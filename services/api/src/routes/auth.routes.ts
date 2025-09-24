import { Router } from 'express'
import { authRateLimiter } from '../middleware/rateLimit.middleware'
import { asyncHandler } from '../middleware/error.middleware'
import { authMiddleware } from '../middleware/auth.middleware'
import { ApiResponse, LoginRequest, LoginResponse } from '@urfmp/types'
import { authService } from '../services/auth.service'
import { logger } from '../config/logger'

const router = Router()

// Apply auth rate limiting to all routes
router.use(authRateLimiter)

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const loginRequest: LoginRequest = req.body

    try {
      const loginResponse: LoginResponse = await authService.login(loginRequest)

      const response: ApiResponse<LoginResponse> = {
        success: true,
        data: loginResponse,
        metadata: {
          requestId: req.traceId,
          timestamp: new Date(),
          version: '1.0.0',
        },
      }

      logger.info('Login successful', {
        userId: loginResponse.user.id,
        email: loginResponse.user.email,
        organizationId: loginResponse.organization.id,
        traceId: req.traceId,
      })

      res.json(response)
    } catch (error) {
      logger.warn('Login failed', {
        email: loginRequest.email,
        error: (error as Error).message,
        traceId: req.traceId,
      })
      throw error
    }
  })
)

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post(
  '/logout',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body
    const userId = req.user!.sub

    try {
      await authService.logout(userId, refreshToken)

      const response: ApiResponse = {
        success: true,
        data: { message: 'Logout successful' },
        metadata: {
          requestId: req.traceId,
          timestamp: new Date(),
          version: '1.0.0',
        },
      }

      logger.info('Logout successful', {
        userId,
        traceId: req.traceId,
      })

      res.json(response)
    } catch (error) {
      logger.warn('Logout failed', {
        userId,
        error: (error as Error).message,
        traceId: req.traceId,
      })
      throw error
    }
  })
)

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body

    if (!refreshToken) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Refresh token is required',
          traceId: req.traceId,
          timestamp: new Date(),
        },
      }
      return res.status(400).json(response)
    }

    try {
      const tokens = await authService.refreshTokens(refreshToken)

      const response: ApiResponse = {
        success: true,
        data: { tokens },
        metadata: {
          requestId: req.traceId,
          timestamp: new Date(),
          version: '1.0.0',
        },
      }

      return res.json(response)
    } catch (error) {
      logger.warn('Token refresh failed', {
        error: (error as Error).message,
        traceId: req.traceId,
      })
      throw error
    }
  })
)

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               organizationName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const registrationData = req.body

    try {
      const loginResponse: LoginResponse = await authService.register(registrationData)

      const response: ApiResponse<LoginResponse> = {
        success: true,
        data: loginResponse,
        metadata: {
          requestId: req.traceId,
          timestamp: new Date(),
          version: '1.0.0',
        },
      }

      logger.info('User registration successful', {
        userId: loginResponse.user.id,
        email: loginResponse.user.email,
        organizationId: loginResponse.organization.id,
        traceId: req.traceId,
      })

      res.status(201).json(response)
    } catch (error) {
      logger.warn('User registration failed', {
        email: registrationData.email,
        error: (error as Error).message,
        traceId: req.traceId,
      })
      throw error
    }
  })
)

export default router
