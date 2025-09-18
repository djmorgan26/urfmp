"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationStatus = exports.AngleUnit = exports.PressureUnit = exports.TemperatureUnit = exports.TorqueUnit = exports.ForceUnit = exports.VelocityUnit = exports.DistanceUnit = exports.InAppNotificationType = exports.PushNotificationType = exports.EmailNotificationType = exports.NotificationFrequency = exports.WidgetType = exports.DashboardView = exports.TimeFormat = exports.Theme = exports.Permission = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["MANAGER"] = "manager";
    UserRole["OPERATOR"] = "operator";
    UserRole["VIEWER"] = "viewer";
    UserRole["TECHNICIAN"] = "technician";
    UserRole["CUSTOM"] = "custom";
})(UserRole || (exports.UserRole = UserRole = {}));
var Permission;
(function (Permission) {
    // Robot management
    Permission["ROBOT_VIEW"] = "robot.view";
    Permission["ROBOT_CREATE"] = "robot.create";
    Permission["ROBOT_UPDATE"] = "robot.update";
    Permission["ROBOT_DELETE"] = "robot.delete";
    Permission["ROBOT_CONTROL"] = "robot.control";
    // Telemetry and data
    Permission["TELEMETRY_VIEW"] = "telemetry.view";
    Permission["TELEMETRY_EXPORT"] = "telemetry.export";
    Permission["ANALYTICS_VIEW"] = "analytics.view";
    Permission["ANALYTICS_CREATE"] = "analytics.create";
    // Organization management
    Permission["ORG_VIEW"] = "org.view";
    Permission["ORG_UPDATE"] = "org.update";
    Permission["ORG_BILLING"] = "org.billing";
    // User management
    Permission["USER_VIEW"] = "user.view";
    Permission["USER_CREATE"] = "user.create";
    Permission["USER_UPDATE"] = "user.update";
    Permission["USER_DELETE"] = "user.delete";
    Permission["USER_INVITE"] = "user.invite";
    // API and integrations
    Permission["API_KEY_VIEW"] = "api_key.view";
    Permission["API_KEY_CREATE"] = "api_key.create";
    Permission["API_KEY_DELETE"] = "api_key.delete";
    Permission["WEBHOOK_MANAGE"] = "webhook.manage";
    Permission["INTEGRATION_MANAGE"] = "integration.manage";
    // Maintenance
    Permission["MAINTENANCE_VIEW"] = "maintenance.view";
    Permission["MAINTENANCE_CREATE"] = "maintenance.create";
    Permission["MAINTENANCE_UPDATE"] = "maintenance.update";
    Permission["MAINTENANCE_DELETE"] = "maintenance.delete";
    // Alerts and notifications
    Permission["ALERT_VIEW"] = "alert.view";
    Permission["ALERT_CREATE"] = "alert.create";
    Permission["ALERT_UPDATE"] = "alert.update";
    Permission["ALERT_DELETE"] = "alert.delete";
    // Settings
    Permission["SETTINGS_VIEW"] = "settings.view";
    Permission["SETTINGS_UPDATE"] = "settings.update";
    // Audit and logs
    Permission["AUDIT_VIEW"] = "audit.view";
    Permission["LOGS_VIEW"] = "logs.view";
})(Permission || (exports.Permission = Permission = {}));
var Theme;
(function (Theme) {
    Theme["LIGHT"] = "light";
    Theme["DARK"] = "dark";
    Theme["AUTO"] = "auto";
})(Theme || (exports.Theme = Theme = {}));
var TimeFormat;
(function (TimeFormat) {
    TimeFormat["TWELVE_HOUR"] = "12h";
    TimeFormat["TWENTY_FOUR_HOUR"] = "24h";
})(TimeFormat || (exports.TimeFormat = TimeFormat = {}));
var DashboardView;
(function (DashboardView) {
    DashboardView["FLEET_OVERVIEW"] = "fleet_overview";
    DashboardView["ROBOT_DETAIL"] = "robot_detail";
    DashboardView["ANALYTICS"] = "analytics";
    DashboardView["MAINTENANCE"] = "maintenance";
    DashboardView["ALERTS"] = "alerts";
})(DashboardView || (exports.DashboardView = DashboardView = {}));
var WidgetType;
(function (WidgetType) {
    WidgetType["ROBOT_STATUS"] = "robot_status";
    WidgetType["TELEMETRY_CHART"] = "telemetry_chart";
    WidgetType["ALERT_LIST"] = "alert_list";
    WidgetType["MAINTENANCE_SCHEDULE"] = "maintenance_schedule";
    WidgetType["PERFORMANCE_METRICS"] = "performance_metrics";
    WidgetType["CUSTOM"] = "custom";
})(WidgetType || (exports.WidgetType = WidgetType = {}));
var NotificationFrequency;
(function (NotificationFrequency) {
    NotificationFrequency["IMMEDIATE"] = "immediate";
    NotificationFrequency["HOURLY"] = "hourly";
    NotificationFrequency["DAILY"] = "daily";
    NotificationFrequency["WEEKLY"] = "weekly";
    NotificationFrequency["NEVER"] = "never";
})(NotificationFrequency || (exports.NotificationFrequency = NotificationFrequency = {}));
var EmailNotificationType;
(function (EmailNotificationType) {
    EmailNotificationType["ROBOT_ALERTS"] = "robot_alerts";
    EmailNotificationType["MAINTENANCE_REMINDERS"] = "maintenance_reminders";
    EmailNotificationType["SYSTEM_UPDATES"] = "system_updates";
    EmailNotificationType["WEEKLY_REPORTS"] = "weekly_reports";
    EmailNotificationType["MONTHLY_REPORTS"] = "monthly_reports";
})(EmailNotificationType || (exports.EmailNotificationType = EmailNotificationType = {}));
var PushNotificationType;
(function (PushNotificationType) {
    PushNotificationType["CRITICAL_ALERTS"] = "critical_alerts";
    PushNotificationType["ROBOT_OFFLINE"] = "robot_offline";
    PushNotificationType["MAINTENANCE_DUE"] = "maintenance_due";
    PushNotificationType["SYSTEM_UPDATES"] = "system_updates";
})(PushNotificationType || (exports.PushNotificationType = PushNotificationType = {}));
var InAppNotificationType;
(function (InAppNotificationType) {
    InAppNotificationType["ALL_ALERTS"] = "all_alerts";
    InAppNotificationType["ROBOT_STATUS"] = "robot_status";
    InAppNotificationType["MAINTENANCE"] = "maintenance";
    InAppNotificationType["SYSTEM"] = "system";
})(InAppNotificationType || (exports.InAppNotificationType = InAppNotificationType = {}));
var DistanceUnit;
(function (DistanceUnit) {
    DistanceUnit["MILLIMETERS"] = "mm";
    DistanceUnit["CENTIMETERS"] = "cm";
    DistanceUnit["METERS"] = "m";
    DistanceUnit["INCHES"] = "in";
    DistanceUnit["FEET"] = "ft";
})(DistanceUnit || (exports.DistanceUnit = DistanceUnit = {}));
var VelocityUnit;
(function (VelocityUnit) {
    VelocityUnit["METERS_PER_SECOND"] = "m/s";
    VelocityUnit["MILLIMETERS_PER_SECOND"] = "mm/s";
    VelocityUnit["INCHES_PER_SECOND"] = "in/s";
    VelocityUnit["FEET_PER_MINUTE"] = "ft/min";
})(VelocityUnit || (exports.VelocityUnit = VelocityUnit = {}));
var ForceUnit;
(function (ForceUnit) {
    ForceUnit["NEWTONS"] = "N";
    ForceUnit["POUNDS"] = "lbf";
    ForceUnit["KILOGRAMS_FORCE"] = "kgf";
})(ForceUnit || (exports.ForceUnit = ForceUnit = {}));
var TorqueUnit;
(function (TorqueUnit) {
    TorqueUnit["NEWTON_METERS"] = "Nm";
    TorqueUnit["FOOT_POUNDS"] = "ft\u00B7lbf";
    TorqueUnit["KILOGRAM_METERS"] = "kg\u00B7m";
})(TorqueUnit || (exports.TorqueUnit = TorqueUnit = {}));
var TemperatureUnit;
(function (TemperatureUnit) {
    TemperatureUnit["CELSIUS"] = "\u00B0C";
    TemperatureUnit["FAHRENHEIT"] = "\u00B0F";
    TemperatureUnit["KELVIN"] = "K";
})(TemperatureUnit || (exports.TemperatureUnit = TemperatureUnit = {}));
var PressureUnit;
(function (PressureUnit) {
    PressureUnit["PASCAL"] = "Pa";
    PressureUnit["BAR"] = "bar";
    PressureUnit["PSI"] = "psi";
    PressureUnit["ATMOSPHERE"] = "atm";
})(PressureUnit || (exports.PressureUnit = PressureUnit = {}));
var AngleUnit;
(function (AngleUnit) {
    AngleUnit["RADIANS"] = "rad";
    AngleUnit["DEGREES"] = "deg";
})(AngleUnit || (exports.AngleUnit = AngleUnit = {}));
var InvitationStatus;
(function (InvitationStatus) {
    InvitationStatus["PENDING"] = "pending";
    InvitationStatus["ACCEPTED"] = "accepted";
    InvitationStatus["EXPIRED"] = "expired";
    InvitationStatus["CANCELLED"] = "cancelled";
})(InvitationStatus || (exports.InvitationStatus = InvitationStatus = {}));
//# sourceMappingURL=user.js.map