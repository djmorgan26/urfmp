import { URFMP } from './client'
import { RobotTelemetry } from '@urfmp/types'

export class TelemetryStream {
  private client: URFMP
  private robotId: string
  private streaming = false
  private buffer: any[] = []
  private batchSize = 10
  private flushInterval = 5000 // 5 seconds
  private interval?: NodeJS.Timeout

  constructor(client: URFMP, robotId: string) {
    this.client = client
    this.robotId = robotId
  }

  /**
   * Start streaming telemetry data
   */
  start(options: { batchSize?: number; flushInterval?: number } = {}): void {
    if (this.streaming) {
      console.warn(`Telemetry stream for robot ${this.robotId} is already active`)
      return
    }

    this.batchSize = options.batchSize || this.batchSize
    this.flushInterval = options.flushInterval || this.flushInterval
    this.streaming = true

    // Set up auto-flush interval
    this.interval = setInterval(() => {
      this.flush()
    }, this.flushInterval)

    console.log(`📡 Started telemetry stream for robot ${this.robotId}`)
  }

  /**
   * Stop streaming telemetry data
   */
  stop(): void {
    if (!this.streaming) {
      return
    }

    this.streaming = false

    if (this.interval) {
      clearInterval(this.interval)
      this.interval = undefined
    }

    // Flush any remaining data
    this.flush()

    console.log(`📡 Stopped telemetry stream for robot ${this.robotId}`)
  }

  /**
   * Add telemetry data to the stream
   */
  push(data: any): void {
    if (!this.streaming) {
      throw new Error('Telemetry stream is not active. Call start() first.')
    }

    this.buffer.push({
      ...data,
      timestamp: new Date(),
      robotId: this.robotId,
    })

    // Auto-flush if buffer is full
    if (this.buffer.length >= this.batchSize) {
      this.flush()
    }
  }

  /**
   * Manually flush buffered data
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) {
      return
    }

    const batch = this.buffer.splice(0)

    try {
      // Send batch to API
      await this.client.sendTelemetry(this.robotId, {
        batch,
        count: batch.length,
        timestamp: new Date(),
      })

      console.log(`📤 Flushed ${batch.length} telemetry points for robot ${this.robotId}`)
    } catch (error) {
      console.error(`Failed to flush telemetry batch:`, error)
      // Put data back in buffer to retry
      this.buffer.unshift(...batch)
    }
  }

  /**
   * Add position data
   */
  addPosition(x: number, y: number, z: number, rx?: number, ry?: number, rz?: number): void {
    this.push({
      type: 'position',
      data: { x, y, z, rx, ry, rz },
    })
  }

  /**
   * Add joint angles
   */
  addJointAngles(angles: number[]): void {
    this.push({
      type: 'joint_angles',
      data: { angles, unit: 'radians' },
    })
  }

  /**
   * Add temperature data
   */
  addTemperature(temperature: number, component?: string): void {
    this.push({
      type: 'temperature',
      data: { temperature, component, unit: 'celsius' },
    })
  }

  /**
   * Add force/torque data
   */
  addForceTorque(fx: number, fy: number, fz: number, tx: number, ty: number, tz: number): void {
    this.push({
      type: 'force_torque',
      data: { force: { x: fx, y: fy, z: fz }, torque: { x: tx, y: ty, z: tz } },
    })
  }

  /**
   * Add status update
   */
  addStatus(status: string, details?: any): void {
    this.push({
      type: 'status',
      data: { status, details },
    })
  }

  /**
   * Add error event
   */
  addError(error: string, code?: string, severity?: string): void {
    this.push({
      type: 'error',
      data: { error, code, severity: severity || 'medium' },
    })
  }

  /**
   * Add custom data
   */
  addCustom(type: string, data: any): void {
    this.push({
      type: `custom_${type}`,
      data,
    })
  }

  /**
   * Get stream status
   */
  getStatus(): { streaming: boolean; bufferSize: number; robotId: string } {
    return {
      streaming: this.streaming,
      bufferSize: this.buffer.length,
      robotId: this.robotId,
    }
  }
}
