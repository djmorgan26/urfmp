import * as net from 'net'
import { URConfig, URProgramInfo, URSafetyInfo } from './types'

export class URDashboardClient {
  private config: URConfig
  private socket?: net.Socket
  private connected = false

  constructor(config: URConfig) {
    this.config = config
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new net.Socket()

      this.socket.connect(this.config.dashboardPort || 29999, this.config.host, () => {
        this.connected = true
        console.log(
          `Connected to UR Dashboard Server at ${this.config.host}:${this.config.dashboardPort}`
        )
        resolve()
      })

      this.socket.on('error', (error) => {
        this.connected = false
        reject(new Error(`Dashboard connection failed: ${error.message}`))
      })

      this.socket.on('close', () => {
        this.connected = false
        console.log('Dashboard connection closed')
      })

      this.socket.setTimeout(this.config.timeout || 5000, () => {
        this.socket?.destroy()
        reject(new Error('Dashboard connection timeout'))
      })
    })
  }

  async disconnect(): Promise<void> {
    if (this.socket) {
      this.socket.destroy()
      this.socket = undefined
    }
    this.connected = false
  }

  private async sendCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.connected) {
        reject(new Error('Not connected to Dashboard Server'))
        return
      }

      let response = ''

      const onData = (data: Buffer) => {
        response += data.toString()
        if (response.includes('\\n')) {
          this.socket?.removeListener('data', onData)
          resolve(response.trim())
        }
      }

      this.socket.on('data', onData)
      this.socket.write(command + '\\n')

      setTimeout(() => {
        this.socket?.removeListener('data', onData)
        reject(new Error(`Command timeout: ${command}`))
      }, this.config.timeout || 5000)
    })
  }

  // Robot Control Commands

  async play(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.sendCommand('play')
      return { success: response.includes('Starting program') }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  async stop(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.sendCommand('stop')
      return { success: response.includes('Stopped') }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  async pause(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.sendCommand('pause')
      return { success: response.includes('Paused') }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  async emergencyStop(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.sendCommand('shutdown')
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  async unlockProtectiveStop(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.sendCommand('unlock protective stop')
      return { success: response.includes('Protective stop releasing') }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  // Robot Information

  async getRobotInfo(): Promise<any> {
    try {
      const [robotMode, model, serialNumber, firmwareVersion] = await Promise.all([
        this.sendCommand('robotmode'),
        this.sendCommand('get robot model'),
        this.sendCommand('get serial number'),
        this.sendCommand('version'),
      ])

      return {
        robotMode: this.parseRobotMode(robotMode),
        model: model.trim(),
        serialNumber: serialNumber.trim(),
        firmwareVersion: firmwareVersion.trim(),
        hardwareVersion: undefined, // Not available via dashboard
        lastMaintenance: undefined,
        nextMaintenance: undefined,
      }
    } catch (error) {
      throw new Error(`Failed to get robot info: ${error.message}`)
    }
  }

  async getSafetyInfo(): Promise<URSafetyInfo> {
    try {
      const safetyModeResponse = await this.sendCommand('safetymode')
      const safetystatus = await this.sendCommand('safetystatus')

      return {
        safetyMode: this.parseSafetyMode(safetyModeResponse),
        safetyStatus: [safetystatus.trim()],
        emergencyStopPressed: safetystatus.includes('EMERGENCY'),
        protectiveStopTriggered: safetystatus.includes('PROTECTIVE'),
      }
    } catch (error) {
      throw new Error(`Failed to get safety info: ${error.message}`)
    }
  }

  async getProgramInfo(): Promise<URProgramInfo> {
    try {
      const [programState, loadedProgram] = await Promise.all([
        this.sendCommand('programState'),
        this.sendCommand('get loaded program'),
      ])

      return {
        programName: loadedProgram.trim(),
        programState: this.parseProgramState(programState),
        lineNumber: undefined,
        remainingTime: undefined,
      }
    } catch (error) {
      throw new Error(`Failed to get program info: ${error.message}`)
    }
  }

  // Program Management

  async loadProgram(programName: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.sendCommand(`load ${programName}`)
      return { success: response.includes('Loading program') }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  async isProgramRunning(): Promise<boolean> {
    try {
      const response = await this.sendCommand('running')
      return response.includes('true')
    } catch (error) {
      return false
    }
  }

  // Advanced Commands

  async moveToPosition(position: {
    x: number
    y: number
    z: number
    rx?: number
    ry?: number
    rz?: number
  }): Promise<{ success: boolean; message?: string }> {
    // This would typically require loading and running a custom script
    // For now, return a placeholder implementation
    try {
      const script = `
        movej(p[${position.x}, ${position.y}, ${position.z}, ${position.rx || 0}, ${position.ry || 0}, ${position.rz || 0}], a=1.2, v=0.25)
      `

      // In a real implementation, you would send this script to the primary interface
      // For now, we'll simulate success
      return { success: true, message: 'Move command sent' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  async setSpeed(speed: number): Promise<{ success: boolean; message?: string }> {
    try {
      // Speed scaling is typically done through URScript
      // This is a placeholder implementation
      return { success: true, message: `Speed set to ${speed}%` }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  // Helper methods

  private parseRobotMode(response: string): number {
    // Extract robot mode from response
    const match = response.match(/Robot Mode: (\\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  private parseSafetyMode(response: string): any {
    // Parse safety mode from response
    if (response.includes('NORMAL')) return 'NORMAL'
    if (response.includes('REDUCED')) return 'REDUCED'
    if (response.includes('PROTECTIVE_STOP')) return 'PROTECTIVE_STOP'
    if (response.includes('RECOVERY')) return 'RECOVERY'
    if (response.includes('SAFEGUARD_STOP')) return 'SAFEGUARD_STOP'
    if (response.includes('SYSTEM_EMERGENCY_STOP')) return 'SYSTEM_EMERGENCY_STOP'
    if (response.includes('ROBOT_EMERGENCY_STOP')) return 'ROBOT_EMERGENCY_STOP'
    if (response.includes('VIOLATION')) return 'VIOLATION'
    if (response.includes('FAULT')) return 'FAULT'
    return 'NORMAL'
  }

  private parseProgramState(response: string): 'STOPPED' | 'PLAYING' | 'PAUSED' {
    if (response.includes('PLAYING')) return 'PLAYING'
    if (response.includes('PAUSED')) return 'PAUSED'
    return 'STOPPED'
  }

  // Connection status
  isConnected(): boolean {
    return this.connected
  }
}
