-- Rollback for: 20250918-194400-robots-schema
-- Description: Rollback robots schema

BEGIN;

-- Drop triggers
DROP TRIGGER IF EXISTS robot_status_change_trigger ON robots;
DROP TRIGGER IF EXISTS update_robots_updated_at ON robots;

-- Drop functions
DROP FUNCTION IF EXISTS log_robot_status_change();

-- Drop indexes
DROP INDEX IF EXISTS idx_alerts_unresolved;
DROP INDEX IF EXISTS idx_alerts_created;
DROP INDEX IF EXISTS idx_alerts_severity;
DROP INDEX IF EXISTS idx_alerts_robot;

DROP INDEX IF EXISTS idx_status_history_robot;

DROP INDEX IF EXISTS idx_telemetry_metric;
DROP INDEX IF EXISTS idx_telemetry_robot_time;

DROP INDEX IF EXISTS idx_commands_created;
DROP INDEX IF EXISTS idx_commands_status;
DROP INDEX IF EXISTS idx_commands_robot;

DROP INDEX IF EXISTS idx_robots_last_seen;
DROP INDEX IF EXISTS idx_robots_vendor;
DROP INDEX IF EXISTS idx_robots_status;
DROP INDEX IF EXISTS idx_robots_organization;

-- Drop tables (in reverse order due to foreign keys)
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS robot_status_history;
DROP TABLE IF EXISTS robot_telemetry;
DROP TABLE IF EXISTS robot_commands;
DROP TABLE IF EXISTS robots;

COMMIT;