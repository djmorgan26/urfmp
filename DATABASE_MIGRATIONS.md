# 🗄️ URFMP Database Migration System

A robust, scalable database migration system designed for enterprise-grade deployments across all environments.

## 🎯 Overview

The URFMP migration system provides:

- **Environment-agnostic execution** (local, Docker, Railway, Render, Fly.io)
- **Transaction-safe operations** with automatic rollback on failure
- **Comprehensive CLI tools** for development and production
- **Admin API endpoints** for deployment debugging
- **Production-safe guards** and comprehensive logging

## 🚀 Quick Start

### Running Migrations

```bash
# Check migration status
npm run migrate:status

# Run all pending migrations
npm run migrate

# Rollback last migration (development only)
npm run migrate:rollback
```

### Railway Deployment

```bash
# Check status via admin API
curl https://urfmpapi-production.up.railway.app/admin/migrations/status

# Run migrations manually if needed
curl -X POST https://urfmpapi-production.up.railway.app/admin/migrations/run
```

## 📁 File Structure

```
services/api/src/migrations/
├── cli.ts                    # Command-line interface
├── migration.service.ts      # Core migration logic
└── sql/                      # Migration files
    ├── 20250918-194300-initial-schema.up.sql
    ├── 20250918-194300-initial-schema.down.sql
    ├── 20250918-194400-robots-schema.up.sql
    ├── 20250918-194400-robots-schema.down.sql
    ├── 20250918-194500-seed-admin-user.up.sql
    └── 20250918-194500-seed-admin-user.down.sql
```

## 🛠️ CLI Commands

### Direct CLI Usage

```bash
# Navigate to API directory
cd services/api

# Run migrations
npx tsx src/migrations/cli.ts migrate

# Check status
npx tsx src/migrations/cli.ts status

# Rollback last migration
npx tsx src/migrations/cli.ts rollback

# Show help
npx tsx src/migrations/cli.ts
```

### Package Scripts

```bash
# Defined in services/api/package.json
npm run migrate          # Run all pending migrations
npm run migrate:status   # Show migration status
npm run migrate:rollback # Rollback last migration
```

## 🔌 Admin API Endpoints

### Migration Status

```http
GET /admin/migrations/status
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 3,
    "executed": 3,
    "pending": 0,
    "executedMigrations": [
      "20250918-194300-initial-schema",
      "20250918-194400-robots-schema",
      "20250918-194500-seed-admin-user"
    ],
    "pendingMigrations": [],
    "migrationsPath": "/app/services/api/src/migrations/sql"
  }
}
```

### Run Migrations

```http
POST /admin/migrations/run
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Migrations completed successfully",
    "timestamp": "2025-09-30T12:39:04.340Z"
  }
}
```

### Database Tables (Debug)

```http
GET /admin/database/tables
```

**Response:**

```json
{
  "success": true,
  "data": {
    "tables": [
      { "table_name": "organizations", "table_schema": "public" },
      { "table_name": "users", "table_schema": "public" },
      { "table_name": "robots", "table_schema": "public" },
      { "table_name": "migrations", "table_schema": "public" }
    ],
    "count": 4
  }
}
```

## 🏗️ Architecture

### Path Resolution Strategy

The migration system uses intelligent path resolution to work across all environments:

1. **Compiled location** (preferred): `__dirname/sql`
2. **Source relative to project root**: `process.cwd()/services/api/src/migrations/sql`
3. **Alternative source location**: `__dirname/../../../src/migrations/sql`
4. **Docker container location**: `/app/services/api/src/migrations/sql`

### Environment Detection

```typescript
// Automatic environment-aware path finding
private findMigrationsPath(): string {
  const possiblePaths = [
    path.join(__dirname, 'sql'),                              // Compiled
    path.join(process.cwd(), 'services/api/src/migrations/sql'), // Project root
    path.join(__dirname, '../../../src/migrations/sql'),      // Relative
    path.join('/app/services/api/src/migrations/sql'),        // Docker
  ]

  for (const migrationPath of possiblePaths) {
    if (fs.existsSync(migrationPath)) {
      logger.info('Found migrations directory', { path: migrationPath })
      return migrationPath
    }
  }
}
```

### Docker Build Integration

```dockerfile
# Dockerfile.prod - ensures SQL files are available in production
RUN cd services/api && npm run build || echo "No build script, using source directly"
RUN cd services/api && mkdir -p dist/migrations && cp -r src/migrations/sql dist/migrations/ || echo "Migration files will be copied from source"
```

## 📊 Current Schema

### Core Tables

1. **organizations** - Multi-tenant organization support
2. **users** - User accounts with role-based permissions
3. **user_sessions** - JWT session management
4. **robots** - Robot fleet management
5. **robot_telemetry** - Time-series telemetry data (TimescaleDB)
6. **robot_commands** - Command history and execution
7. **maintenance_tasks** - Scheduled maintenance
8. **alerts** - System alerts and notifications
9. **api_keys** - API key authentication
10. **migrations** - Migration tracking table

### Migration Tracking

