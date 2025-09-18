import axios, { AxiosInstance } from 'axios'

// Use native WebSocket in browser, ws package in Node.js
const WebSocketImpl = typeof window !== 'undefined' ? window.WebSocket : require('ws')
import {
  Robot,
  RobotTelemetry,
  ApiResponse,
  WebSocketMessage,
  RobotCommand,
  CommandResult,
  WebSocketMessageType,
} from '@urfmp/types'

export interface URFMPConfig {
  apiKey: string
  baseUrl?: string
  websocketUrl?: string
  timeout?: number
  retries?: number
}

export class URFMP {
  private client: AxiosInstance
  private config: URFMPConfig
  private websocket?: any // WebSocket (browser) or ws (Node.js)
  private eventHandlers: Map<string, Function[]> = new Map()

  constructor(config: URFMPConfig) {
    this.config = {
      baseUrl: 'https://api.urfmp.com',
      websocketUrl: 'wss://api.urfmp.com',
      timeout: 10000,
      retries: 3,
      ...config,
    }

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'X-API-Key': this.config.apiKey,
        'Content-Type': 'application/json',
        ...(typeof window === 'undefined' && { 'User-Agent': `@urfmp/sdk/1.0.0` }),
      },
    })

    this.setupRequestInterceptors()
    this.setupResponseInterceptors()
  }

  /**
   * The magic 7-line quickstart method
   * Monitor any robot with minimal setup
   */
  async quickStart(robotConfig: {
    name: string
    vendor: string
    model: string
    host: string
    port?: number
  }): Promise<{ robot: Robot; monitor: any }> {
    // Line 1: Create robot in URFMP
    const robot = await this.createRobot(robotConfig)

    // Line 2: Connect to real-time events
    await this.connectWebSocket()

    // Line 3: Subscribe to robot events
    this.on('robot:status', (data) => console.log('Robot status:', data))
    this.on('robot:telemetry', (data) => console.log('Telemetry:', data))
    this.on('robot:alert', (data) => console.log('Alert:', data))

    // Line 4: Start monitoring
    const monitor = this.monitor(robot.id)

    // Line 5: Send test telemetry
    await this.sendTelemetry(robot.id, {
      position: { x: 0, y: 0, z: 0 },
      timestamp: new Date(),
    })

    // Line 6: Get real-time dashboard URL
    const dashboardUrl = `${this.config.baseUrl?.replace('api.', '') || 'http://localhost:3001'}/robots/${robot.id}`
    console.log(`🚀 Robot monitoring active! Dashboard: ${dashboardUrl}`)

    // Line 7: Return control objects
    return { robot, monitor }
  }

  // Core API methods
  async createRobot(robotData: {
    name: string
    vendor: string
    model: string
    host: string
    port?: number
    serialNumber?: string
  }): Promise<Robot> {
    const response = await this.client.post<ApiResponse<Robot>>('/api/v1/robots', {
      ...robotData,
      serialNumber: robotData.serialNumber || `${robotData.vendor}-${Date.now()}`,
      configuration: {
        host: robotData.host,
        port: robotData.port || 80,
      },
    })

    return response.data.data!
  }

  async getRobots(): Promise<Robot[]> {
    const response = await this.client.get<ApiResponse<{ robots: Robot[] }>>('/api/v1/robots')
    return response.data.data!.robots
  }

  async getRobot(robotId: string): Promise<Robot> {
    const response = await this.client.get<ApiResponse<Robot>>(`/api/v1/robots/${robotId}`)
    return response.data.data!
  }

  async sendTelemetry(robotId: string, data: any): Promise<void> {
    await this.client.post(`/api/v1/telemetry/${robotId}`, data)
  }

  async getLatestTelemetry(robotId: string): Promise<RobotTelemetry> {
    const response = await this.client.get<ApiResponse<RobotTelemetry>>(
      `/api/v1/telemetry/${robotId}/latest`
    )
    return response.data.data!
  }

  async sendCommand(robotId: string, command: Partial<RobotCommand>): Promise<CommandResult> {
    const response = await this.client.post<ApiResponse<CommandResult>>(
      `/api/v1/robots/${robotId}/commands`,
      command
    )
    return response.data.data!
  }

  // WebSocket functionality
  async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.websocket = new WebSocketImpl(`${this.config.websocketUrl}?token=${this.config.apiKey}`)

        // Handle both browser WebSocket and Node.js ws package
        if (typeof window !== 'undefined') {
          // Browser WebSocket API
          this.websocket.onopen = () => {
            console.log('🔗 Connected to URFMP real-time events')
            resolve()
          }

          this.websocket.onmessage = (event: any) => {
            try {
              const message: WebSocketMessage = JSON.parse(event.data)
              this.handleWebSocketMessage(message)
            } catch (error) {
              console.error('Failed to parse WebSocket message:', error)
            }
          }

          this.websocket.onerror = (error: any) => {
            console.error('WebSocket error:', error)
            reject(error)
          }

          this.websocket.onclose = () => {
            console.log('🔌 Disconnected from URFMP')
            // Auto-reconnect logic could go here
          }
        } else {
          // Node.js ws package API
          this.websocket.on('open', () => {
            console.log('🔗 Connected to URFMP real-time events')
            resolve()
          })

          this.websocket.on('message', (data: any) => {
            try {
              const message: WebSocketMessage = JSON.parse(data.toString())
              this.handleWebSocketMessage(message)
            } catch (error) {
              console.error('Failed to parse WebSocket message:', error)
            }
          })

          this.websocket.on('error', (error: any) => {
            console.error('WebSocket error:', error)
            reject(error)
          })

          this.websocket.on('close', () => {
            console.log('🔌 Disconnected from URFMP')
            // Auto-reconnect logic could go here
          })
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  on(event: string, handler: (data?: any) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event)!.push(handler)
  }

  off(event: string, handler?: (data?: any) => void): void {
    if (!handler) {
      this.eventHandlers.delete(event)
      return
    }

    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  subscribe(channel: string): void {
    if (this.websocket && this.websocket.readyState === 1) { // WebSocket.OPEN = 1
      this.websocket.send(
        JSON.stringify({
          type: WebSocketMessageType.SUBSCRIPTION,
          event: 'subscribe',
          data: { channel },
        })
      )
    }
  }

  // Monitoring helper
  monitor(robotId: string) {
    // Subscribe to robot-specific events
    this.subscribe(`robot:${robotId}`)
    this.subscribe(`telemetry:${robotId}`)
    this.subscribe(`alerts:${robotId}`)

    return {
      start: () => console.log(`📊 Monitoring started for robot ${robotId}`),
      stop: () => {
        // Unsubscribe logic
        console.log(`⏹️ Monitoring stopped for robot ${robotId}`)
      },
      sendTelemetry: (data: any) => this.sendTelemetry(robotId, data),
      getLatest: () => this.getLatestTelemetry(robotId),
      sendCommand: (command: any) => this.sendCommand(robotId, command),
    }
  }

  // Health check
  async health(): Promise<any> {
    const response = await this.client.get('/health')
    return response.data
  }

  // Disconnect
  disconnect(): void {
    if (this.websocket) {
      this.websocket.close()
      this.websocket = undefined
    }
    this.eventHandlers.clear()
  }

  // Private methods
  private handleWebSocketMessage(message: WebSocketMessage): void {
    const { event, data } = message

    // Emit to specific event handlers
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data)
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error)
        }
      })
    }

    // Emit to wildcard handlers
    const wildcardHandlers = this.eventHandlers.get('*')
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => {
        try {
          handler(event, data)
        } catch (error) {
          console.error(`Error in wildcard event handler:`, error)
        }
      })
    }
  }

  private setupRequestInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        // Add request ID for tracing
        config.headers['X-Request-ID'] =
          `sdk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        return config
      },
      (error) => Promise.reject(error)
    )
  }

  private setupResponseInterceptors(): void {
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        // Retry logic for network errors
        if (!originalRequest._retry && this.shouldRetry(error)) {
          originalRequest._retry = true

          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 1000))

          return this.client(originalRequest)
        }

        return Promise.reject(error)
      }
    )
  }

  private shouldRetry(error: any): boolean {
    return (
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT' ||
      (error.response && [408, 429, 500, 502, 503, 504].includes(error.response.status))
    )
  }
}

// Export convenience function for quick initialization
export const createURFMP = (config: URFMPConfig): URFMP => {
  return new URFMP(config)
}
