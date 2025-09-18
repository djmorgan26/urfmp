import { URFMP } from './client'
import { Robot, RobotTelemetry } from '@urfmp/types'

export class RobotMonitor {
  private client: URFMP
  private robot: Robot
  private monitoring = false
  private interval?: NodeJS.Timeout
  private pollRate = 1000 // 1 second default

  constructor(client: URFMP, robot: Robot) {
    this.client = client
    this.robot = robot
  }

  /**
   * Start monitoring the robot
   */
  startMonitoring(options: { pollRate?: number; autoReconnect?: boolean } = {}): void {
    if (this.monitoring) {
      console.warn(`Robot ${this.robot.id} is already being monitored`)
      return
    }

    this.pollRate = options.pollRate || this.pollRate
    this.monitoring = true

    console.log(`📊 Started monitoring robot ${this.robot.name} (${this.robot.id})`)

    // Subscribe to real-time events
    this.client.subscribe(`robot:${this.robot.id}`)
    this.client.subscribe(`telemetry:${this.robot.id}`)
    this.client.subscribe(`alerts:${this.robot.id}`)

    // Set up event handlers for this specific robot
    this.client.on(`robot:${this.robot.id}:status`, (data) => {
      console.log(`🤖 Robot ${this.robot.name} status changed:`, data.status)
    })

    this.client.on(`robot:${this.robot.id}:error`, (data) => {
      console.error(`❌ Robot ${this.robot.name} error:`, data.error)
    })

    this.client.on(`robot:${this.robot.id}:alert`, (data) => {
      console.warn(`⚠️ Robot ${this.robot.name} alert:`, data.message)
    })
  }

  /**
   * Stop monitoring the robot
   */
  stopMonitoring(): void {
    if (!this.monitoring) {
      return
    }

    this.monitoring = false

    if (this.interval) {
      clearInterval(this.interval)
      this.interval = undefined
    }

    console.log(`⏹️ Stopped monitoring robot ${this.robot.name} (${this.robot.id})`)
  }

  /**
   * Send telemetry data for this robot
   */
  async sendTelemetry(data: any): Promise<void> {
    return this.client.sendTelemetry(this.robot.id, {
      ...data,
      timestamp: new Date(),
      robotId: this.robot.id,
    })
  }

  /**
   * Get the latest telemetry data
   */
  async getLatestTelemetry(): Promise<RobotTelemetry> {
    return this.client.getLatestTelemetry(this.robot.id)
  }

  /**
   * Send a command to the robot
   */
  async sendCommand(command: any): Promise<any> {
    return this.client.sendCommand(this.robot.id, command)
  }

  /**
   * Common robot commands
   */
  commands = {
    start: (): Promise<any> => this.sendCommand({ type: 'START' }),
    stop: (): Promise<any> => this.sendCommand({ type: 'STOP' }),
    pause: (): Promise<any> => this.sendCommand({ type: 'PAUSE' }),
    resume: (): Promise<any> => this.sendCommand({ type: 'RESUME' }),
    emergencyStop: (): Promise<any> =>
      this.sendCommand({ type: 'EMERGENCY_STOP', priority: 'CRITICAL' }),
    moveToPosition: (x: number, y: number, z: number): Promise<any> => {
      return this.sendCommand({
        type: 'MOVE_TO_POSITION',
        payload: { position: { x, y, z } },
      })
    },
  }

  /**
   * Get robot info
   */
  getRobot(): Robot {
    return this.robot
  }

  /**
   * Check if monitoring is active
   */
  isMonitoring(): boolean {
    return this.monitoring
  }
}
