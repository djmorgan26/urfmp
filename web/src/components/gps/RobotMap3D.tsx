import { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { useURFMP } from '../../hooks/useURFMP'
import { useTheme } from '../../contexts/ThemeContext'
import { cn } from '../../lib/utils'
import { Robot } from '@urfmp/types'
import { Geofence } from '../../hooks/useGeofencing'
import * as THREE from 'three'
import { Satellite, Target, Home } from 'lucide-react'

interface GPSPosition {
  latitude: number
  longitude: number
  altitude?: number
  heading?: number
  speed?: number
  accuracy?: {
    horizontal?: number
    vertical?: number
  }
  timestamp?: Date
  satelliteCount?: number
  fix?: string
}

interface RobotGPSData {
  robotId: string
  position: GPSPosition
  timestamp: Date
}

interface RobotMap3DProps {
  robots: Robot[]
  selectedRobotId?: string
  onRobotSelect?: (robotId: string) => void
  geofences?: Geofence[]
  showPaths?: boolean
  showGeofences?: boolean
  className?: string
}

interface RobotGPSData {
  robotId: string
  position: GPSPosition
  timestamp: Date
}

// Convert GPS coordinates to 3D position on sphere
const gpsTo3D = (lat: number, lng: number, radius: number = 5) => {
  const phi = (90 - lat) * (Math.PI / 180) // latitude to spherical coordinate
  const theta = (lng + 180) * (Math.PI / 180) // longitude to spherical coordinate

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)

  return new THREE.Vector3(x, y, z)
}

// Get robot color based on status
const getRobotColor = (status: string): string => {
  switch (status) {
    case 'online':
    case 'running':
      return '#10b981' // green
    case 'idle':
      return '#f59e0b' // yellow
    case 'offline':
      return '#6b7280' // gray
    case 'error':
    case 'emergency_stop':
      return '#ef4444' // red
    case 'charging':
      return '#3b82f6' // blue
    default:
      return '#ffffff' // white
  }
}

// 3D Earth component
function Earth({ isDark }: { isDark: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)

  useFrame((_state, delta) => {
    meshRef.current.rotation.y += delta * 0.05 // Slower rotation

    // Subtle breathing effect
    const scale = 1 + Math.sin(_state.clock.elapsedTime * 0.5) * 0.01
    meshRef.current.scale.setScalar(scale)
  })

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[5, 64, 64]} />
      <meshStandardMaterial
        color={isDark ? '#1f2937' : '#3b82f6'}
        wireframe={false}
        transparent
        opacity={hovered ? 0.9 : 0.8}
        emissive={hovered ? (isDark ? '#0f172a' : '#1e40af') : '#000000'}
        emissiveIntensity={hovered ? 0.1 : 0}
      />
    </mesh>
  )
}

// Robot marker component
function RobotMarker({
  robot,
  position,
  isSelected,
  onClick,
  isDark,
}: {
  robot: Robot
  position: THREE.Vector3
  isSelected: boolean
  onClick: () => void
  isDark: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  const color = getRobotColor(robot.status)

  useFrame((state) => {
    if (isSelected && meshRef.current) {
      meshRef.current.scale.setScalar(1.2 + Math.sin(state.clock.elapsedTime * 3) * 0.2)
    } else if (hovered && meshRef.current) {
      meshRef.current.scale.setScalar(1.3)
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1)
    }
  })

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.5 : hovered ? 0.4 : 0.3}
        />
      </mesh>

      {/* Always show label for selected robot, show on hover for others */}
      {(isSelected || hovered) && (
        <Html
          position={[0, 0.5, 0]}
          center
          style={{
            color: isDark ? '#ffffff' : '#000000',
            background: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 'bold',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)'
          }}
        >
          {robot.name}
        </Html>
      )}
    </group>
  )
}

