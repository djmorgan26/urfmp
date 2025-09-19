-- Migration: 20250918-194400-robots-schema
-- Description: Create robots and related tables
-- Created: 2025-09-18T23:44:00.000Z

BEGIN;

-- Create robots table
CREATE TABLE IF NOT EXISTS robots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    model VARCHAR(100),
    vendor VARCHAR(50) NOT NULL,
    serial_number VARCHAR(100),
    firmware_version VARCHAR(50),
    status VARCHAR(50) DEFAULT 'offline',
    location JSONB,
    configuration JSONB NOT NULL DEFAULT '{}',
    connection_config JSONB DEFAULT '{}',
    last_seen TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_robots_organization
        FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Create robot_commands table
CREATE TABLE IF NOT EXISTS robot_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    robot_id UUID NOT NULL,
    user_id UUID,
    type VARCHAR(50) NOT NULL,
    payload JSONB DEFAULT '{}',
    priority VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(50) DEFAULT 'pending',
    scheduled_at TIMESTAMPTZ,
    executed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    result JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_commands_robot
        FOREIGN KEY (robot_id) REFERENCES robots(id) ON DELETE CASCADE,
    CONSTRAINT fk_commands_user
        FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create robot_telemetry table (TimescaleDB hypertable)
CREATE TABLE IF NOT EXISTS robot_telemetry (
    time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    robot_id UUID NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    value DOUBLE PRECISION,
    unit VARCHAR(20),
    metadata JSONB,

    CONSTRAINT fk_telemetry_robot
        FOREIGN KEY (robot_id) REFERENCES robots(id) ON DELETE CASCADE
);

-- Create robot_status_history table (TimescaleDB hypertable)
CREATE TABLE IF NOT EXISTS robot_status_history (
    time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    robot_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL,
    previous_status VARCHAR(50),
    reason TEXT,
    metadata JSONB,

    CONSTRAINT fk_status_history_robot
        FOREIGN KEY (robot_id) REFERENCES robots(id) ON DELETE CASCADE
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    robot_id UUID,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    source VARCHAR(100),
    metadata JSONB,
    is_acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID,
    acknowledged_at TIMESTAMPTZ,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_alerts_robot
        FOREIGN KEY (robot_id) REFERENCES robots(id),
    CONSTRAINT fk_alerts_acknowledged
        FOREIGN KEY (acknowledged_by) REFERENCES users(id)
);

-- Create indexes for robots
CREATE INDEX IF NOT EXISTS idx_robots_organization ON robots(organization_id);
CREATE INDEX IF NOT EXISTS idx_robots_status ON robots(status);
CREATE INDEX IF NOT EXISTS idx_robots_vendor ON robots(vendor);
CREATE INDEX IF NOT EXISTS idx_robots_last_seen ON robots(last_seen);

-- Create indexes for commands
CREATE INDEX IF NOT EXISTS idx_commands_robot ON robot_commands(robot_id);
CREATE INDEX IF NOT EXISTS idx_commands_status ON robot_commands(status);
CREATE INDEX IF NOT EXISTS idx_commands_created ON robot_commands(created_at);

-- Try to create TimescaleDB hypertables first (will fail gracefully if TimescaleDB is not available)
DO $$
BEGIN
    -- Convert telemetry table to hypertable
    PERFORM create_hypertable('robot_telemetry', 'time', if_not_exists => true);
    RAISE NOTICE 'Created hypertable for robot_telemetry';
EXCEPTION
    WHEN undefined_function THEN
        RAISE NOTICE 'TimescaleDB not available, using regular tables';
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not create hypertable for robot_telemetry: %', SQLERRM;
END$$;

DO $$
BEGIN
    -- Convert status history table to hypertable
    PERFORM create_hypertable('robot_status_history', 'time', if_not_exists => true);
    RAISE NOTICE 'Created hypertable for robot_status_history';
EXCEPTION
    WHEN undefined_function THEN
        RAISE NOTICE 'TimescaleDB not available, using regular tables';
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not create hypertable for robot_status_history: %', SQLERRM;
END$$;

-- Create indexes for telemetry
CREATE INDEX IF NOT EXISTS idx_telemetry_robot_time ON robot_telemetry(robot_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_metric ON robot_telemetry(metric_name, time DESC);

-- Create indexes for status history
CREATE INDEX IF NOT EXISTS idx_status_history_robot ON robot_status_history(robot_id, time DESC);

-- Create indexes for alerts
CREATE INDEX IF NOT EXISTS idx_alerts_robot ON alerts(robot_id);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_alerts_unresolved ON alerts(is_resolved, created_at) WHERE NOT is_resolved;

-- Add updated_at trigger to robots
DROP TRIGGER IF EXISTS update_robots_updated_at ON robots;
CREATE TRIGGER update_robots_updated_at
    BEFORE UPDATE ON robots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create robot status change trigger
CREATE OR REPLACE FUNCTION log_robot_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO robot_status_history (robot_id, status, previous_status)
        VALUES (NEW.id, NEW.status, OLD.status);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS robot_status_change_trigger ON robots;
CREATE TRIGGER robot_status_change_trigger
    AFTER UPDATE ON robots
    FOR EACH ROW EXECUTE FUNCTION log_robot_status_change();

COMMIT;