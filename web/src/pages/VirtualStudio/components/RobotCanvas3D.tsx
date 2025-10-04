import React, { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { SimpleBot, UR5Arm, Drone } from './RobotModels'
import { RobotTrail } from './PhysicsSimulator'
import { EnvironmentScene, environmentConfigs, type EnvironmentType } from './EnvironmentSelector'
import { RobotSensorSuite } from './RobotSensors'

type RobotType = 'simple' | 'ur5' | 'drone'

interface RobotCanvas3DProps {
  isPlaying: boolean
  position?: { x: number; y: number; z: number }
  rotation?: number
  robotType?: RobotType
  environment?: EnvironmentType
  enabledSensors?: {
    camera?: boolean
    lidar?: boolean
    imu?: boolean
    distance?: boolean
    gps?: boolean
  }
}

const RobotCanvas3D: React.FC<RobotCanvas3DProps> = ({
  isPlaying,
  position,
  rotation,
  robotType = 'simple',
  environment = 'warehouse',
  enabledSensors = { camera: true, lidar: true, imu: true },
}) => {
  const [robotTrail, setRobotTrail] = useState<Array<{ x: number; y: number; z: number }>>([])
  const [collidingObstacles, setCollidingObstacles] = useState<Set<number>>(new Set())

  const RobotComponent = {
    simple: SimpleBot,
    ur5: UR5Arm,
    drone: Drone,
  }[robotType]

  const envConfig = environmentConfigs[environment]

  // Track robot movement for trail
  React.useEffect(() => {
    if (position && isPlaying) {
      setRobotTrail((prev) => [...prev, position].slice(-100)) // Keep last 100 positions
    }
  }, [position, isPlaying])

  // Clear trail when environment changes
  React.useEffect(() => {
    setRobotTrail([])
  }, [environment])

  const handleCollision = useCallback((obstacleIndex: number) => {
    setCollidingObstacles((prev) => new Set(prev).add(obstacleIndex))
    setTimeout(() => {
      setCollidingObstacles((prev) => {
        const next = new Set(prev)
        next.delete(obstacleIndex)
        return next
      })
    }, 500)
  }, [])

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        shadows
        className="bg-gray-50 dark:bg-gray-900"
      >
        {/* Lighting */}
        <ambientLight intensity={envConfig.ambientIntensity} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.5} />

        {/* Grid floor */}
        <Grid
          args={[20, 20]}
          cellSize={1}
          cellThickness={0.5}
          cellColor={envConfig.gridColor}
          sectionSize={5}
          sectionThickness={1}
          sectionColor={envConfig.gridSectionColor}
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={false}
        />

        {/* Robot */}
        <RobotComponent position={position} rotation={rotation} />

        {/* Robot sensors */}
        {position && (
          <RobotSensorSuite
            robotPosition={position}
            robotRotation={rotation || 0}
            enabledSensors={enabledSensors}
          />
        )}

        {/* Robot movement trail */}
        {robotTrail.length > 1 && (
          <RobotTrail
            positions={robotTrail}
            color={robotType === 'simple' ? '#3b82f6' : robotType === 'ur5' ? '#ef4444' : '#10b981'}
          />
        )}

        {/* Environment-specific obstacles */}
        <EnvironmentScene environment={environment} collidingObstacles={collidingObstacles} />

        {/* Camera controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2}
        />

        {/* Axes helper */}
        <axesHelper args={[5]} />
      </Canvas>
    </div>
  )
}

export default RobotCanvas3D
