-- Rollback for: 20250918-194500-seed-admin-user
-- Description: Remove initial admin user and organization

BEGIN;

-- Remove demo robot
DELETE FROM robots WHERE id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

-- Remove admin user
DELETE FROM users WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- Remove demo organization
DELETE FROM organizations WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

COMMIT;