-- Migration: 20250918-194500-seed-admin-user
-- Description: Create initial admin user and organization
-- Created: 2025-09-18T23:45:00.000Z

BEGIN;

-- Insert default organization
INSERT INTO organizations (id, name, slug, description, plan, is_active)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'URFMP Demo Organization',
    'urfmp-demo',
    'Default organization for URFMP demonstration',
    'free',
    true
) ON CONFLICT (slug) DO NOTHING;

-- Insert default admin user
-- Password: 'admin123' (bcrypt hash with 12 rounds)
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
) VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'admin@urfmp.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8xOx9HAZGa',
    'URFMP',
    'Administrator',
    'admin',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
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
) ON CONFLICT (email) DO NOTHING;

-- Insert a demo robot
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
) VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Demo Robot 1',
    'UR10e',
    'universal_robots',
    'UR10e-DEMO-001',
    '5.12.0',
    'offline',
    '{"facility": "Demo Factory", "area": "Assembly Line 1", "cell": "Cell 3"}',
    '{"axes": 6, "payload": 12.5, "reach": 1300, "capabilities": ["welding", "assembly"]}',
    '{"host": "192.168.1.100", "port": 30001, "timeout": 5000}',
    true
) ON CONFLICT (id) DO NOTHING;

COMMIT;