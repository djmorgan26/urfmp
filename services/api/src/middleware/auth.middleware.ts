import { Request, Response, NextFunction } from 'express'
import { AuthPayload, Permission } from '@urfmp/types'
import { UnauthorizedError, ForbiddenError } from './error.middleware'
import { logger } from '../config/logger'
import { query } from '../config/database'
import { cache } from '../config/redis'
import { authService } from '../services/auth.service'

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload
    }
  }
}

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    // Development bypass when using mock robots
    if (process.env.NODE_ENV === 'development' && process.env.DEV_MOCK_ROBOTS === 'true') {
      req.user = {
        sub: '3885c041-ebf4-4fdd-a6ec-7d88216ded2d',
        org: 'd8077863-d602-45fd-a253-78ee0d3d49a8',
        email: 'demo@urfmp.com',
        permissions: ['robot.view', 'robot.create', 'robot.update', 'robot.delete', 'telemetry.view'],
        role: 'admin',
        scope: ['robot.view', 'robot.create', 'robot.update', 'robot.delete', 'telemetry.view'],
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        aud: 'urfmp-api',
        iss: 'urfmp',
      }
      return next()
    }

    const token = extractToken(req)
    if (!token) {
      throw new UnauthorizedError('Authentication token required')
    }

    // Verify JWT token using AuthService
    const decoded = authService.verifyAccessToken(token)

    // Check if user still exists and is active
    const user = await getUserById(decoded.sub)
    if (!user) {
      throw new UnauthorizedError('User not found or inactive')
    }

    // Check if token is blacklisted (for logout functionality)
    const isBlacklisted = await cache.get(`blacklisted_token:${token}`)
    if (isBlacklisted) {
      throw new UnauthorizedError('Token has been revoked')
    }

    // Attach user to request with updated data from database
    req.user = {
      ...decoded,
      permissions: user.permissions || decoded.permissions,
      role: user.role || decoded.role,
    }

    next()
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      next(new UnauthorizedError('Invalid authentication token'))
    } else if (error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Authentication token expired'))
    } else {
      next(error)
    }
  }
}

// API Key authentication middleware
export const apiKeyMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string
    if (!apiKey) {
      throw new UnauthorizedError('API key required')
    }

    // Check API key (with caching)
    const keyData = await getApiKey(apiKey)
    if (!keyData || !keyData.isActive) {
      throw new UnauthorizedError('Invalid or inactive API key')
    }

    // Check expiration
    if (keyData.expiresAt && new Date() > new Date(keyData.expiresAt)) {
      throw new UnauthorizedError('API key expired')
    }

    // Attach API key data to request
    req.user = {
      sub: keyData.userId,
      org: keyData.organizationId,
      email: keyData.userEmail,
      role: 'api',
      permissions: keyData.scope,
      scope: keyData.scope,
      iat: Math.floor(Date.now() / 1000),
      exp: keyData.expiresAt ? Math.floor(new Date(keyData.expiresAt).getTime() / 1000) : 0,
      aud: 'urfmp-api',
      iss: 'urfmp',
    }

    // Update last used timestamp
    await updateApiKeyLastUsed(keyData.id)

    next()
  } catch (error) {
    next(error)
  }
}

// Required authentication (supports both JWT tokens and API keys)
export const requiredAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Development bypass when using mock robots
    if (process.env.NODE_ENV === 'development' && process.env.DEV_MOCK_ROBOTS === 'true') {
      req.user = {
        sub: '3885c041-ebf4-4fdd-a6ec-7d88216ded2d',
        org: 'd8077863-d602-45fd-a253-78ee0d3d49a8',
        email: 'demo@urfmp.com',
        permissions: ['robot.view', 'robot.create', 'robot.update', 'robot.delete', 'telemetry.view'],
        role: 'admin',
        scope: ['robot.view', 'robot.create', 'robot.update', 'robot.delete', 'telemetry.view'],
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        aud: 'urfmp-api',
        iss: 'urfmp',
      }
      return next()
    }

    const token = extractToken(req)
    const apiKey = req.headers['x-api-key'] as string

    if (token) {
      try {
        const decoded = authService.verifyAccessToken(token)
        const user = await getUserById(decoded.sub)

        if (!user) {
          throw new UnauthorizedError('User not found or inactive')
        }

        // Check if token is blacklisted
        const isBlacklisted = await cache.get(`blacklisted_token:${token}`)
        if (isBlacklisted) {
          throw new UnauthorizedError('Token has been revoked')
        }

        req.user = {
          ...decoded,
          permissions: user.permissions || decoded.permissions,
          role: user.role || decoded.role,
        }
        return next()
      } catch (error: any) {
        if (error.name === 'JsonWebTokenError') {
          throw new UnauthorizedError('Invalid authentication token')
        } else if (error.name === 'TokenExpiredError') {
          throw new UnauthorizedError('Authentication token expired')
        } else {
          throw error
        }
      }
    } else if (apiKey) {
      const keyData = await getApiKey(apiKey)
      if (!keyData || !keyData.isActive) {
        throw new UnauthorizedError('Invalid or inactive API key')
      }

      // Check expiration
      if (keyData.expiresAt && new Date() > new Date(keyData.expiresAt)) {
        throw new UnauthorizedError('API key expired')
      }

      req.user = {
        sub: keyData.userId,
        org: keyData.organizationId,
        email: keyData.userEmail,
        role: 'api',
        permissions: keyData.scope,
        scope: keyData.scope,
        iat: Math.floor(Date.now() / 1000),
        exp: keyData.expiresAt ? Math.floor(new Date(keyData.expiresAt).getTime() / 1000) : 0,
        aud: 'urfmp-api',
        iss: 'urfmp',
      }

      // Update last used timestamp
      await updateApiKeyLastUsed(keyData.id)
      return next()
    } else {
      throw new UnauthorizedError('Authentication required: provide Bearer token or X-API-Key header')
    }
  } catch (error) {
    next(error)
  }
}

