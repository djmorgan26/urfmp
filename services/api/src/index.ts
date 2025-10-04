import 'dotenv/config'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import app from './app'
import { logger } from './config/logger'
import { connectDatabase } from './config/database'
import { connectRedis } from './config/redis'
import { connectRabbitMQ } from './config/rabbitmq'
import { initializeWebSocketServer } from './services/websocket.service'
import { migrationService } from './migrations/migration.service'
import { rosbridgeServer } from './services/rosbridgeServer'

const PORT = process.env.PORT || process.env.API_PORT || 3000
const NODE_ENV = process.env.NODE_ENV || 'development'

async function startServer() {
  try {
    // Initialize database connection
    await connectDatabase()
    logger.info('✅ Database connected successfully')

    // Run database migrations
    await migrationService.runMigrations()
    logger.info('✅ Database migrations completed')

    // Initialize Redis connection
    await connectRedis()
    logger.info('✅ Redis connected successfully')

    // Initialize RabbitMQ connection
    await connectRabbitMQ()
    logger.info('✅ RabbitMQ connected successfully')

    // Create HTTP server
    const server = createServer(app)

    // Initialize WebSocket server
    const wss = new WebSocketServer({ server })
    initializeWebSocketServer(wss)
    logger.info('✅ WebSocket server initialized')

    // Initialize ROSBridge WebSocket server
    rosbridgeServer.initialize(server)
    logger.info('✅ ROSBridge server initialized')

    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 URFMP API Server running on port ${PORT} in ${NODE_ENV} mode`)
      logger.info(`📊 Health check: http://localhost:${PORT}/health`)
      logger.info(`📚 API docs: http://localhost:${PORT}/docs`)
    })

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully')
      server.close(() => {
        logger.info('Process terminated')
        process.exit(0)
      })
    })

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully')
      server.close(() => {
        logger.info('Process terminated')
        process.exit(0)
      })
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