// Robot trail component using individual spheres for trail points
function RobotTrail({
  gpsData,
  robot,
  isDark
}: {
  gpsData: RobotGPSData[]
  robot: Robot
  isDark: boolean
}) {
  if (!gpsData || gpsData.length < 2) return null

  const color = getRobotColor(robot.status)

  // Limit trail points for performance (show max 10 points)
  const maxTrailPoints = 10
  const trailData = gpsData.slice(Math.max(0, gpsData.length - maxTrailPoints), -1)

  return (
    <group>
      {trailData.map((data, index) => {
        const position = gpsTo3D(data.position.latitude, data.position.longitude)
        const opacity = (index / trailData.length) * (isDark ? 0.6 : 0.4) + 0.1
        const size = 0.03 + (index / trailData.length) * 0.02 // Gradually increase size

        return (
          <mesh key={`${robot.id}-trail-${index}`} position={position}>
            <sphereGeometry args={[size, 6, 6]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={opacity}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export function RobotMap3D({
  robots,
  selectedRobotId,
  onRobotSelect,
  geofences = [],
  showPaths = true,
  showGeofences = true,
  className,
}: RobotMap3DProps) {
  const { urfmp } = useURFMP()
  const { isDark } = useTheme()
  const controlsRef = useRef<any>(null)
  const [robotGPSData, setRobotGPSData] = useState<Map<string, RobotGPSData[]>>(new Map())
  const [isFollowingRobot, setIsFollowingRobot] = useState(false)
  const [showLabels, setShowLabels] = useState(true)
  const [showTrails, setShowTrails] = useState(true)

  // Initialize robot GPS data collection with mock data
  useEffect(() => {
    if (!urfmp) return

    const loadRobotGPSData = async () => {
      const gpsDataMap = new Map<string, RobotGPSData[]>()

      // Base locations around NYC for demo
      const baseLocations = [
        { lat: 40.7589, lng: -73.9851, name: 'Times Square' },
        { lat: 40.7505, lng: -73.9934, name: 'Empire State' },
        { lat: 40.7614, lng: -73.9776, name: 'Central Park' },
        { lat: 40.7128, lng: -74.006, name: 'Downtown' },
        { lat: 40.7282, lng: -73.7949, name: 'JFK Airport' },
        { lat: 40.6892, lng: -74.0445, name: 'Statue of Liberty' },
      ]

      for (const robot of robots) {
        // Generate mock GPS data for demonstration
        const mockGPSData: RobotGPSData[] = []

        if (robot.status === 'online' || robot.status === 'running') {
          // Assign a base location to each robot
          const baseLocation = baseLocations[robots.indexOf(robot) % baseLocations.length]

          // Generate a path with small variations around the base location
          for (let i = 0; i < 10; i++) {
            const latOffset = (Math.random() - 0.5) * 0.01 // ~1km variation
            const lngOffset = (Math.random() - 0.5) * 0.01

            mockGPSData.push({
              robotId: robot.id,
              position: {
                latitude: baseLocation.lat + latOffset,
                longitude: baseLocation.lng + lngOffset,
                altitude: Math.random() * 50 + 10, // 10-60m altitude
                accuracy: {
                  horizontal: Math.random() * 5 + 2, // 2-7m accuracy
                  vertical: Math.random() * 10 + 5,
                },
                speed: Math.random() * 2 + 0.5, // 0.5-2.5 m/s
                heading: Math.random() * 360,
              },
              timestamp: new Date(Date.now() - (9 - i) * 60000), // Last 10 minutes
            })
          }

          gpsDataMap.set(robot.id, mockGPSData)
        }
      }

      setRobotGPSData(gpsDataMap)
    }

    loadRobotGPSData()

    // Set up real-time GPS updates via WebSocket
    const handleTelemetryUpdate = (data: any) => {
      if (data.telemetry?.data?.gpsPosition) {
        const newGPSData: RobotGPSData = {
          robotId: data.robotId,
          position: data.telemetry.data.gpsPosition,
          timestamp: new Date(data.telemetry.timestamp),
        }

        setRobotGPSData((prev) => {
          const updated = new Map(prev)
          const existingData = updated.get(data.robotId) || []

          // Keep only last 100 points for performance
          const newData = [...existingData, newGPSData].slice(-100)
          updated.set(data.robotId, newData)

          return updated
        })
      }
    }

    // Subscribe to real-time telemetry updates
    robots.forEach((robot) => {
      urfmp.on(`robot:${robot.id}:telemetry_update`, handleTelemetryUpdate)
    })

    return () => {
      robots.forEach((robot) => {
        urfmp.off(`robot:${robot.id}:telemetry_update`, handleTelemetryUpdate)
      })
    }
  }, [urfmp, robots])

  // Camera controls
  const handleHomeView = () => {
    if (!controlsRef.current) return

    // Reset to home view - show all robots
    const positions = Array.from(robotGPSData.values()).flat()
    if (positions.length > 0) {
      // Calculate center point of all robots
      const avgLat = positions.reduce((sum, p) => sum + p.position.latitude, 0) / positions.length
      const avgLng = positions.reduce((sum, p) => sum + p.position.longitude, 0) / positions.length
      const centerPoint = gpsTo3D(avgLat, avgLng)

      // Set camera target to center of robots
      controlsRef.current.target.copy(centerPoint)
      controlsRef.current.update()
    } else {
      // Default to Earth center
      controlsRef.current.target.set(0, 0, 0)
      controlsRef.current.update()
    }

    setIsFollowingRobot(false)
  }

  const handleFollowRobot = () => {
    if (!selectedRobotId || !controlsRef.current) return

    const gpsData = robotGPSData.get(selectedRobotId)
    if (!gpsData || gpsData.length === 0) return

    const latestPosition = gpsData[gpsData.length - 1]
    const robotPosition = gpsTo3D(
      latestPosition.position.latitude,
      latestPosition.position.longitude
    )

    // Focus camera on the selected robot
    controlsRef.current.target.copy(robotPosition)
    controlsRef.current.update()

    setIsFollowingRobot(!isFollowingRobot)
  }

  // Auto-follow selected robot when follow mode is enabled
  useEffect(() => {
    if (!isFollowingRobot || !selectedRobotId || !controlsRef.current) return

    const gpsData = robotGPSData.get(selectedRobotId)
    if (!gpsData || gpsData.length === 0) return

    const latestPosition = gpsData[gpsData.length - 1]
    const robotPosition = gpsTo3D(
      latestPosition.position.latitude,
      latestPosition.position.longitude
    )

    controlsRef.current.target.copy(robotPosition)
    controlsRef.current.update()
  }, [robotGPSData, selectedRobotId, isFollowingRobot])

  return (
    <div
      className={cn('relative w-full h-full', isDark ? 'bg-gray-900' : 'bg-gray-100', className)}
    >
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        style={{ background: isDark ? '#111827' : '#f3f4f6' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        {/* Earth */}
        <Earth isDark={isDark} />

        {/* Robot Trails */}
        {showTrails && robots.map((robot) => {
          const gpsData = robotGPSData.get(robot.id)
          if (!gpsData || gpsData.length === 0) return null

          return (
            <RobotTrail
              key={`${robot.id}-trail`}
              gpsData={gpsData}
              robot={robot}
              isDark={isDark}
            />
          )
        })}

        {/* Robot Markers */}
        {robots.map((robot) => {
          const gpsData = robotGPSData.get(robot.id)
          if (!gpsData || gpsData.length === 0) return null

          const latestPosition = gpsData[gpsData.length - 1]
          const position3D = gpsTo3D(
            latestPosition.position.latitude,
            latestPosition.position.longitude
          )

          return (
            <RobotMarker
              key={robot.id}
              robot={robot}
              position={position3D}
              isSelected={selectedRobotId === robot.id}
              onClick={() => onRobotSelect?.(robot.id)}
              isDark={isDark}
            />
          )
        })}

        {/* Controls */}
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          zoomSpeed={0.6}
          panSpeed={0.8}
          rotateSpeed={0.4}
          minDistance={8}
          maxDistance={50}
        />
      </Canvas>

      {/* Map Controls */}
      <div
        className={cn(
          'absolute top-4 right-4 rounded-lg shadow-lg p-2 space-y-2',
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
        )}
      >
        {/* 3D View Info */}
        <div className="flex flex-col gap-1">
          <label className={cn('text-xs font-medium', isDark ? 'text-gray-300' : 'text-gray-700')}>
            3D Globe View
          </label>
          <span className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
            Interactive Earth visualization
          </span>
        </div>

        {/* View Controls */}
        <div className="flex flex-col gap-1">
          <button
            onClick={handleHomeView}
            className={cn(
              'flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors',
              isDark
                ? 'bg-blue-600 text-white hover:bg-blue-500'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            )}
          >
            <Home className="w-3 h-3" />
            Reset View
          </button>

          {selectedRobotId && (
            <button
              onClick={handleFollowRobot}
              className={cn(
                'flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors',
                isFollowingRobot
                  ? isDark
                    ? 'bg-green-600 text-white hover:bg-green-500'
                    : 'bg-green-500 text-white hover:bg-green-600'
                  : isDark
                    ? 'bg-gray-600 text-white hover:bg-gray-500'
                    : 'bg-gray-500 text-white hover:bg-gray-600'
              )}
            >
              <Target className="w-3 h-3" />
              Follow
            </button>
          )}
        </div>

        {/* Display Options */}
        <div
          className={cn(
            'flex flex-col gap-1 border-t pt-2',
            isDark ? 'border-gray-600' : 'border-gray-200'
          )}
        >
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="w-3 h-3"
            />
            <span className={cn('text-xs', isDark ? 'text-gray-300' : 'text-gray-700')}>
              Labels
            </span>
          </label>

          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={showTrails}
              onChange={(e) => setShowTrails(e.target.checked)}
              className="w-3 h-3"
            />
            <span className={cn('text-xs', isDark ? 'text-gray-300' : 'text-gray-700')}>
              Trails
            </span>
          </label>

          <label className="flex items-center gap-1">
            <input type="checkbox" checked={showPaths} onChange={() => {}} className="w-3 h-3" />
            <span className={cn('text-xs', isDark ? 'text-gray-300' : 'text-gray-700')}>Paths</span>
          </label>

          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={showGeofences}
              onChange={() => {}}
              className="w-3 h-3"
            />
            <span className={cn('text-xs', isDark ? 'text-gray-300' : 'text-gray-700')}>Zones</span>
          </label>
        </div>
      </div>

      {/* Robot Info Panel */}
      {selectedRobotId && (
        <div
          className={cn(
            'absolute bottom-4 left-4 rounded-lg shadow-lg p-4 max-w-sm',
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          )}
        >
          {(() => {
            const robot = robots.find((r) => r.id === selectedRobotId)
            const gpsData = robotGPSData.get(selectedRobotId)
            const latestGPS = gpsData?.[gpsData.length - 1]

            if (!robot || !latestGPS) return null

            return (
              <div className="space-y-2">
                <h3 className={cn('font-bold text-lg', isDark ? 'text-gray-100' : 'text-gray-900')}>
                  {robot.name}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className={cn(isDark ? 'text-gray-400' : 'text-gray-600')}>Status:</span>
                    <span
                      className={cn(
                        'ml-1 font-medium',
                        robot.status === 'online'
                          ? 'text-green-500'
                          : robot.status === 'error'
                            ? 'text-red-500'
                            : isDark
                              ? 'text-gray-300'
                              : 'text-gray-700'
                      )}
                    >
                      {robot.status}
                    </span>
                  </div>
                  <div>
                    <span className={cn(isDark ? 'text-gray-400' : 'text-gray-600')}>Model:</span>
                    <span className={cn('ml-1', isDark ? 'text-gray-300' : 'text-gray-700')}>
                      {robot.model}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className={cn(isDark ? 'text-gray-400' : 'text-gray-600')}>
                      Position:
                    </span>
                    <div
                      className={cn(
                        'text-xs font-mono',
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      )}
                    >
                      {latestGPS.position.latitude.toFixed(6)}°,{' '}
                      {latestGPS.position.longitude.toFixed(6)}°
                      {latestGPS.position.altitude && (
                        <span> • {latestGPS.position.altitude.toFixed(1)}m</span>
                      )}
                    </div>
                  </div>
                  {latestGPS.position.accuracy && (
                    <div className="col-span-2">
                      <span className={cn(isDark ? 'text-gray-400' : 'text-gray-600')}>
                        GPS Accuracy:
                      </span>
                      <span
                        className={cn('ml-1 text-xs', isDark ? 'text-gray-300' : 'text-gray-700')}
                      >
                        {latestGPS.position.accuracy.horizontal.toFixed(1)}m
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Loading State */}
      {robotGPSData.size === 0 && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            isDark ? 'bg-gray-900 bg-opacity-90' : 'bg-white bg-opacity-90'
          )}
        >
          <div className="text-center">
            <Satellite
              className={cn(
                'w-8 h-8 mx-auto mb-2 animate-pulse',
                isDark ? 'text-blue-400' : 'text-blue-500'
              )}
            />
            <p className={cn('text-sm', isDark ? 'text-gray-300' : 'text-gray-600')}>
              Loading robot GPS data...
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
