import React, { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { SimpleBot, UR5Arm, Drone } from './RobotModels'
import { RobotTrail } from './PhysicsSimulator'
import { EnvironmentScene, environmentConfigs, type EnvironmentType } from './EnvironmentSelector'
import { RobotSensorSuite } from './RobotSensors'
import type { Robot } from '../hooks/useMultiRobotManager'

type RobotType = 'simple' | 'ur5' | 'drone'

interface RobotCanvas3DProps {
  isPlaying: boolean
  robots?: Robot[]
  activeRobotId?: string
  // Legacy single robot support
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

const RobotRenderer: React.FC<{
  robot: Robot
  isActive: boolean
  showSensors: boolean
  enabledSensors: any
}> = ({ robot, isActive, showSensors, enabledSensors }) => {
  const RobotComponent = {
    simple: SimpleBot,
    ur5: UR5Arm,
    drone: Drone,
  }[robot.type]

  return (
    <>
      {/* Robot with selection indicator */}
      <group>
        <RobotComponent position={robot.position} rotation={robot.rotation} />

        {/* Active robot indicator ring */}
        {isActive && (
          <mesh
            position={[robot.position.x, robot.position.y - 0.4, robot.position.z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[0.8, 1, 32]} />
            <meshBasicMaterial color={robot.color} transparent opacity={0.6} />
          </mesh>
        )}
      </group>

      {/* Sensors for active robot only */}
      {isActive && showSensors && (
        <RobotSensorSuite
          robotPosition={robot.position}
          robotRotation={robot.rotation}
          enabledSensors={enabledSensors}
        />
      )}
    </>
  )
}

const RobotCanvas3D: React.FC<RobotCanvas3DProps> = ({
  isPlaying,
  robots,
  activeRobotId,
  position,
  rotation,
  robotType = 'simple',
  environment = 'warehouse',
  enabledSensors = { camera: true, lidar: true, imu: true },
}) => {
  const [robotTrails, setRobotTrails] = useState<
    Record<string, Array<{ x: number; y: number; z: number }>>
  >({})
  const [collidingObstacles, setCollidingObstacles] = useState<Set<number>>(new Set())

  const envConfig = environmentConfigs[environment]

  // Multi-robot mode
  const isMultiRobotMode = robots && robots.length > 0

  // Track robot movements for trails (multi-robot)
  React.useEffect(() => {
    if (isMultiRobotMode && isPlaying) {
      robots.forEach((robot) => {
        setRobotTrails((prev) => ({
          ...prev,
          [robot.id]: [...(prev[robot.id] || []), robot.position].slice(-100),
        }))
      })
    }
  }, [robots, isPlaying, isMultiRobotMode])

  // Track single robot movement for trail (legacy)
  React.useEffect(() => {
    if (!isMultiRobotMode && position && isPlaying) {
      setRobotTrails((prev) => ({
        ...prev,
        single: [...(prev.single || []), position].slice(-100),
      }))
    }
  }, [position, isPlaying, isMultiRobotMode])

  // Clear trails when environment changes
  React.useEffect(() => {
    setRobotTrails({})
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

        {/* Multi-robot rendering */}
        {isMultiRobotMode ? (
          <>
            {robots.map((robot) => (
              <React.Fragment key={robot.id}>
                <RobotRenderer
                  robot={robot}
                  isActive={robot.id === activeRobotId}
                  showSensors={true}
                  enabledSensors={enabledSensors}
                />

                {/* Robot trail */}
                {robotTrails[robot.id] && robotTrails[robot.id].length > 1 && (
                  <RobotTrail positions={robotTrails[robot.id]} color={robot.color} />
                )}
              </React.Fragment>
            ))}
          </>
        ) : (
          <>
            {/* Legacy single robot mode */}
            {position && (
              <>
                <group>
                  {(() => {
                    const RobotComponent = {
                      simple: SimpleBot,
                      ur5: UR5Arm,
                      drone: Drone,
                    }[robotType]
                    return <RobotComponent position={position} rotation={rotation} />
                  })()}
                </group>

                {/* Robot sensors */}
                <RobotSensorSuite
                  robotPosition={position}
                  robotRotation={rotation || 0}
                  enabledSensors={enabledSensors}
                />

                {/* Robot movement trail */}
                {robotTrails.single && robotTrails.single.length > 1 && (
                  <RobotTrail
                    positions={robotTrails.single}
                    color={
                      robotType === 'simple'
                        ? '#3b82f6'
                        : robotType === 'ur5'
                          ? '#ef4444'
                          : '#10b981'
                    }
                  />
                )}
              </>
            )}
          </>
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
