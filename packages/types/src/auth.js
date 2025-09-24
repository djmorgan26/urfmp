'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.AuditResource = exports.AuditAction = exports.SsoProviderType = exports.ApiKeyScope = void 0
var ApiKeyScope
;(function (ApiKeyScope) {
  // Read operations
  ApiKeyScope['READ_ROBOTS'] = 'read:robots'
  ApiKeyScope['READ_TELEMETRY'] = 'read:telemetry'
  ApiKeyScope['READ_ORGANIZATIONS'] = 'read:organizations'
  ApiKeyScope['READ_USERS'] = 'read:users'
  ApiKeyScope['READ_MAINTENANCE'] = 'read:maintenance'
  ApiKeyScope['READ_ANALYTICS'] = 'read:analytics'
  // Write operations
  ApiKeyScope['WRITE_ROBOTS'] = 'write:robots'
  ApiKeyScope['WRITE_TELEMETRY'] = 'write:telemetry'
  ApiKeyScope['WRITE_MAINTENANCE'] = 'write:maintenance'
  ApiKeyScope['WRITE_COMMANDS'] = 'write:commands'
  // Admin operations
  ApiKeyScope['ADMIN_USERS'] = 'admin:users'
  ApiKeyScope['ADMIN_ORGANIZATION'] = 'admin:organization'
  ApiKeyScope['ADMIN_API_KEYS'] = 'admin:api_keys'
  ApiKeyScope['ADMIN_WEBHOOKS'] = 'admin:webhooks'
  // Special scopes
  ApiKeyScope['ALL'] = '*'
})(ApiKeyScope || (exports.ApiKeyScope = ApiKeyScope = {}))
var SsoProviderType
;(function (SsoProviderType) {
  SsoProviderType['SAML'] = 'saml'
  SsoProviderType['OIDC'] = 'oidc'
  SsoProviderType['OAUTH2'] = 'oauth2'
  SsoProviderType['LDAP'] = 'ldap'
})(SsoProviderType || (exports.SsoProviderType = SsoProviderType = {}))
var AuditAction
;(function (AuditAction) {
  AuditAction['LOGIN'] = 'login'
  AuditAction['LOGOUT'] = 'logout'
  AuditAction['CREATE'] = 'create'
  AuditAction['UPDATE'] = 'update'
  AuditAction['DELETE'] = 'delete'
  AuditAction['VIEW'] = 'view'
  AuditAction['EXPORT'] = 'export'
  AuditAction['IMPORT'] = 'import'
  AuditAction['EXECUTE'] = 'execute'
  AuditAction['APPROVE'] = 'approve'
  AuditAction['REJECT'] = 'reject'
})(AuditAction || (exports.AuditAction = AuditAction = {}))
var AuditResource
;(function (AuditResource) {
  AuditResource['USER'] = 'user'
  AuditResource['ROBOT'] = 'robot'
  AuditResource['ORGANIZATION'] = 'organization'
  AuditResource['API_KEY'] = 'api_key'
  AuditResource['WEBHOOK'] = 'webhook'
  AuditResource['MAINTENANCE'] = 'maintenance'
  AuditResource['COMMAND'] = 'command'
  AuditResource['SETTINGS'] = 'settings'
  AuditResource['INTEGRATION'] = 'integration'
})(AuditResource || (exports.AuditResource = AuditResource = {}))
//# sourceMappingURL=auth.js.map
