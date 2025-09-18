import { Pool, PoolConfig } from 'pg'
import { logger, logQuery } from './logger'

let pool: Pool

const dbConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL || 'postgresql://urfmp:david@localhost:5432/urfmp',
  min: parseInt(process.env.DATABASE_POOL_MIN || '2'),
  max: parseInt(process.env.DATABASE_POOL_MAX || '10'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  statement_timeout: 60000,
  query_timeout: 60000,
  application_name: 'urfmp-api',
}

export const connectDatabase = async (): Promise<void> => {
  try {
    pool = new Pool(dbConfig)

    // Test the connection
    const client = await pool.connect()

    // Enable TimescaleDB extension if not already enabled
    await client.query('CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;')

    // Set timezone to UTC
    await client.query("SET timezone = 'UTC';")

    client.release()

    logger.info('Database connection established', {
      host: pool.options.host || 'localhost',
      database: pool.options.database,
      poolSize: pool.totalCount,
    })
  } catch (error) {
    logger.error('Failed to connect to database', { error })
    throw error
  }
}

export const getDatabase = (): Pool => {
  if (!pool) {
    throw new Error('Database not initialized. Call connectDatabase first.')
  }
  return pool
}

// Enhanced query function with logging and error handling
export const query = async (text: string, params: any[] = [], traceId?: string): Promise<any> => {
  const start = Date.now()
  const client = await pool.connect()

  try {
    const result = await client.query(text, params)
    const duration = Date.now() - start

    logQuery(text, params, duration, traceId)

    return result
  } catch (error) {
    const duration = Date.now() - start
    logger.error('Database query failed', {
      query: text.replace(/\s+/g, ' ').trim(),
      params,
      duration,
      error: error.message,
      traceId,
    })
    throw error
  } finally {
    client.release()
  }
}

// Transaction helper
export const transaction = async <T>(
  callback: (client: any) => Promise<T>,
  traceId?: string
): Promise<T> => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    logger.debug('Transaction started', { traceId })

    const result = await callback(client)

    await client.query('COMMIT')
    logger.debug('Transaction committed', { traceId })

    return result
  } catch (error) {
    await client.query('ROLLBACK')
    logger.error('Transaction rolled back', { error: error.message, traceId })
    throw error
  } finally {
    client.release()
  }
}

// Health check function
export const checkDatabaseHealth = async (): Promise<{
  status: 'healthy' | 'unhealthy'
  details: any
}> => {
  try {
    const start = Date.now()
    const result = await query('SELECT NOW() as timestamp, version() as version')
    const responseTime = Date.now() - start

    return {
      status: 'healthy',
      details: {
        timestamp: result.rows[0]?.timestamp,
        version: result.rows[0]?.version,
        responseTime,
        totalConnections: pool.totalCount,
        idleConnections: pool.idleCount,
        waitingConnections: pool.waitingCount,
      },
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        error: error.message,
        totalConnections: pool.totalCount,
        idleConnections: pool.idleCount,
        waitingConnections: pool.waitingCount,
      },
    }
  }
}

// Close database connection
export const closeDatabase = async (): Promise<void> => {
  if (pool) {
    await pool.end()
    logger.info('Database connection closed')
  }
}

// Database utilities
export const createHypertable = async (
  tableName: string,
  timeColumn: string = 'timestamp',
  chunkTimeInterval: string = '1 day'
): Promise<void> => {
  try {
    await query(`
      SELECT create_hypertable('${tableName}', '${timeColumn}',
        chunk_time_interval => INTERVAL '${chunkTimeInterval}',
        if_not_exists => TRUE
      );
    `)

    logger.info('Hypertable created', { tableName, timeColumn, chunkTimeInterval })
  } catch (error) {
    logger.error('Failed to create hypertable', {
      tableName,
      timeColumn,
      chunkTimeInterval,
      error: error.message,
    })
    throw error
  }
}

export const createIndex = async (
  indexName: string,
  tableName: string,
  columns: string[],
  options: { unique?: boolean; concurrent?: boolean } = {}
): Promise<void> => {
  try {
    const uniqueClause = options.unique ? 'UNIQUE' : ''
    const concurrentClause = options.concurrent ? 'CONCURRENTLY' : ''

    await query(`
      CREATE ${uniqueClause} INDEX ${concurrentClause} IF NOT EXISTS ${indexName}
      ON ${tableName} (${columns.join(', ')});
    `)

    logger.info('Index created', { indexName, tableName, columns, options })
  } catch (error) {
    logger.error('Failed to create index', {
      indexName,
      tableName,
      columns,
      options,
      error: error.message,
    })
    throw error
  }
}

// Export pool for direct access when needed
export { pool }
export default { connectDatabase, getDatabase, query, transaction, checkDatabaseHealth }
