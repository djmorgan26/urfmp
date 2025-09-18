export interface RobotTelemetry {
    id: string;
    robotId: string;
    timestamp: Date;
    data: TelemetryData;
    metadata?: TelemetryMetadata;
}
export interface TelemetryData {
    position?: Position;
    jointAngles?: JointAngles;
    velocity?: Velocity;
    acceleration?: Acceleration;
    force?: Force;
    torque?: Torque;
    temperature?: Temperature;
    voltage?: Voltage;
    current?: Current;
    power?: Power;
    programState?: ProgramState;
    toolData?: ToolData;
    safety?: SafetyData;
    custom?: Record<string, any>;
}
export interface Position {
    x: number;
    y: number;
    z: number;
    rx?: number;
    ry?: number;
    rz?: number;
    frame?: CoordinateFrame;
}
export declare enum CoordinateFrame {
    BASE = "base",
    TOOL = "tool",
    WORLD = "world",
    USER = "user"
}
export interface JointAngles {
    joint1: number;
    joint2: number;
    joint3: number;
    joint4: number;
    joint5: number;
    joint6: number;
    joint7?: number;
    joint8?: number;
    unit: AngleUnit;
}
export declare enum AngleUnit {
    RADIANS = "radians",
    DEGREES = "degrees"
}
export interface Velocity {
    linear?: LinearVelocity;
    angular?: AngularVelocity;
    joint?: JointVelocity;
}
export interface LinearVelocity {
    x: number;
    y: number;
    z: number;
    magnitude?: number;
    unit: VelocityUnit;
}
export interface AngularVelocity {
    rx: number;
    ry: number;
    rz: number;
    unit: AngularVelocityUnit;
}
export interface JointVelocity {
    joint1: number;
    joint2: number;
    joint3: number;
    joint4: number;
    joint5: number;
    joint6: number;
    joint7?: number;
    joint8?: number;
    unit: AngularVelocityUnit;
}
export declare enum VelocityUnit {
    METERS_PER_SECOND = "m/s",
    MILLIMETERS_PER_SECOND = "mm/s",
    INCHES_PER_SECOND = "in/s"
}
export declare enum AngularVelocityUnit {
    RADIANS_PER_SECOND = "rad/s",
    DEGREES_PER_SECOND = "deg/s",
    REVOLUTIONS_PER_MINUTE = "rpm"
}
export interface Acceleration {
    linear?: LinearAcceleration;
    angular?: AngularAcceleration;
}
export interface LinearAcceleration {
    x: number;
    y: number;
    z: number;
    magnitude?: number;
    unit: AccelerationUnit;
}
export interface AngularAcceleration {
    rx: number;
    ry: number;
    rz: number;
    unit: AngularAccelerationUnit;
}
export declare enum AccelerationUnit {
    METERS_PER_SECOND_SQUARED = "m/s\u00B2",
    G_FORCE = "g"
}
export declare enum AngularAccelerationUnit {
    RADIANS_PER_SECOND_SQUARED = "rad/s\u00B2",
    DEGREES_PER_SECOND_SQUARED = "deg/s\u00B2"
}
export interface Force {
    x: number;
    y: number;
    z: number;
    magnitude?: number;
    unit: ForceUnit;
}
export declare enum ForceUnit {
    NEWTONS = "N",
    POUNDS = "lbf",
    KILOGRAMS_FORCE = "kgf"
}
export interface Torque {
    rx: number;
    ry: number;
    rz: number;
    magnitude?: number;
    unit: TorqueUnit;
}
export declare enum TorqueUnit {
    NEWTON_METERS = "Nm",
    FOOT_POUNDS = "ft\u00B7lbf",
    KILOGRAM_METERS = "kg\u00B7m"
}
export interface Temperature {
    ambient?: number;
    motor?: MotorTemperature;
    controller?: number;
    unit: TemperatureUnit;
}
export interface MotorTemperature {
    joint1?: number;
    joint2?: number;
    joint3?: number;
    joint4?: number;
    joint5?: number;
    joint6?: number;
    joint7?: number;
    joint8?: number;
}
export declare enum TemperatureUnit {
    CELSIUS = "\u00B0C",
    FAHRENHEIT = "\u00B0F",
    KELVIN = "K"
}
export interface Voltage {
    supply: number;
    motor?: MotorVoltage;
    controller?: number;
    unit: VoltageUnit;
}
export interface MotorVoltage {
    joint1?: number;
    joint2?: number;
    joint3?: number;
    joint4?: number;
    joint5?: number;
    joint6?: number;
    joint7?: number;
    joint8?: number;
}
export declare enum VoltageUnit {
    VOLTS = "V",
    MILLIVOLTS = "mV"
}
export interface Current {
    total: number;
    motor?: MotorCurrent;
    controller?: number;
    unit: CurrentUnit;
}
export interface MotorCurrent {
    joint1?: number;
    joint2?: number;
    joint3?: number;
    joint4?: number;
    joint5?: number;
    joint6?: number;
    joint7?: number;
    joint8?: number;
}
export declare enum CurrentUnit {
    AMPERES = "A",
    MILLIAMPERES = "mA"
}
export interface Power {
    total: number;
    motor?: MotorPower;
    controller?: number;
    unit: PowerUnit;
}
export interface MotorPower {
    joint1?: number;
    joint2?: number;
    joint3?: number;
    joint4?: number;
    joint5?: number;
    joint6?: number;
    joint7?: number;
    joint8?: number;
}
export declare enum PowerUnit {
    WATTS = "W",
    KILOWATTS = "kW",
    HORSEPOWER = "hp"
}
export interface ProgramState {
    currentProgram?: string;
    currentLine?: number;
    executionMode: ExecutionMode;
    cycleTime?: number;
    remainingTime?: number;
    completionPercentage?: number;
}
export declare enum ExecutionMode {
    MANUAL = "manual",
    AUTOMATIC = "automatic",
    SINGLE_STEP = "single_step",
    DRY_RUN = "dry_run"
}
export interface ToolData {
    toolId?: string;
    position?: Position;
    force?: Force;
    torque?: Torque;
    temperature?: number;
    active: boolean;
    custom?: Record<string, any>;
}
export interface SafetyData {
    emergencyStop: boolean;
    protectiveStop: boolean;
    reducedMode: boolean;
    safetyZoneViolation: boolean;
    doorOpen?: boolean;
    lightCurtain?: boolean;
    pressureMat?: boolean;
    customSafety?: Record<string, boolean>;
}
export interface TelemetryMetadata {
    source: TelemetrySource;
    quality: DataQuality;
    samplingRate?: number;
    compression?: CompressionType;
    checksum?: string;
}
export declare enum TelemetrySource {
    ROBOT_CONTROLLER = "robot_controller",
    EXTERNAL_SENSOR = "external_sensor",
    SIMULATION = "simulation",
    MANUAL_INPUT = "manual_input"
}
export declare enum DataQuality {
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low",
    QUESTIONABLE = "questionable"
}
export declare enum CompressionType {
    NONE = "none",
    GZIP = "gzip",
    LZ4 = "lz4",
    ZSTD = "zstd"
}
export interface TelemetryAggregation {
    robotId: string;
    metric: string;
    timeWindow: TimeWindow;
    aggregationType: AggregationType;
    value: number;
    timestamp: Date;
}
export declare enum TimeWindow {
    MINUTE = "1m",
    FIVE_MINUTES = "5m",
    FIFTEEN_MINUTES = "15m",
    HOUR = "1h",
    DAY = "1d",
    WEEK = "1w",
    MONTH = "1M"
}
export declare enum AggregationType {
    AVERAGE = "avg",
    MINIMUM = "min",
    MAXIMUM = "max",
    SUM = "sum",
    COUNT = "count",
    STANDARD_DEVIATION = "stddev",
    PERCENTILE_50 = "p50",
    PERCENTILE_95 = "p95",
    PERCENTILE_99 = "p99"
}
//# sourceMappingURL=telemetry.d.ts.map