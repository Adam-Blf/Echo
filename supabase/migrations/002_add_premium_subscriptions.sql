-- Migration 002: Add Premium & Subscriptions System
-- Echo Dating App
-- Date: 2026-01-21

-- =============================================================================
-- ENUMS
-- =============================================================================

-- Subscription plans
CREATE TYPE subscription_plan AS ENUM (
  'free',              -- Plan gratuit
  'echo_plus',         -- Plan intermediaire
  'echo_unlimited'     -- Plan premium complet
);

-- Subscription status
CREATE TYPE subscription_status AS ENUM (
  'active',            -- Actif
  'trialing',          -- Periode d'essai
  'past_due',          -- Paiement en retard
  'canceled',          -- Annule (fin de periode)
  'unpaid',            -- Non paye
  'incomplete',        -- Paiement incomplet
  'incomplete_expired' -- Paiement expire
);

-- =============================================================================
-- TABLES
-- =============================================================================

-- Premium features configuration (static reference table)
CREATE TABLE premium_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan subscription_plan NOT NULL UNIQUE,

  -- Swipe limits
  daily_swipes INTEGER NOT NULL,           -- -1 for unlimited
  weekly_super_likes INTEGER NOT NULL,     -- 0 for none

  -- Features
  see_who_likes_you BOOLEAN DEFAULT FALSE,
  rewind_swipes BOOLEAN DEFAULT FALSE,
  invisible_mode BOOLEAN DEFAULT FALSE,
  read_receipts BOOLEAN DEFAULT FALSE,
  priority_likes BOOLEAN DEFAULT FALSE,    -- Likes shown first to others
  weekly_boosts INTEGER DEFAULT 0,         -- Free boosts per week

  -- Pricing (stored for reference, actual billing via Stripe)
  monthly_price_cents INTEGER,
  yearly_price_cents INTEGER,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default feature configurations
INSERT INTO premium_features (plan, daily_swipes, weekly_super_likes, see_who_likes_you, rewind_swipes, invisible_mode, read_receipts, priority_likes, weekly_boosts, monthly_price_cents, yearly_price_cents) VALUES
  ('free', 20, 0, FALSE, FALSE, FALSE, FALSE, FALSE, 0, 0, 0),
  ('echo_plus', 100, 3, TRUE, TRUE, FALSE, FALSE, FALSE, 1, 999, 5999),
  ('echo_unlimited', -1, 10, TRUE, TRUE, TRUE, TRUE, TRUE, 3, 1999, 11999);

-- Active subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- User reference
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,

  -- Subscription details
  plan subscription_plan NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',

  -- Stripe integration
  stripe_customer_id TEXT,                 -- Stripe Customer ID
  stripe_subscription_id TEXT UNIQUE,      -- Stripe Subscription ID
  stripe_price_id TEXT,                    -- Stripe Price ID

  -- Billing period
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,

  -- Cancellation
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,

  -- Trial
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ
);

-- Subscription events/history
CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- References
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Event details
  event_type TEXT NOT NULL,                -- e.g., 'subscription.created', 'payment.succeeded'
  stripe_event_id TEXT UNIQUE,             -- Stripe Event ID for idempotency
  event_data JSONB,                        -- Full event payload

  -- Status tracking
  previous_plan subscription_plan,
  new_plan subscription_plan,
  previous_status subscription_status,
  new_status subscription_status
);

-- One-time purchases (boosts, super likes packs)
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Purchase details
  product_type TEXT NOT NULL,              -- 'boost', 'super_likes_pack', etc.
  quantity INTEGER NOT NULL DEFAULT 1,
  price_cents INTEGER NOT NULL,

  -- Stripe
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,

  -- Consumption tracking
  consumed INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ                   -- Some items may expire
);

