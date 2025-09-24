import { Router } from 'express'
import { asyncHandler } from '../middleware/error.middleware'
import { requirePermission } from '../middleware/auth.middleware'
import { Permission, ApiResponse } from '@urfmp/types'

const router = Router()

router.get(
  '/',
  requirePermission(Permission.USER_VIEW),
  asyncHandler(async (_req, res) => {
    const response: ApiResponse = {
      success: true,
      data: { message: 'User endpoints - implementation pending' },
    }
    res.json(response)
  })
)

export default router
