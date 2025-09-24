import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'

import { logger } from './config/logger'
import { errorHandler } from './middleware/error.middleware'
import { rateLimiter } from './middleware/rateLimit.middleware'
import { requestLogger } from './middleware/requestLogger.middleware'
import { requiredAuth } from './middleware/auth.middleware'

// Import routes
import authRoutes from './routes/auth.routes'
import robotRoutes from './routes/robot.routes'
import telemetryRoutes from './routes/telemetry.routes'
import organizationRoutes from './routes/organization.routes'
import userRoutes from './routes/user.routes'
import maintenanceRoutes from './routes/maintenance.routes'
import healthRoutes from './routes/health.routes'

const app = express()

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
)

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-API-Key',
      'X-Trace-ID',
      'X-Request-ID',
      'User-Agent',
    ],
  })
)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Compression
app.use(compression())

// Request logging
app.use(requestLogger)

// Rate limiting
app.use(rateLimiter)

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'URFMP API',
      version: '1.0.0',
      description: 'Universal Robot Fleet Management Platform - The Stripe of Robotics',
      contact: {
        name: 'URFMP Team',
        email: 'support@urfmp.com',
      },
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
      {
        apiKey: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

// Serve Swagger docs only in development
if (process.env.NODE_ENV === 'development' || process.env.DEV_ENABLE_SWAGGER === 'true') {
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'URFMP API Documentation',
    })
  )
}

// Health check route (no auth required)
app.use('/health', healthRoutes)

// Public routes (no auth required)
app.use('/api/v1/auth', authRoutes)

// Protected routes (auth required)
app.use('/api/v1/robots', requiredAuth, robotRoutes)
app.use('/api/v1/telemetry', requiredAuth, telemetryRoutes)
app.use('/api/v1/organizations', requiredAuth, organizationRoutes)
app.use('/api/v1/users', requiredAuth, userRoutes)
app.use('/api/v1/maintenance', requiredAuth, maintenanceRoutes)

// API root
app.get('/', (_req, res) => {
  res.json({
    name: 'URFMP API',
    version: '1.0.0',
    description: 'Universal Robot Fleet Management Platform - The Stripe of Robotics',
    docs: '/docs',
    health: '/health',
    endpoints: {
      auth: '/api/v1/auth',
      robots: '/api/v1/robots',
      telemetry: '/api/v1/telemetry',
      organizations: '/api/v1/organizations',
      users: '/api/v1/users',
      maintenance: '/api/v1/maintenance',
    },
  })
})

// Handle 404
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
      timestamp: new Date().toISOString(),
    },
  })
})

// Error handling middleware (must be last)
app.use(errorHandler)

logger.info('Express application configured successfully')

export default app
