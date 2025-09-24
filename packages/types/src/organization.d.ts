export interface Organization {
  id: string
  name: string
  slug: string
  plan: SubscriptionPlan
  settings: OrganizationSettings
  limits: OrganizationLimits
  billing: BillingInfo
  createdAt: Date
  updatedAt: Date
}
export declare enum SubscriptionPlan {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  CUSTOM = 'custom',
}
export interface OrganizationSettings {
  timezone: string
  currency: string
  language: string
  dateFormat: string
  telemetryRetention: TelemetryRetention
  notifications: NotificationSettings
  security: SecuritySettings
  integrations: IntegrationSettings
}
export interface TelemetryRetention {
  raw: string
  aggregated: string
  events: string
}
export interface NotificationSettings {
  email: EmailNotificationSettings
  webhook: WebhookSettings
  slack: SlackSettings
  teams: TeamsSettings
}
export interface EmailNotificationSettings {
  enabled: boolean
  alertEmails: string[]
  reportEmails: string[]
  maintenanceEmails: string[]
}
export interface WebhookSettings {
  enabled: boolean
  url?: string
  secret?: string
  events: WebhookEvent[]
}
export declare enum WebhookEvent {
  ROBOT_ONLINE = 'robot.online',
  ROBOT_OFFLINE = 'robot.offline',
  ROBOT_ERROR = 'robot.error',
  MAINTENANCE_DUE = 'maintenance.due',
  MAINTENANCE_OVERDUE = 'maintenance.overdue',
  ALERT_TRIGGERED = 'alert.triggered',
  THRESHOLD_EXCEEDED = 'threshold.exceeded',
}
export interface SlackSettings {
  enabled: boolean
  webhookUrl?: string
  channel?: string
  username?: string
}
export interface TeamsSettings {
  enabled: boolean
  webhookUrl?: string
}
export interface SecuritySettings {
  mfaRequired: boolean
  sessionTimeout: number
  ipWhitelist: string[]
  apiKeyRotation: boolean
  auditLogging: boolean
}
export interface IntegrationSettings {
  erp: ERPSettings
  mes: MESSettings
  scada: SCADASettings
  custom: CustomIntegrationSettings[]
}
export interface ERPSettings {
  enabled: boolean
  system?: ERPSystem
  apiEndpoint?: string
  syncInterval?: number
}
export declare enum ERPSystem {
  SAP = 'sap',
  ORACLE = 'oracle',
  MICROSOFT_DYNAMICS = 'microsoft_dynamics',
  NETSUITE = 'netsuite',
  CUSTOM = 'custom',
}
export interface MESSettings {
  enabled: boolean
  system?: MESSystem
  apiEndpoint?: string
  syncInterval?: number
}
export declare enum MESSystem {
  WONDERWARE = 'wonderware',
  SIEMENS_OPCENTER = 'siemens_opcenter',
  DELMIA = 'delmia',
  CUSTOM = 'custom',
}
export interface SCADASettings {
  enabled: boolean
  system?: SCADASystem
  apiEndpoint?: string
  pollInterval?: number
}
export declare enum SCADASystem {
  WONDERWARE = 'wonderware',
  IGNITION = 'ignition',
  CITECT = 'citect',
  CUSTOM = 'custom',
}
export interface CustomIntegrationSettings {
  id: string
  name: string
  type: string
  enabled: boolean
  configuration: Record<string, any>
}
export interface OrganizationLimits {
  maxRobots: number
  maxUsers: number
  maxApiCallsPerMonth: number
  maxDataRetentionDays: number
  maxWebhookEndpoints: number
  maxCustomIntegrations: number
  features: PlanFeatures
}
export interface PlanFeatures {
  realTimeMonitoring: boolean
  historicalAnalytics: boolean
  predictiveMaintenance: boolean
  customDashboards: boolean
  apiAccess: boolean
  webhookSupport: boolean
  ssoIntegration: boolean
  prioritySupport: boolean
  customIntegrations: boolean
  whiteLabeling: boolean
}
export interface BillingInfo {
  customerId?: string
  subscriptionId?: string
  paymentMethodId?: string
  billingEmail: string
  billingAddress?: BillingAddress
  taxId?: string
  nextBillingDate?: Date
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
  usageThisMonth: UsageMetrics
}
export interface BillingAddress {
  line1: string
  line2?: string
  city: string
  state?: string
  postalCode: string
  country: string
}
export interface UsageMetrics {
  robotCount: number
  userCount: number
  apiCalls: number
  dataPoints: number
  webhookDeliveries: number
  storageUsedGB: number
}
//# sourceMappingURL=organization.d.ts.map
