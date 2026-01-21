-- Migration 003: Add Advanced Geolocation with PostGIS
-- Echo Dating App
-- Date: 2026-01-21

-- =============================================================================
-- PREREQUISITES
-- PostGIS extension should already be enabled in schema.sql
-- This migration adds proper geography columns and spatial functions
-- =============================================================================

-- Ensure PostGIS is enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- =============================================================================
-- ADD GEOGRAPHY COLUMN TO PROFILES
-- =============================================================================

-- Add location column using geography type (optimized for Earth distances)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS location geography(POINT, 4326);

-- Add search preferences as JSONB
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS search_preferences JSONB DEFAULT '{
  "min_age": 18,
  "max_age": 50,
  "max_distance_km": 50,
  "show_verified_only": false
}'::jsonb;

-- =============================================================================
-- MIGRATE EXISTING LAT/LON DATA
-- =============================================================================

-- Update location from existing latitude/longitude
UPDATE profiles
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE latitude IS NOT NULL
  AND longitude IS NOT NULL
  AND location IS NULL;

-- =============================================================================
-- TRIGGER TO KEEP LOCATION IN SYNC
-- =============================================================================

-- When lat/lon are updated, update geography column
CREATE OR REPLACE FUNCTION sync_location_from_coords()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  ELSE
    NEW.location := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_sync_location
  BEFORE INSERT OR UPDATE OF latitude, longitude ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_location_from_coords();

-- =============================================================================
-- SPATIAL INDEX
-- =============================================================================

