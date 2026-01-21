-- Migration 001: Add Blocks & Reports System
-- Echo Dating App
-- Date: 2026-01-21

-- =============================================================================
-- ENUMS
-- =============================================================================

-- Report reason types
CREATE TYPE report_reason AS ENUM (
  'fake_profile',      -- Profil frauduleux
  'inappropriate',     -- Contenu inapproprie
  'harassment',        -- Harcelement
  'spam',              -- Spam/Publicite
  'underage',          -- Mineur
  'scam',              -- Arnaque
  'other'              -- Autre
);

-- Report status
CREATE TYPE report_status AS ENUM (
  'pending',           -- En attente de moderation
  'reviewing',         -- En cours d'examen
  'resolved_warning',  -- Resolu: avertissement
  'resolved_ban',      -- Resolu: bannissement
  'dismissed'          -- Rejete
);

-- =============================================================================
-- TABLES
-- =============================================================================

-- Blocks table: User A blocks User B
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Constraints
  CONSTRAINT blocks_no_self CHECK (blocker_id != blocked_id),
  UNIQUE(blocker_id, blocked_id)
);

-- Reports table: User A reports User B
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Who reported whom
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Report details
  reason report_reason NOT NULL,
  description TEXT, -- Optional additional details
  screenshot_url TEXT, -- Optional screenshot evidence

  -- Moderation
  status report_status DEFAULT 'pending',
  moderator_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),

  -- Constraints
  CONSTRAINT reports_no_self CHECK (reporter_id != reported_id)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Blocks indexes
CREATE INDEX idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX idx_blocks_blocked ON blocks(blocked_id);
CREATE INDEX idx_blocks_created ON blocks(created_at);

