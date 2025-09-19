"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceType = exports.CommunicationStatus = exports.FormationRole = exports.FormationType = exports.GeofenceActionType = exports.GeofenceTrigger = exports.GeofenceType = exports.PathPlanningStatus = exports.WaypointActionType = exports.WaypointType = exports.GPSFixType = exports.AggregationType = exports.TimeWindow = exports.CompressionType = exports.DataQuality = exports.TelemetrySource = exports.ExecutionMode = exports.PowerUnit = exports.CurrentUnit = exports.VoltageUnit = exports.TemperatureUnit = exports.TorqueUnit = exports.ForceUnit = exports.AngularAccelerationUnit = exports.AccelerationUnit = exports.AngularVelocityUnit = exports.VelocityUnit = exports.AngleUnit = exports.CoordinateFrame = void 0;
var CoordinateFrame;
(function (CoordinateFrame) {
    CoordinateFrame["BASE"] = "base";
    CoordinateFrame["TOOL"] = "tool";
    CoordinateFrame["WORLD"] = "world";
    CoordinateFrame["USER"] = "user";
})(CoordinateFrame || (exports.CoordinateFrame = CoordinateFrame = {}));
var AngleUnit;
(function (AngleUnit) {
    AngleUnit["RADIANS"] = "radians";
    AngleUnit["DEGREES"] = "degrees";
})(AngleUnit || (exports.AngleUnit = AngleUnit = {}));
var VelocityUnit;
(function (VelocityUnit) {
    VelocityUnit["METERS_PER_SECOND"] = "m/s";
    VelocityUnit["MILLIMETERS_PER_SECOND"] = "mm/s";
    VelocityUnit["INCHES_PER_SECOND"] = "in/s";
})(VelocityUnit || (exports.VelocityUnit = VelocityUnit = {}));
var AngularVelocityUnit;
(function (AngularVelocityUnit) {
    AngularVelocityUnit["RADIANS_PER_SECOND"] = "rad/s";
    AngularVelocityUnit["DEGREES_PER_SECOND"] = "deg/s";
    AngularVelocityUnit["REVOLUTIONS_PER_MINUTE"] = "rpm";
})(AngularVelocityUnit || (exports.AngularVelocityUnit = AngularVelocityUnit = {}));
var AccelerationUnit;
(function (AccelerationUnit) {
    AccelerationUnit["METERS_PER_SECOND_SQUARED"] = "m/s\u00B2";
    AccelerationUnit["G_FORCE"] = "g";
})(AccelerationUnit || (exports.AccelerationUnit = AccelerationUnit = {}));
var AngularAccelerationUnit;
(function (AngularAccelerationUnit) {
    AngularAccelerationUnit["RADIANS_PER_SECOND_SQUARED"] = "rad/s\u00B2";
    AngularAccelerationUnit["DEGREES_PER_SECOND_SQUARED"] = "deg/s\u00B2";
})(AngularAccelerationUnit || (exports.AngularAccelerationUnit = AngularAccelerationUnit = {}));
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
var VoltageUnit;
(function (VoltageUnit) {
    VoltageUnit["VOLTS"] = "V";
    VoltageUnit["MILLIVOLTS"] = "mV";
})(VoltageUnit || (exports.VoltageUnit = VoltageUnit = {}));
var CurrentUnit;
(function (CurrentUnit) {
    CurrentUnit["AMPERES"] = "A";
    CurrentUnit["MILLIAMPERES"] = "mA";
})(CurrentUnit || (exports.CurrentUnit = CurrentUnit = {}));
var PowerUnit;
(function (PowerUnit) {
    PowerUnit["WATTS"] = "W";
    PowerUnit["KILOWATTS"] = "kW";
    PowerUnit["HORSEPOWER"] = "hp";
})(PowerUnit || (exports.PowerUnit = PowerUnit = {}));
var ExecutionMode;
(function (ExecutionMode) {
    ExecutionMode["MANUAL"] = "manual";
    ExecutionMode["AUTOMATIC"] = "automatic";
    ExecutionMode["SINGLE_STEP"] = "single_step";
    ExecutionMode["DRY_RUN"] = "dry_run";
})(ExecutionMode || (exports.ExecutionMode = ExecutionMode = {}));
var TelemetrySource;
(function (TelemetrySource) {
    TelemetrySource["ROBOT_CONTROLLER"] = "robot_controller";
    TelemetrySource["EXTERNAL_SENSOR"] = "external_sensor";
    TelemetrySource["SIMULATION"] = "simulation";
    TelemetrySource["MANUAL_INPUT"] = "manual_input";
})(TelemetrySource || (exports.TelemetrySource = TelemetrySource = {}));
var DataQuality;
(function (DataQuality) {
    DataQuality["HIGH"] = "high";
    DataQuality["MEDIUM"] = "medium";
    DataQuality["LOW"] = "low";
    DataQuality["QUESTIONABLE"] = "questionable";
})(DataQuality || (exports.DataQuality = DataQuality = {}));
var CompressionType;
(function (CompressionType) {
    CompressionType["NONE"] = "none";
    CompressionType["GZIP"] = "gzip";
    CompressionType["LZ4"] = "lz4";
    CompressionType["ZSTD"] = "zstd";
})(CompressionType || (exports.CompressionType = CompressionType = {}));
var TimeWindow;
(function (TimeWindow) {
    TimeWindow["MINUTE"] = "1m";
    TimeWindow["FIVE_MINUTES"] = "5m";
    TimeWindow["FIFTEEN_MINUTES"] = "15m";
    TimeWindow["HOUR"] = "1h";
    TimeWindow["DAY"] = "1d";
    TimeWindow["WEEK"] = "1w";
    TimeWindow["MONTH"] = "1M";
})(TimeWindow || (exports.TimeWindow = TimeWindow = {}));
var AggregationType;
(function (AggregationType) {
    AggregationType["AVERAGE"] = "avg";
    AggregationType["MINIMUM"] = "min";
    AggregationType["MAXIMUM"] = "max";
    AggregationType["SUM"] = "sum";
    AggregationType["COUNT"] = "count";
    AggregationType["STANDARD_DEVIATION"] = "stddev";
    AggregationType["PERCENTILE_50"] = "p50";
    AggregationType["PERCENTILE_95"] = "p95";
    AggregationType["PERCENTILE_99"] = "p99";
})(AggregationType || (exports.AggregationType = AggregationType = {}));
var GPSFixType;
(function (GPSFixType) {
    GPSFixType["NO_FIX"] = "no_fix";
    GPSFixType["GPS_2D"] = "2d";
    GPSFixType["GPS_3D"] = "3d";
    GPSFixType["DGPS"] = "dgps";
    GPSFixType["RTK_FLOAT"] = "rtk_float";
    GPSFixType["RTK_FIXED"] = "rtk_fixed";
})(GPSFixType || (exports.GPSFixType = GPSFixType = {}));
var WaypointType;
(function (WaypointType) {
    WaypointType["NORMAL"] = "normal";
    WaypointType["START"] = "start";
    WaypointType["END"] = "end";
    WaypointType["CHECKPOINT"] = "checkpoint";
    WaypointType["CHARGING_STATION"] = "charging_station";
    WaypointType["WORK_ZONE"] = "work_zone";
    WaypointType["SAFETY_ZONE"] = "safety_zone";
    WaypointType["NO_GO_ZONE"] = "no_go_zone";
})(WaypointType || (exports.WaypointType = WaypointType = {}));
var WaypointActionType;
(function (WaypointActionType) {
    WaypointActionType["STOP"] = "stop";
    WaypointActionType["WAIT"] = "wait";
    WaypointActionType["WORK"] = "work";
    WaypointActionType["CHARGE"] = "charge";
    WaypointActionType["TAKE_PHOTO"] = "take_photo";
    WaypointActionType["COLLECT_SAMPLE"] = "collect_sample";
    WaypointActionType["DEPLOY_TOOL"] = "deploy_tool";
    WaypointActionType["CUSTOM"] = "custom";
})(WaypointActionType || (exports.WaypointActionType = WaypointActionType = {}));
var PathPlanningStatus;
(function (PathPlanningStatus) {
    PathPlanningStatus["IDLE"] = "idle";
    PathPlanningStatus["PLANNING"] = "planning";
    PathPlanningStatus["EXECUTING"] = "executing";
    PathPlanningStatus["PAUSED"] = "paused";
    PathPlanningStatus["COMPLETED"] = "completed";
    PathPlanningStatus["FAILED"] = "failed";
    PathPlanningStatus["EMERGENCY_STOP"] = "emergency_stop";
})(PathPlanningStatus || (exports.PathPlanningStatus = PathPlanningStatus = {}));
var GeofenceType;
(function (GeofenceType) {
    GeofenceType["INCLUSION"] = "inclusion";
    GeofenceType["EXCLUSION"] = "exclusion";
    GeofenceType["WARNING"] = "warning";
    GeofenceType["WORK_ZONE"] = "work_zone";
    GeofenceType["CHARGING_ZONE"] = "charging_zone";
    GeofenceType["SAFETY_ZONE"] = "safety_zone";
})(GeofenceType || (exports.GeofenceType = GeofenceType = {}));
var GeofenceTrigger;
(function (GeofenceTrigger) {
    GeofenceTrigger["ENTER"] = "enter";
    GeofenceTrigger["EXIT"] = "exit";
    GeofenceTrigger["DWELL"] = "dwell";
})(GeofenceTrigger || (exports.GeofenceTrigger = GeofenceTrigger = {}));
var GeofenceActionType;
(function (GeofenceActionType) {
    GeofenceActionType["ALERT"] = "alert";
    GeofenceActionType["STOP"] = "stop";
    GeofenceActionType["RETURN_TO_BASE"] = "return_to_base";
    GeofenceActionType["REDUCE_SPEED"] = "reduce_speed";
    GeofenceActionType["LOG_EVENT"] = "log_event";
    GeofenceActionType["CUSTOM"] = "custom";
})(GeofenceActionType || (exports.GeofenceActionType = GeofenceActionType = {}));
var FormationType;
(function (FormationType) {
    FormationType["LINE"] = "line";
    FormationType["COLUMN"] = "column";
    FormationType["WEDGE"] = "wedge";
    FormationType["BOX"] = "box";
    FormationType["CUSTOM"] = "custom";
})(FormationType || (exports.FormationType = FormationType = {}));
var FormationRole;
(function (FormationRole) {
    FormationRole["LEADER"] = "leader";
    FormationRole["FOLLOWER"] = "follower";
    FormationRole["SCOUT"] = "scout";
    FormationRole["SUPPORT"] = "support";
})(FormationRole || (exports.FormationRole = FormationRole = {}));
var CommunicationStatus;
(function (CommunicationStatus) {
    CommunicationStatus["CONNECTED"] = "connected";
    CommunicationStatus["WEAK_SIGNAL"] = "weak_signal";
    CommunicationStatus["INTERMITTENT"] = "intermittent";
    CommunicationStatus["DISCONNECTED"] = "disconnected";
})(CommunicationStatus || (exports.CommunicationStatus = CommunicationStatus = {}));
var ResourceType;
(function (ResourceType) {
    ResourceType["CHARGING_STATION"] = "charging_station";
    ResourceType["TOOL"] = "tool";
    ResourceType["WORKSPACE"] = "workspace";
    ResourceType["NETWORK_BANDWIDTH"] = "network_bandwidth";
    ResourceType["PROCESSING_POWER"] = "processing_power";
})(ResourceType || (exports.ResourceType = ResourceType = {}));
//# sourceMappingURL=telemetry.js.map