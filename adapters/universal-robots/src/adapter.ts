import {
  IRobotVendorAdapter,
  BaseVendorAdapter,
  RobotVendor,
  VendorConnectionConfig,
  VendorConnection,
  RobotCommand,
  RobotCommandType,
  CommandResult,
  RobotTelemetry,
  RobotInfo,
  EventCallback,
  EventSubscription,
  ValidationResult,
  VendorFeatures,
  ConnectionStatus,
  CoordinateFrame,
  AngleUnit,
  VelocityUnit,
  AngularVelocityUnit,
  ForceUnit,
  TorqueUnit,
  TemperatureUnit,
  VoltageUnit,
  CurrentUnit,
  TelemetrySource,
  DataQuality,
  type RobotStatus,
  type RobotCapability,
} from '@urfmp/types'

import { URDashboardClient } from './dashboard-client'
import { URRealTimeClient } from './realtime-client'
import { URConfig, URRobotState, URRobotMode, URSafetyMode } from './types'

export class UniversalRobotsAdapter extends BaseVendorAdapter implements IRobotVendorAdapter {
  vendor = RobotVendor.UNIVERSAL_ROBOTS

  private dashboardClient?: URDashboardClient
  private realTimeClient?: URRealTimeClient
  private connections = new Map<string, VendorConnection>()
  private eventSubscriptions = new Map<string, EventSubscription>()

  async connect(config: VendorConnectionConfig): Promise<VendorConnection> {
    const validation = this.validateConfig(config)
    if (!validation.valid) {
      throw new Error(
        `Invalid configuration: ${validation.errors.map((e) => e.message).join(', ')}`
      )
    }

    const urConfig: URConfig = {
      host: config.host,
      dashboardPort: config.options?.dashboardPort || 29999,
      realTimePort: config.options?.realTimePort || 30003,
      primaryPort: config.options?.primaryPort || 30001,
      secondaryPort: config.options?.secondaryPort || 30002,
      timeout: config.timeout || 5000,
      username: config.authentication?.credentials?.username,
      password: config.authentication?.credentials?.password,
    }

    // Create connection object
    const connection = this.createConnection(config)
    connection.status = ConnectionStatus.CONNECTING

    try {
      // Initialize Dashboard client for robot control
      this.dashboardClient = new URDashboardClient(urConfig)
      await this.dashboardClient.connect()

      // Initialize Real-time client for telemetry
      this.realTimeClient = new URRealTimeClient(urConfig)
      await this.realTimeClient.connect()

      // Get robot information
      const robotInfo = await this.dashboardClient.getRobotInfo()
      connection.robotId = robotInfo.serialNumber || `ur-${Date.now()}`
      connection.status = ConnectionStatus.CONNECTED
      connection.connectedAt = new Date()

      this.connections.set(connection.id, connection)

      console.log(`✅ Connected to Universal Robot at ${config.host}`)
      return connection
    } catch (error) {
      connection.status = ConnectionStatus.ERROR
      throw new Error(`Failed to connect to Universal Robot: ${(error as Error).message}`)
    }
  }

