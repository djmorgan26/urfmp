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
export declare enum ConnectionProtocol {
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
export declare enum AuthenticationType {
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
export declare enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
  TIMEOUT = 'timeout',
}
export interface ConnectionMetrics {
  uptime: number
  messagesReceived: number
  messagesSent: number
  bytesReceived: number
  bytesSent: number
  averageLatency: number
  errorCount: number
  lastErrorAt?: Date
}
export interface CommandResult {
  success: boolean
  commandId: string
  result?: any
  error?: string
  executionTime: number
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
  payload: number
  reach: number
  repeatability: number
  maxSpeed: number
  maxAcceleration: number
  workingRange: WorkingRange
  operatingTemperature: TemperatureRange
  power: PowerSpecifications
  dimensions: Dimensions
  weight: number
}
export interface WorkingRange {
  x: Range
  y: Range
  z: Range
  rx?: Range
  ry?: Range
  rz?: Range
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
  voltage: number
  frequency: number
  consumption: number
  phases: number
}
export interface Dimensions {
  length: number
  width: number
  height: number
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
export declare enum VendorEventType {
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
  supportsOTA: boolean
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
  configSchema: Record<string, any>
  features: VendorFeatures
}
export interface SupportedRobotModel {
  model: string
  series: string
  firmwareVersions: string[]
  notes?: string
}
export declare abstract class BaseVendorAdapter implements IRobotVendorAdapter {
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
  protected createConnection(config: VendorConnectionConfig): VendorConnection
  protected generateConnectionId(): string
  protected validateConfig(config: VendorConnectionConfig): ValidationResult
}
export interface VendorRegistry {
  register(adapter: IRobotVendorAdapter): void
  unregister(vendor: RobotVendor): void
  get(vendor: RobotVendor): IRobotVendorAdapter | undefined
  list(): IRobotVendorAdapter[]
  isSupported(vendor: RobotVendor): boolean
}
export declare class DefaultVendorRegistry implements VendorRegistry {
  private adapters
  register(adapter: IRobotVendorAdapter): void
  unregister(vendor: RobotVendor): void
  get(vendor: RobotVendor): IRobotVendorAdapter | undefined
  list(): IRobotVendorAdapter[]
  isSupported(vendor: RobotVendor): boolean
}
export { RobotVendor, RobotCapability, RobotStatus } from './robot'
export type { RobotCommand } from './robot'
export type { RobotTelemetry } from './telemetry'
export { TemperatureUnit } from './telemetry'
export type { EventSubscription } from './events'
//# sourceMappingURL=vendor.d.ts.map
