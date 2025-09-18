// Universal Robots specific types

export interface URConfig {
  host: string
  dashboardPort?: number // Default: 29999
  realTimePort?: number // Default: 30003
  primaryPort?: number // Default: 30001 (script execution)
  secondaryPort?: number // Default: 30002 (script execution)
  username?: string
  password?: string
  timeout?: number
}

export interface URRobotState {
  timestamp: number
  q_target: number[] // Target joint positions (rad)
  qd_target: number[] // Target joint velocities (rad/s)
  qdd_target: number[] // Target joint accelerations (rad/s^2)
  i_target: number[] // Target joint currents (A)
  m_target: number[] // Target joint moments (Nm)
  q_actual: number[] // Actual joint positions (rad)
  qd_actual: number[] // Actual joint velocities (rad/s)
  i_actual: number[] // Actual joint currents (A)
  i_control: number[] // Joint control currents (A)
  tool_vector_actual: number[] // Actual Cartesian coordinates (m, rad)
  tcp_speed_actual: number[] // Actual speed of TCP (m/s, rad/s)
  tcp_force: number[] // Generalized forces in TCP (N, Nm)
  tool_vector_target: number[] // Target Cartesian coordinates (m, rad)
  tcp_speed_target: number[] // Target speed of TCP (m/s, rad/s)
  digital_input_bits: number // Current state of digital inputs
  motor_temperatures: number[] // Temperature of each joint (°C)
  controller_timer: number // Controller real-time thread execution time
  test_value: number // Test value for debugging
  robot_mode: number // Robot mode
  joint_modes: number[] // Joint control modes
  safety_mode: number // Safety mode
  safety_status: number[] // Safety status bits
  tool_accelerometer_values: number[] // Tool accelerometer values
  speed_scaling: number // Speed scaling of the trajectory limiter
  linear_momentum_norm: number // Norm of Cartesian linear momentum
  v_main: number // Masterboard: main voltage
  v_robot: number // Masterboard: robot voltage (48V)
  i_robot: number // Masterboard: robot current
  v_actual: number[] // Actual joint voltages
  digital_outputs: number // Digital outputs
  program_state: number // Program state
  elbow_position: number[] // Elbow position
  elbow_velocity: number[] // Elbow velocity
}

export interface URProgramInfo {
  programName: string
  programState: 'STOPPED' | 'PLAYING' | 'PAUSED'
  lineNumber?: number
  remainingTime?: number
}

export interface URSafetyInfo {
  safetyMode:
    | 'NORMAL'
    | 'REDUCED'
    | 'PROTECTIVE_STOP'
    | 'RECOVERY'
    | 'SAFEGUARD_STOP'
    | 'SYSTEM_EMERGENCY_STOP'
    | 'ROBOT_EMERGENCY_STOP'
    | 'VIOLATION'
    | 'FAULT'
  safetyStatus: string[]
  emergencyStopPressed: boolean
  protectiveStopTriggered: boolean
}

export enum URRobotMode {
  ROBOT_MODE_NO_CONTROLLER = -1,
  ROBOT_MODE_DISCONNECTED = 0,
  ROBOT_MODE_CONFIRM_SAFETY = 1,
  ROBOT_MODE_BOOTING = 2,
  ROBOT_MODE_POWER_OFF = 3,
  ROBOT_MODE_POWER_ON = 4,
  ROBOT_MODE_IDLE = 5,
  ROBOT_MODE_BACKDRIVE = 6,
  ROBOT_MODE_RUNNING = 7,
  ROBOT_MODE_UPDATING_FIRMWARE = 8,
}

export enum URSafetyMode {
  SAFETY_MODE_NORMAL = 1,
  SAFETY_MODE_REDUCED = 2,
  SAFETY_MODE_PROTECTIVE_STOP = 3,
  SAFETY_MODE_RECOVERY = 4,
  SAFETY_MODE_SAFEGUARD_STOP = 5,
  SAFETY_MODE_SYSTEM_EMERGENCY_STOP = 6,
  SAFETY_MODE_ROBOT_EMERGENCY_STOP = 7,
  SAFETY_MODE_VIOLATION = 8,
  SAFETY_MODE_FAULT = 9,
}

export interface URJointInfo {
  position: number // radians
  velocity: number // rad/s
  current: number // amperes
  voltage: number // volts
  temperature: number // celsius
  mode: number // joint mode
}

export interface URToolInfo {
  position: number[] // [x, y, z, rx, ry, rz] in meters and radians
  velocity: number[] // [vx, vy, vz, rx, ry, rz] in m/s and rad/s
  force: number[] // [fx, fy, fz, mx, my, mz] in N and Nm
  accelerometer: number[] // [ax, ay, az] in m/s²
}

export interface URErrorInfo {
  errorCode?: number
  errorMessage?: string
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
  timestamp: Date
}
