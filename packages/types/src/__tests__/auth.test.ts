import { LoginRequest, LoginResponse, AuthToken, AuthUser, AuthOrganization } from '../auth'
import { Permission } from '../user'

describe('Auth Types', () => {
  describe('LoginRequest interface', () => {
    it('should accept valid login credentials', () => {
      const loginRequest: LoginRequest = {
        email: 'admin@urfmp.com',
        password: 'admin123',
      }

      expect(loginRequest.email).toBe('admin@urfmp.com')
      expect(loginRequest.password).toBe('admin123')
    })

    it('should accept optional fields', () => {
      const loginWithOptions: LoginRequest = {
        email: 'admin@urfmp.com',
        password: 'admin123',
        organizationSlug: 'urfmp-demo',
        rememberMe: true,
        mfaToken: '123456',
      }

      expect(loginWithOptions.organizationSlug).toBe('urfmp-demo')
      expect(loginWithOptions.rememberMe).toBe(true)
      expect(loginWithOptions.mfaToken).toBe('123456')
    })
  })

  describe('LoginResponse interface', () => {
    it('should accept complete login response', () => {
      const loginResponse: LoginResponse = {
        user: {
          id: '3885c041-ebf4-4fdd-a6ec-7d88216ded2d',
          email: 'admin@urfmp.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          permissions: ['robot.view', 'robot.create'],
        },
        organization: {
          id: 'd8077863-d602-45fd-a253-78ee0d3d49a8',
          name: 'URFMP Demo',
          slug: 'urfmp-demo',
          plan: 'enterprise',
        },
        tokens: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'refresh-token-123',
          tokenType: 'Bearer',
          expiresIn: 3600,
          scope: ['robot.view', 'robot.create'],
        },
      }

      expect(loginResponse.user.email).toBe('admin@urfmp.com')
      expect(loginResponse.tokens.accessToken).toMatch(/^eyJ/)
      expect(loginResponse.tokens.tokenType).toBe('Bearer')
      expect(loginResponse.organization.name).toBe('URFMP Demo')
    })

    it('should accept response with MFA requirements', () => {
      const mfaResponse: LoginResponse = {
        user: {
          id: '3885c041-ebf4-4fdd-a6ec-7d88216ded2d',
          email: 'admin@urfmp.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          permissions: [],
        },
        organization: {
          id: 'd8077863-d602-45fd-a253-78ee0d3d49a8',
          name: 'URFMP Demo',
          slug: 'urfmp-demo',
          plan: 'enterprise',
        },
        tokens: {
          accessToken: 'temp-token',
          refreshToken: 'temp-refresh',
          tokenType: 'Bearer',
          expiresIn: 300,
          scope: [],
        },
        requiresMfa: true,
        mfaQrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSU...',
      }

      expect(mfaResponse.requiresMfa).toBe(true)
      expect(mfaResponse.mfaQrCode).toMatch(/^data:image\/png/)
    })
  })

  describe('AuthToken interface', () => {
    it('should accept valid auth token data', () => {
      const authToken: AuthToken = {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'refresh-token-abc123',
        tokenType: 'Bearer',
        expiresIn: 3600,
        scope: ['robot.view', 'telemetry.write'],
      }

      expect(authToken.accessToken).toMatch(/^eyJ/)
      expect(authToken.tokenType).toBe('Bearer')
      expect(authToken.expiresIn).toBe(3600)
      expect(authToken.scope).toContain('robot.view')
    })
  })

  describe('Permission enum', () => {
    it('should have all expected permission values', () => {
      expect(Permission.ROBOT_VIEW).toBe('robot.view')
      expect(Permission.ROBOT_CREATE).toBe('robot.create')
      expect(Permission.ROBOT_UPDATE).toBe('robot.update')
      expect(Permission.ROBOT_DELETE).toBe('robot.delete')
      expect(Permission.TELEMETRY_VIEW).toBe('telemetry.view')
      expect(Permission.TELEMETRY_WRITE).toBe('telemetry.write')
      expect(Permission.USER_VIEW).toBe('user.view')
    })

    it('should contain all defined permissions', () => {
      const permissionValues = Object.values(Permission)
      expect(permissionValues.length).toBeGreaterThan(5)
      expect(permissionValues).toContain('robot.view')
      expect(permissionValues).toContain('telemetry.write')
    })
  })

  describe('JWT token format validation', () => {
    it('should validate JWT token structure', () => {
      const mockTokens = [
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Gf15KZ4KY9_EZGr9jJ5jBFJhOz9_QT4f4fwpMeJf36POk6',
      ]

      mockTokens.forEach((token) => {
        const parts = token.split('.')
        expect(parts).toHaveLength(3)
        expect(parts[0]).toMatch(/^eyJ/) // Header starts with eyJ
        expect(parts[1]).toMatch(/^eyJ/) // Payload starts with eyJ
        expect(parts[2].length).toBeGreaterThan(20) // Signature should be substantial
      })
    })
  })
})
