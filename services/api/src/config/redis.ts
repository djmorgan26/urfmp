import Redis from 'ioredis'
import { logger } from './logger'

let redis: Redis

export const connectRedis = async (): Promise<void> => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      family: 4,
      enableReadyCheck: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
    })

    redis.on('connect', () => {
      logger.info('Redis connection established')
    })

    redis.on('error', (error) => {
      logger.error('Redis connection error', { error: (error as Error).message })
    })

    redis.on('close', () => {
      logger.warn('Redis connection closed')
    })

    redis.on('reconnecting', () => {
      logger.info('Redis reconnecting...')
    })

    await redis.connect()

    // Test the connection
    await redis.ping()

    logger.info('Redis connected successfully')
  } catch (error) {
    logger.error('Failed to connect to Redis', { error: (error as Error).message })
    throw error
  }
}

export const getRedis = (): Redis => {
  if (!redis) {
    throw new Error('Redis not initialized. Call connectRedis first.')
  }
  return redis
}

// Cache utilities
export const cache = {
  get: async (key: string): Promise<any> => {
    try {
      const value = await redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      logger.error('Cache get error', { key, error: (error as Error).message })
      return null
    }
  },

  set: async (key: string, value: any, ttl?: number): Promise<boolean> => {
    try {
      const serialized = JSON.stringify(value)
      if (ttl) {
        await redis.setex(key, ttl, serialized)
      } else {
        await redis.set(key, serialized)
      }
      return true
    } catch (error) {
      logger.error('Cache set error', { key, error: (error as Error).message })
      return false
    }
  },

  del: async (key: string): Promise<boolean> => {
    try {
      await redis.del(key)
      return true
    } catch (error) {
      logger.error('Cache delete error', { key, error: (error as Error).message })
      return false
    }
  },

  exists: async (key: string): Promise<boolean> => {
    try {
      const result = await redis.exists(key)
      return result === 1
    } catch (error) {
      logger.error('Cache exists error', { key, error: (error as Error).message })
      return false
    }
  },
}

// Pub/Sub utilities
export const pubsub = {
  publish: async (channel: string, message: any): Promise<boolean> => {
    try {
      await redis.publish(channel, JSON.stringify(message))
      return true
    } catch (error) {
      logger.error('PubSub publish error', { channel, error: (error as Error).message })
      return false
    }
  },

  subscribe: (channel: string, callback: (message: any) => void): void => {
    const subscriber = redis.duplicate()

    subscriber.subscribe(channel, (err) => {
      if (err) {
        logger.error('PubSub subscribe error', { channel, error: err.message })
        return
      }
      logger.info('Subscribed to channel', { channel })
    })

    subscriber.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        try {
          const parsed = JSON.parse(message)
          callback(parsed)
        } catch (error) {
          logger.error('PubSub message parse error', { channel, error: (error as Error).message })
        }
      }
    })
  },
}

// Health check
export const checkRedisHealth = async (): Promise<{
  status: 'healthy' | 'unhealthy'
  details: any
}> => {
  try {
    const start = Date.now()
    await redis.ping()
    const responseTime = Date.now() - start

    return {
      status: 'healthy',
      details: {
        responseTime,
        connected: redis.status === 'ready',
      },
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        error: (error as Error).message,
        connected: false,
      },
    }
  }
}

export default { connectRedis, getRedis, cache, pubsub, checkRedisHealth }
