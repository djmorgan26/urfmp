import request from 'supertest'
import {
  setupTestEnvironment,
  teardownTestEnvironment,
  resetTestDatabase,
  TEST_API_KEY,
  type TestSetup,
} from '../setup'

describe('Robots API Integration Tests', () => {
  let setup: TestSetup
  let authToken: string

  beforeAll(async () => {
    setup = await setupTestEnvironment()

    // Get auth token for authenticated tests
    try {
      const loginResponse = await request(setup.app).post('/api/v1/auth/login').send({
        email: 'admin@urfmp.com',
        password: 'admin123',
      })

      if (loginResponse.status === 200) {
        authToken = loginResponse.body.data.tokens.accessToken
      }
    } catch (error) {
      console.warn('Could not get auth token for tests:', error)
    }
  })

  afterAll(async () => {
    await teardownTestEnvironment(setup)
  })

  beforeEach(async () => {
    await resetTestDatabase(setup.dbClient)
  })

  describe('GET /api/v1/robots', () => {
    it('should list robots with API key authentication', async () => {
      const response = await request(setup.app)
        .get('/api/v1/robots')
        .set('X-API-Key', TEST_API_KEY)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)

      if (response.body.data.length > 0) {
        const robot = response.body.data[0]
        expect(robot).toHaveProperty('id')
        expect(robot).toHaveProperty('name')
        expect(robot).toHaveProperty('model')
        expect(robot).toHaveProperty('vendor')
        expect(robot).toHaveProperty('status')
        expect(robot).toHaveProperty('organizationId')
      }
    })

    it('should list robots with JWT token authentication', async () => {
      if (!authToken) {
        console.warn('Skipping JWT test - no auth token available')
        return
      }

      const response = await request(setup.app)
        .get('/api/v1/robots')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should reject requests without authentication', async () => {
      const response = await request(setup.app).get('/api/v1/robots').expect(401)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error.code).toBe('MISSING_TOKEN')
    })

    it('should support pagination parameters', async () => {
      const response = await request(setup.app)
        .get('/api/v1/robots')
        .query({ page: 1, limit: 5 })
        .set('X-API-Key', TEST_API_KEY)
        .expect(200)

      expect(response.body).toHaveProperty('pagination')
      expect(response.body.pagination).toHaveProperty('page', 1)
      expect(response.body.pagination).toHaveProperty('limit', 5)
      expect(response.body.pagination).toHaveProperty('total')
      expect(response.body.pagination).toHaveProperty('hasNext')
      expect(response.body.pagination).toHaveProperty('hasPrev', false)
    })

    it('should support filtering by status', async () => {
      const response = await request(setup.app)
        .get('/api/v1/robots')
        .query({ status: 'online' })
        .set('X-API-Key', TEST_API_KEY)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')

      // All returned robots should have 'online' status
      response.body.data.forEach((robot: any) => {
        expect(robot.status).toBe('online')
      })
    })
  })

  describe('GET /api/v1/robots/:id', () => {
    it('should get robot by ID with valid authentication', async () => {
      // First get a list of robots to find a valid ID
      const listResponse = await request(setup.app)
        .get('/api/v1/robots')
        .set('X-API-Key', TEST_API_KEY)
        .expect(200)

      if (listResponse.body.data.length === 0) {
        console.warn('No robots found for individual robot test')
        return
      }

      const robotId = listResponse.body.data[0].id

      const response = await request(setup.app)
        .get(`/api/v1/robots/${robotId}`)
        .set('X-API-Key', TEST_API_KEY)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('id', robotId)
      expect(response.body.data).toHaveProperty('name')
      expect(response.body.data).toHaveProperty('model')
      expect(response.body.data).toHaveProperty('vendor')
      expect(response.body.data).toHaveProperty('status')
    })

    it('should return 404 for non-existent robot', async () => {
      const fakeId = '00000000-0000-4000-8000-000000000000'

      const response = await request(setup.app)
        .get(`/api/v1/robots/${fakeId}`)
        .set('X-API-Key', TEST_API_KEY)
        .expect(404)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error.code).toBe('ROBOT_NOT_FOUND')
    })

    it('should reject invalid UUID format', async () => {
      const invalidId = 'invalid-uuid'

      const response = await request(setup.app)
        .get(`/api/v1/robots/${invalidId}`)
        .set('X-API-Key', TEST_API_KEY)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error.code).toBe('INVALID_UUID')
    })
  })

  describe('POST /api/v1/robots', () => {
    it('should create robot with valid data', async () => {
      const robotData = {
        name: 'Test Robot UR5e',
        model: 'UR5e',
        vendor: 'universal_robots',
        serialNumber: 'TEST123456',
        firmwareVersion: '5.11.0',
        configuration: {
          axes: 6,
          payload: 5.0,
          reach: 850,
          capabilities: ['welding', 'assembly'],
          customSettings: {
            safetyMode: 'collaborative',
          },
        },
        location: {
          facility: 'Test Factory',
          area: 'Assembly Line 1',
          cell: 'Cell A1',
        },
      }

      const response = await request(setup.app)
        .post('/api/v1/robots')
        .set('X-API-Key', TEST_API_KEY)
        .send(robotData)
        .expect(201)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data).toHaveProperty('name', robotData.name)
      expect(response.body.data).toHaveProperty('model', robotData.model)
      expect(response.body.data).toHaveProperty('vendor', robotData.vendor)
      expect(response.body.data).toHaveProperty('status', 'offline') // Default status
      expect(response.body.data).toHaveProperty('createdAt')
      expect(response.body.data).toHaveProperty('updatedAt')
    })

    it('should reject robot with missing required fields', async () => {
      const incompleteRobot = {
        name: 'Test Robot',
        // missing model, vendor, serialNumber, etc.
      }

      const response = await request(setup.app)
        .post('/api/v1/robots')
        .set('X-API-Key', TEST_API_KEY)
        .send(incompleteRobot)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should reject robot with invalid vendor', async () => {
      const robotData = {
        name: 'Test Robot',
        model: 'UR5e',
        vendor: 'invalid_vendor',
        serialNumber: 'TEST123456',
        firmwareVersion: '5.11.0',
        configuration: {
          axes: 6,
          payload: 5.0,
          reach: 850,
          capabilities: [],
          customSettings: {},
        },
      }

      const response = await request(setup.app)
        .post('/api/v1/robots')
        .set('X-API-Key', TEST_API_KEY)
        .send(robotData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('GET /api/v1/robots/stats', () => {
    it('should return robot statistics', async () => {
      const response = await request(setup.app)
        .get('/api/v1/robots/stats')
        .set('X-API-Key', TEST_API_KEY)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('total')
      expect(response.body.data).toHaveProperty('online')
      expect(response.body.data).toHaveProperty('offline')
      expect(response.body.data).toHaveProperty('error')
      expect(response.body.data).toHaveProperty('byVendor')
      expect(response.body.data).toHaveProperty('averageUptime')

      // Validate data types
      expect(typeof response.body.data.total).toBe('number')
      expect(typeof response.body.data.online).toBe('number')
      expect(typeof response.body.data.offline).toBe('number')
      expect(typeof response.body.data.byVendor).toBe('object')
    })
  })
})
