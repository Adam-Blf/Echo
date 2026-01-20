-- ECHO Dating App - Reset Schema
-- Run this FIRST to clean up existing objects

-- Drop triggers first
DROP TRIGGER IF EXISTS swipes_create_match ON swipes;
DROP TRIGGER IF EXISTS profiles_echo_status ON profiles;
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;

-- Drop functions
DROP FUNCTION IF EXISTS expire_matches();
DROP FUNCTION IF EXISTS create_match_on_like();
DROP FUNCTION IF EXISTS calculate_distance(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION);
DROP FUNCTION IF EXISTS get_discovery_profiles(UUID, INTEGER);
DROP FUNCTION IF EXISTS check_match(UUID, UUID);
DROP FUNCTION IF EXISTS update_echo_status();
DROP FUNCTION IF EXISTS calculate_echo_status(TIMESTAMPTZ);
DROP FUNCTION IF EXISTS update_updated_at();

-- Drop tables (order matters due to foreign keys)
DROP TABLE IF EXISTS swipe_limits CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS swipes CASCADE;
DROP TABLE IF EXISTS wingman_tokens CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop types
DROP TYPE IF EXISTS message_type;
DROP TYPE IF EXISTS swipe_action;
DROP TYPE IF EXISTS match_status;
DROP TYPE IF EXISTS echo_status;

-- Done! Now run schema.sql