```sql
CREATE TABLE IF NOT EXISTS migrations (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🚦 Migration Workflow

### Creating New Migrations

1. **Generate migration files:**

   ```bash
   # Using the CLI (if create command exists)
   npx tsx src/migrations/cli.ts create "add-new-feature"

   # Manual creation (recommended)
   # Format: YYYYMMDD-HHMMSS-description
   touch src/migrations/sql/20250930-120000-add-new-feature.up.sql
   touch src/migrations/sql/20250930-120000-add-new-feature.down.sql
   ```

2. **Write migration SQL:**

   ```sql
   -- 20250930-120000-add-new-feature.up.sql
   BEGIN;

   ALTER TABLE robots ADD COLUMN new_field VARCHAR(255);

   COMMIT;
   ```

   ```sql
   -- 20250930-120000-add-new-feature.down.sql
   BEGIN;

   ALTER TABLE robots DROP COLUMN new_field;

   COMMIT;
   ```

3. **Test locally:**

   ```bash
   npm run migrate:status  # Check pending
   npm run migrate         # Run migration
   npm run migrate:rollback # Test rollback
   npm run migrate         # Re-run migration
   ```

4. **Deploy:**
   - Commit migration files
   - Push to repository
   - Migrations run automatically on deployment startup

### Best Practices

1. **Always use transactions** (`BEGIN` / `COMMIT`)
2. **Test rollback migrations** before deploying
3. **Keep migrations idempotent** (safe to run multiple times)
4. **Use descriptive migration names**
5. **Never modify existing migrations** (create new ones instead)
6. **Backup production data** before running migrations

## 🌍 Environment-Specific Usage

### Local Development

```bash
# Standard workflow
npm run migrate:status
npm run migrate
```

### Docker Local

```bash
# Inside container
docker exec urfmp-api npm run migrate

# Or during build (automatic)
# Migrations run on container startup
```

### Railway Production

```bash
# Automatic on deployment startup
# Manual via admin API:
curl -X POST https://urfmpapi-production.up.railway.app/admin/migrations/run

# Status check:
curl https://urfmpapi-production.up.railway.app/admin/migrations/status
```

### Render.com

```bash
# Similar to Railway - automatic on startup
# Check via admin endpoints once deployed
```

### Fly.io

```bash
# SSH into container
flyctl ssh console
npm run migrate

# Or use admin API endpoints
```

## 🔒 Security Considerations

### Production Safety

- **Reset command disabled** in production environments
- **Admin endpoints** should be secured (internal access only)
- **Database credentials** managed via environment variables
- **Transaction isolation** prevents partial migrations

### Access Control

```typescript
// Production guard example
async resetMigrations(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Reset not allowed in production')
  }
  // ... reset logic
}
```

## 🐛 Troubleshooting

### Common Issues

#### Migration Files Not Found

```
Error: Migration directory not found: /path/to/migrations
```

**Solution:**

1. Check migration path resolution logs
2. Verify Docker build copies SQL files
3. Use admin endpoint to check actual path: `/admin/migrations/status`

#### Permission Denied

```
Error: permission denied for relation migrations
```

**Solution:**

1. Check database user permissions
2. Verify DATABASE_URL environment variable
3. Test database connection: `/health`

#### Table Already Exists

```
Error: relation "table_name" already exists
```

**Solution:**

1. Use `CREATE TABLE IF NOT EXISTS` in migrations
2. Check migration tracking table for duplicates
3. Verify migration hasn't been partially applied

### Debug Commands

```bash
# Check database connection
curl https://your-api.com/health

# Check migration status
curl https://your-api.com/admin/migrations/status

# List actual database tables
curl https://your-api.com/admin/database/tables

# Check application logs
railway logs --tail 50  # Railway
docker logs container-name --tail 50  # Docker
```

## 📈 Performance Considerations

### Large Migrations

For large data migrations:

1. **Use batching** for large table updates
2. **Add timeouts** for long-running operations
3. **Consider maintenance windows** for schema changes
4. **Monitor database performance** during migrations

```sql
-- Example: Batch update for large tables
DO $$
DECLARE
    batch_size INTEGER := 1000;
    offset_val INTEGER := 0;
BEGIN
    LOOP
        UPDATE robots
        SET updated_field = 'new_value'
        WHERE id IN (
            SELECT id FROM robots
            ORDER BY id
            LIMIT batch_size OFFSET offset_val
        );

        IF NOT FOUND THEN
            EXIT;
        END IF;

        offset_val := offset_val + batch_size;

        -- Optional: Add delay for large batches
        PERFORM pg_sleep(0.1);
    END LOOP;
END $$;
```

### Index Management

```sql
-- Drop indexes before large data changes
DROP INDEX CONCURRENTLY IF EXISTS idx_robots_status;

-- Perform data migration
-- ...

-- Recreate indexes
CREATE INDEX CONCURRENTLY idx_robots_status ON robots(status);
```

## 🔄 Rollback Strategy

### Automatic Rollback

- **Transaction failures** automatically rollback
- **Validation errors** prevent migration execution
- **Connection issues** leave database unchanged

### Manual Rollback

```bash
# Rollback last migration
npm run migrate:rollback

# Or via CLI
npx tsx src/migrations/cli.ts rollback
```

### Emergency Rollback

For production emergencies:

1. **Use admin API** (fastest):

   ```bash
   curl -X POST https://your-api.com/admin/migrations/rollback
   ```

2. **Direct database access** (if needed):
   ```sql
   BEGIN;
   -- Run down migration SQL manually
   DELETE FROM migrations WHERE id = 'problematic-migration-id';
   COMMIT;
   ```

## 📚 Additional Resources

### Related Documentation

- [Railway Deployment Guide](./RAILWAY_DEPLOYMENT.md)
- [Docker Deployment Guide](./DEPLOYMENT.md)
- [API Documentation](./API.md)
- [Database Schema Reference](./DATABASE_SCHEMA.md)

### External Links

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TimescaleDB Migrations](https://docs.timescale.com/timescaledb/latest/how-to-guides/migrations/)
- [Railway Database Guide](https://docs.railway.app/databases/postgresql)

---

## 🎉 Migration System Status

**✅ Production Ready** - Successfully deployed and tested on Railway
**✅ Environment Agnostic** - Works across all deployment platforms
**✅ Enterprise Grade** - Transaction safety and comprehensive logging
**✅ Developer Friendly** - Simple CLI and clear documentation

_Last Updated: September 30, 2025_
