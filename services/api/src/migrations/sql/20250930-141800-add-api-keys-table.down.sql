-- Rollback for: 20250930-141800-add-api-keys-table
-- Description: Remove api_keys table

BEGIN;

-- Drop trigger
DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;

-- Drop indexes
DROP INDEX IF EXISTS idx_api_keys_active;
DROP INDEX IF EXISTS idx_api_keys_organization;
DROP INDEX IF EXISTS idx_api_keys_user;
DROP INDEX IF EXISTS idx_api_keys_hash;

-- Drop api_keys table
DROP TABLE IF EXISTS api_keys;

COMMIT;
