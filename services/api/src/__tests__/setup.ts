// Set test environment variables BEFORE any imports to ensure proper service initialization
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL || 'postgresql://urfmp:urfmp-dev-2024@localhost:5432/urfmp_test'
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret'
process.env.REDIS_URL = 'redis://localhost:6379/1' // Use test Redis DB

import { Client } from 'pg'
import app from '../app'
import type { Application } from 'express'

// Mock bcrypt for CI environment
jest.mock('bcrypt', () => ({
  compare: jest.fn().mockImplementation((password: string, _hash: string) => {
    // Mock bcrypt comparison - in tests, accept 'admin123' for any hash
    return Promise.resolve(password === 'admin123')
  }),
  hash: jest.fn().mockResolvedValue('$2b$10$test.hash.for.admin123'),
}))

// Also mock bcryptjs since auth service imports bcryptjs
jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockImplementation((password: string, _hash: string) => {
    // Mock bcrypt comparison - in tests, accept 'admin123' for any hash
    return Promise.resolve(password === 'admin123')
  }),
  hash: jest.fn().mockResolvedValue('$2b$10$test.hash.for.admin123'),
}))

// Mock PostgreSQL for CI environment
jest.mock('pg', () => {
  const mockQuery = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 })
  const mockConnect = jest.fn().mockResolvedValue(undefined)
  const mockEnd = jest.fn().mockResolvedValue(undefined)

  return {
    Client: jest.fn().mockImplementation(() => ({
      connect: mockConnect,
      end: mockEnd,
      query: mockQuery,
      on: jest.fn(),
      removeListener: jest.fn(),
    })),
    Pool: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue({
        query: mockQuery,
        release: jest.fn(),
      }),
      end: mockEnd,
      query: mockQuery,
      on: jest.fn(),
    })),
  }
})

