import { Request, Response, NextFunction } from 'express'
import { logger } from '../config/logger'
import { ApiResponse, ApiError } from '@urfmp/types'

export interface CustomError extends Error {
  statusCode?: number
  code?: string
  details?: any
}

export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const traceId = (req.headers['x-trace-id'] as string) || 'unknown'

  // Default error response
  let statusCode = error.statusCode || 500
  let code = error.code || 'INTERNAL_SERVER_ERROR'
  let message = error.message || 'An unexpected error occurred'
  let details = error.details

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400
    code = 'VALIDATION_ERROR'
  } else if (error.name === 'UnauthorizedError' || error.message.includes('unauthorized')) {
    statusCode = 401
    code = 'UNAUTHORIZED'
  } else if (error.name === 'ForbiddenError' || error.message.includes('forbidden')) {
    statusCode = 403
    code = 'FORBIDDEN'
  } else if (error.name === 'NotFoundError' || error.message.includes('not found')) {
    statusCode = 404
    code = 'NOT_FOUND'
  } else if (error.name === 'ConflictError' || error.message.includes('conflict')) {
    statusCode = 409
    code = 'CONFLICT'
  } else if (error.name === 'TooManyRequestsError') {
    statusCode = 429
    code = 'RATE_LIMIT_EXCEEDED'
  }

  // Database errors
  if (error.message.includes('duplicate key')) {
    statusCode = 409
    code = 'DUPLICATE_RESOURCE'
    message = 'Resource already exists'
  } else if (error.message.includes('foreign key')) {
    statusCode = 400
    code = 'INVALID_REFERENCE'
    message = 'Invalid reference to related resource'
  }

  // Don't expose internal errors in production
  if (statusCode >= 500 && process.env.NODE_ENV === 'production') {
    message = 'Internal server error'
    details = undefined
  }

  // Log the error
  logger.error('Request error', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode,
      code,
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    },
    traceId,
  })

  // Create error response
  const errorResponse: ApiError = {
    code,
    message,
    details,
    traceId,
    timestamp: new Date(),
  }

  const response: ApiResponse = {
    success: false,
    error: errorResponse,
  }

  res.status(statusCode).json(response)
}

// Async error wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next)
  }
}

// Custom error classes
export class ValidationError extends Error {
  statusCode = 400
  code = 'VALIDATION_ERROR'
  details?: any

  constructor(message: string, details?: any) {
    super(message)
    this.name = 'ValidationError'
    this.details = details
  }
}

export class UnauthorizedError extends Error {
  statusCode = 401
  code = 'UNAUTHORIZED'

  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  statusCode = 403
  code = 'FORBIDDEN'

  constructor(message: string = 'Access denied') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends Error {
  statusCode = 404
  code = 'NOT_FOUND'

  constructor(message: string = 'Resource not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends Error {
  statusCode = 409
  code = 'CONFLICT'

  constructor(message: string = 'Resource conflict') {
    super(message)
    this.name = 'ConflictError'
  }
}

export class TooManyRequestsError extends Error {
  statusCode = 429
  code = 'RATE_LIMIT_EXCEEDED'

  constructor(message: string = 'Rate limit exceeded') {
    super(message)
    this.name = 'TooManyRequestsError'
  }
}
