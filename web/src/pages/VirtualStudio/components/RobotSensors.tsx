// @ts-nocheck - React Three Fiber geometry props have type incompatibilities
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Cone, Line } from '@react-three/drei'
import * as THREE from 'three'

interface SensorProps {
  robotPosition: { x: number; y: number; z: number }
  robotRotation: number
  enabled?: boolean
}

/**
 * Camera sensor with FOV cone visualization
 */
export const CameraSensor: React.FC<SensorProps & { fov?: number; range?: number }> = ({
  robotPosition,
  robotRotation,
  enabled = true,
  fov = 60,
  range = 5,
}) => {
  if (!enabled) return null

  const fovRadians = (fov * Math.PI) / 180
  const coneRadius = Math.tan(fovRadians / 2) * range

  return (
    <group
      position={[robotPosition.x, robotPosition.y + 0.3, robotPosition.z]}
      rotation={[Math.PI / 2, 0, (robotRotation * Math.PI) / 180]}
    >
      {/* Camera FOV cone */}
      <Cone args={[coneRadius, range, 8, 1, true]} position={[0, range / 2, 0]}>
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.2} side={THREE.DoubleSide} />
      </Cone>
      {/* Camera lens indicator */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
        <meshStandardMaterial color="#1e40af" emissive="#3b82f6" emissiveIntensity={0.5} />
      </mesh>
      {/* FOV wireframe */}
      <lineSegments>
        <edgesGeometry args={[new THREE.ConeGeometry(coneRadius, range, 8, 1, true) as any]} />
        <lineBasicMaterial color="#3b82f6" opacity={0.6} transparent />
      </lineSegments>
    </group>
  )
}

/**
 * LIDAR sensor with ray visualization
 */
export const LIDARSensor: React.FC<
  SensorProps & { rayCount?: number; range?: number; scanRate?: number }
> = ({ robotPosition, robotRotation, enabled = true, rayCount = 12, range = 8, scanRate = 1 }) => {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (groupRef.current && enabled) {
      groupRef.current.rotation.y += delta * scanRate
    }
  })

  if (!enabled) return null

  const rays: Array<[number, number, number][]> = []
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2
    const x = Math.cos(angle) * range
    const z = Math.sin(angle) * range
    rays.push([
      [0, 0, 0],
      [x, 0, z],
    ])
  }

  return (
    <group
      ref={groupRef}
      position={[robotPosition.x, robotPosition.y + 0.5, robotPosition.z]}
      rotation={[0, (robotRotation * Math.PI) / 180, 0]}
    >
      {/* LIDAR housing */}
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, 0.15, 16]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.3} />
      </mesh>

      {/* LIDAR rays */}
      {rays.map((points, index) => (
        <Line key={index} points={points} color="#34d399" lineWidth={1} transparent opacity={0.4} />
      ))}

      {/* Center point indicator */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#6ee7b7" emissive="#10b981" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

/**
 * IMU (Inertial Measurement Unit) orientation indicator
 */
export const IMUSensor: React.FC<SensorProps & { showAxes?: boolean }> = ({
  robotPosition,
  robotRotation,
  enabled = true,
  showAxes = true,
}) => {
  if (!enabled) return null

  const axisLength = 0.8

  return (
    <group
      position={[robotPosition.x, robotPosition.y, robotPosition.z]}
      rotation={[0, (robotRotation * Math.PI) / 180, 0]}
    >
      {/* IMU housing */}
      <mesh>
        <boxGeometry args={[0.15, 0.15, 0.15]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.3} />
      </mesh>

      {showAxes && (
        <>
          {/* X-axis (Red) */}
          <Line
            points={[
              [0, 0, 0],
              [axisLength, 0, 0],
            ]}
            color="#ef4444"
            lineWidth={3}
          />
          <mesh position={[axisLength, 0, 0]}>
            <coneGeometry args={[0.08, 0.2, 8]} rotation={[0, 0, -Math.PI / 2]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>

          {/* Y-axis (Green) */}
          <Line
            points={[
              [0, 0, 0],
              [0, axisLength, 0],
            ]}
            color="#10b981"
            lineWidth={3}
          />
          <mesh position={[0, axisLength, 0]} rotation={[0, 0, 0]}>
            <coneGeometry args={[0.08, 0.2, 8]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>

          {/* Z-axis (Blue) */}
          <Line
            points={[
              [0, 0, 0],
              [0, 0, axisLength],
            ]}
            color="#3b82f6"
            lineWidth={3}
          />
          <mesh position={[0, 0, axisLength]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.08, 0.2, 8]} />
            <meshBasicMaterial color="#3b82f6" />
          </mesh>
        </>
      )}
    </group>
  )
}

/**
 * Ultrasonic/Distance sensor
 */
export const DistanceSensor: React.FC<SensorProps & { range?: number }> = ({
  robotPosition,
  robotRotation,
  enabled = true,
  range = 3,
}) => {
  if (!enabled) return null

  return (
    <group
      position={[robotPosition.x, robotPosition.y + 0.2, robotPosition.z]}
      rotation={[0, (robotRotation * Math.PI) / 180, 0]}
    >
      {/* Sensor housing */}
      <mesh position={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.08, 0.08, 0.15, 16]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.4} />
      </mesh>

      {/* Detection cone */}
      <mesh position={[0, 0, 0.3 + range / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.5, range, 8, 1, true]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>

      {/* Sensor beam indicator */}
      <Line
        points={[
          [0, 0, 0.3],
          [0, 0, 0.3 + range],
        ]}
        color="#a78bfa"
        lineWidth={2}
        transparent
        opacity={0.5}
        dashed
        dashScale={2}
      />
    </group>
  )
}

/**
 * GPS sensor indicator
 */
export const GPSSensor: React.FC<SensorProps & { signalStrength?: number }> = ({
  robotPosition,
  enabled = true,
  signalStrength = 1,
}) => {
  const ringRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (ringRef.current && enabled) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.5
    }
  })

  if (!enabled) return null

  return (
    <group position={[robotPosition.x, robotPosition.y + 1.5, robotPosition.z]}>
      {/* GPS antenna */}
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
        <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.5} />
      </mesh>

      {/* Signal rings */}
      <group ref={ringRef}>
        {[0.3, 0.6, 0.9].map((radius, index) => (
          <mesh
            key={index}
            position={[0, 0.2, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={signalStrength}
          >
            <ringGeometry args={[radius, radius + 0.05, 16]} />
            <meshBasicMaterial
              color="#0ea5e9"
              transparent
              opacity={0.3 - index * 0.1}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/**
 * Composite sensor suite
 */
export const RobotSensorSuite: React.FC<{
  robotPosition: { x: number; y: number; z: number }
  robotRotation: number
  enabledSensors?: {
    camera?: boolean
    lidar?: boolean
    imu?: boolean
    distance?: boolean
    gps?: boolean
  }
}> = ({ robotPosition, robotRotation, enabledSensors = {} }) => {
  const { camera = true, lidar = true, imu = true, distance = false, gps = false } = enabledSensors

  return (
    <>
      {camera && <CameraSensor robotPosition={robotPosition} robotRotation={robotRotation} />}
      {lidar && <LIDARSensor robotPosition={robotPosition} robotRotation={robotRotation} />}
      {imu && <IMUSensor robotPosition={robotPosition} robotRotation={robotRotation} />}
      {distance && <DistanceSensor robotPosition={robotPosition} robotRotation={robotRotation} />}
      {gps && <GPSSensor robotPosition={robotPosition} robotRotation={robotRotation} />}
    </>
  )
}

export default RobotSensorSuite
