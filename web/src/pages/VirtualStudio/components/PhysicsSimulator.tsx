// @ts-nocheck - Three.js and React Three Fiber have complex type incompatibilities
import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'

interface PhysicsSimulatorProps {
  robotPosition: { x: number; y: number; z: number }
  robotType: 'simple' | 'ur5' | 'drone'
  obstacles: Array<{ position: [number, number, number]; size: [number, number, number] }>
  onCollision?: (obstacleIndex: number) => void
  onPositionUpdate?: (position: { x: number; y: number; z: number }) => void
}

/**
 * Physics simulation utilities for virtual robots
 * Handles collision detection, ground constraints, and physics-based movement
 */
export const usePhysicsSimulation = ({
  robotPosition,
  robotType,
  obstacles,
  onCollision,
  onPositionUpdate,
}: PhysicsSimulatorProps) => {
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0))
  const lastPositionRef = useRef(new THREE.Vector3(0, 0, 0))

  // Robot bounding box sizes
  const robotSizes = {
    simple: new THREE.Vector3(1, 0.5, 1.5),
    ur5: new THREE.Vector3(0.5, 2, 0.5),
    drone: new THREE.Vector3(0.6, 0.2, 0.6),
  }

  const robotSize = robotSizes[robotType]

  // Check collision with obstacles
  const checkCollisions = (position: THREE.Vector3): boolean => {
    const robotBox = new THREE.Box3(
      new THREE.Vector3(
        position.x - robotSize.x / 2,
        position.y - robotSize.y / 2,
        position.z - robotSize.z / 2
      ),
      new THREE.Vector3(
        position.x + robotSize.x / 2,
        position.y + robotSize.y / 2,
        position.z + robotSize.z / 2
      )
    )

    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i]
      const obstacleBox = new THREE.Box3(
        new THREE.Vector3(
          obs.position[0] - obs.size[0] / 2,
          obs.position[1] - obs.size[1] / 2,
          obs.position[2] - obs.size[2] / 2
        ),
        new THREE.Vector3(
          obs.position[0] + obs.size[0] / 2,
          obs.position[1] + obs.size[1] / 2,
          obs.position[2] + obs.size[2] / 2
        )
      )

      if (robotBox.intersectsBox(obstacleBox)) {
        onCollision?.(i)
        return true
      }
    }

    return false
  }

  // Apply ground constraint (except for drones)
  const applyGroundConstraint = (position: THREE.Vector3): THREE.Vector3 => {
    if (robotType === 'drone') {
      // Drones can fly but have a minimum height
      position.y = Math.max(position.y, 1.0)
    } else {
      // Ground robots stay on ground
      position.y = robotSize.y / 2
    }
    return position
  }

  // Apply physics updates
  const updatePhysics = (targetPosition: {
    x: number
    y: number
    z: number
  }): {
    x: number
    y: number
    z: number
  } => {
    const current = lastPositionRef.current
    const target = new THREE.Vector3(targetPosition.x, targetPosition.y, targetPosition.z)

    // Calculate velocity
    velocityRef.current.lerp(
      new THREE.Vector3(target.x - current.x, target.y - current.y, target.z - current.z),
      0.1
    )

    // Apply velocity to position
    const newPosition = current.clone().add(velocityRef.current.multiplyScalar(0.1))

    // Apply ground constraint
    applyGroundConstraint(newPosition)

    // Check collisions
    const hasCollision = checkCollisions(newPosition)

    if (hasCollision) {
      // Bounce back on collision
      velocityRef.current.multiplyScalar(-0.5)
      return { x: current.x, y: current.y, z: current.z }
    }

    // Update last position
    lastPositionRef.current.copy(newPosition)

    const result = { x: newPosition.x, y: newPosition.y, z: newPosition.z }
    onPositionUpdate?.(result)

    return result
  }

  return { updatePhysics, checkCollisions, applyGroundConstraint }
}

/**
 * Path trail visualization for robot movement
 */
export const RobotTrail: React.FC<{
  positions: Array<{ x: number; y: number; z: number }>
  color?: string
  maxPoints?: number
}> = ({ positions, color = '#3b82f6', maxPoints = 100 }) => {
  const points = positions.slice(-maxPoints).map((pos) => new THREE.Vector3(pos.x, pos.y, pos.z))

  if (points.length < 2) return null

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color={color} linewidth={2} opacity={0.6} transparent />
    </line>
  )
}

/**
 * Interactive obstacle component
 */
export const InteractiveObstacle: React.FC<{
  position: [number, number, number]
  size: [number, number, number]
  color?: string
  isColliding?: boolean
}> = ({ position, size, color = '#ef4444', isColliding = false }) => {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={isColliding ? '#dc2626' : color}
        emissive={isColliding ? '#dc2626' : '#000000'}
        emissiveIntensity={isColliding ? 0.5 : 0}
      />
    </mesh>
  )
}

export default usePhysicsSimulation
