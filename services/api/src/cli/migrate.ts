#!/usr/bin/env node

import { migrationService } from '../migrations/migration.service'
import { logger } from '../config/logger'

async function main() {
  const command = process.argv[2]

  try {
    switch (command) {
      case 'up':
        await migrationService.runMigrations()
        break

      case 'down':
        await migrationService.rollbackLastMigration()
        break

      case 'status': {
        const status = await migrationService.getMigrationStatus()
        console.log('Migration Status:')
        console.log(`  Total migrations: ${status.total}`)
        console.log(`  Executed: ${status.executed}`)
        console.log(`  Pending: ${status.pending.length}`)
        if (status.pending.length > 0) {
          console.log('  Pending migrations:')
          status.pending.forEach((id) => console.log(`    - ${id}`))
        }
        break
      }

      case 'create': {
        const name = process.argv[3]
        if (!name) {
          console.error('Usage: migrate create <migration-name>')
          process.exit(1)
        }
        const migrationId = await migrationService.createMigration(name)
        console.log(`Created migration: ${migrationId}`)
        break
      }

      default:
        console.log('Usage: migrate <command>')
        console.log('Commands:')
        console.log('  up      - Run pending migrations')
        console.log('  down    - Rollback last migration')
        console.log('  status  - Show migration status')
        console.log('  create  - Create new migration')
        process.exit(1)
    }

    process.exit(0)
  } catch (error) {
    logger.error('Migration command failed', {
      command,
      error: (error as Error).message,
    })
    console.error(`Error: ${(error as Error).message}`)
    process.exit(1)
  }
}

main()
