import { RobotVendor, RobotCommand, RobotStatus, RobotCapability } from './robot'
import { RobotTelemetry, TemperatureUnit } from './telemetry'
import { EventSubscription } from './events'

export interface IRobotVendorAdapter {
  vendor: RobotVendor
  connect(config: VendorConnectionConfig): Promise<VendorConnection>
  disconnect(connectionId: string): Promise<void>
  sendCommand(connectionId: string, command: RobotCommand): Promise<CommandResult>
  getTelemetry(connectionId: string): Promise<RobotTelemetry>
  getRobotInfo(connectionId: string): Promise<RobotInfo>
  subscribeToEvents(connectionId: string, callback: EventCallback): Promise<EventSubscription>
  unsubscribeFromEvents(subscriptionId: string): Promise<void>
  validateConnection(config: VendorConnectionConfig): Promise<ValidationResult>
  getSupportedFeatures(): VendorFeatures
}

export interface VendorConnectionConfig {
  host: string
  port: number
  protocol: ConnectionProtocol
  authentication?: VendorAuthentication
  options?: Record<string, any>
  timeout?: number
  retryAttempts?: number
  keepAlive?: boolean
}

export enum ConnectionProtocol {
  TCP = 'tcp',
  UDP = 'udp',
  HTTP = 'http',
  HTTPS = 'https',
  WEBSOCKET = 'websocket',
  MODBUS = 'modbus',
  PROFINET = 'profinet',
  ETHERNET_IP = 'ethernet_ip',
  OPC_UA = 'opc_ua',
  CUSTOM = 'custom',
}

export interface VendorAuthentication {
  type: AuthenticationType
  credentials: Record<string, any>
}

export enum AuthenticationType {
  NONE = 'none',
  BASIC = 'basic',
  DIGEST = 'digest',
  OAUTH2 = 'oauth2',
  API_KEY = 'api_key',
  CERTIFICATE = 'certificate',
  CUSTOM = 'custom',
}

export interface VendorConnection {
  id: string
  vendor: RobotVendor
  robotId: string
  status: ConnectionStatus
  config: VendorConnectionConfig
  connectedAt: Date
  lastHeartbeat?: Date
  metrics: ConnectionMetrics
}

export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
  TIMEOUT = 'timeout',
}

export interface ConnectionMetrics {
  uptime: number // seconds
  messagesReceived: number
  messagesSent: number
  bytesReceived: number
  bytesSent: number
  averageLatency: number // milliseconds
  errorCount: number
  lastErrorAt?: Date
}

export interface CommandResult {
  success: boolean
  commandId: string
  result?: any
  error?: string
  executionTime: number // milliseconds
  timestamp: Date
}

export interface RobotInfo {
  model: string
  serialNumber: string
  firmwareVersion: string
  hardwareVersion?: string
  manufacturer: string
  capabilities: RobotCapability[]
  specifications: RobotSpecifications
  status: RobotStatus
  lastMaintenance?: Date
  nextMaintenance?: Date
}

export interface RobotSpecifications {
  axes: number
  payload: number // kg
  reach: number // mm
  repeatability: number // mm
  maxSpeed: number // mm/s
  maxAcceleration: number // mm/s²
  workingRange: WorkingRange
  operatingTemperature: TemperatureRange
  power: PowerSpecifications
  dimensions: Dimensions
  weight: number // kg
}

export interface WorkingRange {
  x: Range
  y: Range
  z: Range
  rx?: Range // rotation around x-axis
  ry?: Range // rotation around y-axis
  rz?: Range // rotation around z-axis
}

export interface Range {
  min: number
  max: number
  unit: string
}

export interface TemperatureRange {
  min: number
  max: number
  unit: TemperatureUnit
}

export interface PowerSpecifications {
  voltage: number // V
  frequency: number // Hz
  consumption: number // W
  phases: number
}

export interface Dimensions {
  length: number // mm
  width: number // mm
  height: number // mm
}

export type EventCallback = (event: VendorEvent) => void

export interface VendorEvent {
  id: string
  type: VendorEventType
  robotId: string
  data: any
  timestamp: Date
  source: string
}

