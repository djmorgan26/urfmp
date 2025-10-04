import { WebSocketServer, WebSocket } from 'ws'
import { Server } from 'http'
import {
  ROSMessage,
  ROSBridgeConnection,
  SimulationRobotState,
  SimulationCommand,
  BridgeEvent,
} from '@urfmp/types'
import { logger } from '../config/logger'
import { publishToChannel } from './websocket.service'

interface ROSBridgeClient {
  ws: WebSocket
  robotId: string
  organizationId: string
  userId: string
  connectedAt: Date
  topics: Set<string>
  services: Set<string>
  lastMessageAt?: Date
}

class ROSBridgeServer {
  private wss: WebSocketServer | null = null
  private clients: Map<string, ROSBridgeClient> = new Map()
  private robotConnections: Map<string, ROSBridgeConnection> = new Map()

  initialize(server: Server) {
    this.wss = new WebSocketServer({
      server,
      path: '/rosbridge',
    })

    this.wss.on('connection', this.handleConnection.bind(this))

    logger.info('ROSBridge WebSocket server initialized on /rosbridge')
  }

  private handleConnection(ws: WebSocket, _req: any) {
    const clientId = this.generateClientId()

    logger.info(`New ROSBridge connection: ${clientId}`)

    ws.on('message', (data: Buffer) => {
      try {
        const message: ROSMessage = JSON.parse(data.toString())
        this.handleMessage(clientId, ws, message)
      } catch (error) {
        logger.error('Failed to parse ROSBridge message:', error)
        this.sendError(ws, 'Invalid JSON message')
      }
    })

    ws.on('close', () => {
      this.handleDisconnection(clientId)
    })

    ws.on('error', (error) => {
      logger.error(`ROSBridge client ${clientId} error:`, error)
      this.handleDisconnection(clientId)
    })

    // Send welcome message
    this.send(ws, {
      op: 'service_response',
      service: '/rosbridge/info',
      values: {
        connected: true,
        protocols: ['rosbridge_v2.0'],
        capabilities: ['publish', 'subscribe', 'call_service'],
      },
    })
  }

  private handleMessage(clientId: string, ws: WebSocket, message: ROSMessage) {
    const client = this.clients.get(clientId)

    switch (message.op) {
      case 'advertise':
        this.handleAdvertise(clientId, ws, message)
        break

      case 'publish':
        this.handlePublish(clientId, message)
        break

      case 'subscribe':
        this.handleSubscribe(clientId, ws, message)
        break

      case 'unsubscribe':
        this.handleUnsubscribe(clientId, message)
        break

      case 'call_service':
        this.handleServiceCall(clientId, ws, message)
        break

      case 'advertise_service':
        this.handleAdvertiseService(clientId, message)
        break

      default:
        logger.warn(`Unknown ROSBridge operation: ${message.op}`)
        this.sendError(ws, `Unknown operation: ${message.op}`)
    }

    // Update last message timestamp
    if (client) {
      client.lastMessageAt = new Date()
    }
  }

  private handleAdvertise(clientId: string, ws: WebSocket, message: ROSMessage) {
    const client = this.clients.get(clientId)
    if (!client) {
      // First advertise - register client
      const robotId = message.topic?.split('/')[1] || `robot-${clientId}`
      const newClient: ROSBridgeClient = {
        ws,
        robotId,
        organizationId: 'default', // TODO: Extract from auth
        userId: 'default', // TODO: Extract from auth
        connectedAt: new Date(),
        topics: new Set([message.topic!]),
        services: new Set(),
      }

      this.clients.set(clientId, newClient)

      const connection: ROSBridgeConnection = {
        id: clientId,
        robotId,
        status: 'connected',
        connectedAt: new Date(),
        topics: [message.topic!],
        services: [],
      }

      this.robotConnections.set(robotId, connection)

      logger.info(`Robot ${robotId} advertised topic: ${message.topic}`)

      // Broadcast connection event
      this.broadcastEvent({
        type: 'connection',
        robotId,
        data: connection,
        timestamp: new Date(),
      })
    } else {
      if (message.topic) {
        client.topics.add(message.topic)
        const connection = this.robotConnections.get(client.robotId)
        if (connection) {
          connection.topics = Array.from(client.topics)
        }
        logger.info(`Robot ${client.robotId} advertised topic: ${message.topic}`)
      }
    }
  }

