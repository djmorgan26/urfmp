"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCADASystem = exports.MESSystem = exports.ERPSystem = exports.WebhookEvent = exports.SubscriptionPlan = void 0;
var SubscriptionPlan;
(function (SubscriptionPlan) {
    SubscriptionPlan["FREE"] = "free";
    SubscriptionPlan["STARTER"] = "starter";
    SubscriptionPlan["PROFESSIONAL"] = "professional";
    SubscriptionPlan["ENTERPRISE"] = "enterprise";
    SubscriptionPlan["CUSTOM"] = "custom";
})(SubscriptionPlan || (exports.SubscriptionPlan = SubscriptionPlan = {}));
var WebhookEvent;
(function (WebhookEvent) {
    WebhookEvent["ROBOT_ONLINE"] = "robot.online";
    WebhookEvent["ROBOT_OFFLINE"] = "robot.offline";
    WebhookEvent["ROBOT_ERROR"] = "robot.error";
    WebhookEvent["MAINTENANCE_DUE"] = "maintenance.due";
    WebhookEvent["MAINTENANCE_OVERDUE"] = "maintenance.overdue";
    WebhookEvent["ALERT_TRIGGERED"] = "alert.triggered";
    WebhookEvent["THRESHOLD_EXCEEDED"] = "threshold.exceeded";
})(WebhookEvent || (exports.WebhookEvent = WebhookEvent = {}));
var ERPSystem;
(function (ERPSystem) {
    ERPSystem["SAP"] = "sap";
    ERPSystem["ORACLE"] = "oracle";
    ERPSystem["MICROSOFT_DYNAMICS"] = "microsoft_dynamics";
    ERPSystem["NETSUITE"] = "netsuite";
    ERPSystem["CUSTOM"] = "custom";
})(ERPSystem || (exports.ERPSystem = ERPSystem = {}));
var MESSystem;
(function (MESSystem) {
    MESSystem["WONDERWARE"] = "wonderware";
    MESSystem["SIEMENS_OPCENTER"] = "siemens_opcenter";
    MESSystem["DELMIA"] = "delmia";
    MESSystem["CUSTOM"] = "custom";
})(MESSystem || (exports.MESSystem = MESSystem = {}));
var SCADASystem;
(function (SCADASystem) {
    SCADASystem["WONDERWARE"] = "wonderware";
    SCADASystem["IGNITION"] = "ignition";
    SCADASystem["CITECT"] = "citect";
    SCADASystem["CUSTOM"] = "custom";
})(SCADASystem || (exports.SCADASystem = SCADASystem = {}));
//# sourceMappingURL=organization.js.map