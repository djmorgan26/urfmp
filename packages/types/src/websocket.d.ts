export interface WebSocketMessage {
  id: string
  type: WebSocketMessageType
  event: string
  data: any
  timestamp: Date
  userId?: string
  organizationId?: string
}
export declare enum WebSocketMessageType {
  EVENT = 'event',
  COMMAND = 'command',
  RESPONSE = 'response',
  ERROR = 'error',
  HEARTBEAT = 'heartbeat',
  SUBSCRIPTION = 'subscription',
  UNSUBSCRIPTION = 'unsubscription',
}
export interface WebSocketEvent {
  robot?: WebSocketRobotEvent
  telemetry?: WebSocketTelemetryEvent
  maintenance?: WebSocketMaintenanceEvent
  alert?: WebSocketAlertEvent
  organization?: WebSocketOrganizationEvent
  user?: WebSocketUserEvent
}
export interface WebSocketRobotEvent {
  robotId: string
  event: RobotEventType
  data: any
  timestamp: Date
}
export declare enum RobotEventType {
  STATUS_CHANGED = 'status_changed',
  COMMAND_RECEIVED = 'command_received',
  COMMAND_COMPLETED = 'command_completed',
  COMMAND_FAILED = 'command_failed',
  ERROR_OCCURRED = 'error_occurred',
  EMERGENCY_STOP = 'emergency_stop',
  MAINTENANCE_REQUIRED = 'maintenance_required',
  PROGRAM_STARTED = 'program_started',
  PROGRAM_COMPLETED = 'program_completed',
  PROGRAM_PAUSED = 'program_paused',
  POSITION_CHANGED = 'position_changed',
  TOOL_CHANGED = 'tool_changed',
}
export interface WebSocketTelemetryEvent {
  robotId: string
  event: TelemetryEventType
  data: any
  timestamp: Date
}
export declare enum TelemetryEventType {
  DATA_RECEIVED = 'data_received',
  THRESHOLD_EXCEEDED = 'threshold_exceeded',
  ANOMALY_DETECTED = 'anomaly_detected',
  CONNECTION_LOST = 'connection_lost',
  CONNECTION_RESTORED = 'connection_restored',
  QUALITY_DEGRADED = 'quality_degraded',
}
export interface WebSocketMaintenanceEvent {
  robotId?: string
  maintenanceId: string
  event: MaintenanceEventType
  data: any
  timestamp: Date
}
export declare enum MaintenanceEventType {
  SCHEDULED = 'scheduled',
  STARTED = 'started',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
  REMINDER = 'reminder',
}
export interface WebSocketAlertEvent {
  alertId: string
  robotId?: string
  event: AlertEventType
  data: any
  timestamp: Date
}
export declare enum AlertEventType {
  TRIGGERED = 'triggered',
  RESOLVED = 'resolved',
  ACKNOWLEDGED = 'acknowledged',
  ESCALATED = 'escalated',
  SNOOZED = 'snoozed',
}
export interface WebSocketOrganizationEvent {
  organizationId: string
  event: OrganizationEventType
  data: any
  timestamp: Date
}
export declare enum OrganizationEventType {
  SETTINGS_UPDATED = 'settings_updated',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  PLAN_CHANGED = 'plan_changed',
  LIMIT_EXCEEDED = 'limit_exceeded',
}
export interface WebSocketUserEvent {
  userId: string
  event: UserEventType
  data: any
  timestamp: Date
}
export declare enum UserEventType {
  PROFILE_UPDATED = 'profile_updated',
  PREFERENCES_UPDATED = 'preferences_updated',
  PASSWORD_CHANGED = 'password_changed',
  MFA_ENABLED = 'mfa_enabled',
  MFA_DISABLED = 'mfa_disabled',
}
export interface WebSocketSubscription {
  id: string
  userId: string
  organizationId: string
  channels: SubscriptionChannel[]
  filters?: SubscriptionFilter[]
  createdAt: Date
}
export interface SubscriptionChannel {
  type: ChannelType
  robotId?: string
  events?: string[]
}
export declare enum ChannelType {
  ROBOT = 'robot',
  TELEMETRY = 'telemetry',
  MAINTENANCE = 'maintenance',
  ALERTS = 'alerts',
  ORGANIZATION = 'organization',
  USER = 'user',
  GLOBAL = 'global',
}
export interface SubscriptionFilter {
  field: string
  operator: FilterOperator
  value: any
}
export declare enum FilterOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'ne',
  GREATER_THAN = 'gt',
  GREATER_THAN_EQUAL = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_EQUAL = 'lte',
  IN = 'in',
  NOT_IN = 'nin',
  CONTAINS = 'contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
}
export interface WebSocketConnection {
  id: string
  userId: string
  organizationId: string
  socketId: string
  ipAddress: string
  userAgent?: string
  connectedAt: Date
  lastPingAt: Date
  subscriptions: string[]
}
export interface WebSocketMetrics {
  totalConnections: number
  activeConnections: number
  messagesPerSecond: number
  averageLatency: number
  connectionsByOrganization: Record<string, number>
  popularChannels: ChannelMetric[]
}
export interface ChannelMetric {
  channel: string
  subscribers: number
  messagesPerSecond: number
}
export interface RealTimeUpdate {
  type: UpdateType
  resourceType: ResourceType
  resourceId: string
  operation: OperationType
  data: any
  previousData?: any
  timestamp: Date
  userId?: string
}
export declare enum UpdateType {
  DATA_CHANGE = 'data_change',
  STATUS_CHANGE = 'status_change',
  CONFIGURATION_CHANGE = 'configuration_change',
  SYSTEM_EVENT = 'system_event',
}
export declare enum ResourceType {
  ROBOT = 'robot',
  TELEMETRY = 'telemetry',
  MAINTENANCE = 'maintenance',
  ALERT = 'alert',
  USER = 'user',
  ORGANIZATION = 'organization',
}
export declare enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  PATCH = 'patch',
}
//# sourceMappingURL=websocket.d.ts.map
