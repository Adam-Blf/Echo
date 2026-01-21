-- Migration 004: Security Hardening
-- Echo Dating App
-- Date: 2026-01-21
-- Audit: Security hardening for block system, messages, and profiles

-- =============================================================================
-- FIX 1: PROFILES RLS - EXCLUDE BLOCKED USERS FROM VIEWING
-- =============================================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view active profiles" ON profiles;

-- Create new policy that excludes blocked users (both directions)
CREATE POLICY "Users can view active profiles except blocked" ON profiles
  FOR SELECT USING (
    -- Allow viewing own profile
    id = auth.uid()
    -- Or allow viewing if user is active and NOT blocked
    OR (
      echo_status != 'SILENCE'
      -- User who is viewing is not blocked by the profile owner
      AND NOT EXISTS (
        SELECT 1 FROM blocks
        WHERE blocker_id = profiles.id
        AND blocked_id = auth.uid()
      )
      -- Profile owner has not been blocked by the viewer
      AND NOT EXISTS (
        SELECT 1 FROM blocks
        WHERE blocker_id = auth.uid()
        AND blocked_id = profiles.id
      )
    )
  );

-- =============================================================================
-- FIX 2: MATCHES RLS - EXCLUDE BLOCKED MATCHES
-- =============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own matches" ON matches;
DROP POLICY IF EXISTS "Users can update own matches" ON matches;

-- Create new policy that excludes blocked users
CREATE POLICY "Users can view own matches except blocked" ON matches
  FOR SELECT USING (
    (user1_id = auth.uid() OR user2_id = auth.uid())
    -- Ensure neither user has blocked the other
    AND NOT EXISTS (
      SELECT 1 FROM blocks
      WHERE (blocker_id = matches.user1_id AND blocked_id = matches.user2_id)
         OR (blocker_id = matches.user2_id AND blocked_id = matches.user1_id)
    )
  );

CREATE POLICY "Users can update own matches except blocked" ON matches
  FOR UPDATE USING (
    (user1_id = auth.uid() OR user2_id = auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM blocks
      WHERE (blocker_id = matches.user1_id AND blocked_id = matches.user2_id)
         OR (blocker_id = matches.user2_id AND blocked_id = matches.user1_id)
    )
  );

-- =============================================================================
-- FIX 3: MESSAGES RLS - PREVENT MESSAGES TO/FROM BLOCKED USERS
-- =============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view messages in their matches" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their matches" ON messages;

