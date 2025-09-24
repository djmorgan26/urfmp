import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { WebSocketMessage, WebSocketMessageType, AuthPayload } from '@urfmp/types'
import { logger, logWebSocketEvent } from '../config/logger'
import { pubsub } from '../config/redis'

interface ExtendedWebSocket extends WebSocket {
  id: string
  userId?: string
  organizationId?: string
  subscriptions: Set<string>
  lastPing: number
  isAlive: boolean
}

class WebSocketService {
  private wss: WebSocketServer
  private clients = new Map<string, ExtendedWebSocket>()
  private heartbeatInterval!: NodeJS.Timeout
  private cleanupInterval!: NodeJS.Timeout

  constructor(wss: WebSocketServer) {
    this.wss = wss
    this.setupWebSocketServer()
    this.setupHeartbeat()
    this.setupCleanup()
    this.setupRedisSubscriptions()
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', this.handleConnection.bind(this))

    this.wss.on('error', (error) => {
      logger.error('WebSocket server error', { error: (error as Error).message })
    })

    logger.info('WebSocket server initialized')
  }

  private async handleConnection(ws: WebSocket, req: IncomingMessage): Promise<void> {
    const socketId = uuidv4()
    const extendedWs = ws as ExtendedWebSocket

    extendedWs.id = socketId
    extendedWs.subscriptions = new Set()
    extendedWs.lastPing = Date.now()
    extendedWs.isAlive = true

    this.clients.set(socketId, extendedWs)

    // Extract user info from token if provided
    await this.authenticateConnection(extendedWs, req)

    logWebSocketEvent('connection_established', extendedWs.userId, extendedWs.organizationId, {
      socketId,
      ip: req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    })

    // Set up message handling
    extendedWs.on('message', (data) => this.handleMessage(extendedWs, Buffer.from(data as any)))

    extendedWs.on('close', () => this.handleDisconnection(extendedWs))

    extendedWs.on('error', (error) => {
      logger.error('WebSocket connection error', {
        socketId,
        userId: extendedWs.userId,
        error: (error as Error).message,
      })
    })

    extendedWs.on('pong', () => {
      extendedWs.isAlive = true
      extendedWs.lastPing = Date.now()
    })

    // Send welcome message
    this.sendMessage(extendedWs, {
      type: WebSocketMessageType.EVENT,
      event: 'connected',
      data: {
        socketId,
        timestamp: new Date(),
        server: 'urfmp-api',
        version: '1.0.0',
      },
    })
  }

