import { Router } from 'express'
import { asyncHandler } from '../middleware/error.middleware'
import { requirePermission } from '../middleware/auth.middleware'
import { Permission, ApiResponse } from '@urfmp/types'

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
    // TODO: Implement robot listing
    const response: ApiResponse = {
      success: true,
      data: {
        robots: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            organizationId: req.user!.org,
            name: 'Demo Robot 1',
            model: 'UR10e',
            vendor: 'universal_robots',
            serialNumber: 'UR10-2023-001',
            status: 'online',
            lastSeen: new Date(),
          },
        ],
        total: 1,
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
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
    // TODO: Implement robot details
    const response: ApiResponse = {
      success: true,
      data: {
        id: req.params.id,
        organizationId: req.user!.org,
        name: 'Demo Robot 1',
        model: 'UR10e',
        vendor: 'universal_robots',
        serialNumber: 'UR10-2023-001',
        status: 'online',
        lastSeen: new Date(),
        configuration: {
          axes: 6,
          payload: 10,
          reach: 1300,
          capabilities: ['welding', 'assembly'],
        },
      },
    }

    res.json(response)
  })
)

export default router
