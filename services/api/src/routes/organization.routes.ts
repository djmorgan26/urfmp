import { Router } from 'express'
import { asyncHandler } from '../middleware/error.middleware'
import { requirePermission } from '../middleware/auth.middleware'
import { Permission, ApiResponse } from '@urfmp/types'

const router = Router()

router.get(
  '/',
  requirePermission(Permission.ORG_VIEW),
  asyncHandler(async (req, res) => {
    const response: ApiResponse = {
      success: true,
      data: { message: 'Organization endpoints - implementation pending' },
    }
    res.json(response)
  })
)

export default router