  private async authenticateConnection(ws: ExtendedWebSocket, req: IncomingMessage): Promise<void> {
    try {
      // Try to get token from query params or headers
      const url = new URL(req.url!, `http://${req.headers.host}`)
      const token =
        url.searchParams.get('token') || req.headers.authorization?.replace('Bearer ', '')

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload
        ws.userId = decoded.sub
        ws.organizationId = decoded.org

        logger.info('WebSocket authenticated', {
          socketId: ws.id,
          userId: ws.userId,
          organizationId: ws.organizationId,
        })
      }
    } catch (error) {
      logger.warn('WebSocket authentication failed', {
        socketId: ws.id,
        error: (error as Error).message,
      })
      // Allow unauthenticated connections for public data
    }
  }

  private handleMessage(ws: ExtendedWebSocket, data: Buffer): void {
    try {
      const message = JSON.parse(data.toString()) as WebSocketMessage

      logWebSocketEvent('message_received', ws.userId, ws.organizationId, {
        socketId: ws.id,
        messageType: message.type,
        event: message.event,
      })

      switch (message.type) {
        case WebSocketMessageType.SUBSCRIPTION:
          this.handleSubscription(ws, message)
          break

        case WebSocketMessageType.UNSUBSCRIPTION:
          this.handleUnsubscription(ws, message)
          break

        case WebSocketMessageType.HEARTBEAT:
          this.handleHeartbeat(ws, message)
          break

        case WebSocketMessageType.COMMAND:
          this.handleCommand(ws, message)
          break

        default:
          logger.warn('Unknown WebSocket message type', {
            socketId: ws.id,
            messageType: message.type,
          })
      }
    } catch (error) {
      logger.error('WebSocket message parsing error', {
        socketId: ws.id,
        error: (error as Error).message,
      })

      this.sendError(ws, 'Invalid message format')
    }
  }

  private handleSubscription(ws: ExtendedWebSocket, message: WebSocketMessage): void {
    const { data } = message

    if (!data.channel) {
      return this.sendError(ws, 'Channel is required for subscription')
    }

    const channel = data.channel

    // Check authorization for private channels
    if (this.isPrivateChannel(channel) && !ws.userId) {
      return this.sendError(ws, 'Authentication required for private channels')
    }

    // Add to subscriptions
    ws.subscriptions.add(channel)

    logWebSocketEvent('subscription_added', ws.userId, ws.organizationId, {
      socketId: ws.id,
      channel,
    })

    this.sendMessage(ws, {
      type: WebSocketMessageType.RESPONSE,
      event: 'subscription_confirmed',
      data: { channel },
    })
  }

  private handleUnsubscription(ws: ExtendedWebSocket, message: WebSocketMessage): void {
    const { data } = message

    if (!data.channel) {
      return this.sendError(ws, 'Channel is required for unsubscription')
    }

    const channel = data.channel
    ws.subscriptions.delete(channel)

    logWebSocketEvent('subscription_removed', ws.userId, ws.organizationId, {
      socketId: ws.id,
      channel,
    })

    this.sendMessage(ws, {
      type: WebSocketMessageType.RESPONSE,
      event: 'unsubscription_confirmed',
      data: { channel },
    })
  }

  private handleHeartbeat(ws: ExtendedWebSocket, message: WebSocketMessage): void {
    ws.lastPing = Date.now()

    this.sendMessage(ws, {
      type: WebSocketMessageType.HEARTBEAT,
      event: 'pong',
      data: {
        timestamp: new Date(),
        latency: Date.now() - (message.data?.timestamp || Date.now()),
      },
    })
  }

  private handleCommand(ws: ExtendedWebSocket, message: WebSocketMessage): void {
    // Handle robot commands, maintenance actions, etc.
    logWebSocketEvent('command_received', ws.userId, ws.organizationId, {
      socketId: ws.id,
      command: message.event,
      data: message.data,
    })

    // TODO: Implement command processing
    this.sendMessage(ws, {
      type: WebSocketMessageType.RESPONSE,
      event: 'command_acknowledged',
      data: {
        commandId: message.id,
        status: 'received',
      },
    })
  }

  private handleDisconnection(ws: ExtendedWebSocket): void {
    logWebSocketEvent('connection_closed', ws.userId, ws.organizationId, {
      socketId: ws.id,
      subscriptions: Array.from(ws.subscriptions),
    })

    this.clients.delete(ws.id)
  }

  private sendMessage(ws: ExtendedWebSocket, message: Partial<WebSocketMessage>): void {
    if (ws.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        id: uuidv4(),
        timestamp: new Date(),
        userId: ws.userId,
        organizationId: ws.organizationId,
        ...message,
      } as WebSocketMessage

      ws.send(JSON.stringify(fullMessage))
    }
  }

  private sendError(ws: ExtendedWebSocket, message: string): void {
    this.sendMessage(ws, {
      type: WebSocketMessageType.ERROR,
      event: 'error',
      data: { message },
    })
  }

  private isPrivateChannel(channel: string): boolean {
    return channel.startsWith('robot:') || channel.startsWith('org:') || channel.startsWith('user:')
  }

  private setupHeartbeat(): void {
    const interval = parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000')

    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((ws) => {
        if (!ws.isAlive) {
          logger.warn('WebSocket connection terminated (no pong)', {
            socketId: ws.id,
            userId: ws.userId,
          })
          ws.terminate()
          this.clients.delete(ws.id)
          return
        }

        ws.isAlive = false
        ws.ping()
      })
    }, interval)
  }

  private setupCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const timeout = parseInt(process.env.WS_CONNECTION_TIMEOUT || '60000')
      const now = Date.now()

      this.clients.forEach((ws) => {
        if (now - ws.lastPing > timeout) {
          logger.warn('WebSocket connection timeout', {
            socketId: ws.id,
            userId: ws.userId,
            lastPing: ws.lastPing,
          })
          ws.terminate()
          this.clients.delete(ws.id)
        }
      })
    }, 60000) // Run every minute
  }

  private setupRedisSubscriptions(): void {
    // Subscribe to Redis pub/sub for real-time updates
    pubsub.subscribe('robot:*', (message) => {
      this.broadcastToChannel('robot', message)
    })

    pubsub.subscribe('telemetry:*', (message) => {
      this.broadcastToChannel('telemetry', message)
    })

    pubsub.subscribe('maintenance:*', (message) => {
      this.broadcastToChannel('maintenance', message)
    })

    pubsub.subscribe('alerts:*', (message) => {
      this.broadcastToChannel('alerts', message)
    })
  }

  public broadcastToChannel(channel: string, data: any): void {
    const message: WebSocketMessage = {
      id: uuidv4(),
      type: WebSocketMessageType.EVENT,
      event: channel,
      data,
      timestamp: new Date(),
    }

    this.clients.forEach((ws) => {
      if (ws.subscriptions.has(channel) || ws.subscriptions.has('*')) {
        this.sendMessage(ws, message)
      }
    })
  }

  public getMetrics() {
    const totalConnections = this.clients.size
    const authenticatedConnections = Array.from(this.clients.values()).filter(
      (ws) => ws.userId
    ).length

    const connectionsByOrg = new Map<string, number>()
    this.clients.forEach((ws) => {
      if (ws.organizationId) {
        connectionsByOrg.set(ws.organizationId, (connectionsByOrg.get(ws.organizationId) || 0) + 1)
      }
    })

    return {
      totalConnections,
      authenticatedConnections,
      anonymousConnections: totalConnections - authenticatedConnections,
      connectionsByOrganization: Object.fromEntries(connectionsByOrg),
    }
  }

  public close(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    this.clients.forEach((ws) => {
      ws.close()
    })

    this.clients.clear()
    logger.info('WebSocket service closed')
  }
}

let webSocketService: WebSocketService

export const initializeWebSocketServer = (wss: WebSocketServer): void => {
  webSocketService = new WebSocketService(wss)
}

export const getWebSocketService = (): WebSocketService => {
  if (!webSocketService) {
    throw new Error('WebSocket service not initialized')
  }
  return webSocketService
}

export default WebSocketService
