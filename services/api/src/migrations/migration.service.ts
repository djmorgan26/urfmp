import { promises as fs, existsSync } from 'fs'
import path from 'path'
import { query } from '../config/database'
import { logger } from '../config/logger'

export interface Migration {
  id: string
  name: string
  up: string
  down: string
  timestamp: Date
}

export class MigrationService {
  private migrationsPath: string

  constructor() {
    this.migrationsPath = this.findMigrationsPath()
  }

  /**
   * Find migrations path - check multiple possible locations
   */
  private findMigrationsPath(): string {
    const possiblePaths = [
      // 1. Compiled location (preferred for production)
      path.join(__dirname, 'sql'),
      // 2. Source location relative to project root
      path.join(process.cwd(), 'services/api/src/migrations/sql'),
      // 3. Alternative source location
      path.join(__dirname, '../../../src/migrations/sql'),
      // 4. Docker container source location
      path.join('/app/services/api/src/migrations/sql'),
    ]

    for (const migrationPath of possiblePaths) {
      try {
        if (existsSync(migrationPath)) {
          logger.info('Found migrations directory', { path: migrationPath })
          return migrationPath
        }
      } catch (error) {
        // Continue to next path
      }
    }

    // Fallback to default path
    const defaultPath = path.join(__dirname, 'sql')
    logger.warn('No migrations directory found, using default', { path: defaultPath })
    return defaultPath
  }

