-- Migration: 20250930-143900-force-seed-data
-- Description: Force insert seed data for Railway deployment
-- Created: 2025-09-30T14:39:00.000Z

BEGIN;

-- Insert organization if it doesn't exist
INSERT INTO organizations (id, name, slug, description, plan, is_active)
SELECT 
    'd8077863-d602-45fd-a253-78ee0d3d49a8',
    'URFMP Demo',
    'urfmp-demo', 
    'Demo organization for URFMP',
    'enterprise',
    true
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE slug = 'urfmp-demo');

-- Insert admin user if it doesn't exist
INSERT INTO users (
    id,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    organization_id,
    permissions,
    is_active,
    email_verified
)
SELECT 
    '3885c041-ebf4-4fdd-a6ec-7d88216ded2d',
    'admin@urfmp.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8xOx9HAZGa',
    'Admin',
    'User',
    'admin',
    'd8077863-d602-45fd-a253-78ee0d3d49a8',
    ARRAY[
        'robot.view', 'robot.create', 'robot.update', 'robot.delete',
        'telemetry.view', 'telemetry.write',
        'maintenance.view', 'maintenance.create', 'maintenance.update', 'maintenance.delete',
        'user.view', 'user.create', 'user.update', 'user.delete',
        'organization.view', 'organization.update',
        'alert.view', 'alert.create', 'alert.update',
        'api_key.view', 'api_key.create', 'api_key.delete'
    ],
    true,
    true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@urfmp.com');

-- Insert API key if it doesn't exist
INSERT INTO api_keys (
    id,
    user_id,
    organization_id,
    name,
    key_hash,
    scope,
    expires_at,
    is_active
)
SELECT 
    'api-key-dev-001',
    '3885c041-ebf4-4fdd-a6ec-7d88216ded2d',
    'd8077863-d602-45fd-a253-78ee0d3d49a8',
    'Development API Key',
    'urfmp_dev_9f8e7d6c5b4a3910efabcdef12345678',
    ARRAY[
        'robot.view', 'robot.create', 'robot.update', 'robot.delete',
        'telemetry.view', 'telemetry.write',
        'maintenance.view', 'user.view', 'organization.view'
    ],
    NULL,
    true
WHERE NOT EXISTS (SELECT 1 FROM api_keys WHERE key_hash = 'urfmp_dev_9f8e7d6c5b4a3910efabcdef12345678');

-- Insert demo robot if it doesn't exist
INSERT INTO robots (
    id,
    organization_id,
    name,
    model,
    vendor,
    serial_number,
    firmware_version,
    status,
    location,
    configuration,
    connection_config,
    is_active
)
SELECT 
    'demo-robot-001',
    'd8077863-d602-45fd-a253-78ee0d3d49a8',
    'Demo Robot UR5e',
    'UR5e',
    'universal_robots',
    'UR5e-DEMO-001',
    '5.12.0',
    'offline',
    '{"facility": "Demo Factory", "area": "Assembly Line 1", "cell": "Cell 3"}',
    '{"axes": 6, "payload": 5.0, "reach": 850, "capabilities": ["welding", "assembly"]}',
    '{"host": "192.168.1.100", "port": 30001, "timeout": 5000}',
    true
WHERE NOT EXISTS (SELECT 1 FROM robots WHERE serial_number = 'UR5e-DEMO-001');

COMMIT;