export enum VendorEventType {
  STATUS_CHANGED = 'status_changed',
  POSITION_CHANGED = 'position_changed',
  PROGRAM_STARTED = 'program_started',
  PROGRAM_STOPPED = 'program_stopped',
  PROGRAM_PAUSED = 'program_paused',
  PROGRAM_RESUMED = 'program_resumed',
  ERROR_OCCURRED = 'error_occurred',
  WARNING_ISSUED = 'warning_issued',
  EMERGENCY_STOP = 'emergency_stop',
  SAFETY_VIOLATION = 'safety_violation',
  TOOL_CHANGED = 'tool_changed',
  SPEED_CHANGED = 'speed_changed',
  MODE_CHANGED = 'mode_changed',
  CALIBRATION_REQUIRED = 'calibration_required',
  MAINTENANCE_DUE = 'maintenance_due',
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationWarning {
  field: string
  message: string
  code: string
}

export interface VendorFeatures {
  supportsRealTimeControl: boolean
  supportsFileTransfer: boolean
  supportsRemoteAccess: boolean
  supportsVideoStream: boolean
  supportsForceControl: boolean
  supportsCollisionDetection: boolean
  supportsSafetyMonitoring: boolean
  supportsPathPlanning: boolean
  supportsCalibration: boolean
  supportsOTA: boolean // Over-the-air updates
  customFeatures: string[]
}

export interface VendorAdapterConfig {
  name: string
  version: string
  description: string
  author: string
  homepage?: string
  repository?: string
  license: string
  supportedRobots: SupportedRobotModel[]
  defaultConfig: VendorConnectionConfig
  configSchema: Record<string, any> // JSON Schema
  features: VendorFeatures
}

export interface SupportedRobotModel {
  model: string
  series: string
  firmwareVersions: string[]
  notes?: string
}

export abstract class BaseVendorAdapter implements IRobotVendorAdapter {
  abstract vendor: RobotVendor
  abstract connect(config: VendorConnectionConfig): Promise<VendorConnection>
  abstract disconnect(connectionId: string): Promise<void>
  abstract sendCommand(connectionId: string, command: RobotCommand): Promise<CommandResult>
  abstract getTelemetry(connectionId: string): Promise<RobotTelemetry>
  abstract getRobotInfo(connectionId: string): Promise<RobotInfo>
  abstract subscribeToEvents(
    connectionId: string,
    callback: EventCallback
  ): Promise<EventSubscription>
  abstract unsubscribeFromEvents(subscriptionId: string): Promise<void>
  abstract validateConnection(config: VendorConnectionConfig): Promise<ValidationResult>
  abstract getSupportedFeatures(): VendorFeatures

  protected createConnection(config: VendorConnectionConfig): VendorConnection {
    return {
      id: this.generateConnectionId(),
      vendor: this.vendor,
      robotId: '', // Will be set after connection
      status: ConnectionStatus.CONNECTING,
      config,
      connectedAt: new Date(),
      metrics: {
        uptime: 0,
        messagesReceived: 0,
        messagesSent: 0,
        bytesReceived: 0,
        bytesSent: 0,
        averageLatency: 0,
        errorCount: 0,
      },
    }
  }

  protected generateConnectionId(): string {
    return `${this.vendor}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  protected validateConfig(config: VendorConnectionConfig): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (!config.host) {
      errors.push({
        field: 'host',
        message: 'Host is required',
        code: 'REQUIRED_FIELD',
      })
    }

    if (!config.port || config.port < 1 || config.port > 65535) {
      errors.push({
        field: 'port',
        message: 'Port must be between 1 and 65535',
        code: 'INVALID_PORT',
      })
    }

    if (config.timeout && config.timeout < 1000) {
      warnings.push({
        field: 'timeout',
        message: 'Timeout less than 1 second may cause connection issues',
        code: 'LOW_TIMEOUT',
      })
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }
}

export interface VendorRegistry {
  register(adapter: IRobotVendorAdapter): void
  unregister(vendor: RobotVendor): void
  get(vendor: RobotVendor): IRobotVendorAdapter | undefined
  list(): IRobotVendorAdapter[]
  isSupported(vendor: RobotVendor): boolean
}

export class DefaultVendorRegistry implements VendorRegistry {
  private adapters = new Map<RobotVendor, IRobotVendorAdapter>()

  register(adapter: IRobotVendorAdapter): void {
    this.adapters.set(adapter.vendor, adapter)
  }

  unregister(vendor: RobotVendor): void {
    this.adapters.delete(vendor)
  }

  get(vendor: RobotVendor): IRobotVendorAdapter | undefined {
    return this.adapters.get(vendor)
  }

  list(): IRobotVendorAdapter[] {
    return Array.from(this.adapters.values())
  }

  isSupported(vendor: RobotVendor): boolean {
    return this.adapters.has(vendor)
  }
}

// Re-export types for convenience
export { RobotVendor, RobotCapability, RobotStatus } from './robot'
export type { RobotCommand } from './robot'
export type { RobotTelemetry } from './telemetry'
export { TemperatureUnit } from './telemetry'
export type { EventSubscription } from './events'
