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

/**
 * @swagger
 * /admin/migrations/rollback:
 *   post:
 *     summary: Rollback last migration
 *     description: Rollback the most recent migration
 *     tags: [Admin]
 */
router.post(
  '/migrations/rollback',
  asyncHandler(async (req, res) => {
    const startTime = Date.now()

    try {
      logger.info('Rolling back last migration via admin endpoint')
      await migrationService.rollbackLastMigration()

      const response: ApiResponse<any> = {
        success: true,
        data: {
          message: 'Migration rollback completed successfully',
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
      logger.error('Failed to rollback migration', { error: (error as Error).message })

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
 * /admin/seed/force:
 *   post:
 *     summary: Force insert seed data
 *     description: Manually insert required seed data for deployment
 *     tags: [Admin]
 */
router.post(
  '/seed/force',
  asyncHandler(async (req, res) => {
    const startTime = Date.now()

    try {
      logger.info('Force inserting seed data via admin endpoint')

      const bcrypt = require('bcryptjs')
      const correctPasswordHash = await bcrypt.hash('admin123', 12)

      // Insert organization
      await query(`
        INSERT INTO organizations (id, name, slug, description, plan, is_active)
        SELECT $1, $2, $3, $4, $5, $6
        WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE slug = $3)
      `, [
        'd8077863-d602-45fd-a253-78ee0d3d49a8',
        'URFMP Demo',
        'urfmp-demo',
        'Demo organization for URFMP',
        'enterprise',
        true
      ])

      // Insert admin user with correct password hash
      await query(`
        INSERT INTO users (
          id, email, password_hash, first_name, last_name, role,
          organization_id, permissions, is_active, email_verified
        )
        SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = $2)
      `, [
        '3885c041-ebf4-4fdd-a6ec-7d88216ded2d',
        'admin@urfmp.com',
        correctPasswordHash,
        'Admin',
        'User',
        'admin',
        'd8077863-d602-45fd-a253-78ee0d3d49a8',
        ['robot.view', 'robot.create', 'robot.update', 'robot.delete', 'telemetry.view', 'telemetry.write', 'maintenance.view', 'user.view', 'organization.view'],
        true,
        true
      ])

      // Insert API key
      await query(`
        INSERT INTO api_keys (
          id, user_id, organization_id, name, key_hash, scope, expires_at, is_active
        )
        SELECT $1, $2, $3, $4, $5, $6, $7, $8
        WHERE NOT EXISTS (SELECT 1 FROM api_keys WHERE key_hash = $5)
      `, [
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        '3885c041-ebf4-4fdd-a6ec-7d88216ded2d',
        'd8077863-d602-45fd-a253-78ee0d3d49a8',
        'Development API Key',
        'urfmp_dev_9f8e7d6c5b4a3910efabcdef12345678',
        ['robot.view', 'robot.create', 'robot.update', 'robot.delete', 'telemetry.view', 'telemetry.write'],
        null,
        true
      ])

      const response: ApiResponse<any> = {
        success: true,
        data: {
          message: 'Seed data inserted successfully',
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
      logger.error('Failed to insert seed data', { error: (error as Error).message })

      const response: ApiResponse<any> = {
        success: false,
        error: {
          code: 'SEED_ERROR',
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
 * /admin/fix-password:
 *   post:
 *     summary: Fix admin password hash
 *     description: Updates admin password hash to correct bcrypt format
 *     tags: [Admin]
 */
router.post(
  '/fix-password',
  asyncHandler(async (req, res) => {
    const startTime = Date.now()

    try {
      logger.info('Fixing admin password hash')

      const bcrypt = require('bcryptjs')
      const correctPasswordHash = await bcrypt.hash('admin123', 12)

      // Update admin user password hash
      const result = await query(`
        UPDATE users SET password_hash = $1 WHERE email = $2
      `, [correctPasswordHash, 'admin@urfmp.com'])

      const response: ApiResponse<any> = {
        success: true,
        data: {
          message: 'Admin password hash fixed successfully',
          rowsUpdated: result.rowCount,
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
      logger.error('Failed to fix password hash', { error: (error as Error).message })

      const response: ApiResponse<any> = {
        success: false,
        error: {
          code: 'PASSWORD_FIX_ERROR',
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