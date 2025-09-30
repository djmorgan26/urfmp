-- Rollback for: 20250930-143900-force-seed-data
-- Description: Remove forced seed data

BEGIN;

-- Remove demo robot
DELETE FROM robots WHERE id = 'demo-robot-001';

-- Remove API key
DELETE FROM api_keys WHERE id = 'api-key-dev-001';

-- Remove admin user
DELETE FROM users WHERE id = '3885c041-ebf4-4fdd-a6ec-7d88216ded2d';

-- Remove demo organization
DELETE FROM organizations WHERE id = 'd8077863-d602-45fd-a253-78ee0d3d49a8';

COMMIT;