-- Drop existing basic index on lat/lon (we'll use spatial index instead)
DROP INDEX IF EXISTS idx_profiles_location;

-- Create GiST spatial index for fast proximity queries
CREATE INDEX idx_profiles_location_gist ON profiles USING GIST (location);

-- Keep index on search preferences
CREATE INDEX idx_profiles_search_prefs ON profiles USING GIN (search_preferences);

-- =============================================================================
-- DISTANCE FUNCTIONS
-- =============================================================================

-- Calculate distance between two users (in kilometers)
CREATE OR REPLACE FUNCTION distance_between_users(user_a UUID, user_b UUID)
RETURNS DOUBLE PRECISION AS $$
DECLARE
  loc_a geography;
  loc_b geography;
BEGIN
  SELECT location INTO loc_a FROM profiles WHERE id = user_a;
  SELECT location INTO loc_b FROM profiles WHERE id = user_b;

  IF loc_a IS NULL OR loc_b IS NULL THEN
    RETURN NULL;
  END IF;

  -- ST_Distance returns meters, convert to km
  RETURN ST_Distance(loc_a, loc_b) / 1000.0;
END;
$$ LANGUAGE plpgsql;

-- Get distance from a specific point (in km)
CREATE OR REPLACE FUNCTION distance_from_point(
  p_user_id UUID,
  p_lat DOUBLE PRECISION,
  p_lon DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
DECLARE
  user_loc geography;
  point_loc geography;
BEGIN
  SELECT location INTO user_loc FROM profiles WHERE id = p_user_id;

  IF user_loc IS NULL THEN
    RETURN NULL;
  END IF;

  point_loc := ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography;

  RETURN ST_Distance(user_loc, point_loc) / 1000.0;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- DISCOVERY WITH DISTANCE FILTERING
-- =============================================================================

-- Get profiles within a distance radius
CREATE OR REPLACE FUNCTION get_profiles_within_distance(
  p_user_id UUID,
  p_max_distance_km DOUBLE PRECISION DEFAULT 50,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  profile_id UUID,
  first_name TEXT,
  age INTEGER,
  bio TEXT,
  interests TEXT[],
  photo_url TEXT,
  echo_status echo_status,
  last_photo_at TIMESTAMPTZ,
  wingman_quote TEXT,
  distance_km DOUBLE PRECISION
) AS $$
DECLARE
  user_location geography;
  max_distance_m DOUBLE PRECISION;
BEGIN
  -- Get user's location
  SELECT location INTO user_location FROM profiles WHERE id = p_user_id;

  IF user_location IS NULL THEN
    -- No location set, return empty
    RETURN;
  END IF;

  -- Convert km to meters
  max_distance_m := p_max_distance_km * 1000;

  RETURN QUERY
  SELECT
    p.id AS profile_id,
    p.first_name,
    p.age,
    p.bio,
    p.interests,
    p.photo_url,
    p.echo_status,
    p.last_photo_at,
    p.wingman_quote,
    ROUND((ST_Distance(p.location, user_location) / 1000)::numeric, 1)::double precision AS distance_km
  FROM profiles p
  WHERE p.id != p_user_id
    AND p.location IS NOT NULL
    AND p.echo_status != 'SILENCE'
    -- Use ST_DWithin for efficient spatial query (uses index)
    AND ST_DWithin(p.location, user_location, max_distance_m)
    -- Exclude already swiped
    AND p.id NOT IN (SELECT swiped_id FROM swipes WHERE swiper_id = p_user_id)
    -- Exclude blocked users
    AND p.id NOT IN (SELECT blocked_id FROM blocks WHERE blocker_id = p_user_id)
    AND p.id NOT IN (SELECT blocker_id FROM blocks WHERE blocked_id = p_user_id)
  ORDER BY
    -- ACTIVE profiles first
    CASE WHEN p.echo_status = 'ACTIVE' THEN 0 ELSE 1 END,
    -- Then by distance
    ST_Distance(p.location, user_location),
    -- Then by freshness
    p.last_photo_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ADVANCED DISCOVERY WITH ALL FILTERS
-- =============================================================================

CREATE OR REPLACE FUNCTION get_discovery_profiles_advanced(
  p_user_id UUID,
  p_min_age INTEGER DEFAULT NULL,
  p_max_age INTEGER DEFAULT NULL,
  p_max_distance_km DOUBLE PRECISION DEFAULT NULL,
  p_verified_only BOOLEAN DEFAULT FALSE,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  profile_id UUID,
  first_name TEXT,
  age INTEGER,
  bio TEXT,
  interests TEXT[],
  photo_url TEXT,
  echo_status echo_status,
  last_photo_at TIMESTAMPTZ,
  is_validated BOOLEAN,
  wingman_quote TEXT,
  wingman_qualities TEXT[],
  wingman_flaws TEXT[],
  distance_km DOUBLE PRECISION
) AS $$
DECLARE
  user_location geography;
  user_prefs JSONB;
  min_age_filter INTEGER;
  max_age_filter INTEGER;
  max_dist_filter DOUBLE PRECISION;
BEGIN
  -- Get user's location and preferences
  SELECT p.location, p.search_preferences
  INTO user_location, user_prefs
  FROM profiles p
  WHERE p.id = p_user_id;

  -- Use provided filters or fall back to user preferences
  min_age_filter := COALESCE(p_min_age, (user_prefs->>'min_age')::integer, 18);
  max_age_filter := COALESCE(p_max_age, (user_prefs->>'max_age')::integer, 99);
  max_dist_filter := COALESCE(p_max_distance_km, (user_prefs->>'max_distance_km')::double precision, 100);

  RETURN QUERY
  SELECT
    p.id AS profile_id,
    p.first_name,
    p.age,
    p.bio,
    p.interests,
    p.photo_url,
    p.echo_status,
    p.last_photo_at,
    p.is_validated,
    p.wingman_quote,
    p.wingman_qualities,
    p.wingman_flaws,
    CASE
      WHEN user_location IS NOT NULL AND p.location IS NOT NULL
      THEN ROUND((ST_Distance(p.location, user_location) / 1000)::numeric, 1)::double precision
      ELSE NULL
    END AS distance_km
  FROM profiles p
  WHERE p.id != p_user_id
    AND p.echo_status != 'SILENCE'
    -- Age filter
    AND p.age >= min_age_filter
    AND p.age <= max_age_filter
    -- Verified only filter
    AND (NOT p_verified_only OR p.is_validated = TRUE)
    -- Distance filter (only if both have location)
    AND (
      user_location IS NULL
      OR p.location IS NULL
      OR ST_DWithin(p.location, user_location, max_dist_filter * 1000)
    )
    -- Exclude already swiped
    AND p.id NOT IN (SELECT swiped_id FROM swipes WHERE swiper_id = p_user_id)
    -- Exclude blocked users
    AND p.id NOT IN (SELECT blocked_id FROM blocks WHERE blocker_id = p_user_id)
    AND p.id NOT IN (SELECT blocker_id FROM blocks WHERE blocked_id = p_user_id)
  ORDER BY
    -- ACTIVE profiles first
    CASE WHEN p.echo_status = 'ACTIVE' THEN 0 ELSE 1 END,
    -- Validated profiles second
    CASE WHEN p.is_validated THEN 0 ELSE 1 END,
    -- Then by distance (if available)
    CASE
      WHEN user_location IS NOT NULL AND p.location IS NOT NULL
      THEN ST_Distance(p.location, user_location)
      ELSE 999999999
    END,
    -- Then by freshness
    p.last_photo_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- UPDATE ORIGINAL get_discovery_profiles TO USE NEW LOGIC
-- =============================================================================

-- Replace original function with distance-aware version
DROP FUNCTION IF EXISTS get_discovery_profiles(UUID, INTEGER);

CREATE OR REPLACE FUNCTION get_discovery_profiles(p_user_id UUID, p_limit INTEGER DEFAULT 20)
RETURNS SETOF profiles AS $$
DECLARE
  user_location geography;
  user_prefs JSONB;
  max_dist_m DOUBLE PRECISION;
BEGIN
  -- Get user's location and preferences
  SELECT p.location, p.search_preferences
  INTO user_location, user_prefs
  FROM profiles p
  WHERE p.id = p_user_id;

  -- Default to 50km if no preference set
  max_dist_m := COALESCE((user_prefs->>'max_distance_km')::double precision, 50) * 1000;

  RETURN QUERY
  SELECT p.*
  FROM profiles p
  WHERE p.id != p_user_id
    AND p.echo_status != 'SILENCE'
    -- Distance filter (skip if no location)
    AND (
      user_location IS NULL
      OR p.location IS NULL
      OR ST_DWithin(p.location, user_location, max_dist_m)
    )
    -- Exclude already swiped
    AND p.id NOT IN (SELECT swiped_id FROM swipes WHERE swiper_id = p_user_id)
    -- Exclude blocked users (from migration 001)
    AND p.id NOT IN (SELECT blocked_id FROM blocks WHERE blocker_id = p_user_id)
    AND p.id NOT IN (SELECT blocker_id FROM blocks WHERE blocked_id = p_user_id)
  ORDER BY
    CASE WHEN p.echo_status = 'ACTIVE' THEN 0 ELSE 1 END,
    CASE WHEN p.is_validated THEN 0 ELSE 1 END,
    CASE
      WHEN user_location IS NOT NULL AND p.location IS NOT NULL
      THEN ST_Distance(p.location, user_location)
      ELSE 999999999
    END,
    p.last_photo_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- HELPER FUNCTIONS FOR SEARCH PREFERENCES
-- =============================================================================

-- Update user's search preferences
CREATE OR REPLACE FUNCTION update_search_preferences(
  p_user_id UUID,
  p_preferences JSONB
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET search_preferences = COALESCE(search_preferences, '{}'::jsonb) || p_preferences
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Get user's search preferences with defaults
CREATE OR REPLACE FUNCTION get_search_preferences(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  prefs JSONB;
BEGIN
  SELECT search_preferences INTO prefs
  FROM profiles
  WHERE id = p_user_id;

  RETURN COALESCE(prefs, '{}'::jsonb) || jsonb_build_object(
    'min_age', COALESCE((prefs->>'min_age')::integer, 18),
    'max_age', COALESCE((prefs->>'max_age')::integer, 50),
    'max_distance_km', COALESCE((prefs->>'max_distance_km')::integer, 50),
    'show_verified_only', COALESCE((prefs->>'show_verified_only')::boolean, false)
  );
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- NEARBY USERS COUNT (for UI indicators)
-- =============================================================================

-- Count users within radius (for "X people nearby" feature)
CREATE OR REPLACE FUNCTION count_nearby_users(
  p_user_id UUID,
  p_radius_km DOUBLE PRECISION DEFAULT 10
)
RETURNS INTEGER AS $$
DECLARE
  user_location geography;
  nearby_count INTEGER;
BEGIN
  SELECT location INTO user_location FROM profiles WHERE id = p_user_id;

  IF user_location IS NULL THEN
    RETURN 0;
  END IF;

  SELECT COUNT(*) INTO nearby_count
  FROM profiles p
  WHERE p.id != p_user_id
    AND p.echo_status != 'SILENCE'
    AND p.location IS NOT NULL
    AND ST_DWithin(p.location, user_location, p_radius_km * 1000)
    AND p.id NOT IN (SELECT blocked_id FROM blocks WHERE blocker_id = p_user_id)
    AND p.id NOT IN (SELECT blocker_id FROM blocks WHERE blocked_id = p_user_id);

  RETURN nearby_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON COLUMN profiles.location IS 'PostGIS geography point for optimized distance queries';
COMMENT ON COLUMN profiles.search_preferences IS 'User search filters (age range, distance, verified)';

COMMENT ON FUNCTION distance_between_users IS 'Calculate distance in km between two users';
COMMENT ON FUNCTION get_profiles_within_distance IS 'Get profiles within a radius with distance info';
COMMENT ON FUNCTION get_discovery_profiles_advanced IS 'Full-featured discovery with all filters';
COMMENT ON FUNCTION count_nearby_users IS 'Count users within radius for UI indicators';
