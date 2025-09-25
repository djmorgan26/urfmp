import { Client } from 'pg'
import app from '../app'
import type { Application } from 'express'

export interface TestSetup {
  app: Application
  dbClient: Client
}

export async function setupTestEnvironment(): Promise<TestSetup> {
  // Set test environment variables
  process.env.NODE_ENV = 'test'
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://urfmp:urfmp-dev-2024@localhost:5432/urfmp_test'
  process.env.JWT_SECRET = 'test-jwt-secret'
  process.env.REDIS_URL = 'redis://localhost:6379/1' // Use test Redis DB

  // Create test database client
  const dbClient = new Client({
    connectionString: process.env.DATABASE_URL
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
    await dbClient.query('DELETE FROM robot_commands WHERE created_at > NOW() - INTERVAL \'1 hour\'')
    await dbClient.query('DELETE FROM robot_telemetry WHERE timestamp > NOW() - INTERVAL \'1 hour\'')
    await dbClient.query('DELETE FROM robots WHERE name LIKE \'Test %\'')
    await dbClient.query('DELETE FROM users WHERE email LIKE \'%@test.com\'')
  } catch (error) {
    console.warn('Could not reset test database:', error)
  }
}

export const TEST_USER = {
  id: '3885c041-ebf4-4fdd-a6ec-7d88216ded2d',
  email: 'admin@urfmp.com',
  organizationId: 'd8077863-d602-45fd-a253-78ee0d3d49a8'
}

export const TEST_API_KEY = 'urfmp_dev_9f8e7d6c5b4a3910efabcdef12345678'