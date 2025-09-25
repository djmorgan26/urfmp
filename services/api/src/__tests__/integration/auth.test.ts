import request from 'supertest'
import { setupTestEnvironment, teardownTestEnvironment, resetTestDatabase, type TestSetup } from '../setup'

describe('Auth API Integration Tests', () => {
  let setup: TestSetup

  beforeAll(async () => {
    setup = await setupTestEnvironment()
  })

  afterAll(async () => {
    await teardownTestEnvironment(setup)
  })

  beforeEach(async () => {
    await resetTestDatabase(setup.dbClient)
  })

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'admin@urfmp.com',
        password: 'admin123'
      }

      const response = await request(setup.app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200)

      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('tokens')
      expect(response.body).toHaveProperty('organization')

      // User data validation
      expect(response.body.user).toHaveProperty('id')
      expect(response.body.user).toHaveProperty('email', 'admin@urfmp.com')
      expect(response.body.user).toHaveProperty('firstName')
      expect(response.body.user).toHaveProperty('lastName')
      expect(response.body.user).toHaveProperty('role')
      expect(response.body.user).toHaveProperty('permissions')

      // Token validation
      expect(response.body.tokens).toHaveProperty('accessToken')
      expect(response.body.tokens).toHaveProperty('refreshToken')
      expect(response.body.tokens).toHaveProperty('tokenType', 'Bearer')
      expect(response.body.tokens).toHaveProperty('expiresIn')

      // JWT token format validation
      expect(response.body.tokens.accessToken).toMatch(/^eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/)

      // Organization validation
      expect(response.body.organization).toHaveProperty('id')
      expect(response.body.organization).toHaveProperty('name')
    })

    it('should reject invalid credentials', async () => {
      const invalidLogin = {
        email: 'admin@urfmp.com',
        password: 'wrongpassword'
      }

      const response = await request(setup.app)
        .post('/api/v1/auth/login')
        .send(invalidLogin)
        .expect(401)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toHaveProperty('code', 'INVALID_CREDENTIALS')
      expect(response.body.error).toHaveProperty('message')
    })

    it('should reject invalid email format', async () => {
      const invalidEmailLogin = {
        email: 'invalid-email',
        password: 'admin123'
      }

      const response = await request(setup.app)
        .post('/api/v1/auth/login')
        .send(invalidEmailLogin)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error.code).toMatch(/VALIDATION/)
    })

    it('should reject missing required fields', async () => {
      const incompleteLogin = {
        email: 'admin@urfmp.com'
        // missing password
      }

      const response = await request(setup.app)
        .post('/api/v1/auth/login')
        .send(incompleteLogin)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error.message).toMatch(/password/i)
    })

    it('should have proper security headers', async () => {
      const loginData = {
        email: 'admin@urfmp.com',
        password: 'admin123'
      }

      const response = await request(setup.app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200)

      // Should have security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff')
      expect(response.headers['x-frame-options']).toBe('DENY')
      expect(response.headers['x-xss-protection']).toBe('1; mode=block')
    })
  })

  describe('POST /api/v1/auth/refresh', () => {
    let validRefreshToken: string

    beforeEach(async () => {
      // First login to get a refresh token
      const loginResponse = await request(setup.app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@urfmp.com',
          password: 'admin123'
        })
        .expect(200)

      validRefreshToken = loginResponse.body.tokens.refreshToken
    })

    it('should refresh token with valid refresh token', async () => {
      const response = await request(setup.app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: validRefreshToken
        })
        .expect(200)

      expect(response.body).toHaveProperty('tokens')
      expect(response.body.tokens).toHaveProperty('accessToken')
      expect(response.body.tokens).toHaveProperty('refreshToken')
      expect(response.body.tokens).toHaveProperty('tokenType', 'Bearer')

      // New tokens should be different from original
      expect(response.body.tokens.accessToken).toMatch(/^eyJ/)
      expect(response.body.tokens.refreshToken).toMatch(/\w+/)
    })

    it('should reject invalid refresh token', async () => {
      const response = await request(setup.app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: 'invalid-refresh-token'
        })
        .expect(401)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error.code).toBe('INVALID_TOKEN')
    })

    it('should reject missing refresh token', async () => {
      const response = await request(setup.app)
        .post('/api/v1/auth/refresh')
        .send({})
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error.message).toMatch(/refreshToken/i)
    })
  })

  describe('POST /api/v1/auth/logout', () => {
    let validAccessToken: string

    beforeEach(async () => {
      const loginResponse = await request(setup.app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@urfmp.com',
          password: 'admin123'
        })
        .expect(200)

      validAccessToken = loginResponse.body.tokens.accessToken
    })

    it('should logout with valid token', async () => {
      const response = await request(setup.app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${validAccessToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toMatch(/logout/i)
    })

    it('should reject logout without token', async () => {
      const response = await request(setup.app)
        .post('/api/v1/auth/logout')
        .expect(401)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error.code).toBe('MISSING_TOKEN')
    })

    it('should reject invalid token', async () => {
      const response = await request(setup.app)
        .post('/api/v1/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error.code).toBe('INVALID_TOKEN')
    })
  })
})