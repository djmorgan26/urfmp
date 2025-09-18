-- URFMP Initial Database Schema
-- Universal Robot Fleet Management Platform

-- Create organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  plan VARCHAR(50) NOT NULL DEFAULT 'free',
  settings JSONB DEFAULT '{}',
  limits JSONB DEFAULT '{}',
  billing JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'viewer',
  permissions TEXT[] DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  profile JSONB DEFAULT '{}',
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create robots table
CREATE TABLE robots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  vendor VARCHAR(100) NOT NULL,
  serial_number VARCHAR(255) NOT NULL,
  firmware_version VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'offline',
  location JSONB DEFAULT '{}',
  configuration JSONB DEFAULT '{}',
  last_seen TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, serial_number)
);

-- Create robot_telemetry hypertable (TimescaleDB)
CREATE TABLE robot_telemetry (
  id UUID DEFAULT gen_random_uuid(),
  robot_id UUID NOT NULL REFERENCES robots(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  PRIMARY KEY (id, timestamp)
);

-- Convert to hypertable (TimescaleDB)
SELECT create_hypertable('robot_telemetry', 'timestamp', chunk_time_interval => INTERVAL '1 day');

-- Create maintenance_tasks table
CREATE TABLE maintenance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  robot_id UUID NOT NULL REFERENCES robots(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT[],
  estimated_duration INTEGER, -- minutes
  actual_duration INTEGER, -- minutes
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  assigned_to UUID REFERENCES users(id),
  created_by UUID NOT NULL REFERENCES users(id),
  parts JSONB DEFAULT '[]',
  checklist_items JSONB DEFAULT '[]',
  attachments JSONB DEFAULT '[]',
  notes JSONB DEFAULT '[]',
  cost JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule JSONB,
  parent_task_id UUID REFERENCES maintenance_tasks(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create maintenance_predictions table
CREATE TABLE maintenance_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  robot_id UUID NOT NULL REFERENCES robots(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  component VARCHAR(100) NOT NULL,
  prediction_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  predicted_failure_date TIMESTAMP WITH TIME ZONE NOT NULL,
  remaining_useful_life INTEGER NOT NULL, -- days or hours
  trigger_metrics JSONB DEFAULT '[]',
  recommendation JSONB NOT NULL,
  model_version VARCHAR(50) NOT NULL,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(100) NOT NULL,
  source VARCHAR(100) NOT NULL,
  robot_id UUID REFERENCES robots(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  severity VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create api_keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  prefix VARCHAR(20) NOT NULL,
  scope TEXT[] NOT NULL DEFAULT '{}',
  rate_limit JSONB,
  ip_whitelist INET[],
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  resource VARCHAR(50) NOT NULL,
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for performance

-- Organizations indexes
CREATE INDEX idx_organizations_slug ON organizations(slug);

-- Users indexes
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);

-- Robots indexes
CREATE INDEX idx_robots_organization_id ON robots(organization_id);
CREATE INDEX idx_robots_vendor ON robots(vendor);
CREATE INDEX idx_robots_status ON robots(status);
CREATE INDEX idx_robots_last_seen ON robots(last_seen);

-- Robot telemetry indexes (TimescaleDB optimized)
CREATE INDEX idx_robot_telemetry_robot_id ON robot_telemetry(robot_id, timestamp DESC);
CREATE INDEX idx_robot_telemetry_timestamp ON robot_telemetry(timestamp DESC);

-- Maintenance tasks indexes
CREATE INDEX idx_maintenance_tasks_robot_id ON maintenance_tasks(robot_id);
CREATE INDEX idx_maintenance_tasks_organization_id ON maintenance_tasks(organization_id);
CREATE INDEX idx_maintenance_tasks_status ON maintenance_tasks(status);
CREATE INDEX idx_maintenance_tasks_due_date ON maintenance_tasks(due_date);
CREATE INDEX idx_maintenance_tasks_assigned_to ON maintenance_tasks(assigned_to);

-- Maintenance predictions indexes
CREATE INDEX idx_maintenance_predictions_robot_id ON maintenance_predictions(robot_id);
CREATE INDEX idx_maintenance_predictions_organization_id ON maintenance_predictions(organization_id);
CREATE INDEX idx_maintenance_predictions_predicted_failure_date ON maintenance_predictions(predicted_failure_date);

-- Events indexes
CREATE INDEX idx_events_organization_id ON events(organization_id);
CREATE INDEX idx_events_robot_id ON events(robot_id);
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_severity ON events(severity);
CREATE INDEX idx_events_timestamp ON events(timestamp DESC);

-- API keys indexes
CREATE INDEX idx_api_keys_organization_id ON api_keys(organization_id);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_robots_updated_at BEFORE UPDATE ON robots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_tasks_updated_at BEFORE UPDATE ON maintenance_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create TimescaleDB compression policy for robot_telemetry
SELECT add_compression_policy('robot_telemetry', INTERVAL '7 days');

-- Create TimescaleDB retention policy for robot_telemetry (keep 2 years by default)
SELECT add_retention_policy('robot_telemetry', INTERVAL '2 years');

-- Create TimescaleDB continuous aggregates for telemetry analytics
CREATE MATERIALIZED VIEW robot_telemetry_hourly
WITH (timescaledb.continuous) AS
SELECT
  robot_id,
  time_bucket('1 hour', timestamp) AS bucket,
  COUNT(*) as data_points,
  AVG(CAST(data->>'temperature' AS DECIMAL)) as avg_temperature,
  MAX(CAST(data->>'temperature' AS DECIMAL)) as max_temperature,
  MIN(CAST(data->>'temperature' AS DECIMAL)) as min_temperature,
  AVG(CAST(data->>'position'->>'x' AS DECIMAL)) as avg_position_x,
  AVG(CAST(data->>'position'->>'y' AS DECIMAL)) as avg_position_y,
  AVG(CAST(data->>'position'->>'z' AS DECIMAL)) as avg_position_z
FROM robot_telemetry
WHERE data ? 'temperature' OR data ? 'position'
GROUP BY robot_id, bucket;

-- Add refresh policy for continuous aggregate
SELECT add_continuous_aggregate_policy('robot_telemetry_hourly',
  start_offset => INTERVAL '3 hours',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour');

-- Insert default organization for development
INSERT INTO organizations (name, slug, plan)
VALUES ('URFMP Demo', 'demo', 'professional')
ON CONFLICT (slug) DO NOTHING;