  async disconnect(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId)
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`)
    }

    try {
      if (this.dashboardClient) {
        await this.dashboardClient.disconnect()
        this.dashboardClient = undefined
      }

      if (this.realTimeClient) {
        await this.realTimeClient.disconnect()
        this.realTimeClient = undefined
      }

      connection.status = ConnectionStatus.DISCONNECTED
      this.connections.delete(connectionId)

      console.log(`✅ Disconnected from Universal Robot (${connectionId})`)
    } catch (error) {
      console.error(`Error disconnecting from Universal Robot: ${(error as Error).message}`)
      throw error
    }
  }

  async sendCommand(connectionId: string, command: RobotCommand): Promise<CommandResult> {
    const connection = this.connections.get(connectionId)
    if (!connection || !this.dashboardClient) {
      throw new Error(`Connection ${connectionId} not available`)
    }

    const startTime = Date.now()

    try {
      let result: any

      switch (command.type) {
        case RobotCommandType.START:
          result = await this.dashboardClient.play()
          break

        case RobotCommandType.STOP:
          result = await this.dashboardClient.stop()
          break

        case RobotCommandType.PAUSE:
          result = await this.dashboardClient.pause()
          break

        case RobotCommandType.RESUME:
          result = await this.dashboardClient.play()
          break

        case RobotCommandType.EMERGENCY_STOP:
          result = await this.dashboardClient.emergencyStop()
          break

        case RobotCommandType.RESET:
          result = await this.dashboardClient.unlockProtectiveStop()
          break

        case RobotCommandType.MOVE_TO_POSITION:
          if (!command.payload?.position) {
            throw new Error('Position is required for MOVE_TO_POSITION command')
          }
          result = await this.dashboardClient.moveToPosition(command.payload.position)
          break

        case RobotCommandType.RUN_PROGRAM:
          if (!command.payload?.programName) {
            throw new Error('Program name is required for RUN_PROGRAM command')
          }
          result = await this.dashboardClient.loadProgram(command.payload.programName)
          if (result.success) {
            result = await this.dashboardClient.play()
          }
          break

        case RobotCommandType.SET_SPEED:
          if (!command.payload?.speed) {
            throw new Error('Speed is required for SET_SPEED command')
          }
          result = await this.dashboardClient.setSpeed(command.payload.speed)
          break

        default:
          throw new Error(`Unsupported command type: ${command.type}`)
      }

      const executionTime = Date.now() - startTime

      return {
        success: result.success || true,
        commandId: command.id || `cmd-${Date.now()}`,
        result,
        executionTime,
        timestamp: new Date(),
      }
    } catch (error) {
      const executionTime = Date.now() - startTime

      return {
        success: false,
        commandId: command.id || `cmd-${Date.now()}`,
        error: (error as Error).message,
        executionTime,
        timestamp: new Date(),
      }
    }
  }

  async getTelemetry(connectionId: string): Promise<RobotTelemetry> {
    const connection = this.connections.get(connectionId)
    if (!connection || !this.realTimeClient) {
      throw new Error(`Connection ${connectionId} not available`)
    }

    try {
      const robotState = await this.realTimeClient.getRobotState()
      return this.convertToStandardTelemetry(connection.robotId, robotState)
    } catch (error) {
      throw new Error(`Failed to get telemetry: ${(error as Error).message}`)
    }
  }

  async getRobotInfo(connectionId: string): Promise<RobotInfo> {
    const connection = this.connections.get(connectionId)
    if (!connection || !this.dashboardClient) {
      throw new Error(`Connection ${connectionId} not available`)
    }

    try {
      const robotInfo = await this.dashboardClient.getRobotInfo()
      const safetyInfo = await this.dashboardClient.getSafetyInfo()

      return {
        model: robotInfo.model || 'Universal Robot',
        serialNumber: robotInfo.serialNumber || connection.robotId,
        firmwareVersion: robotInfo.firmwareVersion || 'Unknown',
        hardwareVersion: robotInfo.hardwareVersion,
        manufacturer: 'Universal Robots',
        capabilities: this.getCapabilities(robotInfo.model),
        specifications: this.getSpecifications(robotInfo.model),
        status: this.mapRobotStatus(
          Number(robotInfo.robotMode) || 0,
          Number(safetyInfo.safetyMode) || 0
        ),
        lastMaintenance: robotInfo.lastMaintenance,
        nextMaintenance: robotInfo.nextMaintenance,
      }
    } catch (error) {
      throw new Error(`Failed to get robot info: ${(error as Error).message}`)
    }
  }

  async subscribeToEvents(
    connectionId: string,
    callback: EventCallback
  ): Promise<EventSubscription> {
    const connection = this.connections.get(connectionId)
    if (!connection || !this.realTimeClient) {
      throw new Error(`Connection ${connectionId} not available`)
    }

    const subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const subscription: EventSubscription = {
      id: subscriptionId,
      userId: '',
      organizationId: '',
      name: `UR Events ${connectionId}`,
      filter: { types: [] },
      channels: [],
      enabled: true,
      connectionId,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Set up real-time data streaming
    this.realTimeClient.onData((robotState: URRobotState) => {
      if (subscription.active) {
        const events = this.extractEvents(connection.robotId, robotState)
        events.forEach((event) => callback(event))
      }
    })

    this.eventSubscriptions.set(subscriptionId, subscription)
    return subscription
  }

  async unsubscribeFromEvents(subscriptionId: string): Promise<void> {
    const subscription = this.eventSubscriptions.get(subscriptionId)
    if (subscription) {
      subscription.active = false
      this.eventSubscriptions.delete(subscriptionId)
    }
  }

  async validateConnection(config: VendorConnectionConfig): Promise<ValidationResult> {
    const baseValidation = this.validateConfig(config)
    if (!baseValidation.valid) {
      return baseValidation
    }

    // Additional Universal Robots specific validation
    const errors: any[] = []
    const warnings: any[] = []

    // Check if host is reachable (simplified check)
    if (!config.host.match(/^(\d{1,3}\.){3}\d{1,3}$/) && !config.host.includes('.')) {
      warnings.push({
        field: 'host',
        message: 'Host should be an IP address or FQDN',
        code: 'INVALID_HOST_FORMAT',
      })
    }

    // Check port ranges
    if (
      config.options?.dashboardPort &&
      (config.options.dashboardPort < 1024 || config.options.dashboardPort > 65535)
    ) {
      errors.push({
        field: 'dashboardPort',
        message: 'Dashboard port should be between 1024 and 65535',
        code: 'INVALID_PORT_RANGE',
      })
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: [...baseValidation.warnings, ...warnings],
    }
  }

  getSupportedFeatures(): VendorFeatures {
    return {
      supportsRealTimeControl: true,
      supportsFileTransfer: true,
      supportsRemoteAccess: true,
      supportsVideoStream: false,
      supportsForceControl: true,
      supportsCollisionDetection: true,
      supportsSafetyMonitoring: true,
      supportsPathPlanning: true,
      supportsCalibration: true,
      supportsOTA: true,
      customFeatures: [
        'dashboard_api',
        'real_time_interface',
        'primary_interface',
        'secondary_interface',
        'freedrive_mode',
        'protective_stop',
        'safety_configuration',
      ],
    }
  }

  // Helper methods

  private convertToStandardTelemetry(robotId: string, robotState: URRobotState): RobotTelemetry {
    return {
      id: `tel-${Date.now()}`,
      robotId,
      timestamp: new Date(robotState.timestamp * 1000),
      data: {
        position: {
          x: robotState.tool_vector_actual[0],
          y: robotState.tool_vector_actual[1],
          z: robotState.tool_vector_actual[2],
          rx: robotState.tool_vector_actual[3],
          ry: robotState.tool_vector_actual[4],
          rz: robotState.tool_vector_actual[5],
          frame: CoordinateFrame.BASE,
        },
        jointAngles: {
          joint1: robotState.q_actual[0],
          joint2: robotState.q_actual[1],
          joint3: robotState.q_actual[2],
          joint4: robotState.q_actual[3],
          joint5: robotState.q_actual[4],
          joint6: robotState.q_actual[5],
          unit: AngleUnit.RADIANS,
        },
        velocity: {
          linear: {
            x: robotState.tcp_speed_actual[0],
            y: robotState.tcp_speed_actual[1],
            z: robotState.tcp_speed_actual[2],
            magnitude: Math.sqrt(
              robotState.tcp_speed_actual[0] ** 2 +
                robotState.tcp_speed_actual[1] ** 2 +
                robotState.tcp_speed_actual[2] ** 2
            ),
            unit: VelocityUnit.METERS_PER_SECOND,
          },
          angular: {
            rx: robotState.tcp_speed_actual[3],
            ry: robotState.tcp_speed_actual[4],
            rz: robotState.tcp_speed_actual[5],
            unit: AngularVelocityUnit.RADIANS_PER_SECOND,
          },
          joint: {
            joint1: robotState.qd_actual[0],
            joint2: robotState.qd_actual[1],
            joint3: robotState.qd_actual[2],
            joint4: robotState.qd_actual[3],
            joint5: robotState.qd_actual[4],
            joint6: robotState.qd_actual[5],
            unit: AngularVelocityUnit.RADIANS_PER_SECOND,
          },
        },
        force: {
          x: robotState.tcp_force[0],
          y: robotState.tcp_force[1],
          z: robotState.tcp_force[2],
          magnitude: Math.sqrt(
            robotState.tcp_force[0] ** 2 +
              robotState.tcp_force[1] ** 2 +
              robotState.tcp_force[2] ** 2
          ),
          unit: ForceUnit.NEWTONS,
        },
        torque: {
          rx: robotState.tcp_force[3],
          ry: robotState.tcp_force[4],
          rz: robotState.tcp_force[5],
          magnitude: Math.sqrt(
            robotState.tcp_force[3] ** 2 +
              robotState.tcp_force[4] ** 2 +
              robotState.tcp_force[5] ** 2
          ),
          unit: TorqueUnit.NEWTON_METERS,
        },
        temperature: {
          motor: {
            joint1: robotState.motor_temperatures[0],
            joint2: robotState.motor_temperatures[1],
            joint3: robotState.motor_temperatures[2],
            joint4: robotState.motor_temperatures[3],
            joint5: robotState.motor_temperatures[4],
            joint6: robotState.motor_temperatures[5],
          },
          unit: TemperatureUnit.CELSIUS,
        },
        voltage: {
          supply: robotState.v_main,
          motor: {
            joint1: robotState.v_actual[0],
            joint2: robotState.v_actual[1],
            joint3: robotState.v_actual[2],
            joint4: robotState.v_actual[3],
            joint5: robotState.v_actual[4],
            joint6: robotState.v_actual[5],
          },
          unit: VoltageUnit.VOLTS,
        },
        current: {
          total: robotState.i_robot,
          motor: {
            joint1: robotState.i_actual[0],
            joint2: robotState.i_actual[1],
            joint3: robotState.i_actual[2],
            joint4: robotState.i_actual[3],
            joint5: robotState.i_actual[4],
            joint6: robotState.i_actual[5],
          },
          unit: CurrentUnit.AMPERES,
        },
        safety: {
          emergencyStop:
            robotState.safety_mode === URSafetyMode.SAFETY_MODE_ROBOT_EMERGENCY_STOP ||
            robotState.safety_mode === URSafetyMode.SAFETY_MODE_SYSTEM_EMERGENCY_STOP,
          protectiveStop: robotState.safety_mode === URSafetyMode.SAFETY_MODE_PROTECTIVE_STOP,
          reducedMode: robotState.safety_mode === URSafetyMode.SAFETY_MODE_REDUCED,
          safetyZoneViolation: robotState.safety_mode === URSafetyMode.SAFETY_MODE_VIOLATION,
        },
      },
      metadata: {
        source: TelemetrySource.ROBOT_CONTROLLER,
        quality: DataQuality.HIGH,
        samplingRate: 125, // UR robots typically sample at 125 Hz
      },
    }
  }

  private mapRobotStatus(robotMode: number, safetyMode: number): RobotStatus {
    // Emergency or safety stops
    if (
      safetyMode === URSafetyMode.SAFETY_MODE_ROBOT_EMERGENCY_STOP ||
      safetyMode === URSafetyMode.SAFETY_MODE_SYSTEM_EMERGENCY_STOP
    ) {
      return 'emergency_stop' as RobotStatus
    }

    if (
      safetyMode === URSafetyMode.SAFETY_MODE_PROTECTIVE_STOP ||
      safetyMode === URSafetyMode.SAFETY_MODE_VIOLATION ||
      safetyMode === URSafetyMode.SAFETY_MODE_FAULT
    ) {
      return 'error' as RobotStatus
    }

    // Robot mode mapping
    switch (robotMode) {
      case URRobotMode.ROBOT_MODE_RUNNING:
        return 'running' as RobotStatus
      case URRobotMode.ROBOT_MODE_IDLE:
        return 'idle' as RobotStatus
      case URRobotMode.ROBOT_MODE_POWER_OFF:
      case URRobotMode.ROBOT_MODE_DISCONNECTED:
        return 'offline' as RobotStatus
      case URRobotMode.ROBOT_MODE_POWER_ON:
      case URRobotMode.ROBOT_MODE_BOOTING:
        return 'idle' as RobotStatus
      default:
        return 'offline' as RobotStatus
    }
  }

  private getCapabilities(model?: string): RobotCapability[] {
    // All UR robots support these basic capabilities
    const baseCapabilities: RobotCapability[] = [
      'assembly' as RobotCapability,
      'material_handling' as RobotCapability,
      'machine_tending' as RobotCapability,
      'packaging' as RobotCapability,
      'inspection' as RobotCapability,
    ]

    // Add model-specific capabilities
    if (model?.includes('UR5') || model?.includes('UR10') || model?.includes('UR16')) {
      baseCapabilities.push('welding' as RobotCapability, 'painting' as RobotCapability)
    }

    return baseCapabilities
  }

  private getSpecifications(model?: string): any {
    const specs: any = {
      axes: 6,
      operatingTemperature: { min: 0, max: 50, unit: '°C' },
      power: { voltage: 100 - 240, frequency: 50 - 60, consumption: 300, phases: 1 },
      dimensions: { length: 1300, width: 1300, height: 1500 },
      weight: 28.9,
    }

    // Model-specific specifications
    switch (model) {
      case 'UR3':
      case 'UR3e':
        specs.payload = 3
        specs.reach = 500
        specs.repeatability = 0.1
        specs.maxSpeed = 1000
        specs.weight = 11.2
        break
      case 'UR5':
      case 'UR5e':
        specs.payload = 5
        specs.reach = 850
        specs.repeatability = 0.1
        specs.maxSpeed = 1000
        specs.weight = 20.6
        break
      case 'UR10':
      case 'UR10e':
        specs.payload = 10
        specs.reach = 1300
        specs.repeatability = 0.1
        specs.maxSpeed = 1000
        specs.weight = 28.9
        break
      case 'UR16e':
        specs.payload = 16
        specs.reach = 900
        specs.repeatability = 0.05
        specs.maxSpeed = 1000
        specs.weight = 33.5
        break
      case 'UR20':
        specs.payload = 20
        specs.reach = 1750
        specs.repeatability = 0.05
        specs.maxSpeed = 1000
        specs.weight = 64
        break
      default:
        specs.payload = 10
        specs.reach = 1300
        specs.repeatability = 0.1
        specs.maxSpeed = 1000
    }

    return specs
  }

  private extractEvents(_robotId: string, _robotState: URRobotState): any[] {
    const events: any[] = []

    // Add logic to detect events from robot state changes
    // This would typically compare with previous state

    return events
  }
}