-- User's current premium state (denormalized for fast access)
CREATE TABLE user_premium_state (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Current plan
  current_plan subscription_plan DEFAULT 'free',
  is_premium BOOLEAN DEFAULT FALSE,

  -- Available resources
  boosts_available INTEGER DEFAULT 0,
  super_likes_available INTEGER DEFAULT 0,

  -- Feature flags (cached from premium_features)
  daily_swipes INTEGER DEFAULT 20,
  can_see_likes BOOLEAN DEFAULT FALSE,
  can_rewind BOOLEAN DEFAULT FALSE,
  has_invisible_mode BOOLEAN DEFAULT FALSE,
  has_read_receipts BOOLEAN DEFAULT FALSE,
  has_priority_likes BOOLEAN DEFAULT FALSE
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_period_end ON subscriptions(current_period_end);

CREATE INDEX idx_sub_events_user ON subscription_events(user_id);
CREATE INDEX idx_sub_events_subscription ON subscription_events(subscription_id);
CREATE INDEX idx_sub_events_type ON subscription_events(event_type);
CREATE INDEX idx_sub_events_stripe ON subscription_events(stripe_event_id);

CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE INDEX idx_purchases_type ON purchases(product_type);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-update updated_at
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER premium_features_updated_at
  BEFORE UPDATE ON premium_features
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_premium_state_updated_at
  BEFORE UPDATE ON user_premium_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Get user's current subscription plan
CREATE OR REPLACE FUNCTION get_user_plan(p_user_id UUID)
RETURNS subscription_plan AS $$
DECLARE
  user_plan subscription_plan;
BEGIN
  SELECT plan INTO user_plan
  FROM subscriptions
  WHERE user_id = p_user_id
    AND status IN ('active', 'trialing')
    AND (current_period_end IS NULL OR current_period_end > NOW());

  RETURN COALESCE(user_plan, 'free');
END;
$$ LANGUAGE plpgsql;

-- Check if user has premium (any paid plan)
CREATE OR REPLACE FUNCTION is_user_premium(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_plan(p_user_id) != 'free';
END;
$$ LANGUAGE plpgsql;

-- Get user's premium features
CREATE OR REPLACE FUNCTION get_user_features(p_user_id UUID)
RETURNS premium_features AS $$
DECLARE
  user_plan subscription_plan;
  features premium_features;
BEGIN
  user_plan := get_user_plan(p_user_id);

  SELECT * INTO features
  FROM premium_features
  WHERE plan = user_plan;

  RETURN features;
END;
$$ LANGUAGE plpgsql;

-- Check if user can use a specific feature
CREATE OR REPLACE FUNCTION can_use_feature(p_user_id UUID, p_feature TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  features premium_features;
BEGIN
  features := get_user_features(p_user_id);

  CASE p_feature
    WHEN 'see_who_likes_you' THEN RETURN features.see_who_likes_you;
    WHEN 'rewind_swipes' THEN RETURN features.rewind_swipes;
    WHEN 'invisible_mode' THEN RETURN features.invisible_mode;
    WHEN 'read_receipts' THEN RETURN features.read_receipts;
    WHEN 'priority_likes' THEN RETURN features.priority_likes;
    ELSE RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Synchronize profiles.is_premium with subscription status
CREATE OR REPLACE FUNCTION sync_profile_premium_status()
RETURNS TRIGGER AS $$
DECLARE
  is_premium BOOLEAN;
BEGIN
  is_premium := NEW.status IN ('active', 'trialing') AND NEW.plan != 'free';

  UPDATE profiles
  SET
    is_premium = is_premium,
    premium_expires_at = CASE
      WHEN is_premium THEN NEW.current_period_end
      ELSE NULL
    END
  WHERE id = NEW.user_id;

  -- Also update user_premium_state
  INSERT INTO user_premium_state (user_id, current_plan, is_premium)
  VALUES (NEW.user_id, NEW.plan, is_premium)
  ON CONFLICT (user_id) DO UPDATE SET
    current_plan = NEW.plan,
    is_premium = is_premium,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscriptions_sync_profile
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_premium_status();

-- Initialize premium state for new users
CREATE OR REPLACE FUNCTION init_user_premium_state()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_premium_state (user_id, current_plan, is_premium)
  VALUES (NEW.id, 'free', FALSE)
  ON CONFLICT (user_id) DO NOTHING;

  -- Also create a free subscription record
  INSERT INTO subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_init_premium
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION init_user_premium_state();

-- =============================================================================
-- RECEIVED LIKES VIEW (Premium Feature)
-- =============================================================================

-- View to see who liked you (premium only can see full details)
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
  );

-- Function to get received likes (respects premium status)
CREATE OR REPLACE FUNCTION get_received_likes(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  liker_id UUID,
  action swipe_action,
  created_at TIMESTAMPTZ,
  -- Premium users see full details, free users see blurred/limited
  first_name TEXT,
  age INTEGER,
  photo_url TEXT,
  bio TEXT,
  interests TEXT[],
  echo_status echo_status,
  is_blurred BOOLEAN
) AS $$
DECLARE
  user_is_premium BOOLEAN;
BEGIN
  user_is_premium := is_user_premium(p_user_id);

  RETURN QUERY
  SELECT
    rl.liker_id,
    rl.action,
    rl.created_at,
    CASE WHEN user_is_premium THEN rl.liker_first_name ELSE NULL END,
    CASE WHEN user_is_premium THEN rl.liker_age ELSE NULL END,
    CASE WHEN user_is_premium THEN rl.liker_photo_url ELSE NULL END,
    CASE WHEN user_is_premium THEN rl.liker_bio ELSE NULL END,
    CASE WHEN user_is_premium THEN rl.liker_interests ELSE NULL END,
    CASE WHEN user_is_premium THEN rl.liker_echo_status ELSE NULL END,
    NOT user_is_premium AS is_blurred
  FROM received_likes rl
  WHERE rl.user_id = p_user_id
  ORDER BY rl.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Count received likes
CREATE OR REPLACE FUNCTION count_received_likes(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  like_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO like_count
  FROM received_likes
  WHERE user_id = p_user_id;

  RETURN like_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE premium_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_premium_state ENABLE ROW LEVEL SECURITY;

-- Premium features: Everyone can read (it's reference data)
CREATE POLICY "Anyone can view premium features" ON premium_features
  FOR SELECT USING (TRUE);

-- Subscriptions: Users can only view their own
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- Subscription events: Users can only view their own
CREATE POLICY "Users can view own events" ON subscription_events
  FOR SELECT USING (user_id = auth.uid());

-- Purchases: Users can only view their own
CREATE POLICY "Users can view own purchases" ON purchases
  FOR SELECT USING (user_id = auth.uid());

-- User premium state: Users can only view their own
CREATE POLICY "Users can view own premium state" ON user_premium_state
  FOR SELECT USING (user_id = auth.uid());

-- Note: INSERT/UPDATE on subscriptions and subscription_events
-- should only be done via service role (Stripe webhooks)

-- =============================================================================
-- REALTIME
-- =============================================================================

-- Enable realtime for subscription changes
ALTER PUBLICATION supabase_realtime ADD TABLE subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE user_premium_state;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE premium_features IS 'Static configuration of features per subscription plan';
COMMENT ON TABLE subscriptions IS 'Active user subscriptions synced with Stripe';
COMMENT ON TABLE subscription_events IS 'History of subscription changes from Stripe webhooks';
COMMENT ON TABLE purchases IS 'One-time in-app purchases (boosts, super likes packs)';
COMMENT ON TABLE user_premium_state IS 'Denormalized premium state for fast access';

COMMENT ON FUNCTION get_user_plan IS 'Get user current subscription plan';
COMMENT ON FUNCTION is_user_premium IS 'Check if user has any paid plan';
COMMENT ON FUNCTION get_received_likes IS 'Get likes received (blurred for free users)';
