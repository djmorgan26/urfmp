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
      const response = await request(setup.app)
        .get('/health')
        .expect(200)

      expect(response.body).toHaveProperty('status', 'ok')
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('version')
      expect(response.body).toHaveProperty('uptime')
    })

    it('should include service dependencies in health check', async () => {
      const response = await request(setup.app)
        .get('/health')
        .expect(200)

      expect(response.body).toHaveProperty('dependencies')
      expect(response.body.dependencies).toHaveProperty('database')
      expect(response.body.dependencies).toHaveProperty('redis')

      // Database and Redis status should be either 'healthy' or 'unhealthy'
      const dbStatus = response.body.dependencies.database.status
      const redisStatus = response.body.dependencies.redis.status

      expect(['healthy', 'unhealthy']).toContain(dbStatus)
      expect(['healthy', 'unhealthy']).toContain(redisStatus)
    })

    it('should include version information', async () => {
      const response = await request(setup.app)
        .get('/health')
        .expect(200)

      expect(response.body.version).toBeDefined()
      expect(typeof response.body.version).toBe('string')
      expect(response.body.version).toMatch(/^\d+\.\d+\.\d+/)
    })

    it('should include uptime in seconds', async () => {
      const response = await request(setup.app)
        .get('/health')
        .expect(200)

      expect(response.body.uptime).toBeDefined()
      expect(typeof response.body.uptime).toBe('number')
      expect(response.body.uptime).toBeGreaterThan(0)
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

      await request(setup.app)
        .get('/health')
        .expect(200)

      const responseTime = Date.now() - startTime
      expect(responseTime).toBeLessThan(1000) // Less than 1 second
    })
  })
})