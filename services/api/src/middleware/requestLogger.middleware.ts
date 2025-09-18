import { Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '../config/logger'

// Extend Request interface to include traceId
declare global {
  namespace Express {
    interface Request {
      traceId: string
      startTime: number
    }
  }
}

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Generate or use existing trace ID
  req.traceId = (req.headers['x-trace-id'] as string) || uuidv4()
  req.startTime = Date.now()

  // Add trace ID to response headers
  res.setHeader('X-Trace-ID', req.traceId)

  // Log request start
  logger.info('Request started', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    traceId: req.traceId,
    headers: {
      contentType: req.get('Content-Type'),
      authorization: req.get('Authorization') ? 'present' : 'absent',
      apiKey: req.get('X-API-Key') ? 'present' : 'absent',
    },
    params: req.params,
    query: req.query,
    // Don't log sensitive data in body
    bodySize: req.get('Content-Length') || 0,
  })

  // Capture response data
  const originalSend = res.send
  res.send = function (data) {
    const duration = Date.now() - req.startTime
    const contentLength = res.get('Content-Length') || (data ? Buffer.byteLength(data) : 0)

    // Log response
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      contentLength,
      traceId: req.traceId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    })

    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        duration,
        traceId: req.traceId,
      })
    }

    return originalSend.call(this, data)
  }

  next()
}

// Middleware to log sensitive operations
export const auditLogger = (operation: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id
    const organizationId = (req as any).user?.organizationId

    logger.info('Audit log', {
      operation,
      userId,
      organizationId,
      resource: req.params,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      traceId: req.traceId,
      timestamp: new Date().toISOString(),
    })

    next()
  }
}

// Performance monitoring middleware
export const performanceMonitor = (threshold: number = 500) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now()

    res.on('finish', () => {
      const duration = Date.now() - start

      if (duration > threshold) {
        logger.warn('Performance threshold exceeded', {
          method: req.method,
          url: req.url,
          duration,
          threshold,
          statusCode: res.statusCode,
          traceId: req.traceId,
        })
      }
    })

    next()
  }
}
