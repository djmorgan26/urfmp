'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.OperationType =
  exports.ResourceType =
  exports.UpdateType =
  exports.FilterOperator =
  exports.ChannelType =
  exports.UserEventType =
  exports.OrganizationEventType =
  exports.AlertEventType =
  exports.MaintenanceEventType =
  exports.TelemetryEventType =
  exports.RobotEventType =
  exports.WebSocketMessageType =
    void 0
var WebSocketMessageType
;(function (WebSocketMessageType) {
  WebSocketMessageType['EVENT'] = 'event'
  WebSocketMessageType['COMMAND'] = 'command'
  WebSocketMessageType['RESPONSE'] = 'response'
  WebSocketMessageType['ERROR'] = 'error'
  WebSocketMessageType['HEARTBEAT'] = 'heartbeat'
  WebSocketMessageType['SUBSCRIPTION'] = 'subscription'
  WebSocketMessageType['UNSUBSCRIPTION'] = 'unsubscription'
})(WebSocketMessageType || (exports.WebSocketMessageType = WebSocketMessageType = {}))
var RobotEventType
;(function (RobotEventType) {
  RobotEventType['STATUS_CHANGED'] = 'status_changed'
  RobotEventType['COMMAND_RECEIVED'] = 'command_received'
  RobotEventType['COMMAND_COMPLETED'] = 'command_completed'
  RobotEventType['COMMAND_FAILED'] = 'command_failed'
  RobotEventType['ERROR_OCCURRED'] = 'error_occurred'
  RobotEventType['EMERGENCY_STOP'] = 'emergency_stop'
  RobotEventType['MAINTENANCE_REQUIRED'] = 'maintenance_required'
  RobotEventType['PROGRAM_STARTED'] = 'program_started'
  RobotEventType['PROGRAM_COMPLETED'] = 'program_completed'
  RobotEventType['PROGRAM_PAUSED'] = 'program_paused'
  RobotEventType['POSITION_CHANGED'] = 'position_changed'
  RobotEventType['TOOL_CHANGED'] = 'tool_changed'
})(RobotEventType || (exports.RobotEventType = RobotEventType = {}))
var TelemetryEventType
;(function (TelemetryEventType) {
  TelemetryEventType['DATA_RECEIVED'] = 'data_received'
  TelemetryEventType['THRESHOLD_EXCEEDED'] = 'threshold_exceeded'
  TelemetryEventType['ANOMALY_DETECTED'] = 'anomaly_detected'
  TelemetryEventType['CONNECTION_LOST'] = 'connection_lost'
  TelemetryEventType['CONNECTION_RESTORED'] = 'connection_restored'
  TelemetryEventType['QUALITY_DEGRADED'] = 'quality_degraded'
})(TelemetryEventType || (exports.TelemetryEventType = TelemetryEventType = {}))
var MaintenanceEventType
;(function (MaintenanceEventType) {
  MaintenanceEventType['SCHEDULED'] = 'scheduled'
  MaintenanceEventType['STARTED'] = 'started'
  MaintenanceEventType['COMPLETED'] = 'completed'
  MaintenanceEventType['OVERDUE'] = 'overdue'
  MaintenanceEventType['CANCELLED'] = 'cancelled'
  MaintenanceEventType['RESCHEDULED'] = 'rescheduled'
  MaintenanceEventType['REMINDER'] = 'reminder'
})(MaintenanceEventType || (exports.MaintenanceEventType = MaintenanceEventType = {}))
var AlertEventType
;(function (AlertEventType) {
  AlertEventType['TRIGGERED'] = 'triggered'
  AlertEventType['RESOLVED'] = 'resolved'
  AlertEventType['ACKNOWLEDGED'] = 'acknowledged'
  AlertEventType['ESCALATED'] = 'escalated'
  AlertEventType['SNOOZED'] = 'snoozed'
})(AlertEventType || (exports.AlertEventType = AlertEventType = {}))
var OrganizationEventType
;(function (OrganizationEventType) {
  OrganizationEventType['SETTINGS_UPDATED'] = 'settings_updated'
  OrganizationEventType['USER_JOINED'] = 'user_joined'
  OrganizationEventType['USER_LEFT'] = 'user_left'
  OrganizationEventType['PLAN_CHANGED'] = 'plan_changed'
  OrganizationEventType['LIMIT_EXCEEDED'] = 'limit_exceeded'
})(OrganizationEventType || (exports.OrganizationEventType = OrganizationEventType = {}))
var UserEventType
;(function (UserEventType) {
  UserEventType['PROFILE_UPDATED'] = 'profile_updated'
  UserEventType['PREFERENCES_UPDATED'] = 'preferences_updated'
  UserEventType['PASSWORD_CHANGED'] = 'password_changed'
  UserEventType['MFA_ENABLED'] = 'mfa_enabled'
  UserEventType['MFA_DISABLED'] = 'mfa_disabled'
})(UserEventType || (exports.UserEventType = UserEventType = {}))
var ChannelType
;(function (ChannelType) {
  ChannelType['ROBOT'] = 'robot'
  ChannelType['TELEMETRY'] = 'telemetry'
  ChannelType['MAINTENANCE'] = 'maintenance'
  ChannelType['ALERTS'] = 'alerts'
  ChannelType['ORGANIZATION'] = 'organization'
  ChannelType['USER'] = 'user'
  ChannelType['GLOBAL'] = 'global'
})(ChannelType || (exports.ChannelType = ChannelType = {}))
var FilterOperator
;(function (FilterOperator) {
  FilterOperator['EQUALS'] = 'eq'
  FilterOperator['NOT_EQUALS'] = 'ne'
  FilterOperator['GREATER_THAN'] = 'gt'
  FilterOperator['GREATER_THAN_EQUAL'] = 'gte'
  FilterOperator['LESS_THAN'] = 'lt'
  FilterOperator['LESS_THAN_EQUAL'] = 'lte'
  FilterOperator['IN'] = 'in'
  FilterOperator['NOT_IN'] = 'nin'
  FilterOperator['CONTAINS'] = 'contains'
  FilterOperator['STARTS_WITH'] = 'starts_with'
  FilterOperator['ENDS_WITH'] = 'ends_with'
})(FilterOperator || (exports.FilterOperator = FilterOperator = {}))
var UpdateType
;(function (UpdateType) {
  UpdateType['DATA_CHANGE'] = 'data_change'
  UpdateType['STATUS_CHANGE'] = 'status_change'
  UpdateType['CONFIGURATION_CHANGE'] = 'configuration_change'
  UpdateType['SYSTEM_EVENT'] = 'system_event'
})(UpdateType || (exports.UpdateType = UpdateType = {}))
var ResourceType
;(function (ResourceType) {
  ResourceType['ROBOT'] = 'robot'
  ResourceType['TELEMETRY'] = 'telemetry'
  ResourceType['MAINTENANCE'] = 'maintenance'
  ResourceType['ALERT'] = 'alert'
  ResourceType['USER'] = 'user'
  ResourceType['ORGANIZATION'] = 'organization'
})(ResourceType || (exports.ResourceType = ResourceType = {}))
var OperationType
;(function (OperationType) {
  OperationType['CREATE'] = 'create'
  OperationType['UPDATE'] = 'update'
  OperationType['DELETE'] = 'delete'
  OperationType['PATCH'] = 'patch'
})(OperationType || (exports.OperationType = OperationType = {}))
//# sourceMappingURL=websocket.js.map
