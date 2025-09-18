"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamFormat = exports.StreamDestinationType = exports.AggregationPeriod = exports.NotificationChannelType = exports.EventActionType = exports.LogicalOperator = exports.ConditionOperator = exports.EventSeverity = exports.EventSource = exports.EventType = void 0;
var EventType;
(function (EventType) {
    // Robot events
    EventType["ROBOT_ONLINE"] = "robot.online";
    EventType["ROBOT_OFFLINE"] = "robot.offline";
    EventType["ROBOT_ERROR"] = "robot.error";
    EventType["ROBOT_WARNING"] = "robot.warning";
    EventType["ROBOT_EMERGENCY_STOP"] = "robot.emergency_stop";
    EventType["ROBOT_PROGRAM_START"] = "robot.program.start";
    EventType["ROBOT_PROGRAM_COMPLETE"] = "robot.program.complete";
    EventType["ROBOT_PROGRAM_ERROR"] = "robot.program.error";
    EventType["ROBOT_COLLISION"] = "robot.collision";
    EventType["ROBOT_TOOL_CHANGE"] = "robot.tool.change";
    EventType["ROBOT_CALIBRATION"] = "robot.calibration";
    // Telemetry events
    EventType["TELEMETRY_THRESHOLD_EXCEEDED"] = "telemetry.threshold.exceeded";
    EventType["TELEMETRY_ANOMALY"] = "telemetry.anomaly";
    EventType["TELEMETRY_CONNECTION_LOST"] = "telemetry.connection.lost";
    EventType["TELEMETRY_DATA_GAP"] = "telemetry.data.gap";
    EventType["TELEMETRY_QUALITY_DEGRADED"] = "telemetry.quality.degraded";
    // Maintenance events
    EventType["MAINTENANCE_DUE"] = "maintenance.due";
    EventType["MAINTENANCE_OVERDUE"] = "maintenance.overdue";
    EventType["MAINTENANCE_STARTED"] = "maintenance.started";
    EventType["MAINTENANCE_COMPLETED"] = "maintenance.completed";
    EventType["MAINTENANCE_CANCELLED"] = "maintenance.cancelled";
    EventType["MAINTENANCE_PREDICTED"] = "maintenance.predicted";
    // System events
    EventType["SYSTEM_STARTUP"] = "system.startup";
    EventType["SYSTEM_SHUTDOWN"] = "system.shutdown";
    EventType["SYSTEM_ERROR"] = "system.error";
    EventType["SYSTEM_UPDATE"] = "system.update";
    EventType["SYSTEM_BACKUP"] = "system.backup";
    EventType["SYSTEM_RESTORE"] = "system.restore";
    // Security events
    EventType["SECURITY_LOGIN_SUCCESS"] = "security.login.success";
    EventType["SECURITY_LOGIN_FAILURE"] = "security.login.failure";
    EventType["SECURITY_LOGOUT"] = "security.logout";
    EventType["SECURITY_PASSWORD_CHANGE"] = "security.password.change";
    EventType["SECURITY_MFA_ENABLED"] = "security.mfa.enabled";
    EventType["SECURITY_MFA_DISABLED"] = "security.mfa.disabled";
    EventType["SECURITY_API_KEY_CREATED"] = "security.api_key.created";
    EventType["SECURITY_API_KEY_DELETED"] = "security.api_key.deleted";
    EventType["SECURITY_UNAUTHORIZED_ACCESS"] = "security.unauthorized.access";
    // Organization events
    EventType["ORGANIZATION_USER_INVITED"] = "organization.user.invited";
    EventType["ORGANIZATION_USER_JOINED"] = "organization.user.joined";
    EventType["ORGANIZATION_USER_LEFT"] = "organization.user.left";
    EventType["ORGANIZATION_PLAN_CHANGED"] = "organization.plan.changed";
    EventType["ORGANIZATION_SETTINGS_UPDATED"] = "organization.settings.updated";
    EventType["ORGANIZATION_LIMIT_EXCEEDED"] = "organization.limit.exceeded";
    // Integration events
    EventType["INTEGRATION_CONNECTED"] = "integration.connected";
    EventType["INTEGRATION_DISCONNECTED"] = "integration.disconnected";
    EventType["INTEGRATION_ERROR"] = "integration.error";
    EventType["INTEGRATION_SYNC_COMPLETE"] = "integration.sync.complete";
    // Custom events
    EventType["CUSTOM"] = "custom";
})(EventType || (exports.EventType = EventType = {}));
var EventSource;
(function (EventSource) {
    EventSource["ROBOT_CONTROLLER"] = "robot_controller";
    EventSource["API_SERVER"] = "api_server";
    EventSource["WEB_DASHBOARD"] = "web_dashboard";
    EventSource["MOBILE_APP"] = "mobile_app";
    EventSource["WEBHOOK"] = "webhook";
    EventSource["INTEGRATION"] = "integration";
    EventSource["SYSTEM"] = "system";
    EventSource["SCHEDULER"] = "scheduler";
    EventSource["MONITORING"] = "monitoring";
    EventSource["USER"] = "user";
})(EventSource || (exports.EventSource = EventSource = {}));
var EventSeverity;
(function (EventSeverity) {
    EventSeverity["CRITICAL"] = "critical";
    EventSeverity["HIGH"] = "high";
    EventSeverity["MEDIUM"] = "medium";
    EventSeverity["LOW"] = "low";
    EventSeverity["INFO"] = "info";
})(EventSeverity || (exports.EventSeverity = EventSeverity = {}));
var ConditionOperator;
(function (ConditionOperator) {
    ConditionOperator["EQUALS"] = "equals";
    ConditionOperator["NOT_EQUALS"] = "not_equals";
    ConditionOperator["GREATER_THAN"] = "greater_than";
    ConditionOperator["GREATER_THAN_EQUAL"] = "greater_than_equal";
    ConditionOperator["LESS_THAN"] = "less_than";
    ConditionOperator["LESS_THAN_EQUAL"] = "less_than_equal";
    ConditionOperator["CONTAINS"] = "contains";
    ConditionOperator["NOT_CONTAINS"] = "not_contains";
    ConditionOperator["STARTS_WITH"] = "starts_with";
    ConditionOperator["ENDS_WITH"] = "ends_with";
    ConditionOperator["IN"] = "in";
    ConditionOperator["NOT_IN"] = "not_in";
    ConditionOperator["EXISTS"] = "exists";
    ConditionOperator["NOT_EXISTS"] = "not_exists";
    ConditionOperator["REGEX"] = "regex";
})(ConditionOperator || (exports.ConditionOperator = ConditionOperator = {}));
var LogicalOperator;
(function (LogicalOperator) {
    LogicalOperator["AND"] = "and";
    LogicalOperator["OR"] = "or";
})(LogicalOperator || (exports.LogicalOperator = LogicalOperator = {}));
var EventActionType;
(function (EventActionType) {
    EventActionType["SEND_EMAIL"] = "send_email";
    EventActionType["SEND_SMS"] = "send_sms";
    EventActionType["SEND_WEBHOOK"] = "send_webhook";
    EventActionType["SEND_SLACK_MESSAGE"] = "send_slack_message";
    EventActionType["SEND_TEAMS_MESSAGE"] = "send_teams_message";
    EventActionType["CREATE_MAINTENANCE_TASK"] = "create_maintenance_task";
    EventActionType["EXECUTE_ROBOT_COMMAND"] = "execute_robot_command";
    EventActionType["TRIGGER_AUTOMATION"] = "trigger_automation";
    EventActionType["LOG_TO_FILE"] = "log_to_file";
    EventActionType["ESCALATE_ALERT"] = "escalate_alert";
    EventActionType["CUSTOM_SCRIPT"] = "custom_script";
})(EventActionType || (exports.EventActionType = EventActionType = {}));
var NotificationChannelType;
(function (NotificationChannelType) {
    NotificationChannelType["EMAIL"] = "email";
    NotificationChannelType["SMS"] = "sms";
    NotificationChannelType["WEBHOOK"] = "webhook";
    NotificationChannelType["SLACK"] = "slack";
    NotificationChannelType["TEAMS"] = "teams";
    NotificationChannelType["PUSH_NOTIFICATION"] = "push_notification";
    NotificationChannelType["IN_APP"] = "in_app";
})(NotificationChannelType || (exports.NotificationChannelType = NotificationChannelType = {}));
var AggregationPeriod;
(function (AggregationPeriod) {
    AggregationPeriod["MINUTE"] = "minute";
    AggregationPeriod["HOUR"] = "hour";
    AggregationPeriod["DAY"] = "day";
    AggregationPeriod["WEEK"] = "week";
    AggregationPeriod["MONTH"] = "month";
})(AggregationPeriod || (exports.AggregationPeriod = AggregationPeriod = {}));
var StreamDestinationType;
(function (StreamDestinationType) {
    StreamDestinationType["KAFKA"] = "kafka";
    StreamDestinationType["KINESIS"] = "kinesis";
    StreamDestinationType["PUBSUB"] = "pubsub";
    StreamDestinationType["WEBHOOK"] = "webhook";
    StreamDestinationType["S3"] = "s3";
    StreamDestinationType["AZURE_BLOB"] = "azure_blob";
    StreamDestinationType["GCS"] = "gcs";
})(StreamDestinationType || (exports.StreamDestinationType = StreamDestinationType = {}));
var StreamFormat;
(function (StreamFormat) {
    StreamFormat["JSON"] = "json";
    StreamFormat["AVRO"] = "avro";
    StreamFormat["PROTOBUF"] = "protobuf";
    StreamFormat["CSV"] = "csv";
})(StreamFormat || (exports.StreamFormat = StreamFormat = {}));
//# sourceMappingURL=events.js.map