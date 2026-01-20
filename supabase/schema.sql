-- ECHO Dating App - Supabase Schema
-- Run this in the Supabase SQL editor to set up the database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Enums
CREATE TYPE echo_status AS ENUM ('ACTIVE', 'EXPIRING', 'SILENCE');
CREATE TYPE match_status AS ENUM ('pending', 'matched', 'expired', 'resonance');
CREATE TYPE swipe_action AS ENUM ('like', 'nope', 'superlike');
CREATE TYPE message_type AS ENUM ('text', 'image', 'audio');

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 99),
  bio TEXT,
  interests TEXT[] DEFAULT '{}',
  photo_url TEXT,
  last_photo_at TIMESTAMPTZ DEFAULT NOW(),
  echo_status echo_status DEFAULT 'ACTIVE',
  is_validated BOOLEAN DEFAULT FALSE,
  wingman_quote TEXT,
  wingman_qualities TEXT[],
  wingman_flaws TEXT[],
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  language TEXT DEFAULT 'fr' CHECK (language IN ('fr', 'en')),
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMPTZ
);

-- Wingman tokens
CREATE TABLE wingman_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  used_by_name TEXT
);

-- Swipes
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  swiper_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  swiped_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action swipe_action NOT NULL,
  UNIQUE(swiper_id, swiped_id)
);

-- Matches
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status match_status DEFAULT 'matched',
  expires_at TIMESTAMPTZ NOT NULL,
  is_super_like BOOLEAN DEFAULT FALSE,
  last_message_at TIMESTAMPTZ,
  resonance_at TIMESTAMPTZ,
  UNIQUE(user1_id, user2_id)
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  message_type message_type DEFAULT 'text',
  media_url TEXT
);

-- Swipe limits (daily tracking)
CREATE TABLE swipe_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  swipes_used INTEGER DEFAULT 0,
  super_likes_used INTEGER DEFAULT 0,
  week_start DATE DEFAULT date_trunc('week', CURRENT_DATE)::DATE,
  UNIQUE(user_id, date)
);

