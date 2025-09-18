import * as net from 'net'
import { URConfig, URRobotState } from './types'

export class URRealTimeClient {
  private config: URConfig
  private socket?: net.Socket
  private connected = false
  private dataCallback?: (data: URRobotState) => void
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor(config: URConfig) {
    this.config = config
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new net.Socket()

      this.socket.connect(this.config.realTimePort || 30003, this.config.host, () => {
        this.connected = true
        this.reconnectAttempts = 0
        console.log(
          `Connected to UR Real-time Interface at ${this.config.host}:${this.config.realTimePort}`
        )
        this.startDataStream()
        resolve()
      })

      this.socket.on('error', (error) => {
        this.connected = false
        console.error(`Real-time connection error: ${error.message}`)
        this.attemptReconnection()
        reject(new Error(`Real-time connection failed: ${error.message}`))
      })

      this.socket.on('close', () => {
        this.connected = false
        console.log('Real-time connection closed')
        this.attemptReconnection()
      })

      this.socket.setTimeout(this.config.timeout || 5000, () => {
        this.socket?.destroy()
        reject(new Error('Real-time connection timeout'))
      })
    })
  }

  async disconnect(): Promise<void> {
    this.connected = false
    if (this.socket) {
      this.socket.destroy()
      this.socket = undefined
    }
  }

  onData(callback: (data: URRobotState) => void): void {
    this.dataCallback = callback
  }

  async getRobotState(): Promise<URRobotState> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.connected) {
        reject(new Error('Not connected to Real-time Interface'))
        return
      }

      let buffer = Buffer.alloc(0)
      const expectedLength = 1060 // UR real-time interface packet size

      const onData = (data: Buffer) => {
        buffer = Buffer.concat([buffer, data])

        if (buffer.length >= expectedLength) {
          this.socket?.removeListener('data', onData)
          try {
            const robotState = this.parseRobotState(buffer)
            resolve(robotState)
          } catch (error) {
            reject(new Error(`Failed to parse robot state: ${error.message}`))
          }
        }
      }

      this.socket.on('data', onData)

      setTimeout(() => {
        this.socket?.removeListener('data', onData)
        reject(new Error('Robot state request timeout'))
      }, this.config.timeout || 5000)
    })
  }

  private startDataStream(): void {
    if (!this.socket || !this.connected) {
      return
    }

    let buffer = Buffer.alloc(0)
    const expectedLength = 1060

    this.socket.on('data', (data: Buffer) => {
      buffer = Buffer.concat([buffer, data])

      while (buffer.length >= expectedLength) {
        try {
          const packetBuffer = buffer.slice(0, expectedLength)
          buffer = buffer.slice(expectedLength)

          const robotState = this.parseRobotState(packetBuffer)

          if (this.dataCallback) {
            this.dataCallback(robotState)
          }
        } catch (error) {
          console.error('Error parsing robot state:', error.message)
          break
        }
      }
    })
  }

  private parseRobotState(buffer: Buffer): URRobotState {
    // UR real-time interface sends binary data in a specific format
    // This is a simplified parser - in production, you'd want more robust parsing

    let offset = 0

    // Helper function to read double (8 bytes, big-endian)
    const readDouble = (): number => {
      const value = buffer.readDoubleBE(offset)
      offset += 8
      return value
    }

    // Helper function to read uint64 (8 bytes, big-endian)
    const readUInt64 = (): number => {
      const value = buffer.readBigUInt64BE(offset)
      offset += 8
      return Number(value)
    }

    // Helper function to read uint32 (4 bytes, big-endian)
    const readUInt32 = (): number => {
      const value = buffer.readUInt32BE(offset)
      offset += 4
      return value
    }

    try {
      const robotState: URRobotState = {
        timestamp: readUInt64(),
        q_target: [
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
        ],
        qd_target: [
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
        ],
        qdd_target: [
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
        ],
        i_target: [
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
        ],
        m_target: [
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
        ],
        q_actual: [
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
        ],
        qd_actual: [
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
        ],
        i_actual: [
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
        ],
        i_control: [
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
        ],
        tool_vector_actual: [
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
        ],
        tcp_speed_actual: [
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
        ],
        tcp_force: [
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
        ],
        tool_vector_target: [
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
        ],
        tcp_speed_target: [
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
        ],
        digital_input_bits: readUInt64(),
        motor_temperatures: [
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
        ],
        controller_timer: readDouble(),
        test_value: readDouble(),
        robot_mode: readDouble(),
        joint_modes: [
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
        ],
        safety_mode: readDouble(),
        safety_status: [
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
        ],
        tool_accelerometer_values: [readDouble(), readDouble(), readDouble()],
        speed_scaling: readDouble(),
        linear_momentum_norm: readDouble(),
        v_main: readDouble(),
        v_robot: readDouble(),
        i_robot: readDouble(),
        v_actual: [
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
          readDouble(),
        ],
        digital_outputs: readUInt64(),
        program_state: readDouble(),
        elbow_position: [readDouble(), readDouble(), readDouble()],
        elbow_velocity: [readDouble(), readDouble(), readDouble()],
      }

      return robotState
    } catch (error) {
      throw new Error(`Failed to parse robot state buffer: ${error.message}`)
    }
  }

  private async attemptReconnection(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000) // Exponential backoff, max 30s

    console.log(
      `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    )

    setTimeout(async () => {
      try {
        await this.connect()
        console.log('Real-time interface reconnected successfully')
      } catch (error) {
        console.error('Reconnection failed:', error.message)
      }
    }, delay)
  }

  isConnected(): boolean {
    return this.connected
  }

  getConnectionInfo(): {
    connected: boolean
    reconnectAttempts: number
    maxReconnectAttempts: number
  } {
    return {
      connected: this.connected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
    }
  }
}
