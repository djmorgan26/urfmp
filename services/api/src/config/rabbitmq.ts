import * as amqp from 'amqplib'
import { v4 as uuidv4 } from 'uuid'
import { logger } from './logger'

let connection: any = null
let channel: amqp.Channel | null = null

const EXCHANGES = {
  EVENTS: process.env.RABBITMQ_EXCHANGE || 'urfmp_events',
}

const QUEUES = {
  TELEMETRY: process.env.RABBITMQ_QUEUE_TELEMETRY || 'robot_telemetry',
  COMMANDS: process.env.RABBITMQ_QUEUE_COMMANDS || 'robot_commands',
  NOTIFICATIONS: 'notifications',
  MAINTENANCE: 'maintenance_tasks',
}

export const connectRabbitMQ = async (): Promise<void> => {
  try {
    const url = process.env.RABBITMQ_URL || 'amqp://urfmp:urfmp-dev-2024@localhost:5672'

    connection = await amqp.connect(url)
    if (!connection) {
      throw new Error('Failed to establish RabbitMQ connection')
    }
    channel = await (connection as any).createChannel()
    if (!channel) {
      throw new Error('Failed to create RabbitMQ channel')
    }

    // Create exchanges
    await channel.assertExchange(EXCHANGES.EVENTS, 'topic', { durable: true })

    // Create queues
    for (const queueName of Object.values(QUEUES)) {
      await channel.assertQueue(queueName, { durable: true })
    }

    // Bind queues to exchanges
    await channel.bindQueue(QUEUES.TELEMETRY, EXCHANGES.EVENTS, 'robot.telemetry.*')
    await channel.bindQueue(QUEUES.COMMANDS, EXCHANGES.EVENTS, 'robot.command.*')
    await channel.bindQueue(QUEUES.NOTIFICATIONS, EXCHANGES.EVENTS, 'notification.*')
    await channel.bindQueue(QUEUES.MAINTENANCE, EXCHANGES.EVENTS, 'maintenance.*')

    // Set up error handlers
    connection.on('error', (error: Error) => {
      logger.error('RabbitMQ connection error', { error: (error as Error).message })
    })

    connection.on('close', () => {
      logger.warn('RabbitMQ connection closed')
    })

    if (channel) {
      channel.on('error', (error: Error) => {
        logger.error('RabbitMQ channel error', { error: (error as Error).message })
      })
    }

    logger.info('RabbitMQ connected successfully')
  } catch (error) {
    logger.error('Failed to connect to RabbitMQ', { error: (error as Error).message })
    throw error
  }
}

export const getRabbitMQ = (): { connection: any; channel: amqp.Channel } => {
  if (!connection || !channel) {
    throw new Error('RabbitMQ not initialized. Call connectRabbitMQ first.')
  }
  return { connection, channel }
}

// Message publishing utilities
export const publishEvent = async (
  routingKey: string,
  message: any,
  options: { persistent?: boolean } = {}
): Promise<boolean> => {
  try {
    if (!channel) {
      throw new Error('RabbitMQ channel not initialized')
    }

    const messageBuffer = Buffer.from(
      JSON.stringify({
        ...message,
        timestamp: new Date().toISOString(),
        id: uuidv4(),
      })
    )

    const success = channel.publish(EXCHANGES.EVENTS, routingKey, messageBuffer, {
      persistent: options.persistent ?? true,
      timestamp: Date.now(),
    })

    if (!success) {
      logger.warn('Message publish failed (buffer full)', { routingKey })
    }

    return success
  } catch (error) {
    logger.error('Failed to publish event', {
      routingKey,
      error: (error as Error).message,
    })
    return false
  }
}

export const publishToQueue = async (
  queueName: string,
  message: any,
  options: { persistent?: boolean; priority?: number } = {}
): Promise<boolean> => {
  try {
    if (!channel) {
      throw new Error('RabbitMQ channel not initialized')
    }

    const messageBuffer = Buffer.from(
      JSON.stringify({
        ...message,
        timestamp: new Date().toISOString(),
        id: uuidv4(),
      })
    )

    const success = channel.sendToQueue(queueName, messageBuffer, {
      persistent: options.persistent ?? true,
      priority: options.priority ?? 0,
      timestamp: Date.now(),
    })

    if (!success) {
      logger.warn('Message send failed (buffer full)', { queueName })
    }

    return success
  } catch (error) {
    logger.error('Failed to send message to queue', {
      queueName,
      error: (error as Error).message,
    })
    return false
  }
}

// Consumer utilities
export const consumeQueue = async (
  queueName: string,
  handler: (message: any) => Promise<void>,
  options: { prefetch?: number } = {}
): Promise<void> => {
  try {
    if (!channel) {
      throw new Error('RabbitMQ channel not initialized')
    }

    await channel.prefetch(options.prefetch ?? 1)

    await channel.consume(queueName, async (msg) => {
      if (!msg || !channel) return

      try {
        const content = JSON.parse(msg.content.toString())
        await handler(content)
        channel.ack(msg)
      } catch (error) {
        logger.error('Message processing failed', {
          queueName,
          error: (error as Error).message,
        })
        // Reject and requeue the message (could add retry logic here)
        channel.nack(msg, false, true)
      }
    })

    logger.info('Consumer started', { queueName })
  } catch (error) {
    logger.error('Failed to start consumer', {
      queueName,
      error: (error as Error).message,
    })
    throw error
  }
}

// Health check
export const checkRabbitMQHealth = async (): Promise<{
  status: 'healthy' | 'unhealthy'
  details: any
}> => {
  try {
    if (!connection) {
      throw new Error('Connection not established')
    }

    // Try to create a temporary channel to test connectivity
    if (!connection) throw new Error('No connection available')
    const testChannel = await (connection as any).createChannel()
    await testChannel.close()

    return {
      status: 'healthy',
      details: {
        connected: true,
        exchanges: Object.values(EXCHANGES),
        queues: Object.values(QUEUES),
      },
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        connected: false,
        error: (error as Error).message,
      },
    }
  }
}

// Close connection
export const closeRabbitMQ = async (): Promise<void> => {
  try {
    if (channel) {
      await channel.close()
    }
    if (connection) {
      await (connection as any).close()
    }
    logger.info('RabbitMQ connection closed')
  } catch (error) {
    logger.error('Error closing RabbitMQ connection', { error: (error as Error).message })
  }
}

export { EXCHANGES, QUEUES }
export default {
  connectRabbitMQ,
  getRabbitMQ,
  publishEvent,
  publishToQueue,
  consumeQueue,
  checkRabbitMQHealth,
  closeRabbitMQ,
}