  private handlePublish(clientId: string, message: ROSMessage) {
    const client = this.clients.get(clientId)
    if (!client) {
      logger.warn(`Publish from unknown client: ${clientId}`)
      return
    }

    if (!message.topic || !message.msg) {
      logger.warn('Invalid publish message: missing topic or msg')
      return
    }

    // Translate ROS message to URFMP telemetry
    const robotState = this.translateROSToState(client.robotId, message)

    if (robotState) {
      // Broadcast to WebSocket subscribers
      publishToChannel(`robot:${client.robotId}`, {
        type: 'telemetry',
        robotId: client.robotId,
        data: robotState,
      })

      logger.debug(`Published telemetry from robot ${client.robotId} on topic ${message.topic}`)
    }

    // Broadcast event
    this.broadcastEvent({
      type: 'telemetry',
      robotId: client.robotId,
      data: message.msg,
      timestamp: new Date(),
    })
  }

  private handleSubscribe(clientId: string, ws: WebSocket, message: ROSMessage) {
    const client = this.clients.get(clientId)
    if (!client) {
      logger.warn(`Subscribe from unknown client: ${clientId}`)
      return
    }

    if (message.topic) {
      client.topics.add(message.topic)
      logger.info(`Robot ${client.robotId} subscribed to topic: ${message.topic}`)

      // Send confirmation
      this.send(ws, {
        op: 'set_level',
        level: 'none',
        id: message.id,
      })
    }
  }

  private handleUnsubscribe(clientId: string, message: ROSMessage) {
    const client = this.clients.get(clientId)
    if (!client) return

    if (message.topic) {
      client.topics.delete(message.topic)
      logger.info(`Robot ${client.robotId} unsubscribed from topic: ${message.topic}`)
    }
  }

  private handleServiceCall(clientId: string, ws: WebSocket, message: ROSMessage) {
    const client = this.clients.get(clientId)
    if (!client) {
      logger.warn(`Service call from unknown client: ${clientId}`)
      return
    }

    logger.info(`Service call from robot ${client.robotId}: ${message.service}`)

    // Send service response
    this.send(ws, {
      op: 'service_response',
      service: message.service,
      values: { success: true },
      id: message.id,
    })
  }

  private handleAdvertiseService(clientId: string, message: ROSMessage) {
    const client = this.clients.get(clientId)
    if (!client) return

    if (message.service) {
      client.services.add(message.service)
      const connection = this.robotConnections.get(client.robotId)
      if (connection) {
        connection.services = Array.from(client.services)
      }
      logger.info(`Robot ${client.robotId} advertised service: ${message.service}`)
    }
  }

  private handleDisconnection(clientId: string) {
    const client = this.clients.get(clientId)
    if (client) {
      logger.info(`Robot ${client.robotId} disconnected`)

      const connection = this.robotConnections.get(client.robotId)
      if (connection) {
        connection.status = 'disconnected'
      }

      // Broadcast disconnection event
      this.broadcastEvent({
        type: 'disconnection',
        robotId: client.robotId,
        timestamp: new Date(),
      })

      this.clients.delete(clientId)
      this.robotConnections.delete(client.robotId)
    }
  }

