-- Migration 005: Add gender, preference, and phone_number to profiles
-- Date: 2026-01-21

-- =============================================================================
-- ADD NEW COLUMNS TO PROFILES
-- =============================================================================

-- Gender enum
DO $$ BEGIN
    CREATE TYPE gender_type AS ENUM ('male', 'female', 'non-binary');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Preference enum
DO $$ BEGIN
    CREATE TYPE preference_type AS ENUM ('men', 'women', 'everyone');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS gender gender_type,
ADD COLUMN IF NOT EXISTS preference preference_type,
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

-- Index for phone number (for contact-based recommendations)
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON profiles(phone_number) WHERE phone_number IS NOT NULL;

-- =============================================================================
-- UPDATE get_discovery_profiles_advanced TO FILTER BY PREFERENCE
-- =============================================================================

CREATE OR REPLACE FUNCTION get_discovery_profiles_advanced(
    p_user_id UUID,
    p_min_age INT DEFAULT 18,
    p_max_age INT DEFAULT 99,
    p_max_distance_km INT DEFAULT 50,
    p_verified_only BOOLEAN DEFAULT FALSE,
    p_limit INT DEFAULT 20,
    p_offset INT DEFAULT 0
)
RETURNS TABLE (
    profile_id UUID,
    first_name VARCHAR,
    age INT,
    bio TEXT,
    interests TEXT[],
    photo_url TEXT,
    echo_status echo_status,
    last_photo_at TIMESTAMPTZ,
    is_validated BOOLEAN,
    wingman_quote TEXT,
    wingman_qualities TEXT[],
    wingman_flaws TEXT[],
    distance_km FLOAT,
    gender gender_type,
    preference preference_type
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_lat FLOAT;
    user_lon FLOAT;
    user_gender gender_type;
    user_preference preference_type;
BEGIN
    -- Get current user's location and preferences
    SELECT p.latitude, p.longitude, p.gender, p.preference
    INTO user_lat, user_lon, user_gender, user_preference
    FROM profiles p
    WHERE p.id = p_user_id;

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
            WHEN user_lat IS NOT NULL AND user_lon IS NOT NULL AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL
            THEN calculate_distance(user_lat, user_lon, p.latitude, p.longitude)
            ELSE NULL
        END AS distance_km,
        p.gender,
        p.preference
    FROM profiles p
    WHERE p.id != p_user_id
        AND p.echo_status IN ('ACTIVE', 'EXPIRING')
        AND p.age BETWEEN p_min_age AND p_max_age
        -- Filter by user's preference
        AND (
            user_preference IS NULL
            OR user_preference = 'everyone'
            OR (user_preference = 'men' AND p.gender = 'male')
            OR (user_preference = 'women' AND p.gender = 'female')
        )
        -- Filter by target's preference (mutual interest)
        AND (
            p.preference IS NULL
            OR p.preference = 'everyone'
            OR (p.preference = 'men' AND user_gender = 'male')
            OR (p.preference = 'women' AND user_gender = 'female')
        )
        -- Verified only filter
        AND (NOT p_verified_only OR p.is_validated = TRUE)
        -- Distance filter (if user has location)
        AND (
            user_lat IS NULL
            OR user_lon IS NULL
            OR p.latitude IS NULL
            OR p.longitude IS NULL
            OR calculate_distance(user_lat, user_lon, p.latitude, p.longitude) <= p_max_distance_km
        )
        -- Exclude blocked users
        AND NOT EXISTS (
            SELECT 1 FROM blocks b
            WHERE (b.blocker_id = p_user_id AND b.blocked_id = p.id)
               OR (b.blocker_id = p.id AND b.blocked_id = p_user_id)
        )
        -- Exclude already swiped users
        AND NOT EXISTS (
            SELECT 1 FROM swipes s
            WHERE s.swiper_id = p_user_id AND s.swiped_id = p.id
        )
    ORDER BY
        p.echo_status ASC, -- ACTIVE first, then EXPIRING
        p.last_photo_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON COLUMN profiles.gender IS 'User gender: male, female, or non-binary';
COMMENT ON COLUMN profiles.preference IS 'Dating preference: men, women, or everyone';
COMMENT ON COLUMN profiles.phone_number IS 'Phone number for contact-based recommendations';
