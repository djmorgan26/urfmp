import rateLimit from 'express-rate-limit'
import { Request, Response } from 'express'
import { TooManyRequestsError } from './error.middleware'
import { logger } from '../config/logger'
import { getRedis } from '../config/redis'

// Redis store for rate limiting
class RedisStore {
  private prefix = 'rl:'

  private getRedisInstance() {
    return getRedis()
  }

  async increment(key: string): Promise<{ totalHits: number; resetTime?: Date }> {
    const redis = this.getRedisInstance()
    const redisKey = this.prefix + key
    const window = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000')
    const limit = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')

    try {
      const multi = redis.multi()
      multi.incr(redisKey)
      multi.expire(redisKey, Math.ceil(window / 1000))

      const results = await multi.exec()
      const totalHits = (results?.[0]?.[1] as number) || 0

      const resetTime = new Date(Date.now() + window)

      return { totalHits, resetTime }
    } catch (error) {
      logger.error('Redis rate limit error', { error: error.message, key })
      // Fallback to allowing the request if Redis fails
      return { totalHits: 1 }
    }
  }

  async decrement(key: string): Promise<void> {
    const redis = this.getRedisInstance()
    const redisKey = this.prefix + key
    try {
      await redis.decr(redisKey)
    } catch (error) {
      logger.error('Redis rate limit decrement error', { error: error.message, key })
    }
  }

  async resetKey(key: string): Promise<void> {
    const redis = this.getRedisInstance()
    const redisKey = this.prefix + key
    try {
      await redis.del(redisKey)
    } catch (error) {
      logger.error('Redis rate limit reset error', { error: error.message, key })
    }
  }
}

// Create key generator function
const createKeyGenerator = (prefix: string = 'global') => {
  return (req: Request): string => {
    const userId = (req as any).user?.id
    const apiKey = req.headers['x-api-key']
    const ip = req.ip || req.connection.remoteAddress

    // Prioritize user ID, then API key, then IP
    if (userId) {
      return `${prefix}:user:${userId}`
    } else if (apiKey) {
      return `${prefix}:api:${apiKey}`
    } else {
      return `${prefix}:ip:${ip}`
    }
  }
}

// Main rate limiter
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore() as any,
  keyGenerator: createKeyGenerator(),
  handler: (req: Request, res: Response) => {
    const error = new TooManyRequestsError('Rate limit exceeded. Please try again later.')

    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      userId: (req as any).user?.id,
      apiKey: req.headers['x-api-key'] ? 'present' : 'absent',
    })

    throw error
  },
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === '/health'
  },
})

// Stricter rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore() as any,
  keyGenerator: createKeyGenerator('auth'),
  handler: (req: Request, res: Response) => {
    const error = new TooManyRequestsError(
      'Too many authentication attempts. Please try again in 15 minutes.'
    )

    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
    })

    throw error
  },
})

// API-specific rate limiter with higher limits
export const apiRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
  max: 1000, // Higher limit for API endpoints
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore() as any,
  keyGenerator: createKeyGenerator('api'),
  handler: (req: Request, res: Response) => {
    const error = new TooManyRequestsError('API rate limit exceeded.')

    logger.warn('API rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      apiKey: req.headers['x-api-key'] ? 'present' : 'absent',
    })

    throw error
  },
})

// Burst rate limiter for telemetry endpoints
export const telemetryRateLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: parseInt(process.env.RATE_LIMIT_BURST_REQUESTS || '20'), // 20 requests per second
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore() as any,
  keyGenerator: createKeyGenerator('telemetry'),
  handler: (req: Request, res: Response) => {
    const error = new TooManyRequestsError('Telemetry burst limit exceeded.')

    logger.warn('Telemetry rate limit exceeded', {
      ip: req.ip,
      robotId: req.params.robotId || req.body?.robotId,
      url: req.url,
      method: req.method,
    })

    throw error
  },
})
