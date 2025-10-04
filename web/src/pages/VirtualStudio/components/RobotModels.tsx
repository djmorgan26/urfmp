import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Sphere, Cylinder, Torus } from '@react-three/drei'
import * as THREE from 'three'

interface RobotProps {
  position?: { x: number; y: number; z: number }
  rotation?: number
}

// Simple wheeled robot
export const SimpleBot: React.FC<RobotProps> = ({
  position: targetPosition,
  rotation: targetRotation,
}) => {
  const robotRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (robotRef.current && targetPosition) {
      robotRef.current.position.x += (targetPosition.x - robotRef.current.position.x) * delta * 5
      robotRef.current.position.y += (targetPosition.y - robotRef.current.position.y) * delta * 5
      robotRef.current.position.z += (targetPosition.z - robotRef.current.position.z) * delta * 5

      if (targetRotation !== undefined) {
        const targetRad = (targetRotation * Math.PI) / 180
        robotRef.current.rotation.y += (targetRad - robotRef.current.rotation.y) * delta * 5
      }
    }
  })

  return (
    <group ref={robotRef} position={[0, 0.5, 0]}>
      {/* Robot body */}
      <Box args={[1, 0.5, 1.5]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#3b82f6" />
      </Box>

      {/* Robot head/sensor */}
      <Sphere args={[0.3, 32, 32]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#60a5fa" />
      </Sphere>

      {/* Wheels */}
      <Sphere args={[0.2, 16, 16]} position={[0.5, -0.3, 0.5]}>
        <meshStandardMaterial color="#1f2937" />
      </Sphere>
      <Sphere args={[0.2, 16, 16]} position={[-0.5, -0.3, 0.5]}>
        <meshStandardMaterial color="#1f2937" />
      </Sphere>
      <Sphere args={[0.2, 16, 16]} position={[0.5, -0.3, -0.5]}>
        <meshStandardMaterial color="#1f2937" />
      </Sphere>
      <Sphere args={[0.2, 16, 16]} position={[-0.5, -0.3, -0.5]}>
        <meshStandardMaterial color="#1f2937" />
      </Sphere>
    </group>
  )
}

// UR5 robotic arm
export const UR5Arm: React.FC<RobotProps> = ({
  position: targetPosition,
  rotation: targetRotation,
}) => {
  const armRef = useRef<THREE.Group>(null)
  const joint1Ref = useRef<THREE.Group>(null)
  const joint2Ref = useRef<THREE.Group>(null)
  const joint3Ref = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (armRef.current && targetPosition) {
      armRef.current.position.x += (targetPosition.x - armRef.current.position.x) * delta * 5
      armRef.current.position.z += (targetPosition.z - armRef.current.position.z) * delta * 5
    }

    // Animate joints
    if (joint1Ref.current) {
      joint1Ref.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.5
    }
    if (joint2Ref.current) {
      joint2Ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.3
    }
    if (joint3Ref.current) {
      joint3Ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.2) * 0.3
    }
  })

  return (
    <group ref={armRef} position={[0, 0, 0]}>
      {/* Base */}
      <Cylinder args={[0.5, 0.5, 0.2, 32]} position={[0, 0.1, 0]}>
        <meshStandardMaterial color="#dc2626" />
      </Cylinder>

      {/* Joint 1 - Rotating base */}
      <group ref={joint1Ref} position={[0, 0.2, 0]}>
        <Cylinder args={[0.15, 0.15, 0.8, 16]} position={[0, 0.4, 0]}>
          <meshStandardMaterial color="#ef4444" />
        </Cylinder>

        {/* Joint 2 - First arm segment */}
        <group ref={joint2Ref} position={[0, 0.8, 0]}>
          <Box args={[0.2, 1.2, 0.2]} position={[0.6, 0, 0]}>
            <meshStandardMaterial color="#f87171" />
          </Box>

          {/* Joint 3 - Second arm segment */}
          <group ref={joint3Ref} position={[1.2, 0, 0]}>
            <Box args={[0.15, 0.8, 0.15]} position={[0.4, 0, 0]}>
              <meshStandardMaterial color="#fca5a5" />
            </Box>

            {/* End effector */}
            <Sphere args={[0.15, 16, 16]} position={[0.8, 0, 0]}>
              <meshStandardMaterial color="#fecaca" />
            </Sphere>
          </group>
        </group>
      </group>
    </group>
  )
}

// Quadcopter drone
export const Drone: React.FC<RobotProps> = ({
  position: targetPosition,
  rotation: targetRotation,
}) => {
  const droneRef = useRef<THREE.Group>(null)
  const propeller1Ref = useRef<THREE.Group>(null)
  const propeller2Ref = useRef<THREE.Group>(null)
  const propeller3Ref = useRef<THREE.Group>(null)
  const propeller4Ref = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (droneRef.current && targetPosition) {
      droneRef.current.position.x += (targetPosition.x - droneRef.current.position.x) * delta * 5
      droneRef.current.position.y += (targetPosition.y - droneRef.current.position.y) * delta * 5
      droneRef.current.position.z += (targetPosition.z - droneRef.current.position.z) * delta * 5

      if (targetRotation !== undefined) {
        const targetRad = (targetRotation * Math.PI) / 180
        droneRef.current.rotation.y += (targetRad - droneRef.current.rotation.y) * delta * 5
      }

      // Slight hovering animation
      droneRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.01
    }

    // Spin propellers
    const propellers = [propeller1Ref, propeller2Ref, propeller3Ref, propeller4Ref]
    propellers.forEach((ref) => {
      if (ref.current) {
        ref.current.rotation.y += delta * 20
      }
    })
  })

  return (
    <group ref={droneRef} position={[0, 2, 0]}>
      {/* Main body */}
      <Box args={[0.6, 0.2, 0.6]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#10b981" />
      </Box>

      {/* Arms */}
      <Cylinder args={[0.05, 0.05, 1.2, 8]} position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#059669" />
      </Cylinder>
      <Cylinder
        args={[0.05, 0.05, 1.2, 8]}
        position={[0, 0, 0]}
        rotation={[0, Math.PI / 2, Math.PI / 2]}
      >
        <meshStandardMaterial color="#059669" />
      </Cylinder>

      {/* Propellers */}
      <group ref={propeller1Ref} position={[0.6, 0.15, 0.6]}>
        <Torus args={[0.2, 0.02, 8, 32]}>
          <meshStandardMaterial color="#34d399" />
        </Torus>
      </group>
      <group ref={propeller2Ref} position={[-0.6, 0.15, 0.6]}>
        <Torus args={[0.2, 0.02, 8, 32]}>
          <meshStandardMaterial color="#34d399" />
        </Torus>
      </group>
      <group ref={propeller3Ref} position={[0.6, 0.15, -0.6]}>
        <Torus args={[0.2, 0.02, 8, 32]}>
          <meshStandardMaterial color="#34d399" />
        </Torus>
      </group>
      <group ref={propeller4Ref} position={[-0.6, 0.15, -0.6]}>
        <Torus args={[0.2, 0.02, 8, 32]}>
          <meshStandardMaterial color="#34d399" />
        </Torus>
      </group>

      {/* Camera/sensor */}
      <Sphere args={[0.1, 16, 16]} position={[0, -0.15, 0]}>
        <meshStandardMaterial color="#6ee7b7" emissive="#10b981" emissiveIntensity={0.5} />
      </Sphere>
    </group>
  )
}
