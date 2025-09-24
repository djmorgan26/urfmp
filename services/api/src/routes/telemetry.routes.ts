import { Router } from 'express'
import { asyncHandler } from '../middleware/error.middleware'
import { telemetryRateLimiter } from '../middleware/rateLimit.middleware'
import { requirePermission } from '../middleware/auth.middleware'
import { Permission, ApiResponse, RobotTelemetry, TelemetryData } from '@urfmp/types'
import { telemetryService, TelemetryFilters, TelemetryQuery } from '../services/telemetry.service'
import { logger } from '../config/logger'
import { getWebSocketService } from '../services/websocket.service'

const router = Router()

/**
 * @swagger
 * /api/v1/telemetry/{robotId}:
 *   post:
 *     summary: Submit robot telemetry data
 *     tags: [Telemetry]
 *     parameters:
 *       - in: path
 *         name: robotId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Telemetry data received
 */
router.post(
  '/:robotId',
  telemetryRateLimiter,
  requirePermission(Permission.TELEMETRY_WRITE),
  asyncHandler(async (req, res) => {
    const { robotId } = req.params
    const { data, timestamp } = req.body
    const organizationId = req.user!.org

    if (!data) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Telemetry data is required',
          traceId: req.traceId,
          timestamp: new Date(),
        },
      }
      return res.status(400).json(response)
    }

    const telemetryRecord = await telemetryService.ingestTelemetry({
      robotId,
      organizationId,
      data: data as TelemetryData,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    })

    // Broadcast telemetry via WebSocket
    try {
      const wsService = getWebSocketService()
      wsService.broadcastToChannel(`robot:${robotId}`, {
        event: 'robot:telemetry_update',
        robotId,
        organizationId,
        telemetry: telemetryRecord,
        timestamp: new Date(),
      })
    } catch (error) {
      logger.warn('Failed to broadcast telemetry update', {
        robotId,
        error: (error as Error).message,
      })
    }

    const response: ApiResponse<RobotTelemetry> = {
      success: true,
      data: telemetryRecord,
      metadata: {
        requestId: req.traceId,
        timestamp: new Date(),
        version: '1.0.0',
      },
    }

    return res.status(201).json(response)
  })
)

/**
 * @swagger
 * /api/v1/telemetry/{robotId}/latest:
 *   get:
 *     summary: Get latest telemetry data
 *     tags: [Telemetry]
 *     parameters:
 *       - in: path
 *         name: robotId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Latest telemetry data
 */
router.get(
  '/:robotId/latest',
  requirePermission(Permission.TELEMETRY_VIEW),
  asyncHandler(async (req, res) => {
    const { robotId } = req.params
    const organizationId = req.user!.org

    const latestTelemetry = await telemetryService.getLatestTelemetry(robotId, organizationId)

    const response: ApiResponse<RobotTelemetry | null> = {
      success: true,
      data: latestTelemetry,
      metadata: {
        requestId: req.traceId,
        timestamp: new Date(),
        version: '1.0.0',
      },
    }

    res.json(response)
  })
)

/**
 * @swagger
 * /api/v1/telemetry/{robotId}/history:
 *   get:
 *     summary: Get telemetry history for a robot
 *     tags: [Telemetry]
 *     parameters:
 *       - in: path
 *         name: robotId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: metric
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Telemetry history retrieved successfully
 */
router.get(
  '/:robotId/history',
  requirePermission(Permission.TELEMETRY_VIEW),
  asyncHandler(async (req, res) => {
    const { robotId } = req.params
    const organizationId = req.user!.org

    const query: TelemetryQuery = {
      robotId,
      organizationId,
      metric: req.query.metric as string,
      from: req.query.from ? new Date(req.query.from as string) : undefined,
      to: req.query.to ? new Date(req.query.to as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 1000,
    }

    const telemetryData = await telemetryService.getTelemetryData(query)

    const response: ApiResponse<RobotTelemetry[]> = {
      success: true,
      data: telemetryData,
      metadata: {
        requestId: req.traceId,
        timestamp: new Date(),
        version: '1.0.0',
      },
    }

    res.json(response)
  })
)

/**
 * @swagger
 * /api/v1/telemetry/{robotId}/metrics:
 *   get:
 *     summary: Get available metrics for a robot
 *     tags: [Telemetry]
 *     parameters:
 *       - in: path
 *         name: robotId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Available metrics retrieved successfully
 */
router.get(
  '/:robotId/metrics',
  requirePermission(Permission.TELEMETRY_VIEW),
  asyncHandler(async (req, res) => {
    const { robotId } = req.params
    const organizationId = req.user!.org

    const metrics = await telemetryService.getAvailableMetrics(robotId, organizationId)

    const response: ApiResponse<string[]> = {
      success: true,
      data: metrics,
      metadata: {
        requestId: req.traceId,
        timestamp: new Date(),
        version: '1.0.0',
      },
    }

    res.json(response)
  })
)

/**
 * @swagger
 * /api/v1/telemetry/aggregated:
 *   get:
 *     summary: Get aggregated telemetry data
 *     tags: [Telemetry]
 *     parameters:
 *       - in: query
 *         name: robotId
 *         schema:
 *           type: string
 *       - in: query
 *         name: metric
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: aggregation
 *         required: true
 *         schema:
 *           type: string
 *           enum: [avg, min, max, sum, count]
 *       - in: query
 *         name: timeWindow
 *         required: true
 *         schema:
 *           type: string
 *           enum: [1m, 5m, 15m, 1h, 1d]
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Aggregated telemetry data retrieved successfully
 */
router.get(
  '/aggregated',
  requirePermission(Permission.TELEMETRY_VIEW),
  asyncHandler(async (req, res) => {
    const organizationId = req.user!.org

    const filters: TelemetryFilters = {
      robotId: req.query.robotId as string,
      metric: req.query.metric as string,
      aggregation: req.query.aggregation as any,
      timeWindow: req.query.timeWindow as any,
      from: req.query.from ? new Date(req.query.from as string) : undefined,
      to: req.query.to ? new Date(req.query.to as string) : undefined,
    }

    if (!filters.metric || !filters.aggregation || !filters.timeWindow) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Metric, aggregation, and timeWindow are required',
          traceId: req.traceId,
          timestamp: new Date(),
        },
      }
      return res.status(400).json(response)
    }

    const aggregatedData = await telemetryService.getAggregatedTelemetry(organizationId, filters)

    const response: ApiResponse = {
      success: true,
      data: aggregatedData,
      metadata: {
        requestId: req.traceId,
        timestamp: new Date(),
        version: '1.0.0',
      },
    }

    return res.json(response)
  })
)

export default router
