import winston from 'winston'

const logLevel = process.env.LOG_LEVEL || 'info'
const logFormat = process.env.LOG_FORMAT || 'json'

// Custom format for development
const developmentFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`

    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`
    }

    if (stack) {
      log += `\n${stack}`
    }

    return log
  })
)

// Production format with structured logging
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

// Create logger
export const logger = winston.createLogger({
  level: logLevel,
  format: logFormat === 'json' ? productionFormat : developmentFormat,
  defaultMeta: {
    service: 'urfmp-api',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
})

// File logging in production
if (process.env.NODE_ENV === 'production' && process.env.LOG_FILE_ENABLED === 'true') {
  const logFilePath = process.env.LOG_FILE_PATH || './logs/urfmp.log'
  const maxSizeStr = process.env.LOG_FILE_MAX_SIZE || '10m'
  // Convert string like '10m' to bytes (10 * 1024 * 1024)
  const maxSize = maxSizeStr.endsWith('m')
    ? parseInt(maxSizeStr.slice(0, -1)) * 1024 * 1024
    : parseInt(maxSizeStr)
  const maxFiles = parseInt(process.env.LOG_FILE_MAX_FILES || '5')

  logger.add(
    new winston.transports.File({
      filename: logFilePath,
      maxsize: maxSize,
      maxFiles,
      tailable: true,
      handleExceptions: true,
      handleRejections: true,
    })
  )
}

// Create a stream for Morgan HTTP request logging
export const logStream = {
  write: (message: string) => {
    logger.info(message.trim(), { type: 'http-request' })
  },
}

// Enhanced logging functions with trace support
export const createTraceLogger = (traceId?: string) => {
  return {
    info: (message: string, meta?: any) => logger.info(message, { ...meta, traceId }),
    error: (message: string, meta?: any) => logger.error(message, { ...meta, traceId }),
    warn: (message: string, meta?: any) => logger.warn(message, { ...meta, traceId }),
    debug: (message: string, meta?: any) => logger.debug(message, { ...meta, traceId }),
  }
}

// Performance logging utility
export const logPerformance = (operation: string, startTime: number, meta?: any) => {
  const duration = Date.now() - startTime
  logger.info(`Performance: ${operation}`, {
    ...meta,
    operation,
    duration,
    type: 'performance',
  })
}

// Database query logging
export const logQuery = (query: string, params: any[], duration: number, traceId?: string) => {
  logger.debug('Database query', {
    query: query.replace(/\s+/g, ' ').trim(),
    params,
    duration,
    traceId,
    type: 'database-query',
  })
}

// WebSocket event logging
export const logWebSocketEvent = (
  event: string,
  userId?: string,
  organizationId?: string,
  meta?: any
) => {
  logger.info(`WebSocket: ${event}`, {
    ...meta,
    event,
    userId,
    organizationId,
    type: 'websocket-event',
  })
}

// Security event logging
export const logSecurityEvent = (
  event: string,
  userId?: string,
  ipAddress?: string,
  userAgent?: string,
  meta?: any
) => {
  logger.warn(`Security: ${event}`, {
    ...meta,
    event,
    userId,
    ipAddress,
    userAgent,
    type: 'security-event',
  })
}

export default logger
