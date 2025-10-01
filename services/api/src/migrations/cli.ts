#!/usr/bin/env node

import { migrationService } from './migration.service'
import { logger } from '../config/logger'
import { connectDatabase } from '../config/database'

async function main() {
  const command = process.argv[2]

  try {
    // Connect to database
    logger.info('Connecting to database...')
    await connectDatabase()
    logger.info('Database connected successfully')

    switch (command) {
      case 'migrate':
      case 'up':
        logger.info('Running migrations...')
        await migrationService.runMigrations()
        logger.info('✅ Migrations completed successfully')
        break

      case 'status': {
        logger.info('Checking migration status...')
        const pending = await migrationService.getPendingMigrations()
        const executed = await migrationService.getExecutedMigrations()

        console.log(`\n📊 Migration Status:`)
        console.log(`   Executed: ${executed.length}`)
        console.log(`   Pending: ${pending.length}`)

        if (pending.length > 0) {
          console.log(`\n⏳ Pending migrations:`)
          pending.forEach((m) => console.log(`   - ${m.id}: ${m.name}`))
        }

        if (executed.length > 0) {
          console.log(`\n✅ Executed migrations:`)
          executed.slice(-5).forEach((migrationId) => console.log(`   - ${migrationId}`))
          if (executed.length > 5) {
            console.log(`   ... and ${executed.length - 5} more`)
          }
        }
        break
      }

      case 'rollback':
      case 'down':
        logger.info('Rolling back last migration...')
        await migrationService.rollbackMigration()
        logger.info('✅ Rollback completed successfully')
        break

      case 'reset':
        logger.warn('Resetting all migrations (THIS WILL DELETE ALL DATA)...')
        // Add confirmation in production
        if (process.env.NODE_ENV === 'production') {
          throw new Error('Reset not allowed in production. Use explicit rollback commands.')
        }
        await migrationService.resetMigrations()
        logger.info('✅ Reset completed successfully')
        break

      default:
        console.log(`
🗄️  URFMP Database Migration CLI

Usage: npx tsx services/api/src/migrations/cli.ts <command>

Commands:
  migrate, up     Run all pending migrations
  status          Show migration status
  rollback, down  Rollback the last migration
  reset           Reset all migrations (dev only)

Examples:
  npx tsx services/api/src/migrations/cli.ts migrate
  npx tsx services/api/src/migrations/cli.ts status
  railway run npx tsx services/api/src/migrations/cli.ts migrate
        `)
        break
    }

    process.exit(0)
  } catch (error) {
    logger.error('Migration CLI error', { error: (error as Error).message })
    console.error(`❌ Error: ${(error as Error).message}`)
    process.exit(1)
  }
}

main().catch((error) => {
  logger.error('Unhandled migration error', { error: error.message })
  console.error(`💥 Unhandled error: ${error.message}`)
  process.exit(1)
})