// Mock database configuration for CI environment
jest.mock('../config/database', () => ({
  pool: {
    connect: jest.fn().mockResolvedValue({
      query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
      release: jest.fn(),
    }),
    end: jest.fn().mockResolvedValue(undefined),
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    totalCount: 0,
    idleCount: 0,
    waitingCount: 0,
  },
  query: jest.fn().mockImplementation((text: string, params: any[] = []) => {
    // Mock different queries based on SQL content
    if (text.includes('SELECT NOW() as timestamp')) {
      return Promise.resolve({ rows: [{ timestamp: new Date(), version: 'PostgreSQL 14.0' }], rowCount: 1 })
    }
    if (text.includes('FROM users') && text.includes('JOIN organizations') && text.includes('WHERE')) {
      // Mock user authentication query with organization JOIN
      const email = params?.[0] || params?.find?.(p => typeof p === 'string' && p.includes('@'))
      if (email === 'admin@urfmp.com') {
        return Promise.resolve({
          rows: [{
            id: '3885c041-ebf4-4fdd-a6ec-7d88216ded2d',
            email: 'admin@urfmp.com',
            password_hash: '$2b$10$test.hash.for.admin123',
            first_name: 'Admin',
            last_name: 'User',
            role: 'admin',
            permissions: ['robot.view', 'robot.create', 'robot.update', 'robot.delete', 'telemetry.view', 'telemetry.write'],
            organization_id: 'd8077863-d602-45fd-a253-78ee0d3d49a8',
            org_id: 'd8077863-d602-45fd-a253-78ee0d3d49a8',
            org_name: 'URFMP Demo',
            org_slug: 'urfmp-demo',
            org_plan: 'enterprise'
          }],
          rowCount: 1
        })
      }
      return Promise.resolve({ rows: [], rowCount: 0 })
    }
    if (text.includes('FROM users') && text.includes('WHERE email')) {
      // Mock simple user query
      const email = params?.[0] || params?.find?.(p => typeof p === 'string' && p.includes('@'))
      if (email === 'admin@urfmp.com') {
        return Promise.resolve({
          rows: [{
            id: '3885c041-ebf4-4fdd-a6ec-7d88216ded2d',
            email: 'admin@urfmp.com',
            password_hash: '$2b$10$test.hash.for.admin123',
            first_name: 'Admin',
            last_name: 'User',
            role: 'admin',
            email_verified: true,
            organization_id: 'd8077863-d602-45fd-a253-78ee0d3d49a8',
            permissions: ['robot.view', 'robot.create', 'robot.update', 'robot.delete', 'telemetry.view', 'telemetry.write']
          }],
          rowCount: 1
        })
      }
      return Promise.resolve({ rows: [], rowCount: 0 })
    }
    if (text.includes('FROM users') && text.includes('WHERE id')) {
      // Mock user lookup by ID for refresh token validation
      const userId = params?.[0]
      if (userId === '3885c041-ebf4-4fdd-a6ec-7d88216ded2d') {
        return Promise.resolve({
          rows: [{
            id: '3885c041-ebf4-4fdd-a6ec-7d88216ded2d',
            email: 'admin@urfmp.com',
            first_name: 'Admin',
            last_name: 'User',
            role: 'admin',
            permissions: ['robot.view', 'robot.create', 'robot.update', 'robot.delete', 'telemetry.view', 'telemetry.write']
          }],
          rowCount: 1
        })
      }
      return Promise.resolve({ rows: [], rowCount: 0 })
    }
    if (text.includes('FROM organizations') && text.includes('WHERE id')) {
      // Mock organization lookup by ID for refresh token validation
      const orgId = params?.[0]
      if (orgId === 'd8077863-d602-45fd-a253-78ee0d3d49a8') {
        return Promise.resolve({
          rows: [{
            id: 'd8077863-d602-45fd-a253-78ee0d3d49a8',
            name: 'URFMP Demo',
            slug: 'urfmp-demo',
            plan: 'enterprise'
          }],
          rowCount: 1
        })
      }
      return Promise.resolve({ rows: [], rowCount: 0 })
    }
    // Mock API key queries for authentication
    if (text.includes('FROM api_keys') && text.includes('WHERE ak.key_hash')) {
      const keyHash = params?.[0]
      if (keyHash === 'urfmp_dev_9f8e7d6c5b4a3910efabcdef12345678') {
        return Promise.resolve({
          rows: [{
            id: 'test-api-key-id',
            user_id: '3885c041-ebf4-4fdd-a6ec-7d88216ded2d',
            organization_id: 'd8077863-d602-45fd-a253-78ee0d3d49a8',
            scope: ['robot.view', 'robot.create', 'robot.update', 'robot.delete', 'telemetry.view', 'telemetry.write'],
            expires_at: null,
            is_active: true,
            user_email: 'admin@urfmp.com'
          }],
          rowCount: 1
        })
      }
      return Promise.resolve({ rows: [], rowCount: 0 })
    }
    // Mock robots queries for API tests
    if (text.includes('FROM robots')) {
      // Handle specific robot ID queries
      if (text.includes('WHERE id = $1') || text.includes('WHERE r.id = $1')) {
        const robotId = params?.[0]
        if (robotId === 'test-robot-id') {
          return Promise.resolve({
            rows: [{
              id: 'test-robot-id',
              name: 'Test Robot',
              vendor: 'universal_robots',
              model: 'UR5e',
              serial_number: 'UR12345',
              status: 'online',
              created_at: new Date(),
              updated_at: new Date(),
              organization_id: 'd8077863-d602-45fd-a253-78ee0d3d49a8'
            }],
            rowCount: 1
          })
        }
        // Return empty for non-existent robot IDs (should trigger 404)
        return Promise.resolve({ rows: [], rowCount: 0 })
      }

      // Handle serial number uniqueness checks for robot creation
      if (text.includes('WHERE organization_id = $1 AND serial_number = $2')) {
        const serialNumber = params?.[1]
        if (serialNumber === 'UR12345') {
          // Return existing robot to simulate "already exists" scenario
          return Promise.resolve({
            rows: [{
              id: 'test-robot-id',
              serial_number: 'UR12345',
              organization_id: 'd8077863-d602-45fd-a253-78ee0d3d49a8'
            }],
            rowCount: 1
          })
        }
        // Allow TEST123456 for robot creation tests
        if (serialNumber === 'TEST123456') {
          return Promise.resolve({ rows: [], rowCount: 0 })
        }
        // Return empty for new serial numbers (allow creation)
        return Promise.resolve({ rows: [], rowCount: 0 })
      }

      // Handle robot list queries (no WHERE clause for specific ID)
      if (!text.includes('WHERE id = $1') && !text.includes('WHERE organization_id = $1 AND serial_number = $2')) {
        return Promise.resolve({
          rows: [{
            id: 'test-robot-id',
            name: 'Test Robot',
            vendor: 'universal_robots',
            model: 'UR5e',
            serial_number: 'UR12345',
            status: 'online',
            created_at: new Date(),
            updated_at: new Date(),
            organization_id: 'd8077863-d602-45fd-a253-78ee0d3d49a8'
          }],
          rowCount: 1
        })
      }

      // Handle robot creation (INSERT) queries
      if (text.includes('INSERT INTO robots')) {
        const createdRobotId = 'newly-created-robot-id'
        return Promise.resolve({
          rows: [{
            id: createdRobotId,
            name: 'Test Robot UR5e',
            vendor: 'universal_robots',
            model: 'UR5e',
            serial_number: 'TEST123456',
            status: 'offline',
            created_at: new Date(),
            updated_at: new Date(),
            organization_id: 'd8077863-d602-45fd-a253-78ee0d3d49a8'
          }],
          rowCount: 1
        })
      }

      // Default fallback
      return Promise.resolve({ rows: [], rowCount: 0 })
    }
    // Default mock response
    return Promise.resolve({ rows: [], rowCount: 0 })
  }),
  transaction: jest.fn().mockImplementation(async (callback) => callback({
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  })),
  connectDatabase: jest.fn().mockResolvedValue(undefined),
  getDatabase: jest.fn().mockReturnValue({
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  }),
  checkDatabaseHealth: jest.fn().mockResolvedValue({
    status: 'healthy',
    details: {
      timestamp: new Date(),
      version: 'PostgreSQL 14.0',
      responseTime: 10,
      totalConnections: 0,
      idleConnections: 0,
      waitingConnections: 0,
    },
  }),
  closeDatabase: jest.fn().mockResolvedValue(undefined),
  createHypertable: jest.fn().mockResolvedValue(undefined),
  createIndex: jest.fn().mockResolvedValue(undefined),
}))

