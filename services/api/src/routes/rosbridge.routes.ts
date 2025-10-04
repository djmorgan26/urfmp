import { Router, Request, Response, NextFunction } from 'express'
import { body, param, validationResult } from 'express-validator'
import { rosbridgeServer } from '../services/rosbridgeServer'
import { SimulationCommand } from '@urfmp/types'

const router = Router()

// Simple validation middleware
const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() })
    return
  }
  next()
}

// Simple async handler
type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>

const asyncHandler =
  (fn: AsyncRequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }

/**
 * @route   GET /api/v1/rosbridge/connections
 * @desc    Get all active ROSBridge connections
 * @access  Private
 */
router.get(
  '/connections',
  asyncHandler(async (_req, res) => {
    const connections = rosbridgeServer.getAllConnections()

    res.json({
      success: true,
      data: {
        connections,
        count: connections.length,
      },
    })
  })
)

/**
 * @route   GET /api/v1/rosbridge/connections/:robotId
 * @desc    Get ROSBridge connection for specific robot
 * @access  Private
 */
router.get(
  '/connections/:robotId',
  param('robotId').isString().notEmpty(),
  validate,
  asyncHandler(async (req, res) => {
    const { robotId } = req.params
    const connection = rosbridgeServer.getConnection(robotId)

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONNECTION_NOT_FOUND',
          message: `No ROSBridge connection found for robot ${robotId}`,
        },
      })
    }

    res.json({
      success: true,
      data: connection,
    })
  })
)

/**
 * @route   POST /api/v1/rosbridge/commands/:robotId
 * @desc    Send command to robot via ROSBridge
 * @access  Private
 */
router.post(
  '/commands/:robotId',
  param('robotId').isString().notEmpty(),
  body('type')
    .isIn(['move', 'rotate', 'joint_control', 'gripper', 'custom'])
    .withMessage('Invalid command type'),
  body('target').optional().isObject(),
  body('joints').optional().isArray(),
  body('velocity').optional().isObject(),
  body('customTopic').optional().isString(),
  body('customMessage').optional(),
  validate,
  asyncHandler(async (req, res) => {
    const { robotId } = req.params
    const command: SimulationCommand = {
      robotId,
      type: req.body.type,
      target: req.body.target,
      joints: req.body.joints,
      velocity: req.body.velocity,
      customTopic: req.body.customTopic,
      customMessage: req.body.customMessage,
      timestamp: new Date(),
    }

    const success = rosbridgeServer.sendCommand(robotId, command)

    if (!success) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMMAND_FAILED',
          message: `Failed to send command to robot ${robotId}. Robot may not be connected.`,
        },
      })
    }

    res.json({
      success: true,
      data: {
        robotId,
        commandType: command.type,
        timestamp: command.timestamp,
      },
    })
  })
)

/**
 * @route   GET /api/v1/rosbridge/health
 * @desc    Get ROSBridge server health status
 * @access  Private
 */
router.get(
  '/health',
  asyncHandler(async (_req, res) => {
    const health = rosbridgeServer.getHealth()

    res.json({
      success: true,
      data: {
        status: 'healthy',
        ...health,
      },
    })
  })
)

export default router
