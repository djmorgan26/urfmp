import { Router } from 'express'
import { checkDatabaseHealth } from '../config/database'
import { checkRedisHealth } from '../config/redis'
import { checkRabbitMQHealth } from '../config/rabbitmq'
import { ApiResponse, HealthCheck, HealthStatus } from '@urfmp/types'
import { asyncHandler } from '../middleware/error.middleware'

const router = Router()

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of all system components
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/HealthCheck'
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const startTime = Date.now()

    // Check all services in parallel
    const [dbHealth, redisHealth, rabbitmqHealth] = await Promise.allSettled([
      checkDatabaseHealth(),
      checkRedisHealth(),
      checkRabbitMQHealth(),
    ])

    const checks = [
      {
        name: 'database',
        status:
          dbHealth.status === 'fulfilled' && dbHealth.value.status === 'healthy'
            ? HealthStatus.HEALTHY
            : HealthStatus.UNHEALTHY,
        message: dbHealth.status === 'fulfilled' ? undefined : (dbHealth as any).reason?.message,
        responseTime:
          dbHealth.status === 'fulfilled' ? dbHealth.value.details.responseTime : undefined,
        details:
          dbHealth.status === 'fulfilled'
            ? dbHealth.value.details
            : { error: (dbHealth as any).reason?.message },
      },
      {
        name: 'redis',
        status:
          redisHealth.status === 'fulfilled' && redisHealth.value.status === 'healthy'
            ? HealthStatus.HEALTHY
            : HealthStatus.UNHEALTHY,
        message:
          redisHealth.status === 'fulfilled' ? undefined : (redisHealth as any).reason?.message,
        responseTime:
          redisHealth.status === 'fulfilled' ? redisHealth.value.details.responseTime : undefined,
        details:
          redisHealth.status === 'fulfilled'
            ? redisHealth.value.details
            : { error: (redisHealth as any).reason?.message },
      },
      {
        name: 'rabbitmq',
        status:
          rabbitmqHealth.status === 'fulfilled' && rabbitmqHealth.value.status === 'healthy'
            ? HealthStatus.HEALTHY
            : HealthStatus.UNHEALTHY,
        message:
          rabbitmqHealth.status === 'fulfilled'
            ? undefined
            : (rabbitmqHealth as any).reason?.message,
        responseTime: undefined,
        details:
          rabbitmqHealth.status === 'fulfilled'
            ? rabbitmqHealth.value.details
            : { error: (rabbitmqHealth as any).reason?.message },
      },
    ]

    // Determine overall status
    const hasUnhealthy = checks.some((check) => check.status === HealthStatus.UNHEALTHY)
    const hasDegraded = checks.some((check) => check.status === HealthStatus.DEGRADED)

    let overallStatus = HealthStatus.HEALTHY
    if (hasUnhealthy) {
      overallStatus = HealthStatus.UNHEALTHY
    } else if (hasDegraded) {
      overallStatus = HealthStatus.DEGRADED
    }

    const healthCheck: HealthCheck = {
      status: overallStatus,
      checks,
      timestamp: new Date(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: Math.floor(process.uptime()),
    }

    const response: ApiResponse<HealthCheck> = {
      success: overallStatus !== HealthStatus.UNHEALTHY,
      data: healthCheck,
      metadata: {
        requestId: req.traceId,
        timestamp: new Date(),
        version: '1.0.0',
        executionTime: Date.now() - startTime,
      },
    }

    // Set appropriate HTTP status code
    const statusCode =
      overallStatus === HealthStatus.HEALTHY
        ? 200
        : overallStatus === HealthStatus.DEGRADED
          ? 200
          : 503

    res.status(statusCode).json(response)
  })
)

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness probe
 *     description: Simple liveness check for Kubernetes
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is alive
 */
router.get('/live', (req, res) => {
  res.status(200).json({ status: 'alive', timestamp: new Date() })
})

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness probe
 *     description: Readiness check for Kubernetes - checks if service can handle requests
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
router.get(
  '/ready',
  asyncHandler(async (req, res) => {
    // Quick check of essential services
    const [dbHealth, redisHealth] = await Promise.allSettled([
      checkDatabaseHealth(),
      checkRedisHealth(),
    ])

    const dbReady = dbHealth.status === 'fulfilled' && dbHealth.value.status === 'healthy'
    const redisReady = redisHealth.status === 'fulfilled' && redisHealth.value.status === 'healthy'

    if (dbReady && redisReady) {
      res.status(200).json({ status: 'ready', timestamp: new Date() })
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date(),
        issues: {
          database: !dbReady,
          redis: !redisReady,
        },
      })
    }
  })
)

export default router
