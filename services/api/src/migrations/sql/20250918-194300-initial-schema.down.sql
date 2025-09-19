-- Rollback for: 20250918-194300-initial-schema
-- Description: Rollback initial schema

BEGIN;

-- Drop triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes
DROP INDEX IF EXISTS idx_sessions_expires;
DROP INDEX IF EXISTS idx_sessions_user;
DROP INDEX IF EXISTS idx_sessions_token;

DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_organization;
DROP INDEX IF EXISTS idx_users_email;

DROP INDEX IF EXISTS idx_organizations_plan;
DROP INDEX IF EXISTS idx_organizations_slug;

-- Drop tables (in reverse order due to foreign keys)
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS organizations;

COMMIT;