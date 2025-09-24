# URFMP Database Schema

## Overview

URFMP uses PostgreSQL as the primary database with TimescaleDB extension for time-series data. Redis is used for caching and session storage.

## Database Configuration

### PostgreSQL (TimescaleDB)

- **Host**: localhost:5432 (development)
- **Database**: urfmp
- **User**: urfmp
- **Extensions**: TimescaleDB for time-series data

### Redis

- **Host**: localhost:6379 (development)
- **Usage**: Sessions, caching, rate limiting

## Core Tables

### Users & Authentication

#### `users`

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'operator',
    organization_id UUID NOT NULL,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_users_organization
        FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
```

#### `user_sessions`

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,

    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);
```

### Organizations

#### `organizations`

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    settings JSONB DEFAULT '{}',
    plan VARCHAR(50) DEFAULT 'free',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_plan ON organizations(plan);
```

### Robots

#### `robots`

```sql
CREATE TABLE robots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    model VARCHAR(100),
    vendor VARCHAR(50) NOT NULL,
    serial_number VARCHAR(100),
    firmware_version VARCHAR(50),
    status VARCHAR(50) DEFAULT 'offline',
    location JSONB, -- {facility, area, cell, coordinates}
    configuration JSONB NOT NULL, -- {axes, payload, reach, capabilities, customSettings}
    connection_config JSONB, -- Vendor-specific connection settings
    last_seen TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_robots_organization
        FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE INDEX idx_robots_organization ON robots(organization_id);
CREATE INDEX idx_robots_status ON robots(status);
CREATE INDEX idx_robots_vendor ON robots(vendor);
CREATE INDEX idx_robots_last_seen ON robots(last_seen);
```

#### `robot_commands`

```sql
CREATE TABLE robot_commands (
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

CREATE INDEX idx_commands_robot ON robot_commands(robot_id);
CREATE INDEX idx_commands_status ON robot_commands(status);
CREATE INDEX idx_commands_created ON robot_commands(created_at);
```

### Telemetry (TimescaleDB Hypertables)

#### `robot_telemetry`

```sql
CREATE TABLE robot_telemetry (
    time TIMESTAMPTZ NOT NULL,
    robot_id UUID NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    value DOUBLE PRECISION,
    unit VARCHAR(20),
    metadata JSONB,

    CONSTRAINT fk_telemetry_robot
        FOREIGN KEY (robot_id) REFERENCES robots(id) ON DELETE CASCADE
);

-- Convert to hypertable for time-series optimization
SELECT create_hypertable('robot_telemetry', 'time');

CREATE INDEX idx_telemetry_robot_time ON robot_telemetry(robot_id, time DESC);
CREATE INDEX idx_telemetry_metric ON robot_telemetry(metric_name, time DESC);
```

#### `robot_status_history`

```sql
CREATE TABLE robot_status_history (
    time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    robot_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL,
    previous_status VARCHAR(50),
    reason TEXT,
    metadata JSONB,

    CONSTRAINT fk_status_history_robot
        FOREIGN KEY (robot_id) REFERENCES robots(id) ON DELETE CASCADE
);

SELECT create_hypertable('robot_status_history', 'time');

CREATE INDEX idx_status_history_robot ON robot_status_history(robot_id, time DESC);
```

### Maintenance

#### `maintenance_tasks`

```sql
CREATE TABLE maintenance_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    robot_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- 'preventive', 'corrective', 'emergency'
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'scheduled',
    assigned_to UUID,
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    estimated_duration INTEGER, -- minutes
    actual_duration INTEGER, -- minutes
    cost DECIMAL(10,2),
    parts_used JSONB,
    notes TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_maintenance_robot
        FOREIGN KEY (robot_id) REFERENCES robots(id),
    CONSTRAINT fk_maintenance_assigned
        FOREIGN KEY (assigned_to) REFERENCES users(id),
    CONSTRAINT fk_maintenance_created
        FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_maintenance_robot ON maintenance_tasks(robot_id);
CREATE INDEX idx_maintenance_status ON maintenance_tasks(status);
CREATE INDEX idx_maintenance_scheduled ON maintenance_tasks(scheduled_at);
```

### Alerts & Notifications

#### `alerts`

```sql
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    robot_id UUID,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'info', 'warning', 'error', 'critical'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    source VARCHAR(100), -- 'robot', 'system', 'maintenance'
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

CREATE INDEX idx_alerts_robot ON alerts(robot_id);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_created ON alerts(created_at);
CREATE INDEX idx_alerts_unresolved ON alerts(is_resolved, created_at) WHERE NOT is_resolved;
```

### API & Security

#### `api_keys`

```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    key_prefix VARCHAR(20) NOT NULL, -- For display purposes
    permissions TEXT[] DEFAULT '{}',
    rate_limit INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_api_keys_organization
        FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_api_keys_user
        FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_organization ON api_keys(organization_id);
```

#### `audit_logs`

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    request_data JSONB,
    response_data JSONB,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_audit_organization
        FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_audit_user
        FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_audit_organization ON audit_logs(organization_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
CREATE INDEX idx_audit_action ON audit_logs(action);
```

## Views

### `robot_status_current`

```sql
CREATE VIEW robot_status_current AS
SELECT DISTINCT ON (robot_id)
    robot_id,
    status,
    time as status_changed_at,
    reason,
    metadata
FROM robot_status_history
ORDER BY robot_id, time DESC;
```

### `maintenance_summary`

```sql
CREATE VIEW maintenance_summary AS
SELECT
    robot_id,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
    COUNT(*) FILTER (WHERE status = 'overdue') as overdue_tasks,
    SUM(cost) as total_cost,
    AVG(actual_duration) as avg_duration
FROM maintenance_tasks
GROUP BY robot_id;
```

## Functions & Triggers

### Update Timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_robots_updated_at
    BEFORE UPDATE ON robots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_updated_at
    BEFORE UPDATE ON maintenance_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Robot Status Change Trigger

```sql
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

CREATE TRIGGER robot_status_change_trigger
    AFTER UPDATE ON robots
    FOR EACH ROW EXECUTE FUNCTION log_robot_status_change();
```

## Data Retention Policies

### TimescaleDB Retention

```sql
-- Keep telemetry data for 1 year
SELECT add_retention_policy('robot_telemetry', INTERVAL '1 year');

-- Keep status history for 2 years
SELECT add_retention_policy('robot_status_history', INTERVAL '2 years');
```

### Manual Cleanup

```sql
-- Clean up old sessions (older than 30 days)
DELETE FROM user_sessions
WHERE expires_at < NOW() - INTERVAL '30 days';

-- Clean up old audit logs (older than 1 year)
DELETE FROM audit_logs
WHERE created_at < NOW() - INTERVAL '1 year';
```

## Indexes Strategy

### Performance Indexes

- Time-based queries: Compound indexes with time column
- Foreign key lookups: Indexes on all foreign key columns
- Status queries: Indexes on status columns
- Search queries: GIN indexes on JSONB columns where needed

### Monitoring Queries

```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Check table sizes
SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Migrations

Migrations are handled through the API service in `services/api/src/migrations/`.

### Migration Template

```sql
-- Migration: YYYY-MM-DD-HH-MM-description.sql
-- Up migration

BEGIN;

-- Add your schema changes here

COMMIT;

-- Down migration (in separate file)
-- BEGIN;
-- -- Revert changes
-- COMMIT;
```

## Backup Strategy

### Development

- Docker volume persistence
- Manual exports for testing

### Production

- Automated daily backups
- Point-in-time recovery
- Cross-region replication for critical data

---

_Schema will evolve as features are implemented_