// Mock Redis for CI environment
jest.mock('../config/redis', () => ({
  connectRedis: jest.fn().mockResolvedValue(undefined),
  getRedis: jest.fn().mockReturnValue({
    ping: jest.fn().mockResolvedValue('PONG'),
    get: jest.fn().mockImplementation(async (key: string) => {
      // For rate limiting keys, return a number as string
      if (key.includes('rate-limit') || key.includes('rl:')) {
        return '1'
      }
      return null
    }),
    set: jest.fn().mockResolvedValue('OK'),
    setex: jest.fn().mockResolvedValue('OK'),
    incr: jest.fn().mockResolvedValue(1), // Return positive integer for rate limiting
    del: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(0),
    publish: jest.fn().mockResolvedValue(1),
    multi: jest.fn().mockReturnValue({
      get: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      incr: jest.fn().mockReturnThis(),
      expire: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([
        [null, 1], // Result for incr operation (totalHits)
        [null, 1], // Result for expire operation
      ]),
    }),
    duplicate: jest.fn().mockReturnValue({
      subscribe: jest.fn(),
      on: jest.fn(),
    }),
    status: 'ready',
  }),
  cache: {
    get: jest.fn().mockImplementation(async (key: string) => {
      // Use a simple in-memory store for tests
      const store = (global as any).__testCacheStore__ || {}
      const value = store[key]

      // Special handling for authentication cache keys
      if (key.startsWith('blacklisted_token:')) {
        return null // Never blacklisted in tests
      }

      return value || null
    }),
    set: jest.fn().mockImplementation(async (key: string, value: string, _ttl?: number) => {
      // Store in global test cache
      const store = (global as any).__testCacheStore__ || {}
      store[key] = value
      ;(global as any).__testCacheStore__ = store
      return true
    }),
    del: jest.fn().mockImplementation(async (key: string) => {
      const store = (global as any).__testCacheStore__ || {}
      delete store[key]
      ;(global as any).__testCacheStore__ = store
      return true
    }),
    exists: jest.fn().mockResolvedValue(false),
  },
  pubsub: {
    publish: jest.fn().mockResolvedValue(true),
    subscribe: jest.fn(),
  },
  checkRedisHealth: jest.fn().mockResolvedValue({
    status: 'healthy',
    details: { responseTime: 1, connected: true },
  }),
}))

// Mock RabbitMQ for CI environment
jest.mock('../config/rabbitmq', () => ({
  connectRabbitMQ: jest.fn().mockResolvedValue(undefined),
  getRabbitMQ: jest.fn().mockReturnValue({
    connection: { close: jest.fn() },
    channel: {
      assertQueue: jest.fn().mockResolvedValue({ queue: 'test' }),
      sendToQueue: jest.fn().mockResolvedValue(true),
      consume: jest.fn().mockResolvedValue({ consumerTag: 'test' }),
      ack: jest.fn(),
      nack: jest.fn(),
      close: jest.fn(),
    },
  }),
  checkRabbitMQHealth: jest.fn().mockResolvedValue({
    status: 'healthy',
    details: { connected: true },
  }),
  closeRabbitMQ: jest.fn().mockResolvedValue(undefined),
}))

export interface TestSetup {
  app: Application
  dbClient: Client
}

export async function setupTestEnvironment(): Promise<TestSetup> {
  // Environment variables are already set at the top of this file

  // Create test database client
  const dbClient = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    await dbClient.connect()
  } catch (error) {
    console.warn('Test database not available, skipping DB tests:', error)
  }

  // Express app is already created in app.ts

  return { app, dbClient }
}

export async function teardownTestEnvironment(setup: TestSetup) {
  if (setup.dbClient) {
    await setup.dbClient.end()
  }
}

export async function resetTestDatabase(dbClient: Client) {
  if (!dbClient) return

  try {
    // Clean up test data - be careful not to affect real data
    await dbClient.query("DELETE FROM robot_commands WHERE created_at > NOW() - INTERVAL '1 hour'")
    await dbClient.query("DELETE FROM robot_telemetry WHERE timestamp > NOW() - INTERVAL '1 hour'")
    await dbClient.query("DELETE FROM robots WHERE name LIKE 'Test %'")
    await dbClient.query("DELETE FROM users WHERE email LIKE '%@test.com'")
  } catch (error) {
    console.warn('Could not reset test database:', error)
  }
}

export const TEST_USER = {
  id: '3885c041-ebf4-4fdd-a6ec-7d88216ded2d',
  email: 'admin@urfmp.com',
  organizationId: 'd8077863-d602-45fd-a253-78ee0d3d49a8',
}

export const TEST_API_KEY = 'urfmp_dev_9f8e7d6c5b4a3910efabcdef12345678'
