import request from 'supertest'
import { setupTestEnvironment, teardownTestEnvironment, type TestSetup } from '../setup'

describe('Health API Integration Tests', () => {
  let setup: TestSetup

  beforeAll(async () => {
    setup = await setupTestEnvironment()
  })

  afterAll(async () => {
    await teardownTestEnvironment(setup)
  })

  describe('GET /health', () => {
    it('should return health status without authentication', async () => {
      const response = await request(setup.app).get('/health').expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('status', 'healthy')
      expect(response.body.data).toHaveProperty('timestamp')
      expect(response.body.data).toHaveProperty('version')
      expect(response.body.data).toHaveProperty('uptime')
    })

    it('should include service dependencies in health check', async () => {
      const response = await request(setup.app).get('/health').expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('checks')
      expect(Array.isArray(response.body.data.checks)).toBe(true)

      // Find database and redis checks
      const checks = response.body.data.checks
      const dbCheck = checks.find((check: any) => check.name === 'database')
      const redisCheck = checks.find((check: any) => check.name === 'redis')

      expect(dbCheck).toBeDefined()
      expect(redisCheck).toBeDefined()
      expect(['healthy', 'unhealthy']).toContain(dbCheck.status)
      expect(['healthy', 'unhealthy']).toContain(redisCheck.status)
    })

    it('should include version information', async () => {
      const response = await request(setup.app).get('/health').expect(200)

      expect(response.body.data.version).toBeDefined()
      expect(typeof response.body.data.version).toBe('string')
      expect(response.body.data.version).toMatch(/^\d+\.\d+\.\d+/)
    })

    it('should include uptime in seconds', async () => {
      const response = await request(setup.app).get('/health').expect(200)

      expect(response.body.data.uptime).toBeDefined()
      expect(typeof response.body.data.uptime).toBe('number')
      expect(response.body.data.uptime).toBeGreaterThanOrEqual(0)
    })

    it('should have correct response headers', async () => {
      const response = await request(setup.app)
        .get('/health')
        .expect(200)
        .expect('Content-Type', /json/)

      // Should not require authentication
      expect(response.headers['www-authenticate']).toBeUndefined()
    })

    it('should respond quickly', async () => {
      const startTime = Date.now()

      await request(setup.app).get('/health').expect(200)

      const responseTime = Date.now() - startTime
      expect(responseTime).toBeLessThan(1000) // Less than 1 second
    })
  })
})
