export interface RobotTelemetry {
  id: string
  robotId: string
  timestamp: Date
  data: TelemetryData
  metadata?: TelemetryMetadata
}
export interface TelemetryData {
  position?: Position
  gpsPosition?: GPSPosition
  jointAngles?: JointAngles
  velocity?: Velocity
  acceleration?: Acceleration
  force?: Force
  torque?: Torque
  temperature?: Temperature
  voltage?: Voltage
  current?: Current
  power?: Power
  programState?: ProgramState
  toolData?: ToolData
  safety?: SafetyData
  navigation?: NavigationData
  custom?: Record<string, any>
}
export interface Position {
  x: number
  y: number
  z: number
  rx?: number
  ry?: number
  rz?: number
  frame?: CoordinateFrame
}
export declare enum CoordinateFrame {
  BASE = 'base',
  TOOL = 'tool',
  WORLD = 'world',
  USER = 'user',
}
export interface JointAngles {
  joint1: number
  joint2: number
  joint3: number
  joint4: number
  joint5: number
  joint6: number
  joint7?: number
  joint8?: number
  unit: AngleUnit
}
export declare enum AngleUnit {
  RADIANS = 'radians',
  DEGREES = 'degrees',
}
export interface Velocity {
  linear?: LinearVelocity
  angular?: AngularVelocity
  joint?: JointVelocity
}
export interface LinearVelocity {
  x: number
  y: number
  z: number
  magnitude?: number
  unit: VelocityUnit
}
export interface AngularVelocity {
  rx: number
  ry: number
  rz: number
  unit: AngularVelocityUnit
}
export interface JointVelocity {
  joint1: number
  joint2: number
  joint3: number
  joint4: number
  joint5: number
  joint6: number
  joint7?: number
  joint8?: number
  unit: AngularVelocityUnit
}
export declare enum VelocityUnit {
  METERS_PER_SECOND = 'm/s',
  MILLIMETERS_PER_SECOND = 'mm/s',
  INCHES_PER_SECOND = 'in/s',
}
export declare enum AngularVelocityUnit {
  RADIANS_PER_SECOND = 'rad/s',
  DEGREES_PER_SECOND = 'deg/s',
  REVOLUTIONS_PER_MINUTE = 'rpm',
}
export interface Acceleration {
  linear?: LinearAcceleration
  angular?: AngularAcceleration
}
export interface LinearAcceleration {
  x: number
  y: number
  z: number
  magnitude?: number
  unit: AccelerationUnit
}
export interface AngularAcceleration {
  rx: number
  ry: number
  rz: number
  unit: AngularAccelerationUnit
}
export declare enum AccelerationUnit {
  METERS_PER_SECOND_SQUARED = 'm/s\u00B2',
  G_FORCE = 'g',
}
export declare enum AngularAccelerationUnit {
  RADIANS_PER_SECOND_SQUARED = 'rad/s\u00B2',
  DEGREES_PER_SECOND_SQUARED = 'deg/s\u00B2',
}
export interface Force {
  x: number
  y: number
  z: number
  magnitude?: number
  unit: ForceUnit
}
export declare enum ForceUnit {
  NEWTONS = 'N',
  POUNDS = 'lbf',
  KILOGRAMS_FORCE = 'kgf',
}
export interface Torque {
  rx: number
  ry: number
  rz: number
  magnitude?: number
  unit: TorqueUnit
}
export declare enum TorqueUnit {
  NEWTON_METERS = 'Nm',
  FOOT_POUNDS = 'ft\u00B7lbf',
  KILOGRAM_METERS = 'kg\u00B7m',
}
export interface Temperature {
  ambient?: number
  motor?: MotorTemperature
  controller?: number
  unit: TemperatureUnit
}
export interface MotorTemperature {
  joint1?: number
  joint2?: number
  joint3?: number
  joint4?: number
  joint5?: number
  joint6?: number
  joint7?: number
  joint8?: number
}
export declare enum TemperatureUnit {
  CELSIUS = '\u00B0C',
  FAHRENHEIT = '\u00B0F',
  KELVIN = 'K',
}
export interface Voltage {
  supply: number
  motor?: MotorVoltage
  controller?: number
  unit: VoltageUnit
}
export interface MotorVoltage {
  joint1?: number
  joint2?: number
  joint3?: number
  joint4?: number
  joint5?: number
  joint6?: number
  joint7?: number
  joint8?: number
}
export declare enum VoltageUnit {
  VOLTS = 'V',
  MILLIVOLTS = 'mV',
}
export interface Current {
  total: number
  motor?: MotorCurrent
  controller?: number
  unit: CurrentUnit
}
export interface MotorCurrent {
  joint1?: number
  joint2?: number
  joint3?: number
  joint4?: number
  joint5?: number
  joint6?: number
  joint7?: number
  joint8?: number
}
export declare enum CurrentUnit {
  AMPERES = 'A',
  MILLIAMPERES = 'mA',
}
export interface Power {
  total: number
  motor?: MotorPower
  controller?: number
  unit: PowerUnit
}
export interface MotorPower {
  joint1?: number
  joint2?: number
  joint3?: number
  joint4?: number
  joint5?: number
  joint6?: number
  joint7?: number
  joint8?: number
}
export declare enum PowerUnit {
  WATTS = 'W',
  KILOWATTS = 'kW',
  HORSEPOWER = 'hp',
}
export interface ProgramState {
  currentProgram?: string
  currentLine?: number
  executionMode: ExecutionMode
  cycleTime?: number
  remainingTime?: number
  completionPercentage?: number
}
export declare enum ExecutionMode {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
  SINGLE_STEP = 'single_step',
  DRY_RUN = 'dry_run',
}
export interface ToolData {
  toolId?: string
  position?: Position
  force?: Force
  torque?: Torque
  temperature?: number
  active: boolean
  custom?: Record<string, any>
}
export interface SafetyData {
  emergencyStop: boolean
  protectiveStop: boolean
  reducedMode: boolean
  safetyZoneViolation: boolean
  doorOpen?: boolean
  lightCurtain?: boolean
  pressureMat?: boolean
  customSafety?: Record<string, boolean>
}
export interface TelemetryMetadata {
  source: TelemetrySource
  quality: DataQuality
  samplingRate?: number
  compression?: CompressionType
  checksum?: string
}
export declare enum TelemetrySource {
  ROBOT_CONTROLLER = 'robot_controller',
  EXTERNAL_SENSOR = 'external_sensor',
  SIMULATION = 'simulation',
  MANUAL_INPUT = 'manual_input',
}
export declare enum DataQuality {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  QUESTIONABLE = 'questionable',
}
export declare enum CompressionType {
  NONE = 'none',
  GZIP = 'gzip',
  LZ4 = 'lz4',
  ZSTD = 'zstd',
}
export interface TelemetryAggregation {
  robotId: string
  metric: string
  timeWindow: TimeWindow
  aggregationType: AggregationType
  value: number
  timestamp: Date
}
export declare enum TimeWindow {
  MINUTE = '1m',
  FIVE_MINUTES = '5m',
  FIFTEEN_MINUTES = '15m',
  HOUR = '1h',
  DAY = '1d',
  WEEK = '1w',
  MONTH = '1M',
}
export declare enum AggregationType {
  AVERAGE = 'avg',
  MINIMUM = 'min',
  MAXIMUM = 'max',
  SUM = 'sum',
  COUNT = 'count',
  STANDARD_DEVIATION = 'stddev',
  PERCENTILE_50 = 'p50',
  PERCENTILE_95 = 'p95',
  PERCENTILE_99 = 'p99',
}
export interface GPSPosition {
  latitude: number
  longitude: number
  altitude?: number
  heading?: number
  speed?: number
  accuracy?: GPSAccuracy
  timestamp: Date
  satelliteCount?: number
  hdop?: number
  fix?: GPSFixType
}
export interface GPSAccuracy {
  horizontal: number
  vertical?: number
  speed?: number
  heading?: number
}
export declare enum GPSFixType {
  NO_FIX = 'no_fix',
  GPS_2D = '2d',
  GPS_3D = '3d',
  DGPS = 'dgps',
  RTK_FLOAT = 'rtk_float',
  RTK_FIXED = 'rtk_fixed',
}
export interface NavigationData {
  waypoints?: Waypoint[]
  currentWaypoint?: number
  targetPosition?: GPSPosition
  pathDeviation?: number
  estimatedTimeToTarget?: number
  missionProgress?: number
  obstacleDetected?: boolean
  pathPlanningStatus?: PathPlanningStatus
}
export interface Waypoint {
  id: string
  position: GPSPosition
  type: WaypointType
  radius?: number
  speed?: number
  actions?: WaypointAction[]
  visited?: boolean
  visitedAt?: Date
}
export declare enum WaypointType {
  NORMAL = 'normal',
  START = 'start',
  END = 'end',
  CHECKPOINT = 'checkpoint',
  CHARGING_STATION = 'charging_station',
  WORK_ZONE = 'work_zone',
  SAFETY_ZONE = 'safety_zone',
  NO_GO_ZONE = 'no_go_zone',
}
export interface WaypointAction {
  type: WaypointActionType
  parameters?: Record<string, any>
  duration?: number
}
export declare enum WaypointActionType {
  STOP = 'stop',
  WAIT = 'wait',
  WORK = 'work',
  CHARGE = 'charge',
  TAKE_PHOTO = 'take_photo',
  COLLECT_SAMPLE = 'collect_sample',
  DEPLOY_TOOL = 'deploy_tool',
  CUSTOM = 'custom',
}
export declare enum PathPlanningStatus {
  IDLE = 'idle',
  PLANNING = 'planning',
  EXECUTING = 'executing',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EMERGENCY_STOP = 'emergency_stop',
}
export interface GeofenceZone {
  id: string
  name: string
  type: GeofenceType
  coordinates: GPSPosition[]
  active: boolean
  actions: GeofenceAction[]
  metadata?: Record<string, any>
}
export declare enum GeofenceType {
  INCLUSION = 'inclusion', // Robot must stay inside
  EXCLUSION = 'exclusion', // Robot must stay outside
  WARNING = 'warning', // Trigger warning when entered
  WORK_ZONE = 'work_zone', // Designated work area
  CHARGING_ZONE = 'charging_zone',
  SAFETY_ZONE = 'safety_zone',
}
export interface GeofenceAction {
  trigger: GeofenceTrigger
  action: GeofenceActionType
  parameters?: Record<string, any>
}
export declare enum GeofenceTrigger {
  ENTER = 'enter',
  EXIT = 'exit',
  DWELL = 'dwell',
}
export declare enum GeofenceActionType {
  ALERT = 'alert',
  STOP = 'stop',
  RETURN_TO_BASE = 'return_to_base',
  REDUCE_SPEED = 'reduce_speed',
  LOG_EVENT = 'log_event',
  CUSTOM = 'custom',
}
export interface FleetCoordination {
  fleetId: string
  robotId: string
  formation?: Formation
  communicationStatus: CommunicationStatus
  lastHeartbeat: Date
  sharedResources?: SharedResource[]
}
export interface Formation {
  type: FormationType
  role: FormationRole
  relativePosition?: RelativePosition
  leader?: string
  followers?: string[]
}
export declare enum FormationType {
  LINE = 'line',
  COLUMN = 'column',
  WEDGE = 'wedge',
  BOX = 'box',
  CUSTOM = 'custom',
}
export declare enum FormationRole {
  LEADER = 'leader',
  FOLLOWER = 'follower',
  SCOUT = 'scout',
  SUPPORT = 'support',
}
export interface RelativePosition {
  distance: number
  bearing: number
  elevation?: number
}
export declare enum CommunicationStatus {
  CONNECTED = 'connected',
  WEAK_SIGNAL = 'weak_signal',
  INTERMITTENT = 'intermittent',
  DISCONNECTED = 'disconnected',
}
export interface SharedResource {
  type: ResourceType
  id: string
  available: boolean
  reservedBy?: string
  reservedUntil?: Date
}
export declare enum ResourceType {
  CHARGING_STATION = 'charging_station',
  TOOL = 'tool',
  WORKSPACE = 'workspace',
  NETWORK_BANDWIDTH = 'network_bandwidth',
  PROCESSING_POWER = 'processing_power',
}
//# sourceMappingURL=telemetry.d.ts.map