-- Indexes for performance
CREATE INDEX idx_profiles_echo_status ON profiles(echo_status);
CREATE INDEX idx_profiles_location ON profiles(latitude, longitude);
CREATE INDEX idx_swipes_swiper ON swipes(swiper_id);
CREATE INDEX idx_swipes_swiped ON swipes(swiped_id);
CREATE INDEX idx_matches_users ON matches(user1_id, user2_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_expires ON matches(expires_at);
CREATE INDEX idx_messages_match ON messages(match_id);
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_wingman_token ON wingman_tokens(token);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to calculate Echo status based on last_photo_at
CREATE OR REPLACE FUNCTION calculate_echo_status(last_photo TIMESTAMPTZ)
RETURNS echo_status AS $$
DECLARE
  diff_days NUMERIC;
BEGIN
  diff_days := EXTRACT(EPOCH FROM (NOW() - last_photo)) / 86400;

  IF diff_days < 6 THEN
    RETURN 'ACTIVE';
  ELSIF diff_days < 7 THEN
    RETURN 'EXPIRING';
  ELSE
    RETURN 'SILENCE';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update echo_status automatically
CREATE OR REPLACE FUNCTION update_echo_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.echo_status := calculate_echo_status(NEW.last_photo_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for echo_status update
CREATE TRIGGER profiles_echo_status
  BEFORE INSERT OR UPDATE OF last_photo_at ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_echo_status();

-- Function to check for mutual match
CREATE OR REPLACE FUNCTION check_match(p_swiper_id UUID, p_swiped_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  mutual_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM swipes
    WHERE swiper_id = p_swiped_id
    AND swiped_id = p_swiper_id
    AND action IN ('like', 'superlike')
  ) INTO mutual_exists;

  RETURN mutual_exists;
END;
$$ LANGUAGE plpgsql;

-- Function to get discovery profiles
CREATE OR REPLACE FUNCTION get_discovery_profiles(p_user_id UUID, p_limit INTEGER DEFAULT 20)
RETURNS SETOF profiles AS $$
BEGIN
  RETURN QUERY
  SELECT p.* FROM profiles p
  WHERE p.id != p_user_id
  AND p.echo_status != 'SILENCE'
  AND p.id NOT IN (
    SELECT swiped_id FROM swipes WHERE swiper_id = p_user_id
  )
  ORDER BY
    CASE WHEN p.echo_status = 'ACTIVE' THEN 0 ELSE 1 END,
    p.last_photo_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate distance (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DOUBLE PRECISION,
  lon1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lon2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
DECLARE
  R CONSTANT DOUBLE PRECISION := 6371; -- Earth's radius in km
  dlat DOUBLE PRECISION;
  dlon DOUBLE PRECISION;
  a DOUBLE PRECISION;
  c DOUBLE PRECISION;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);

  a := sin(dlat/2) * sin(dlat/2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(dlon/2) * sin(dlon/2);

  c := 2 * atan2(sqrt(a), sqrt(1-a));

  RETURN R * c;
END;
$$ LANGUAGE plpgsql;

-- Function to create match on mutual like
CREATE OR REPLACE FUNCTION create_match_on_like()
RETURNS TRIGGER AS $$
DECLARE
  match_exists BOOLEAN;
  other_action swipe_action;
BEGIN
  IF NEW.action NOT IN ('like', 'superlike') THEN
    RETURN NEW;
  END IF;

  -- Check if the other person already liked us
  SELECT action INTO other_action
  FROM swipes
  WHERE swiper_id = NEW.swiped_id
  AND swiped_id = NEW.swiper_id
  AND action IN ('like', 'superlike');

  IF other_action IS NOT NULL THEN
    -- Create match (use smaller ID as user1 for consistency)
    INSERT INTO matches (user1_id, user2_id, expires_at, is_super_like)
    VALUES (
      LEAST(NEW.swiper_id, NEW.swiped_id),
      GREATEST(NEW.swiper_id, NEW.swiped_id),
      NOW() + INTERVAL '48 hours',
      NEW.action = 'superlike' OR other_action = 'superlike'
    )
    ON CONFLICT (user1_id, user2_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create match on mutual like
CREATE TRIGGER swipes_create_match
  AFTER INSERT ON swipes
  FOR EACH ROW
  EXECUTE FUNCTION create_match_on_like();

-- Function to update match expiration and status
CREATE OR REPLACE FUNCTION expire_matches()
RETURNS void AS $$
BEGIN
  UPDATE matches
  SET status = 'expired'
  WHERE status = 'matched'
  AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wingman_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipe_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view active profiles" ON profiles
  FOR SELECT USING (echo_status != 'SILENCE' OR id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- RLS Policies for wingman_tokens
CREATE POLICY "Users can view own tokens" ON wingman_tokens
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own tokens" ON wingman_tokens
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can view valid tokens" ON wingman_tokens
  FOR SELECT USING (expires_at > NOW() AND used_at IS NULL);

CREATE POLICY "Anyone can update token (validate)" ON wingman_tokens
  FOR UPDATE USING (expires_at > NOW() AND used_at IS NULL);

-- RLS Policies for swipes
CREATE POLICY "Users can view own swipes" ON swipes
  FOR SELECT USING (swiper_id = auth.uid());

CREATE POLICY "Users can create swipes" ON swipes
  FOR INSERT WITH CHECK (swiper_id = auth.uid());

-- RLS Policies for matches
CREATE POLICY "Users can view own matches" ON matches
  FOR SELECT USING (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "Users can update own matches" ON matches
  FOR UPDATE USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their matches" ON messages
  FOR SELECT USING (
    match_id IN (
      SELECT id FROM matches WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in their matches" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    match_id IN (
      SELECT id FROM matches
      WHERE (user1_id = auth.uid() OR user2_id = auth.uid())
      AND status = 'matched'
    )
  );

-- RLS Policies for swipe_limits
CREATE POLICY "Users can view own limits" ON swipe_limits
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own limits" ON swipe_limits
  FOR ALL USING (user_id = auth.uid());

-- Enable Realtime for messages and matches
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;

-- Storage bucket for photos
-- Run this in the Supabase dashboard: Storage > Create bucket "photos"
-- Set it to public

-- Storage policy for photos (run in SQL editor)
-- CREATE POLICY "Anyone can view photos" ON storage.objects
--   FOR SELECT USING (bucket_id = 'photos');
-- CREATE POLICY "Authenticated users can upload photos" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');
-- CREATE POLICY "Users can update own photos" ON storage.objects
--   FOR UPDATE USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can delete own photos" ON storage.objects
--   FOR DELETE USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);
