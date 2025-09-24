import fs from 'fs'
import path from 'path'
import { query, connectDatabase } from '../config/database'
import { logger } from '../config/logger'

interface Migration {
  version: string
  filename: string
  content: string
}

const MIGRATIONS_TABLE = 'schema_migrations'

async function ensureMigrationsTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      version VARCHAR(255) PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `)
}

async function getExecutedMigrations(): Promise<string[]> {
  const result = await query(`SELECT version FROM ${MIGRATIONS_TABLE} ORDER BY version`)
  return result.rows.map((row: any) => row.version)
}

async function executeMigration(migration: Migration): Promise<void> {
  try {
    logger.info(`Executing migration: ${migration.filename}`)

    // Split the migration file by semicolons and execute each statement
    const statements = migration.content
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0)

    for (const statement of statements) {
      if (statement.trim()) {
        await query(statement)
      }
    }

    // Record the migration as executed
    await query(`INSERT INTO ${MIGRATIONS_TABLE} (version, filename) VALUES ($1, $2)`, [
      migration.version,
      migration.filename,
    ])

    logger.info(`Migration completed: ${migration.filename}`)
  } catch (error) {
    logger.error(`Migration failed: ${migration.filename}`, { error: (error as Error).message })
    throw error
  }
}

async function loadMigrations(): Promise<Migration[]> {
  const migrationsDir = __dirname
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort()

  const migrations: Migration[] = []

  for (const file of files) {
    const filePath = path.join(migrationsDir, file)
    const content = fs.readFileSync(filePath, 'utf8')
    const version = file.replace('.sql', '')

    migrations.push({
      version,
      filename: file,
      content,
    })
  }

  return migrations
}

export async function runMigrations(): Promise<void> {
  try {
    await connectDatabase()
    await ensureMigrationsTable()

    const allMigrations = await loadMigrations()
    const executedMigrations = await getExecutedMigrations()

    const pendingMigrations = allMigrations.filter(
      (migration) => !executedMigrations.includes(migration.version)
    )

    if (pendingMigrations.length === 0) {
      logger.info('No pending migrations found')
      return
    }

    logger.info(`Found ${pendingMigrations.length} pending migrations`)

    for (const migration of pendingMigrations) {
      await executeMigration(migration)
    }

    logger.info('All migrations completed successfully')
  } catch (error) {
    logger.error('Migration process failed', { error: (error as Error).message })
    throw error
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('Migration process completed')
      process.exit(0)
    })
    .catch((error) => {
      logger.error('Migration process failed', { error: error.message })
      process.exit(1)
    })
}
