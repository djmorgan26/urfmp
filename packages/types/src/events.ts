export interface Event {
  id: string
  type: EventType
  source: EventSource
  robotId?: string
  organizationId: string
  userId?: string
  severity: EventSeverity
  title: string
  description: string
  data: Record<string, any>
  metadata: EventMetadata
  timestamp: Date
  acknowledgedAt?: Date
  acknowledgedBy?: string
  resolvedAt?: Date
  resolvedBy?: string
}

export enum EventType {
  // Robot events
  ROBOT_ONLINE = 'robot.online',
  ROBOT_OFFLINE = 'robot.offline',
  ROBOT_ERROR = 'robot.error',
  ROBOT_WARNING = 'robot.warning',
  ROBOT_EMERGENCY_STOP = 'robot.emergency_stop',
  ROBOT_PROGRAM_START = 'robot.program.start',
  ROBOT_PROGRAM_COMPLETE = 'robot.program.complete',
  ROBOT_PROGRAM_ERROR = 'robot.program.error',
  ROBOT_COLLISION = 'robot.collision',
  ROBOT_TOOL_CHANGE = 'robot.tool.change',
  ROBOT_CALIBRATION = 'robot.calibration',

  // Telemetry events
  TELEMETRY_THRESHOLD_EXCEEDED = 'telemetry.threshold.exceeded',
  TELEMETRY_ANOMALY = 'telemetry.anomaly',
  TELEMETRY_CONNECTION_LOST = 'telemetry.connection.lost',
  TELEMETRY_DATA_GAP = 'telemetry.data.gap',
  TELEMETRY_QUALITY_DEGRADED = 'telemetry.quality.degraded',

  // Maintenance events
  MAINTENANCE_DUE = 'maintenance.due',
  MAINTENANCE_OVERDUE = 'maintenance.overdue',
  MAINTENANCE_STARTED = 'maintenance.started',
  MAINTENANCE_COMPLETED = 'maintenance.completed',
  MAINTENANCE_CANCELLED = 'maintenance.cancelled',
  MAINTENANCE_PREDICTED = 'maintenance.predicted',

  // System events
  SYSTEM_STARTUP = 'system.startup',
  SYSTEM_SHUTDOWN = 'system.shutdown',
  SYSTEM_ERROR = 'system.error',
  SYSTEM_UPDATE = 'system.update',
  SYSTEM_BACKUP = 'system.backup',
  SYSTEM_RESTORE = 'system.restore',

  // Security events
  SECURITY_LOGIN_SUCCESS = 'security.login.success',
  SECURITY_LOGIN_FAILURE = 'security.login.failure',
  SECURITY_LOGOUT = 'security.logout',
  SECURITY_PASSWORD_CHANGE = 'security.password.change',
  SECURITY_MFA_ENABLED = 'security.mfa.enabled',
  SECURITY_MFA_DISABLED = 'security.mfa.disabled',
  SECURITY_API_KEY_CREATED = 'security.api_key.created',
  SECURITY_API_KEY_DELETED = 'security.api_key.deleted',
  SECURITY_UNAUTHORIZED_ACCESS = 'security.unauthorized.access',

  // Organization events
  ORGANIZATION_USER_INVITED = 'organization.user.invited',
  ORGANIZATION_USER_JOINED = 'organization.user.joined',
  ORGANIZATION_USER_LEFT = 'organization.user.left',
  ORGANIZATION_PLAN_CHANGED = 'organization.plan.changed',
  ORGANIZATION_SETTINGS_UPDATED = 'organization.settings.updated',
  ORGANIZATION_LIMIT_EXCEEDED = 'organization.limit.exceeded',

  // Integration events
  INTEGRATION_CONNECTED = 'integration.connected',
  INTEGRATION_DISCONNECTED = 'integration.disconnected',
  INTEGRATION_ERROR = 'integration.error',
  INTEGRATION_SYNC_COMPLETE = 'integration.sync.complete',

  // Custom events
  CUSTOM = 'custom',
}

export enum EventSource {
  ROBOT_CONTROLLER = 'robot_controller',
  API_SERVER = 'api_server',
  WEB_DASHBOARD = 'web_dashboard',
  MOBILE_APP = 'mobile_app',
  WEBHOOK = 'webhook',
  INTEGRATION = 'integration',
  SYSTEM = 'system',
  SCHEDULER = 'scheduler',
  MONITORING = 'monitoring',
  USER = 'user',
}

