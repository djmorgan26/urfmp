import { Router } from 'express'
import { asyncHandler } from '../middleware/error.middleware'
import { requirePermission } from '../middleware/auth.middleware'
import { Permission, ApiResponse } from '@urfmp/types'

const router = Router()

router.get(
  '/',
  requirePermission(Permission.MAINTENANCE_VIEW),
  asyncHandler(async (_req, res) => {
    const response: ApiResponse = {
      success: true,
      data: { message: 'Maintenance endpoints - implementation pending' },
    }
    res.json(response)
  })
)

export default router