  /**
   * Initialize migrations table
   */
  async initializeMigrationsTable(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS migrations (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
    await query(createTableQuery)
    logger.info('Migrations table initialized')
  }

  /**
   * Get all migration files
   */
  async getMigrationFiles(): Promise<Migration[]> {
    try {
      logger.info('Reading migration files', { path: this.migrationsPath })

      // Check if directory exists
      if (!existsSync(this.migrationsPath)) {
        logger.error('Migration directory does not exist', { path: this.migrationsPath })
        throw new Error(`Migration directory not found: ${this.migrationsPath}`)
      }

      const files = await fs.readdir(this.migrationsPath)
      logger.info('Found files in migration directory', { files, count: files.length })

      const migrationFiles = files.filter((file) => file.endsWith('.up.sql')).sort()
      logger.info('Found migration files', { migrationFiles, count: migrationFiles.length })

      const migrations: Migration[] = []

      for (const file of migrationFiles) {
        const id = file.replace('.up.sql', '')
        const upFile = path.join(this.migrationsPath, file)
        const downFile = path.join(this.migrationsPath, `${id}.down.sql`)

        const up = await fs.readFile(upFile, 'utf-8')
        let down = ''

        try {
          down = await fs.readFile(downFile, 'utf-8')
        } catch (error) {
          logger.warn(`No down migration found for ${id}`)
        }

        migrations.push({
          id,
          name: id.replace(/^\d{8}-\d{6}-/, ''),
          up,
          down,
          timestamp: new Date(),
        })
      }

      return migrations
    } catch (error) {
      logger.error('Error reading migration files', { error: (error as Error).message })
      return []
    }
  }

  /**
   * Get executed migrations
   */
  async getExecutedMigrations(): Promise<string[]> {
    try {
      const result = await query('SELECT id FROM migrations ORDER BY id')
      return result.rows.map((row: any) => row.id)
    } catch (error) {
      logger.error('Error getting executed migrations', { error: (error as Error).message })
      return []
    }
  }

  /**
   * Execute pending migrations
   */
  async runMigrations(): Promise<void> {
    await this.initializeMigrationsTable()

    const allMigrations = await this.getMigrationFiles()
    const executedMigrations = await getExecutedMigrations()

    const pendingMigrations = allMigrations.filter(
      (migration) => !executedMigrations.includes(migration.id)
    )

    if (pendingMigrations.length === 0) {
      logger.info('No pending migrations')
      return
    }

    logger.info(`Running ${pendingMigrations.length} pending migrations`)

    for (const migration of pendingMigrations) {
      try {
        await query('BEGIN')

        // Execute the migration
        await query(migration.up)

        // Record the migration
        await query('INSERT INTO migrations (id, name) VALUES ($1, $2)', [
          migration.id,
          migration.name,
        ])

        await query('COMMIT')

        logger.info(`✅ Migration executed: ${migration.id}`)
      } catch (error) {
        await query('ROLLBACK')
        logger.error(`❌ Migration failed: ${migration.id}`, {
          error: (error as Error).message,
          migration: migration.id,
        })
        throw error
      }
    }

    logger.info('All migrations completed successfully')
  }

  /**
   * Rollback last migration
   */
  async rollbackLastMigration(): Promise<void> {
    const executedMigrations = await this.getExecutedMigrations()

    if (executedMigrations.length === 0) {
      logger.info('No migrations to rollback')
      return
    }

    const lastMigrationId = executedMigrations[executedMigrations.length - 1]
    const allMigrations = await this.getMigrationFiles()
    const migration = allMigrations.find((m) => m.id === lastMigrationId)

    if (!migration) {
      throw new Error(`Migration file not found: ${lastMigrationId}`)
    }

    if (!migration.down) {
      throw new Error(`No down migration available for: ${lastMigrationId}`)
    }

    try {
      await query('BEGIN')

      // Execute the down migration
      await query(migration.down)

      // Remove migration record
      await query('DELETE FROM migrations WHERE id = $1', [migration.id])

      await query('COMMIT')

      logger.info(`✅ Migration rolled back: ${migration.id}`)
    } catch (error) {
      await query('ROLLBACK')
      logger.error(`❌ Rollback failed: ${migration.id}`, {
        error: (error as Error).message,
      })
      throw error
    }
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(): Promise<{
    total: number
    executed: number
    pending: string[]
  }> {
    const allMigrations = await this.getMigrationFiles()
    const executedMigrations = await this.getExecutedMigrations()

    const pendingMigrations = allMigrations
      .filter((migration) => !executedMigrations.includes(migration.id))
      .map((migration) => migration.id)

    return {
      total: allMigrations.length,
      executed: executedMigrations.length,
      pending: pendingMigrations,
    }
  }

  /**
   * Create a new migration file
   */
  async createMigration(name: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '')
    const migrationId = `${timestamp.slice(0, 8)}-${timestamp.slice(8, 14)}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`

    const upFile = path.join(this.migrationsPath, `${migrationId}.up.sql`)
    const downFile = path.join(this.migrationsPath, `${migrationId}.down.sql`)

    const upTemplate = `-- Migration: ${migrationId}
-- Description: ${name}
-- Created: ${new Date().toISOString()}

BEGIN;

-- Add your migration SQL here

COMMIT;
`

    const downTemplate = `-- Rollback for: ${migrationId}
-- Description: Rollback ${name}

BEGIN;

-- Add your rollback SQL here

COMMIT;
`

    await fs.writeFile(upFile, upTemplate)
    await fs.writeFile(downFile, downTemplate)

    logger.info(`Migration files created: ${migrationId}`)
    return migrationId
  }

  /**
   * Get pending migrations
   */
  async getPendingMigrations(): Promise<Migration[]> {
    const allMigrations = await this.getMigrationFiles()
    const executedMigrations = await this.getExecutedMigrations()

    return allMigrations.filter((migration) => !executedMigrations.includes(migration.id))
  }

  /**
   * Rollback migration (alias for rollbackLastMigration)
   */
  async rollbackMigration(): Promise<void> {
    return this.rollbackLastMigration()
  }

  /**
   * Reset all migrations (dev only)
   */
  async resetMigrations(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Reset not allowed in production')
    }

    logger.warn('Resetting all migrations - this will DELETE ALL DATA')

    try {
      await query('BEGIN')

      // Drop all tables (in reverse dependency order)
      const dropTables = [
        'user_sessions',
        'api_keys',
        'robot_commands',
        'robot_telemetry',
        'maintenance_tasks',
        'alerts',
        'robots',
        'users',
        'organizations',
        'migrations',
      ]

      for (const table of dropTables) {
        await query(`DROP TABLE IF EXISTS ${table} CASCADE`)
      }

      await query('COMMIT')
      logger.info('All migrations reset successfully')
    } catch (error) {
      await query('ROLLBACK')
      throw error
    }
  }
}

export const migrationService = new MigrationService()

// Helper function for backward compatibility
async function getExecutedMigrations(): Promise<string[]> {
  try {
    const result = await query('SELECT id FROM migrations ORDER BY id')
    return result.rows.map((row: any) => row.id)
  } catch (error) {
    return []
  }
}
