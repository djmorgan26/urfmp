// Robot types
export * from './robot'
export type {
  Robot,
  RobotCommand,
  RobotStatus,
  RobotCapability,
  RobotLocation,
  RobotConfiguration,
} from './robot'
export { CommandPriority, CommandStatus, RobotCommandType, RobotVendor } from './robot'

// Telemetry types
export type {
  TelemetryData,
  RobotTelemetry,
  TelemetryMetadata,
  TelemetryAggregation,
} from './telemetry'

export {
  AngleUnit,
  ForceUnit,
  TemperatureUnit,
  TorqueUnit,
  VelocityUnit,
  AngularVelocityUnit,
  VoltageUnit,
  CurrentUnit,
  CoordinateFrame,
  TelemetrySource,
  DataQuality,
  TimeWindow,
  AggregationType,
} from './telemetry'

// Organization types
export * from './organization'

// User types
export * from './user'

// Auth types
export * from './auth'

// API types
export type {
  ApiResponse,
  ApiError,
  HealthCheck,
  ServiceHealth,
  PaginationOptions,
  PaginationResult,
} from './api'

export { SortOrder, HealthStatus } from './api'
export type { ValidationError } from './api'

// WebSocket types
export * from './websocket'
export type { WebSocketMessage, WebSocketEvent, WebSocketConnection } from './websocket'
export { WebSocketMessageType, RobotEventType, ChannelType } from './websocket'

// Event types
export * from './events'

// Vendor types
export * from './vendor'
export type { CommandResult, IRobotVendorAdapter, VendorConnection } from './vendor'

// Maintenance types
export * from './maintenance'

// Brand configuration
export type { BrandConfig } from './config/brand'
export { defaultBrandConfig, getBrandConfig } from './config/brand'

// Simulation bridge types
export * from './simulation'
export type {
  SimulationBridgeConfig,
  ROSMessage,
  ROSBridgeConnection,
  SimulationRobotState,
  SimulationCommand,
  BridgeEvent,
  SimulationBridgeMetrics,
} from './simulation'
export { ROS_TOPIC_MAPPINGS, ROS_MESSAGE_TYPES } from './simulation'
