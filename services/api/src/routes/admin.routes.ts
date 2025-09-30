import { Router } from 'express'
import { migrationService } from '../migrations/migration.service'
import { asyncHandler } from '../middleware/error.middleware'
import { ApiResponse } from '@urfmp/types'
import { logger } from '../config/logger'
import { query } from '../config/database'

const router = Router()

/**
 * @swagger
 * /admin/migrations/status:
 *   get:
 *     summary: Get migration status
 *     description: Returns the current migration status
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Migration status
 */
router.get(
  '/migrations/status',
  asyncHandler(async (req, res) => {
    const startTime = Date.now()

    try {
      const allMigrations = await migrationService.getMigrationFiles()
      const executedMigrations = await migrationService.getExecutedMigrations()
      const pendingMigrations = await migrationService.getPendingMigrations()

      const response: ApiResponse<any> = {
        success: true,
        data: {
          total: allMigrations.length,
          executed: executedMigrations.length,
          pending: pendingMigrations.length,
          executedMigrations: executedMigrations,
          pendingMigrations: pendingMigrations.map(m => ({ id: m.id, name: m.name })),
          migrationsPath: (migrationService as any).migrationsPath,
        },
        metadata: {
          requestId: req.traceId,
          timestamp: new Date(),
          version: '1.0.0',
          executionTime: Date.now() - startTime,
        },
      }

      res.status(200).json(response)
    } catch (error) {
      logger.error('Failed to get migration status', { error: (error as Error).message })

      const response: ApiResponse<any> = {
        success: false,
        error: {
          code: 'MIGRATION_ERROR',
          message: (error as Error).message,
          traceId: req.traceId,
          timestamp: new Date(),
        },
      }

      res.status(500).json(response)
    }
  })
)

/**
 * @swagger
 * /admin/migrations/run:
 *   post:
 *     summary: Run pending migrations
 *     description: Executes all pending migrations
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Migrations executed successfully
 */
router.post(
  '/migrations/run',
  asyncHandler(async (req, res) => {
    const startTime = Date.now()

    try {
      logger.info('Running migrations via admin endpoint')
      await migrationService.runMigrations()

      const response: ApiResponse<any> = {
        success: true,
        data: {
          message: 'Migrations completed successfully',
          timestamp: new Date(),
        },
        metadata: {
          requestId: req.traceId,
          timestamp: new Date(),
          version: '1.0.0',
          executionTime: Date.now() - startTime,
        },
      }

      res.status(200).json(response)
    } catch (error) {
      logger.error('Failed to run migrations', { error: (error as Error).message })

      const response: ApiResponse<any> = {
        success: false,
        error: {
          code: 'MIGRATION_ERROR',
          message: (error as Error).message,
          traceId: req.traceId,
          timestamp: new Date(),
        },
      }

      res.status(500).json(response)
    }
  })
)

/**
 * @swagger
 * /admin/database/tables:
 *   get:
 *     summary: List database tables
 *     description: Returns list of all tables in the database
 *     tags: [Admin]
 */
router.get(
  '/database/tables',
  asyncHandler(async (req, res) => {
    const startTime = Date.now()

    try {
      const result = await query(`
        SELECT table_name, table_schema
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
      `)

      const response: ApiResponse<any> = {
        success: true,
        data: {
          tables: result.rows,
          count: result.rows.length,
        },
        metadata: {
          requestId: req.traceId,
          timestamp: new Date(),
          version: '1.0.0',
          executionTime: Date.now() - startTime,
        },
      }

      res.status(200).json(response)
    } catch (error) {
      logger.error('Failed to list database tables', { error: (error as Error).message })

      const response: ApiResponse<any> = {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: (error as Error).message,
          traceId: req.traceId,
          timestamp: new Date(),
        },
      }

      res.status(500).json(response)
    }
  })
)

export default router