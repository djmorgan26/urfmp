export interface User {
  id: string
  organizationId: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  permissions: Permission[]
  preferences: UserPreferences
  profile: UserProfile
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator',
  VIEWER = 'viewer',
  TECHNICIAN = 'technician',
  CUSTOM = 'custom',
}

export enum Permission {
  // Robot management
  ROBOT_VIEW = 'robot.view',
  ROBOT_CREATE = 'robot.create',
  ROBOT_UPDATE = 'robot.update',
  ROBOT_DELETE = 'robot.delete',
  ROBOT_CONTROL = 'robot.control',

  // Telemetry and data
  TELEMETRY_VIEW = 'telemetry.view',
  TELEMETRY_WRITE = 'telemetry.write',
  TELEMETRY_EXPORT = 'telemetry.export',
  ANALYTICS_VIEW = 'analytics.view',
  ANALYTICS_CREATE = 'analytics.create',

  // Organization management
  ORG_VIEW = 'org.view',
  ORG_UPDATE = 'org.update',
  ORG_BILLING = 'org.billing',

  // User management
  USER_VIEW = 'user.view',
  USER_CREATE = 'user.create',
  USER_UPDATE = 'user.update',
  USER_DELETE = 'user.delete',
  USER_INVITE = 'user.invite',

  // API and integrations
  API_KEY_VIEW = 'api_key.view',
  API_KEY_CREATE = 'api_key.create',
  API_KEY_DELETE = 'api_key.delete',
  WEBHOOK_MANAGE = 'webhook.manage',
  INTEGRATION_MANAGE = 'integration.manage',

  // Maintenance
  MAINTENANCE_VIEW = 'maintenance.view',
  MAINTENANCE_CREATE = 'maintenance.create',
  MAINTENANCE_UPDATE = 'maintenance.update',
  MAINTENANCE_DELETE = 'maintenance.delete',

  // Alerts and notifications
  ALERT_VIEW = 'alert.view',
  ALERT_CREATE = 'alert.create',
  ALERT_UPDATE = 'alert.update',
  ALERT_DELETE = 'alert.delete',

  // Settings
  SETTINGS_VIEW = 'settings.view',
  SETTINGS_UPDATE = 'settings.update',

  // Audit and logs
  AUDIT_VIEW = 'audit.view',
  LOGS_VIEW = 'logs.view',
}

export interface UserPreferences {
  theme: Theme
  language: string
  timezone: string
  dateFormat: string
  timeFormat: TimeFormat
  dashboardLayout: DashboardLayout
  notifications: UserNotificationPreferences
  units: UnitPreferences
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto',
}

export enum TimeFormat {
  TWELVE_HOUR = '12h',
  TWENTY_FOUR_HOUR = '24h',
}

export interface DashboardLayout {
  defaultView: DashboardView
  widgets: WidgetConfiguration[]
  autoRefresh: boolean
  refreshInterval: number // seconds
}

export enum DashboardView {
  FLEET_OVERVIEW = 'fleet_overview',
  ROBOT_DETAIL = 'robot_detail',
  ANALYTICS = 'analytics',
  MAINTENANCE = 'maintenance',
  ALERTS = 'alerts',
}

export interface WidgetConfiguration {
  id: string
  type: WidgetType
  position: WidgetPosition
  size: WidgetSize
  configuration: Record<string, any>
}

export enum WidgetType {
  ROBOT_STATUS = 'robot_status',
  TELEMETRY_CHART = 'telemetry_chart',
  ALERT_LIST = 'alert_list',
  MAINTENANCE_SCHEDULE = 'maintenance_schedule',
  PERFORMANCE_METRICS = 'performance_metrics',
  CUSTOM = 'custom',
}

export interface WidgetPosition {
  x: number
  y: number
}

export interface WidgetSize {
  width: number
  height: number
}

export interface UserNotificationPreferences {
  email: EmailPreferences
  push: PushNotificationPreferences
  inApp: InAppNotificationPreferences
}

export interface EmailPreferences {
  enabled: boolean
  frequency: NotificationFrequency
  types: EmailNotificationType[]
}

export enum NotificationFrequency {
  IMMEDIATE = 'immediate',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  NEVER = 'never',
}

export enum EmailNotificationType {
  ROBOT_ALERTS = 'robot_alerts',
  MAINTENANCE_REMINDERS = 'maintenance_reminders',
  SYSTEM_UPDATES = 'system_updates',
  WEEKLY_REPORTS = 'weekly_reports',
  MONTHLY_REPORTS = 'monthly_reports',
}

export interface PushNotificationPreferences {
  enabled: boolean
  types: PushNotificationType[]
}

export enum PushNotificationType {
  CRITICAL_ALERTS = 'critical_alerts',
  ROBOT_OFFLINE = 'robot_offline',
  MAINTENANCE_DUE = 'maintenance_due',
  SYSTEM_UPDATES = 'system_updates',
}

export interface InAppNotificationPreferences {
  enabled: boolean
  playSound: boolean
  showBadges: boolean
  types: InAppNotificationType[]
}

export enum InAppNotificationType {
  ALL_ALERTS = 'all_alerts',
  ROBOT_STATUS = 'robot_status',
  MAINTENANCE = 'maintenance',
  SYSTEM = 'system',
}

export interface UnitPreferences {
  distance: DistanceUnit
  velocity: VelocityUnit
  force: ForceUnit
  torque: TorqueUnit
  temperature: TemperatureUnit
  pressure: PressureUnit
  angle: AngleUnit
}

export enum DistanceUnit {
  MILLIMETERS = 'mm',
  CENTIMETERS = 'cm',
  METERS = 'm',
  INCHES = 'in',
  FEET = 'ft',
}

export enum VelocityUnit {
  METERS_PER_SECOND = 'm/s',
  MILLIMETERS_PER_SECOND = 'mm/s',
  INCHES_PER_SECOND = 'in/s',
  FEET_PER_MINUTE = 'ft/min',
}

export enum ForceUnit {
  NEWTONS = 'N',
  POUNDS = 'lbf',
  KILOGRAMS_FORCE = 'kgf',
}

export enum TorqueUnit {
  NEWTON_METERS = 'Nm',
  FOOT_POUNDS = 'ft·lbf',
  KILOGRAM_METERS = 'kg·m',
}

export enum TemperatureUnit {
  CELSIUS = '°C',
  FAHRENHEIT = '°F',
  KELVIN = 'K',
}

export enum PressureUnit {
  PASCAL = 'Pa',
  BAR = 'bar',
  PSI = 'psi',
  ATMOSPHERE = 'atm',
}

export enum AngleUnit {
  RADIANS = 'rad',
  DEGREES = 'deg',
}

export interface UserProfile {
  avatar?: string
  phoneNumber?: string
  jobTitle?: string
  department?: string
  location?: string
  bio?: string
  linkedinUrl?: string
  twitterUrl?: string
}

export interface UserInvitation {
  id: string
  organizationId: string
  email: string
  role: UserRole
  permissions: Permission[]
  invitedBy: string
  status: InvitationStatus
  token: string
  expiresAt: Date
  createdAt: Date
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export interface UserSession {
  id: string
  userId: string
  deviceId?: string
  userAgent?: string
  ipAddress?: string
  location?: string
  isActive: boolean
  lastActivityAt: Date
  expiresAt: Date
  createdAt: Date
}
