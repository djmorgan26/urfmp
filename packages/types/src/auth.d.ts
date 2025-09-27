export interface AuthToken {
  accessToken: string
  refreshToken: string
  tokenType: 'Bearer'
  expiresIn: number
  scope: string[]
}
export interface AuthPayload {
  sub: string
  org: string
  email: string
  role: string
  permissions: string[]
  scope: string[]
  iat: number
  exp: number
  aud: string
  iss: string
}
export interface LoginRequest {
  email: string
  password: string
  organizationSlug?: string
  rememberMe?: boolean
  mfaToken?: string
}
export interface LoginResponse {
  user: AuthUser
  organization: AuthOrganization
  tokens: AuthToken
  requiresMfa?: boolean
  mfaQrCode?: string
}
export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  permissions: string[]
  avatar?: string
  lastLoginAt?: Date
}
export interface AuthOrganization {
  id: string
  name: string
  slug: string
  plan: string
  logo?: string
}
export interface RefreshTokenRequest {
  refreshToken: string
}
export interface PasswordResetRequest {
  email: string
  organizationSlug?: string
}
export interface PasswordResetConfirmRequest {
  token: string
  newPassword: string
  confirmPassword: string
}
export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
export interface MfaSetupRequest {
  password: string
}
export interface MfaSetupResponse {
  secret: string
  qrCode: string
  backupCodes: string[]
}
export interface MfaVerifyRequest {
  token: string
  backupCode?: string
}
export interface MfaDisableRequest {
  password: string
  token?: string
  backupCode?: string
}
export interface ApiKey {
  id: string
  name: string
  prefix: string
  lastUsedAt?: Date
  expiresAt?: Date
  scope: ApiKeyScope[]
  rateLimit?: RateLimit
  ipWhitelist?: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
export declare enum ApiKeyScope {
  READ_ROBOTS = 'read:robots',
  READ_TELEMETRY = 'read:telemetry',
  READ_ORGANIZATIONS = 'read:organizations',
  READ_USERS = 'read:users',
  READ_MAINTENANCE = 'read:maintenance',
  READ_ANALYTICS = 'read:analytics',
  WRITE_ROBOTS = 'write:robots',
  WRITE_TELEMETRY = 'write:telemetry',
  WRITE_MAINTENANCE = 'write:maintenance',
  WRITE_COMMANDS = 'write:commands',
  ADMIN_USERS = 'admin:users',
  ADMIN_ORGANIZATION = 'admin:organization',
  ADMIN_API_KEYS = 'admin:api_keys',
  ADMIN_WEBHOOKS = 'admin:webhooks',
  ALL = '*',
}
export interface RateLimit {
  requestsPerMinute: number
  requestsPerHour: number
  requestsPerDay: number
  burstLimit: number
}
export interface CreateApiKeyRequest {
  name: string
  scope: ApiKeyScope[]
  expiresAt?: Date
  rateLimit?: RateLimit
  ipWhitelist?: string[]
}
export interface CreateApiKeyResponse {
  apiKey: ApiKey
  key: string
}
export interface WebhookSignature {
  timestamp: number
  signature: string
}
export interface SsoProvider {
  id: string
  name: string
  type: SsoProviderType
  enabled: boolean
  configuration: SsoConfiguration
}
export declare enum SsoProviderType {
  SAML = 'saml',
  OIDC = 'oidc',
  OAUTH2 = 'oauth2',
  LDAP = 'ldap',
}
export interface SsoConfiguration {
  entityId?: string
  ssoUrl?: string
  certificate?: string
  clientId?: string
  clientSecret?: string
  discoveryUrl?: string
  authorizationUrl?: string
  tokenUrl?: string
  userInfoUrl?: string
  host?: string
  port?: number
  baseDn?: string
  bindDn?: string
  bindPassword?: string
  attributeMapping?: AttributeMapping
  autoProvision?: boolean
  defaultRole?: string
}
export interface AttributeMapping {
  email: string
  firstName?: string
  lastName?: string
  role?: string
  department?: string
}
export interface SsoLoginRequest {
  providerId: string
  state?: string
  redirectUrl?: string
}
export interface AuditLog {
  id: string
  userId?: string
  organizationId: string
  action: AuditAction
  resource: AuditResource
  resourceId?: string
  details: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}
export declare enum AuditAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  EXPORT = 'export',
  IMPORT = 'import',
  EXECUTE = 'execute',
  APPROVE = 'approve',
  REJECT = 'reject',
}
export declare enum AuditResource {
  USER = 'user',
  ROBOT = 'robot',
  ORGANIZATION = 'organization',
  API_KEY = 'api_key',
  WEBHOOK = 'webhook',
  MAINTENANCE = 'maintenance',
  COMMAND = 'command',
  SETTINGS = 'settings',
  INTEGRATION = 'integration',
}
//# sourceMappingURL=auth.d.ts.map