  // Translate ROS messages to URFMP robot state
  private translateROSToState(robotId: string, message: ROSMessage): SimulationRobotState | null {
    const { topic, msg } = message

    if (!topic || !msg) return null

    const state: Partial<SimulationRobotState> = {
      robotId,
      timestamp: new Date(),
    }

    // Parse common ROS topics
    if (topic.includes('odom') || topic.includes('pose')) {
      state.position = {
        x: msg.pose?.pose?.position?.x || msg.position?.x || 0,
        y: msg.pose?.pose?.position?.y || msg.position?.y || 0,
        z: msg.pose?.pose?.position?.z || msg.position?.z || 0,
      }
      state.orientation = msg.pose?.pose?.orientation || msg.orientation
    }

    if (topic.includes('cmd_vel') || topic.includes('velocity')) {
      state.velocity = {
        linear: msg.linear || { x: 0, y: 0, z: 0 },
        angular: msg.angular || { x: 0, y: 0, z: 0 },
      }
    }

    if (topic.includes('joint_states')) {
      state.jointStates = {
        name: msg.name || [],
        position: msg.position || [],
        velocity: msg.velocity || [],
        effort: msg.effort || [],
      }
    }

    if (topic.includes('scan') || topic.includes('lidar')) {
      state.sensorData = {
        lidar: {
          ranges: msg.ranges || [],
          angle_min: msg.angle_min || 0,
          angle_max: msg.angle_max || 0,
          angle_increment: msg.angle_increment || 0,
        },
      }
    }

    if (topic.includes('imu')) {
      state.sensorData = {
        ...state.sensorData,
        imu: {
          orientation: msg.orientation || { x: 0, y: 0, z: 0, w: 1 },
          angular_velocity: msg.angular_velocity || { x: 0, y: 0, z: 0 },
          linear_acceleration: msg.linear_acceleration || { x: 0, y: 0, z: 0 },
        },
      }
    }

    if (topic.includes('gps') || topic.includes('global_position')) {
      state.sensorData = {
        ...state.sensorData,
        gps: {
          latitude: msg.latitude || 0,
          longitude: msg.longitude || 0,
          altitude: msg.altitude || 0,
        },
      }
    }

    return state as SimulationRobotState
  }

  // Send command to robot via ROS topic
  sendCommand(robotId: string, command: SimulationCommand) {
    const client = Array.from(this.clients.values()).find((c) => c.robotId === robotId)

    if (!client) {
      logger.warn(`Cannot send command to robot ${robotId}: not connected`)
      return false
    }

    const rosMessage = this.translateCommandToROS(command)

    if (rosMessage) {
      this.send(client.ws, rosMessage)
      logger.info(`Sent command to robot ${robotId}: ${command.type}`)
      return true
    }

    return false
  }

  // Translate URFMP command to ROS message
  private translateCommandToROS(command: SimulationCommand): ROSMessage | null {
    switch (command.type) {
      case 'move':
      case 'rotate':
        return {
          op: 'publish',
          topic: '/cmd_vel',
          msg: {
            linear: command.velocity?.linear || { x: 0, y: 0, z: 0 },
            angular: command.velocity?.angular || { x: 0, y: 0, z: 0 },
          },
        }

      case 'joint_control':
        return {
          op: 'publish',
          topic: '/joint_trajectory',
          msg: {
            joint_names: command.joints?.map((j: any) => j.name) || [],
            points: command.joints?.map((j: any) => ({ positions: [j.position] })) || [],
          },
        }

      case 'custom':
        if (command.customTopic && command.customMessage) {
          return {
            op: 'publish',
            topic: command.customTopic,
            msg: command.customMessage,
          }
        }
        return null

      default:
        logger.warn(`Unknown command type: ${command.type}`)
        return null
    }
  }

  private send(ws: WebSocket, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    }
  }

  private sendError(ws: WebSocket, error: string) {
    this.send(ws, {
      op: 'service_response',
      service: 'error',
      values: { error },
    })
  }

  private broadcastEvent(event: BridgeEvent) {
    publishToChannel('rosbridge:events', event)
  }

  private generateClientId(): string {
    return `rosbridge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Get connection info
  getConnection(robotId: string): ROSBridgeConnection | undefined {
    return this.robotConnections.get(robotId)
  }

  getAllConnections(): ROSBridgeConnection[] {
    return Array.from(this.robotConnections.values())
  }

  // Health check
  getHealth() {
    return {
      active_connections: this.clients.size,
      robots_connected: this.robotConnections.size,
      topics_active: Array.from(this.clients.values()).reduce(
        (acc, client) => acc + client.topics.size,
        0
      ),
      services_active: Array.from(this.clients.values()).reduce(
        (acc, client) => acc + client.services.size,
        0
      ),
    }
  }
}

export const rosbridgeServer = new ROSBridgeServer()
