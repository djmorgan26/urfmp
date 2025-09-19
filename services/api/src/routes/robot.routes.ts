import { Router } from 'express'
import { asyncHandler } from '../middleware/error.middleware'
import { requirePermission } from '../middleware/auth.middleware'
import { Permission, ApiResponse, Robot } from '@urfmp/types'
import { robotService, CreateRobotRequest, UpdateRobotRequest, RobotFilters } from '../services/robot.service'
import { logger } from '../config/logger'

const router = Router()

/**
 * @swagger
 * /api/v1/robots:
 *   get:
 *     summary: List robots
 *     tags: [Robots]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of robots
 */
router.get(
  '/',
  requirePermission(Permission.ROBOT_VIEW),
  asyncHandler(async (req, res) => {
    const organizationId = req.user!.org

    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)

    const filters: RobotFilters = {
      status: req.query.status as string,
      vendor: req.query.vendor as string,
      model: req.query.model as string,
      search: req.query.search as string,
    }

    const result = await robotService.getRobots(organizationId, filters, { page, limit })

    const response: ApiResponse = {
      success: true,
      data: {
        robots: result.data,
        total: result.pagination.total,
      },
      pagination: result.pagination,
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
 * /api/v1/robots/stats:
 *   get:
 *     summary: Get robot statistics
 *     tags: [Robots]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Robot statistics
 */
router.get(
  '/stats',
  requirePermission(Permission.ROBOT_VIEW),
  asyncHandler(async (req, res) => {
    const organizationId = req.user!.org

    const stats = await robotService.getRobotStats(organizationId)

    const response: ApiResponse = {
      success: true,
      data: stats,
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
 * /api/v1/robots/{id}:
 *   get:
 *     summary: Get robot by ID
 *     tags: [Robots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Robot details
 */
router.get(
  '/:id',
  requirePermission(Permission.ROBOT_VIEW),
  asyncHandler(async (req, res) => {
    const robotId = req.params.id
    const organizationId = req.user!.org

    const robot = await robotService.getRobotById(robotId, organizationId)

    if (!robot) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Robot not found',
          traceId: req.traceId,
          timestamp: new Date(),
        },
      }
      return res.status(404).json(response)
    }

    const response: ApiResponse<Robot> = {
      success: true,
      data: robot,
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
 * /api/v1/robots:
 *   post:
 *     summary: Create a new robot
 *     tags: [Robots]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               model:
 *                 type: string
 *               vendor:
 *                 type: string
 *               serialNumber:
 *                 type: string
 *               firmwareVersion:
 *                 type: string
 *               location:
 *                 type: object
 *               configuration:
 *                 type: object
 *     responses:
 *       201:
 *         description: Robot created successfully
 */
router.post(
  '/',
  requirePermission(Permission.ROBOT_CREATE),
  asyncHandler(async (req, res) => {
    const organizationId = req.user!.org
    const robotData: CreateRobotRequest = req.body

    const robot = await robotService.createRobot(organizationId, robotData)

    const response: ApiResponse<Robot> = {
      success: true,
      data: robot,
      metadata: {
        requestId: req.traceId,
        timestamp: new Date(),
        version: '1.0.0',
      },
    }

    logger.info('Robot created via API', {
      robotId: robot.id,
      organizationId,
      userId: req.user!.sub,
      traceId: req.traceId,
    })

    res.status(201).json(response)
  })
)

/**
 * @swagger
 * /api/v1/robots/{id}:
 *   put:
 *     summary: Update robot
 *     tags: [Robots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Robot updated successfully
 */
router.put(
  '/:id',
  requirePermission(Permission.ROBOT_UPDATE),
  asyncHandler(async (req, res) => {
    const robotId = req.params.id
    const organizationId = req.user!.org
    const updateData: UpdateRobotRequest = req.body

    const robot = await robotService.updateRobot(robotId, organizationId, updateData)

    const response: ApiResponse<Robot> = {
      success: true,
      data: robot,
      metadata: {
        requestId: req.traceId,
        timestamp: new Date(),
        version: '1.0.0',
      },
    }

    logger.info('Robot updated via API', {
      robotId,
      organizationId,
      userId: req.user!.sub,
      updateData,
      traceId: req.traceId,
    })

    res.json(response)
  })
)

/**
 * @swagger
 * /api/v1/robots/{id}:
 *   delete:
 *     summary: Delete robot
 *     tags: [Robots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Robot deleted successfully
 */
router.delete(
  '/:id',
  requirePermission(Permission.ROBOT_DELETE),
  asyncHandler(async (req, res) => {
    const robotId = req.params.id
    const organizationId = req.user!.org

    await robotService.deleteRobot(robotId, organizationId)

    const response: ApiResponse = {
      success: true,
      data: { message: 'Robot deleted successfully' },
      metadata: {
        requestId: req.traceId,
        timestamp: new Date(),
        version: '1.0.0',
      },
    }

    logger.info('Robot deleted via API', {
      robotId,
      organizationId,
      userId: req.user!.sub,
      traceId: req.traceId,
    })

    res.json(response)
  })
)

export default router