// Optional authentication (allows both authenticated and anonymous access)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req)
    const apiKey = req.headers['x-api-key'] as string

    if (token) {
      try {
        const decoded = authService.verifyAccessToken(token)
        const user = await getUserById(decoded.sub)

        // Check if token is blacklisted
        const isBlacklisted = await cache.get(`blacklisted_token:${token}`)

        if (user && !isBlacklisted) {
          req.user = {
            ...decoded,
            permissions: user.permissions || decoded.permissions,
            role: user.role || decoded.role,
          }
        }
      } catch (error) {
        // Token is invalid, continue without authentication
      }
    } else if (apiKey) {
      const keyData = await getApiKey(apiKey)
      if (keyData && keyData.isActive) {
        req.user = {
          sub: keyData.userId,
          org: keyData.organizationId,
          email: keyData.userEmail,
          role: 'api',
          permissions: keyData.scope,
          scope: keyData.scope,
          iat: Math.floor(Date.now() / 1000),
          exp: keyData.expiresAt ? Math.floor(new Date(keyData.expiresAt).getTime() / 1000) : 0,
          aud: 'urfmp-api',
          iss: 'urfmp',
        }
      }
    }

    next()
  } catch (error) {
    // Continue without authentication for optional auth
    next()
  }
}

// Permission check middleware
export const requirePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError())
    }

    if (!req.user.permissions.includes(permission) && !req.user.permissions.includes('*')) {
      logger.warn('Permission denied', {
        userId: req.user.sub,
        requiredPermission: permission,
        userPermissions: req.user.permissions,
        resource: req.url,
        method: req.method,
        traceId: req.traceId,
      })

      return next(new ForbiddenError(`Missing required permission: ${permission}`))
    }

    next()
  }
}

// Role check middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError())
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Role access denied', {
        userId: req.user.sub,
        userRole: req.user.role,
        requiredRoles: roles,
        resource: req.url,
        method: req.method,
        traceId: req.traceId,
      })

      return next(new ForbiddenError(`Access denied. Required roles: ${roles.join(', ')}`))
    }

    next()
  }
}

// Organization access middleware
export const requireOrgAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new UnauthorizedError())
  }

  const organizationId = req.params.organizationId || req.body?.organizationId

  if (organizationId && organizationId !== req.user.org) {
    logger.warn('Organization access denied', {
      userId: req.user.sub,
      userOrgId: req.user.org,
      requestedOrgId: organizationId,
      resource: req.url,
      method: req.method,
      traceId: req.traceId,
    })

    return next(new ForbiddenError('Access denied to this organization'))
  }

  next()
}

// Helper functions
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

async function getUserById(userId: string): Promise<any> {
  const cacheKey = `user:${userId}`

  // Try cache first
  let user = await cache.get(cacheKey)
  if (user) {
    return user
  }

  // Query database
  const result = await query(
    `SELECT id, organization_id, email, first_name, last_name, role, permissions
     FROM users WHERE id = $1 AND created_at IS NOT NULL`,
    [userId]
  )

  if (result.rows.length === 0) {
    return null
  }

  user = {
    id: result.rows[0].id,
    organizationId: result.rows[0].organization_id,
    email: result.rows[0].email,
    firstName: result.rows[0].first_name,
    lastName: result.rows[0].last_name,
    role: result.rows[0].role,
    permissions: result.rows[0].permissions || [],
  }

  // Cache for 5 minutes
  await cache.set(cacheKey, user, 300)

  return user
}

async function getApiKey(keyHash: string): Promise<any> {
  const cacheKey = `api_key:${keyHash}`

  // Try cache first
  let keyData = await cache.get(cacheKey)
  if (keyData) {
    return keyData
  }

  // Query database
  const result = await query(
    `SELECT ak.id, ak.user_id, ak.organization_id, ak.scope, ak.expires_at, ak.is_active,
            u.email as user_email
     FROM api_keys ak
     JOIN users u ON ak.user_id = u.id
     WHERE ak.key_hash = $1`,
    [keyHash]
  )

  if (result.rows.length === 0) {
    return null
  }

  keyData = {
    id: result.rows[0].id,
    userId: result.rows[0].user_id,
    organizationId: result.rows[0].organization_id,
    scope: result.rows[0].scope || [],
    expiresAt: result.rows[0].expires_at,
    isActive: result.rows[0].is_active,
    userEmail: result.rows[0].user_email,
  }

  // Cache for 1 minute
  await cache.set(cacheKey, keyData, 60)

  return keyData
}

async function updateApiKeyLastUsed(keyId: string): Promise<void> {
  try {
    await query('UPDATE api_keys SET last_used_at = NOW() WHERE id = $1', [keyId])
  } catch (error) {
    logger.error('Failed to update API key last used timestamp', {
      keyId,
      error: error.message,
    })
  }
}
