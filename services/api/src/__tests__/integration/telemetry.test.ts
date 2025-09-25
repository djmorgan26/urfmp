import request from 'supertest'
import {
  setupTestEnvironment,
  teardownTestEnvironment,
  resetTestDatabase,
  TEST_API_KEY,
  type TestSetup,
} from '../setup'

describe('Telemetry API Integration Tests', () => {
  let setup: TestSetup
  let testRobotId: string

  beforeAll(async () => {
    setup = await setupTestEnvironment()

    // Get a robot ID for telemetry tests
    try {
      const robotsResponse = await request(setup.app)
        .get('/api/v1/robots')
        .set('X-API-Key', TEST_API_KEY)

      if (robotsResponse.status === 200 && robotsResponse.body.data.length > 0) {
        testRobotId = robotsResponse.body.data[0].id
      }
    } catch (error) {
      console.warn('Could not get test robot ID:', error)
      testRobotId = '12345678-1234-4000-8000-123456789012' // Fallback test ID
    }
  })

  afterAll(async () => {
    await teardownTestEnvironment(setup)
  })

  beforeEach(async () => {
    await resetTestDatabase(setup.dbClient)
  })

  describe('POST /api/v1/telemetry/:robotId', () => {
    it('should accept telemetry data with valid authentication', async () => {
      const telemetryData = {
        data: {
          position: {
            x: 125.5,
            y: 245.8,
            z: 300.2,
            rx: 0.1,
            ry: 0.2,
            rz: 0.3,
          },
          jointAngles: {
            joint1: 0.1,
            joint2: 0.2,
            joint3: 0.3,
            joint4: 0.4,
            joint5: 0.5,
            joint6: 0.6,
            unit: 'radians',
          },
          temperature: {
            ambient: 25.3,
            controller: 35.7,
            unit: 'celsius',
          },
          power: {
            voltage: 48.2,
            current: 2.15,
            unit: 'watts',
          },
        },
      }

      const response = await request(setup.app)
        .post(`/api/v1/telemetry/${testRobotId}`)
        .set('X-API-Key', TEST_API_KEY)
        .send(telemetryData)
        .expect(201)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data).toHaveProperty('robotId', testRobotId)
      expect(response.body.data).toHaveProperty('timestamp')
    })

    it('should reject telemetry without authentication', async () => {
      const telemetryData = {
        data: {
          position: { x: 0, y: 0, z: 0 },
        },
      }

      const response = await request(setup.app)
        .post(`/api/v1/telemetry/${testRobotId}`)
        .send(telemetryData)
        .expect(401)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error.code).toBe('MISSING_TOKEN')
    })

    it('should reject invalid robot ID', async () => {
      const invalidRobotId = 'invalid-robot-id'
      const telemetryData = {
        data: {
          position: { x: 0, y: 0, z: 0 },
        },
      }

      const response = await request(setup.app)
        .post(`/api/v1/telemetry/${invalidRobotId}`)
        .set('X-API-Key', TEST_API_KEY)
        .send(telemetryData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error.code).toBe('INVALID_UUID')
    })

    it('should reject empty telemetry data', async () => {
      const emptyTelemetry = {}

      const response = await request(setup.app)
        .post(`/api/v1/telemetry/${testRobotId}`)
        .set('X-API-Key', TEST_API_KEY)
        .send(emptyTelemetry)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('GET /api/v1/telemetry/:robotId/latest', () => {
    it('should get latest telemetry data', async () => {
      const response = await request(setup.app)
        .get(`/api/v1/telemetry/${testRobotId}/latest`)
        .set('X-API-Key', TEST_API_KEY)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')

      if (response.body.data) {
        expect(response.body.data).toHaveProperty('id')
        expect(response.body.data).toHaveProperty('robotId', testRobotId)
        expect(response.body.data).toHaveProperty('timestamp')
        expect(response.body.data).toHaveProperty('data')
      }
    })

    it('should handle robot with no telemetry data', async () => {
      const response = await request(setup.app)
        .get(`/api/v1/telemetry/${testRobotId}/latest`)
        .set('X-API-Key', TEST_API_KEY)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      // Data might be null if no telemetry exists
      expect(response.body).toHaveProperty('data')
    })
  })

  describe('GET /api/v1/telemetry/:robotId/history', () => {
    it('should get telemetry history with pagination', async () => {
      const response = await request(setup.app)
        .get(`/api/v1/telemetry/${testRobotId}/history`)
        .query({
          page: 1,
          limit: 10,
          from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
          to: new Date().toISOString(),
        })
        .set('X-API-Key', TEST_API_KEY)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toHaveProperty('pagination')
      expect(response.body.pagination).toHaveProperty('page', 1)
      expect(response.body.pagination).toHaveProperty('limit', 10)
    })

    it('should support metric filtering', async () => {
      const response = await request(setup.app)
        .get(`/api/v1/telemetry/${testRobotId}/history`)
        .query({
          metrics: 'position,temperature',
        })
        .set('X-API-Key', TEST_API_KEY)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
    })

    it('should validate date range parameters', async () => {
      const response = await request(setup.app)
        .get(`/api/v1/telemetry/${testRobotId}/history`)
        .query({
          from: 'invalid-date',
          to: new Date().toISOString(),
        })
        .set('X-API-Key', TEST_API_KEY)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('GET /api/v1/telemetry/:robotId/metrics', () => {
    it('should list available metrics for a robot', async () => {
      const response = await request(setup.app)
        .get(`/api/v1/telemetry/${testRobotId}/metrics`)
        .set('X-API-Key', TEST_API_KEY)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)

      // Each metric should have name and type
      response.body.data.forEach((metric: any) => {
        expect(metric).toHaveProperty('name')
        expect(metric).toHaveProperty('type')
        expect(metric).toHaveProperty('unit')
      })
    })
  })

  describe('GET /api/v1/telemetry/aggregated', () => {
    it('should return aggregated telemetry across robots', async () => {
      const response = await request(setup.app)
        .get('/api/v1/telemetry/aggregated')
        .query({
          timeWindow: '1h',
          aggregation: 'average',
        })
        .set('X-API-Key', TEST_API_KEY)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('timeWindow', '1h')
      expect(response.body.data).toHaveProperty('aggregation', 'average')
      expect(response.body.data).toHaveProperty('metrics')
    })

    it('should validate aggregation parameters', async () => {
      const response = await request(setup.app)
        .get('/api/v1/telemetry/aggregated')
        .query({
          timeWindow: 'invalid',
          aggregation: 'invalid',
        })
        .set('X-API-Key', TEST_API_KEY)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })
  })
})