-- Create new policies with block verification
CREATE POLICY "Users can view messages in non-blocked matches" ON messages
  FOR SELECT USING (
    match_id IN (
      SELECT m.id FROM matches m
      WHERE (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
      -- No block exists between match participants
      AND NOT EXISTS (
        SELECT 1 FROM blocks
        WHERE (blocker_id = m.user1_id AND blocked_id = m.user2_id)
           OR (blocker_id = m.user2_id AND blocked_id = m.user1_id)
      )
    )
  );

CREATE POLICY "Users can send messages in non-blocked active matches" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND match_id IN (
      SELECT m.id FROM matches m
      WHERE (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
      AND m.status = 'matched'
      -- No block exists between match participants
      AND NOT EXISTS (
        SELECT 1 FROM blocks
        WHERE (blocker_id = m.user1_id AND blocked_id = m.user2_id)
           OR (blocker_id = m.user2_id AND blocked_id = m.user1_id)
      )
    )
  );

-- =============================================================================
-- FIX 4: SWIPES RLS - PREVENT SWIPING ON BLOCKED USERS
-- =============================================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Users can create swipes" ON swipes;

-- Create new policy preventing swipes on blocked users
CREATE POLICY "Users can create swipes on non-blocked users" ON swipes
  FOR INSERT WITH CHECK (
    swiper_id = auth.uid()
    -- Cannot swipe on someone who blocked you
    AND NOT EXISTS (
      SELECT 1 FROM blocks
      WHERE blocker_id = swiped_id
      AND blocked_id = auth.uid()
    )
    -- Cannot swipe on someone you blocked
    AND NOT EXISTS (
      SELECT 1 FROM blocks
      WHERE blocker_id = auth.uid()
      AND blocked_id = swiped_id
    )
  );

-- =============================================================================
-- FIX 5: RECEIVED LIKES VIEW - EXCLUDE BLOCKED USERS
-- =============================================================================

-- Drop and recreate the view to exclude blocked users
DROP VIEW IF EXISTS received_likes;

CREATE OR REPLACE VIEW received_likes AS
SELECT
  s.swiped_id AS user_id,
  s.swiper_id AS liker_id,
  s.action,
  s.created_at,
  p.first_name AS liker_first_name,
  p.age AS liker_age,
  p.photo_url AS liker_photo_url,
  p.bio AS liker_bio,
  p.interests AS liker_interests,
  p.echo_status AS liker_echo_status
FROM swipes s
JOIN profiles p ON p.id = s.swiper_id
WHERE s.action IN ('like', 'superlike')
  -- Exclude if already matched
  AND NOT EXISTS (
    SELECT 1 FROM matches m
    WHERE (m.user1_id = s.swiper_id AND m.user2_id = s.swiped_id)
       OR (m.user1_id = s.swiped_id AND m.user2_id = s.swiper_id)
  )
  -- Exclude if I already swiped on them
  AND NOT EXISTS (
    SELECT 1 FROM swipes s2
    WHERE s2.swiper_id = s.swiped_id AND s2.swiped_id = s.swiper_id
  )
  -- SECURITY FIX: Exclude blocked users (both directions)
  AND NOT EXISTS (
    SELECT 1 FROM blocks
    WHERE (blocker_id = s.swiper_id AND blocked_id = s.swiped_id)
       OR (blocker_id = s.swiped_id AND blocked_id = s.swiper_id)
  );

-- =============================================================================
-- FIX 6: FUNCTION TO CHECK IF USER CAN INTERACT
-- =============================================================================

-- Helper function to check if two users can interact (not blocked)
CREATE OR REPLACE FUNCTION can_users_interact(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS(
    SELECT 1 FROM blocks
    WHERE (blocker_id = user_a AND blocked_id = user_b)
       OR (blocker_id = user_b AND blocked_id = user_a)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- FIX 7: SECURE MESSAGE SENDING FUNCTION (Server-side validation)
-- =============================================================================

CREATE OR REPLACE FUNCTION send_secure_message(
  p_match_id UUID,
  p_content TEXT,
  p_message_type message_type DEFAULT 'text',
  p_media_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_match RECORD;
  v_other_user_id UUID;
  v_message_id UUID;
BEGIN
  -- Get current user
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get match and verify user is participant
  SELECT * INTO v_match
  FROM matches
  WHERE id = p_match_id
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
    AND status = 'matched';

  IF v_match IS NULL THEN
    RAISE EXCEPTION 'Match not found or not active';
  END IF;

  -- Get other user ID
  v_other_user_id := CASE
    WHEN v_match.user1_id = auth.uid() THEN v_match.user2_id
    ELSE v_match.user1_id
  END;

  -- Check if users can interact (not blocked)
  IF NOT can_users_interact(auth.uid(), v_other_user_id) THEN
    RAISE EXCEPTION 'Cannot send message to this user';
  END IF;

  -- Validate content length (max 2000 chars)
  IF length(p_content) > 2000 THEN
    RAISE EXCEPTION 'Message too long';
  END IF;

  -- Insert message
  INSERT INTO messages (match_id, sender_id, content, message_type, media_url)
  VALUES (p_match_id, auth.uid(), p_content, p_message_type, p_media_url)
  RETURNING id INTO v_message_id;

  -- Update last_message_at
  UPDATE matches
  SET last_message_at = NOW()
  WHERE id = p_match_id;

  RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- FIX 8: LOCATION FUZZING FOR PRIVACY
-- =============================================================================

-- Function to get fuzzy location (rounded to ~1km precision)
-- This prevents precise stalking while still allowing distance calculation
CREATE OR REPLACE FUNCTION get_fuzzy_location(p_user_id UUID)
RETURNS TABLE (
  fuzzy_latitude DOUBLE PRECISION,
  fuzzy_longitude DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Round to 2 decimal places (~1.1km precision at equator)
    ROUND(latitude::numeric, 2)::double precision AS fuzzy_latitude,
    ROUND(longitude::numeric, 2)::double precision AS fuzzy_longitude
  FROM profiles
  WHERE id = p_user_id
    AND latitude IS NOT NULL
    AND longitude IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- FIX 9: RATE LIMITING FUNCTION FOR ABUSE PREVENTION
-- =============================================================================

-- Generic rate limit check function (to be used with RLS or triggers)
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_action TEXT,
  p_max_count INTEGER,
  p_window_interval INTERVAL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Count recent actions based on action type
  CASE p_action
    WHEN 'swipe' THEN
      SELECT COUNT(*) INTO v_count
      FROM swipes
      WHERE swiper_id = p_user_id
        AND created_at > NOW() - p_window_interval;

    WHEN 'message' THEN
      SELECT COUNT(*) INTO v_count
      FROM messages
      WHERE sender_id = p_user_id
        AND created_at > NOW() - p_window_interval;

    WHEN 'block' THEN
      SELECT COUNT(*) INTO v_count
      FROM blocks
      WHERE blocker_id = p_user_id
        AND created_at > NOW() - p_window_interval;

    WHEN 'report' THEN
      SELECT COUNT(*) INTO v_count
      FROM reports
      WHERE reporter_id = p_user_id
        AND created_at > NOW() - p_window_interval;

    ELSE
      RETURN TRUE; -- Unknown action, allow
  END CASE;

  RETURN v_count < p_max_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- FIX 10: MESSAGE RATE LIMITING TRIGGER
-- =============================================================================

CREATE OR REPLACE FUNCTION check_message_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  messages_minute INTEGER;
  messages_hour INTEGER;
BEGIN
  -- Check messages per minute (max 10)
  SELECT COUNT(*) INTO messages_minute
  FROM messages
  WHERE sender_id = NEW.sender_id
    AND created_at > NOW() - INTERVAL '1 minute';

  IF messages_minute >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded: maximum 10 messages per minute';
  END IF;

  -- Check messages per hour (max 100)
  SELECT COUNT(*) INTO messages_hour
  FROM messages
  WHERE sender_id = NEW.sender_id
    AND created_at > NOW() - INTERVAL '1 hour';

  IF messages_hour >= 100 THEN
    RAISE EXCEPTION 'Rate limit exceeded: maximum 100 messages per hour';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (drop if exists first)
DROP TRIGGER IF EXISTS messages_rate_limit ON messages;

CREATE TRIGGER messages_rate_limit
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION check_message_rate_limit();

-- =============================================================================
-- FIX 11: AUDIT LOG TABLE FOR SECURITY EVENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS security_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_user_id UUID,
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

-- Index for efficient querying
CREATE INDEX idx_audit_log_user ON security_audit_log(user_id);
CREATE INDEX idx_audit_log_action ON security_audit_log(action);
CREATE INDEX idx_audit_log_created ON security_audit_log(created_at);
CREATE INDEX idx_audit_log_severity ON security_audit_log(severity);

-- RLS for audit log (only service role can write, users can read their own)
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit entries" ON security_audit_log
  FOR SELECT USING (user_id = auth.uid());

-- Note: INSERT/UPDATE/DELETE should only be done via service role

-- =============================================================================
-- FIX 12: FUNCTION TO LOG SECURITY EVENTS
-- =============================================================================

CREATE OR REPLACE FUNCTION log_security_event(
  p_action TEXT,
  p_target_user_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_severity TEXT DEFAULT 'low'
)
RETURNS void AS $$
BEGIN
  INSERT INTO security_audit_log (user_id, action, target_user_id, details, severity)
  VALUES (auth.uid(), p_action, p_target_user_id, p_details, p_severity);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON FUNCTION can_users_interact IS 'Check if two users can interact (not blocked in either direction)';
COMMENT ON FUNCTION send_secure_message IS 'Server-validated message sending with block checking';
COMMENT ON FUNCTION get_fuzzy_location IS 'Get user location with reduced precision for privacy';
COMMENT ON FUNCTION check_rate_limit IS 'Generic rate limiting function for abuse prevention';
COMMENT ON TABLE security_audit_log IS 'Audit log for security-relevant events';
