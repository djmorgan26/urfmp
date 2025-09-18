export interface Robot {
  id: string
  organizationId: string
  name: string
  model: string
  vendor: RobotVendor
  serialNumber: string
  firmwareVersion: string
  status: RobotStatus
  location?: RobotLocation
  configuration: RobotConfiguration
  lastSeen: Date
  createdAt: Date
  updatedAt: Date
}

export enum RobotVendor {
  UNIVERSAL_ROBOTS = 'universal_robots',
  KUKA = 'kuka',
  ABB = 'abb',
  FANUC = 'fanuc',
  YASKAWA = 'yaskawa',
  DOOSAN = 'doosan',
  TECHMAN = 'techman',
  CUSTOM = 'custom',
}

export enum RobotStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  ERROR = 'error',
  MAINTENANCE = 'maintenance',
  RUNNING = 'running',
  IDLE = 'idle',
  STOPPED = 'stopped',
  EMERGENCY_STOP = 'emergency_stop',
}

export interface RobotLocation {
  facility: string
  area: string
  cell: string
  coordinates?: {
    x: number
    y: number
    z?: number
  }
}

export interface RobotConfiguration {
  axes: number
  payload: number // kg
  reach: number // mm
  capabilities: RobotCapability[]
  customSettings: Record<string, any>
}

export enum RobotCapability {
  WELDING = 'welding',
  PAINTING = 'painting',
  ASSEMBLY = 'assembly',
  MATERIAL_HANDLING = 'material_handling',
  MACHINE_TENDING = 'machine_tending',
  PACKAGING = 'packaging',
  PALLETIZING = 'palletizing',
  INSPECTION = 'inspection',
  CUSTOM = 'custom',
}

export interface RobotCommand {
  id: string
  robotId: string
  type: RobotCommandType
  payload: Record<string, any>
  priority: CommandPriority
  status: CommandStatus
  scheduledAt?: Date
  executedAt?: Date
  completedAt?: Date
  error?: string
  createdAt: Date
}

export enum RobotCommandType {
  START = 'start',
  STOP = 'stop',
  PAUSE = 'pause',
  RESUME = 'resume',
  EMERGENCY_STOP = 'emergency_stop',
  RESET = 'reset',
  MOVE_TO_POSITION = 'move_to_position',
  RUN_PROGRAM = 'run_program',
  LOAD_PROGRAM = 'load_program',
  SET_SPEED = 'set_speed',
  CALIBRATE = 'calibrate',
  UPDATE_FIRMWARE = 'update_firmware',
  CUSTOM = 'custom',
}

export enum CommandPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum CommandStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  EXECUTING = 'executing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout',
}
