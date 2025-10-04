// Simulation Bridge Types for External Robot Connection

export interface SimulationBridgeConfig {
  type: 'rosbridge' | 'webots' | 'gazebo' | 'custom'
  url: string
  robotId: string
  organizationId: string
  userId: string
  apiKey?: string
}

export interface ROSMessage {
  op:
    | 'publish'
    | 'subscribe'
    | 'call_service'
    | 'advertise'
    | 'unadvertise'
    | 'advertise_service'
    | 'unadvertise_service'
  topic?: string
  type?: string
  msg?: any
  service?: string
  args?: any
  id?: string
}

export interface ROSBridgeConnection {
  id: string
  robotId: string
  status: 'connected' | 'disconnected' | 'error'
  connectedAt: Date
  lastMessageAt?: Date
  rosVersion?: 'ros1' | 'ros2'
  topics: string[]
  services: string[]
}

export interface SimulationRobotState {
  robotId: string
  position?: { x: number; y: number; z: number }
  orientation?: { x: number; y: number; z: number; w: number }
  velocity?: {
    linear: { x: number; y: number; z: number }
    angular: { x: number; y: number; z: number }
  }
  jointStates?: {
    name: string[]
    position: number[]
    velocity: number[]
    effort: number[]
  }
  sensorData?: {
    lidar?: { ranges: number[]; angle_min: number; angle_max: number; angle_increment: number }
    camera?: { format: string; data: string }
    imu?: {
      orientation: { x: number; y: number; z: number; w: number }
      angular_velocity: { x: number; y: number; z: number }
      linear_acceleration: { x: number; y: number; z: number }
    }
    gps?: { latitude: number; longitude: number; altitude: number }
  }
  timestamp: Date
}

export interface SimulationCommand {
  robotId: string
  type: 'move' | 'rotate' | 'joint_control' | 'gripper' | 'custom'
  target?: { x?: number; y?: number; z?: number; rotation?: number }
  joints?: { name: string; position: number }[]
  velocity?: {
    linear: { x: number; y: number; z: number }
    angular: { x: number; y: number; z: number }
  }
  customTopic?: string
  customMessage?: any
  timestamp: Date
}

export interface BridgeEvent {
  type: 'connection' | 'disconnection' | 'message' | 'error' | 'telemetry'
  robotId: string
  data?: any
  error?: string
  timestamp: Date
}

// ROS Topic Mappings for common robot types
export const ROS_TOPIC_MAPPINGS = {
  // TurtleBot / Mobile Robots
  mobile: {
    cmd_vel: '/cmd_vel',
    odom: '/odom',
    scan: '/scan',
    joint_states: '/joint_states',
    camera: '/camera/rgb/image_raw',
  },
  // UR5 / Manipulator Arms
  manipulator: {
    joint_states: '/joint_states',
    joint_trajectory: '/arm_controller/follow_joint_trajectory',
    gripper_command: '/gripper_controller/gripper_cmd',
    wrench: '/wrench',
  },
  // Drones / Quadcopters
  drone: {
    cmd_vel: '/cmd_vel',
    pose: '/mavros/local_position/pose',
    battery: '/mavros/battery',
    gps: '/mavros/global_position/global',
    imu: '/mavros/imu/data',
  },
} as const

// Message type mappings
export const ROS_MESSAGE_TYPES = {
  cmd_vel: 'geometry_msgs/Twist',
  odom: 'nav_msgs/Odometry',
  scan: 'sensor_msgs/LaserScan',
  joint_states: 'sensor_msgs/JointState',
  image: 'sensor_msgs/Image',
  imu: 'sensor_msgs/Imu',
  gps: 'sensor_msgs/NavSatFix',
  pose: 'geometry_msgs/PoseStamped',
  point: 'geometry_msgs/Point',
  quaternion: 'geometry_msgs/Quaternion',
} as const

export interface SimulationBridgeMetrics {
  robotId: string
  messagesSent: number
  messagesReceived: number
  avgLatency: number
  connectionUptime: number
  lastError?: string
  bandwidth: {
    incoming: number // bytes/sec
    outgoing: number // bytes/sec
  }
}