export enum EventSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info',
}

export interface EventMetadata {
  version: string
  correlationId?: string
  traceId?: string
  spanId?: string
  tags?: Record<string, string>
  additionalContext?: Record<string, any>
}

export interface EventRule {
  id: string
  organizationId: string
  name: string
  description?: string
  enabled: boolean
  conditions: EventCondition[]
  actions: EventAction[]
  cooldownPeriod?: number // seconds
  priority: number
  createdAt: Date
  updatedAt: Date
}

export interface EventCondition {
  field: string
  operator: ConditionOperator
  value: any
  logicalOperator?: LogicalOperator
}

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  GREATER_THAN_EQUAL = 'greater_than_equal',
  LESS_THAN = 'less_than',
  LESS_THAN_EQUAL = 'less_than_equal',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  IN = 'in',
  NOT_IN = 'not_in',
  EXISTS = 'exists',
  NOT_EXISTS = 'not_exists',
  REGEX = 'regex',
}

export enum LogicalOperator {
  AND = 'and',
  OR = 'or',
}

export interface EventAction {
  type: EventActionType
  configuration: Record<string, any>
  enabled: boolean
}

export enum EventActionType {
  SEND_EMAIL = 'send_email',
  SEND_SMS = 'send_sms',
  SEND_WEBHOOK = 'send_webhook',
  SEND_SLACK_MESSAGE = 'send_slack_message',
  SEND_TEAMS_MESSAGE = 'send_teams_message',
  CREATE_MAINTENANCE_TASK = 'create_maintenance_task',
  EXECUTE_ROBOT_COMMAND = 'execute_robot_command',
  TRIGGER_AUTOMATION = 'trigger_automation',
  LOG_TO_FILE = 'log_to_file',
  ESCALATE_ALERT = 'escalate_alert',
  CUSTOM_SCRIPT = 'custom_script',
}

export interface EventFilter {
  types?: EventType[]
  sources?: EventSource[]
  severities?: EventSeverity[]
  robotIds?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  acknowledged?: boolean
  resolved?: boolean
  tags?: Record<string, string>
}

export interface EventStatistics {
  total: number
  byType: Record<EventType, number>
  bySeverity: Record<EventSeverity, number>
  bySource: Record<EventSource, number>
  acknowledged: number
  resolved: number
  averageResolutionTime?: number // minutes
  topRobots: Array<{
    robotId: string
    count: number
  }>
}

export interface EventSubscription {
  id: string
  userId: string
  organizationId: string
  name: string
  filter: EventFilter
  channels: NotificationChannel[]
  enabled: boolean
  connectionId?: string
  active?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface NotificationChannel {
  type: NotificationChannelType
  configuration: Record<string, any>
  enabled: boolean
}

export enum NotificationChannelType {
  EMAIL = 'email',
  SMS = 'sms',
  WEBHOOK = 'webhook',
  SLACK = 'slack',
  TEAMS = 'teams',
  PUSH_NOTIFICATION = 'push_notification',
  IN_APP = 'in_app',
}

export interface EventAggregation {
  robotId?: string
  organizationId: string
  period: AggregationPeriod
  eventType: EventType
  count: number
  firstOccurrence: Date
  lastOccurrence: Date
  timestamp: Date
}

export enum AggregationPeriod {
  MINUTE = 'minute',
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export interface EventStream {
  id: string
  organizationId: string
  name: string
  filter: EventFilter
  destination: StreamDestination
  format: StreamFormat
  enabled: boolean
  lastProcessedAt?: Date
  errorCount: number
  createdAt: Date
  updatedAt: Date
}

export interface StreamDestination {
  type: StreamDestinationType
  configuration: Record<string, any>
}

export enum StreamDestinationType {
  KAFKA = 'kafka',
  KINESIS = 'kinesis',
  PUBSUB = 'pubsub',
  WEBHOOK = 'webhook',
  S3 = 's3',
  AZURE_BLOB = 'azure_blob',
  GCS = 'gcs',
}

export enum StreamFormat {
  JSON = 'json',
  AVRO = 'avro',
  PROTOBUF = 'protobuf',
  CSV = 'csv',
}