-- Reports indexes
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_reported ON reports(reported_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_reason ON reports(reason);
CREATE INDEX idx_reports_pending ON reports(status) WHERE status = 'pending';

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-update updated_at on reports
CREATE TRIGGER reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-block when reporting (optional but recommended)
CREATE OR REPLACE FUNCTION auto_block_on_report()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically block the reported user
  INSERT INTO blocks (blocker_id, blocked_id)
  VALUES (NEW.reporter_id, NEW.reported_id)
  ON CONFLICT (blocker_id, blocked_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reports_auto_block
  AFTER INSERT ON reports
  FOR EACH ROW
  EXECUTE FUNCTION auto_block_on_report();

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Check if user A has blocked user B
CREATE OR REPLACE FUNCTION is_blocked(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM blocks
    WHERE blocker_id = user_a AND blocked_id = user_b
  );
END;
$$ LANGUAGE plpgsql;

-- Check if there's a mutual block (either direction)
CREATE OR REPLACE FUNCTION is_mutually_blocked(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM blocks
    WHERE (blocker_id = user_a AND blocked_id = user_b)
       OR (blocker_id = user_b AND blocked_id = user_a)
  );
END;
$$ LANGUAGE plpgsql;

-- Get all blocked user IDs for a user
CREATE OR REPLACE FUNCTION get_blocked_user_ids(p_user_id UUID)
RETURNS UUID[] AS $$
DECLARE
  blocked_ids UUID[];
BEGIN
  SELECT ARRAY_AGG(blocked_id) INTO blocked_ids
  FROM blocks
  WHERE blocker_id = p_user_id;

  RETURN COALESCE(blocked_ids, '{}');
END;
$$ LANGUAGE plpgsql;

-- Get all users who blocked this user
CREATE OR REPLACE FUNCTION get_blockers_user_ids(p_user_id UUID)
RETURNS UUID[] AS $$
DECLARE
  blocker_ids UUID[];
BEGIN
  SELECT ARRAY_AGG(blocker_id) INTO blocker_ids
  FROM blocks
  WHERE blocked_id = p_user_id;

  RETURN COALESCE(blocker_ids, '{}');
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- UPDATE get_discovery_profiles TO EXCLUDE BLOCKED USERS
-- =============================================================================

-- Drop existing function and recreate with block filtering
DROP FUNCTION IF EXISTS get_discovery_profiles(UUID, INTEGER);

CREATE OR REPLACE FUNCTION get_discovery_profiles(p_user_id UUID, p_limit INTEGER DEFAULT 20)
RETURNS SETOF profiles AS $$
DECLARE
  blocked_users UUID[];
  blockers UUID[];
BEGIN
  -- Get users I blocked
  blocked_users := get_blocked_user_ids(p_user_id);

  -- Get users who blocked me
  blockers := get_blockers_user_ids(p_user_id);

  RETURN QUERY
  SELECT p.* FROM profiles p
  WHERE p.id != p_user_id
    -- Exclude SILENCE status (Echo expired)
    AND p.echo_status != 'SILENCE'
    -- Exclude already swiped profiles
    AND p.id NOT IN (
      SELECT swiped_id FROM swipes WHERE swiper_id = p_user_id
    )
    -- Exclude blocked users (both directions)
    AND p.id != ALL(blocked_users)
    AND p.id != ALL(blockers)
  ORDER BY
    -- Prioritize ACTIVE over EXPIRING
    CASE WHEN p.echo_status = 'ACTIVE' THEN 0 ELSE 1 END,
    -- Most recent photos first
    p.last_photo_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Blocks RLS Policies
CREATE POLICY "Users can view own blocks" ON blocks
  FOR SELECT USING (blocker_id = auth.uid());

CREATE POLICY "Users can create blocks" ON blocks
  FOR INSERT WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "Users can delete own blocks" ON blocks
  FOR DELETE USING (blocker_id = auth.uid());

-- Reports RLS Policies
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (reporter_id = auth.uid());

CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- Note: Users cannot update or delete their reports
-- Only moderators (via service role) can update reports

-- =============================================================================
-- RATE LIMITING (via database constraints)
-- =============================================================================

-- Function to check report rate limit (max 5 reports per day)
CREATE OR REPLACE FUNCTION check_report_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  reports_today INTEGER;
BEGIN
  SELECT COUNT(*) INTO reports_today
  FROM reports
  WHERE reporter_id = NEW.reporter_id
    AND created_at > NOW() - INTERVAL '24 hours';

  IF reports_today >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded: maximum 5 reports per 24 hours';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reports_rate_limit
  BEFORE INSERT ON reports
  FOR EACH ROW
  EXECUTE FUNCTION check_report_rate_limit();

-- Function to check block rate limit (max 20 blocks per hour)
CREATE OR REPLACE FUNCTION check_block_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  blocks_hour INTEGER;
BEGIN
  SELECT COUNT(*) INTO blocks_hour
  FROM blocks
  WHERE blocker_id = NEW.blocker_id
    AND created_at > NOW() - INTERVAL '1 hour';

  IF blocks_hour >= 20 THEN
    RAISE EXCEPTION 'Rate limit exceeded: maximum 20 blocks per hour';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blocks_rate_limit
  BEFORE INSERT ON blocks
  FOR EACH ROW
  EXECUTE FUNCTION check_block_rate_limit();

-- =============================================================================
-- CLEANUP: Remove matches/conversations when blocking
-- =============================================================================

CREATE OR REPLACE FUNCTION cleanup_on_block()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete any existing matches between these users
  DELETE FROM matches
  WHERE (user1_id = NEW.blocker_id AND user2_id = NEW.blocked_id)
     OR (user1_id = NEW.blocked_id AND user2_id = NEW.blocker_id);

  -- Delete any swipes between these users
  DELETE FROM swipes
  WHERE (swiper_id = NEW.blocker_id AND swiped_id = NEW.blocked_id)
     OR (swiper_id = NEW.blocked_id AND swiped_id = NEW.blocker_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blocks_cleanup
  AFTER INSERT ON blocks
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_on_block();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE blocks IS 'Stores user blocking relationships';
COMMENT ON TABLE reports IS 'Stores user reports for moderation';
COMMENT ON FUNCTION is_blocked IS 'Check if user_a has blocked user_b';
COMMENT ON FUNCTION is_mutually_blocked IS 'Check if either user has blocked the other';
COMMENT ON FUNCTION get_blocked_user_ids IS 'Get array of user IDs blocked by a user';
