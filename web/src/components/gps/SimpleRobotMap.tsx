import { useState, useEffect } from 'react'
import { MapPin, Navigation, Satellite, Target, Route, Home, ZoomIn, ZoomOut } from 'lucide-react'
import { useURFMP } from '@/hooks/useURFMP'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/utils/cn'
import { Robot, GPSPosition } from '@urfmp/types'

interface SimpleRobotMapProps {
  robots: Robot[]
  selectedRobotId?: string
  onRobotSelect?: (robotId: string) => void
  className?: string
}

interface RobotGPSData {
  robotId: string
  position: GPSPosition
  timestamp: Date
}

export function SimpleRobotMap({
  robots,
  selectedRobotId,
  onRobotSelect,
  className,
}: SimpleRobotMapProps) {
  const { urfmp } = useURFMP()
  const { isDark } = useTheme()
  const [robotGPSData, setRobotGPSData] = useState<Map<string, RobotGPSData[]>>(new Map())
  const [mapCenter, setMapCenter] = useState({ lat: 40.7589, lng: -73.9851 }) // NYC default
  const [zoomLevel, setZoomLevel] = useState(10)
  const [isLoading, setIsLoading] = useState(true)

  // Load robot GPS data
  useEffect(() => {
    if (!urfmp) return

    const loadRobotGPSData = async () => {
      setIsLoading(true)
      const gpsDataMap = new Map<string, RobotGPSData[]>()

      for (const robot of robots) {
        try {
          // Get recent telemetry data with GPS coordinates
          // Skip telemetry loading for now to avoid API errors
          // const telemetryData = await urfmp.getTelemetryHistory(robot.id, {
          //   from: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          //   limit: 100
          // })

          // Generate mock GPS data for demonstration
          const mockGPSData: RobotGPSData[] = []
          if (robot.status === 'online' || robot.status === 'running') {
            // Create demo GPS positions around NYC for demonstration
            const baseLocations = [
              { lat: 40.7589, lng: -73.9851, name: 'Times Square' },
              { lat: 40.7505, lng: -73.9934, name: 'Empire State' },
              { lat: 40.7614, lng: -73.9776, name: 'Central Park' },
              { lat: 40.7128, lng: -74.006, name: 'Downtown' },
            ]

            const robotIndex = robots.indexOf(robot)
            const baseLocation = baseLocations[robotIndex % baseLocations.length]

            // Generate a trail of 5 GPS points around the base location
            for (let i = 0; i < 5; i++) {
              const latOffset = (Math.random() - 0.5) * 0.01 // ~500m radius
              const lngOffset = (Math.random() - 0.5) * 0.01
              const timestamp = new Date(Date.now() - (4 - i) * 5 * 60 * 1000) // 5-minute intervals

              mockGPSData.push({
                robotId: robot.id,
                position: {
                  latitude: baseLocation.lat + latOffset,
                  longitude: baseLocation.lng + lngOffset,
                  altitude: 10 + Math.random() * 20,
                  heading: Math.random() * 360,
                  speed: 0.5 + Math.random() * 2,
                  accuracy: {
                    horizontal: 2 + Math.random() * 3,
                    vertical: 3 + Math.random() * 4,
                  },
                  timestamp: timestamp,
                  satelliteCount: 6 + Math.floor(Math.random() * 6),
                  fix: '3d' as const,
                },
                timestamp,
              })
            }
          }

          const gpsData = mockGPSData

          if (gpsData.length > 0) {
            gpsDataMap.set(robot.id, gpsData)
          }
        } catch (error) {
          console.error(`Failed to load GPS data for robot ${robot.id}:`, error)
        }
      }

      setRobotGPSData(gpsDataMap)

      // Auto-center map on robots if we have GPS data
      if (gpsDataMap.size > 0) {
        const allPositions = Array.from(gpsDataMap.values()).flat()
        if (allPositions.length > 0) {
          const avgLat =
            allPositions.reduce((sum, p) => sum + p.position.latitude, 0) / allPositions.length
          const avgLng =
            allPositions.reduce((sum, p) => sum + p.position.longitude, 0) / allPositions.length
          setMapCenter({ lat: avgLat, lng: avgLng })
        }
      }

      setIsLoading(false)
    }

    loadRobotGPSData()

    // Set up real-time GPS updates
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
          const newData = [...existingData, newGPSData].slice(-100) // Keep last 100 points
          updated.set(data.robotId, newData)
          return updated
        })
      }
    }

    // Subscribe to robot telemetry updates
    robots.forEach((robot) => {
      urfmp.on(`robot:${robot.id}`, handleTelemetryUpdate)
    })

    return () => {
      robots.forEach((robot) => {
        urfmp.off(`robot:${robot.id}`, handleTelemetryUpdate)
      })
    }
  }, [urfmp, robots])

  // Get robot status color
  const getRobotStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'running':
        return 'text-green-500 bg-green-100'
      case 'idle':
        return 'text-yellow-500 bg-yellow-100'
      case 'offline':
        return 'text-gray-500 bg-gray-100'
      case 'error':
      case 'emergency_stop':
        return 'text-red-500 bg-red-100'
      default:
        return 'text-blue-500 bg-blue-100'
    }
  }

  // Convert GPS to map coordinates (simplified projection)
  const gpsToMapCoords = (lat: number, lng: number) => {
    const x =
      (lng - mapCenter.lng) * Math.cos((mapCenter.lat * Math.PI) / 180) * zoomLevel * 100 + 250
    const y = (mapCenter.lat - lat) * zoomLevel * 100 + 250
    return { x, y }
  }

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev * 1.5, 50))
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev / 1.5, 1))

  const handleCenterOnRobots = () => {
    if (robotGPSData.size === 0) return

    const allPositions = Array.from(robotGPSData.values()).flat()
    if (allPositions.length > 0) {
      const avgLat =
        allPositions.reduce((sum, p) => sum + p.position.latitude, 0) / allPositions.length
      const avgLng =
        allPositions.reduce((sum, p) => sum + p.position.longitude, 0) / allPositions.length
      setMapCenter({ lat: avgLat, lng: avgLng })
    }
  }

  return (
    <div
      className={cn(
        'relative w-full h-full rounded-lg overflow-hidden',
        isDark ? 'bg-gray-900' : 'bg-blue-50',
        className
      )}
    >
      {/* Map Background */}
      <div
        className={cn(
          'absolute inset-0',
          isDark
            ? 'bg-gradient-to-br from-gray-800 to-gray-900'
            : 'bg-gradient-to-br from-blue-100 to-green-100'
        )}
      >
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke={isDark ? '#374151' : '#cbd5e1'}
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Map center indicator */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div
            className={cn(
              'w-2 h-2 rounded-full opacity-50',
              isDark ? 'bg-gray-300' : 'bg-gray-400'
            )}
          ></div>
        </div>

        {/* Robots on map */}
        {Array.from(robotGPSData.entries()).map(([robotId, gpsData]) => {
          if (gpsData.length === 0) return null

          const robot = robots.find((r) => r.id === robotId)
          if (!robot) return null

          const latestPosition = gpsData[gpsData.length - 1]
          const coords = gpsToMapCoords(
            latestPosition.position.latitude,
            latestPosition.position.longitude
          )
          const isSelected = selectedRobotId === robotId

          // Don't render if off-screen
          if (coords.x < -20 || coords.x > 520 || coords.y < -20 || coords.y > 520) return null

          return (
            <div key={robotId}>
              {/* Robot trail */}
              {gpsData.length > 1 && (
                <svg className="absolute inset-0 pointer-events-none">
                  <path
                    d={gpsData
                      .map((data, index) => {
                        const c = gpsToMapCoords(data.position.latitude, data.position.longitude)
                        return `${index === 0 ? 'M' : 'L'} ${c.x} ${c.y}`
                      })
                      .join(' ')}
                    fill="none"
                    stroke={
                      isSelected ? (isDark ? '#60a5fa' : '#3b82f6') : isDark ? '#9ca3af' : '#6b7280'
                    }
                    strokeWidth="2"
                    strokeOpacity="0.6"
                    strokeDasharray="5,5"
                  />
                </svg>
              )}

              {/* Robot marker */}
              <div
                className={cn(
                  'absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200',
                  isSelected ? 'scale-125 z-20' : 'z-10 hover:scale-110'
                )}
                style={{ left: coords.x, top: coords.y }}
                onClick={() => onRobotSelect?.(robotId)}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center',
                    getRobotStatusColor(robot.status),
                    isSelected && 'ring-2 ring-blue-500 ring-offset-2'
                  )}
                >
                  <Navigation
                    className="w-4 h-4"
                    style={{
                      transform: `rotate(${latestPosition.position.heading || 0}deg)`,
                    }}
                  />
                </div>

                {/* Robot label */}
                <div
                  className={cn(
                    'absolute top-full mt-1 left-1/2 transform -translate-x-1/2 rounded px-2 py-1 text-xs font-medium shadow-md whitespace-nowrap',
                    isDark ? 'bg-gray-800 text-gray-100 border border-gray-600' : 'bg-white text-gray-900',
                    isSelected ? 'block' : 'hidden group-hover:block'
                  )}
                >
                  {robot.name}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Map Controls */}
      <div
        className={cn(
          'absolute top-4 right-4 rounded-lg shadow-lg p-2 space-y-2',
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
        )}
      >
        <button
          onClick={handleZoomIn}
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded',
            isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded',
            isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleCenterOnRobots}
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded',
            isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          <Home className="w-4 h-4" />
        </button>
      </div>

      {/* Map Info */}
      <div
        className={cn(
          'absolute top-4 left-4 rounded-lg shadow-lg p-3 space-y-1',
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
        )}
      >
        <div className={cn('text-sm font-medium', isDark ? 'text-gray-200' : 'text-gray-900')}>
          GPS Fleet View
        </div>
        <div className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
          Center: {mapCenter.lat.toFixed(4)}°, {mapCenter.lng.toFixed(4)}°
        </div>
        <div className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
          Zoom: {zoomLevel.toFixed(1)}x
        </div>
        <div className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
          Robots: {robotGPSData.size} with GPS
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
                <div className="flex items-center gap-2">
                  <div className={cn('w-3 h-3 rounded-full', getRobotStatusColor(robot.status))} />
                  <h3
                    className={cn('font-bold text-lg', isDark ? 'text-gray-200' : 'text-gray-900')}
                  >
                    {robot.name}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className={cn(isDark ? 'text-gray-400' : 'text-gray-600')}>Status:</span>
                    <span
                      className={cn('ml-1 font-medium', isDark ? 'text-gray-200' : 'text-gray-900')}
                    >
                      {robot.status}
                    </span>
                  </div>
                  <div>
                    <span className={cn(isDark ? 'text-gray-400' : 'text-gray-600')}>Model:</span>
                    <span className={cn('ml-1', isDark ? 'text-gray-200' : 'text-gray-900')}>
                      {robot.model}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                    GPS Position:
                  </div>
                  <div
                    className={cn(
                      'text-xs font-mono p-2 rounded',
                      isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-900'
                    )}
                  >
                    Lat: {latestGPS.position.latitude.toFixed(6)}°<br />
                    Lng: {latestGPS.position.longitude.toFixed(6)}°
                    {latestGPS.position.altitude && (
                      <>
                        <br />
                        Alt: {latestGPS.position.altitude.toFixed(1)}m
                      </>
                    )}
                  </div>
                </div>

                {latestGPS.position.speed !== undefined && (
                  <div className="text-sm">
                    <span className={cn(isDark ? 'text-gray-400' : 'text-gray-600')}>Speed:</span>
                    <span className={cn('ml-1', isDark ? 'text-gray-200' : 'text-gray-900')}>
                      {latestGPS.position.speed.toFixed(1)} m/s
                    </span>
                  </div>
                )}

                {latestGPS.position.accuracy && (
                  <div className="text-sm">
                    <span className={cn(isDark ? 'text-gray-400' : 'text-gray-600')}>
                      GPS Accuracy:
                    </span>
                    <span className={cn('ml-1', isDark ? 'text-gray-200' : 'text-gray-900')}>
                      {latestGPS.position.accuracy.horizontal.toFixed(1)}m
                    </span>
                  </div>
                )}

                <div className={cn('text-xs', isDark ? 'text-gray-500' : 'text-gray-500')}>
                  Last update: {new Date(latestGPS.timestamp).toLocaleTimeString()}
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 bg-opacity-90 flex items-center justify-center',
            isDark ? 'bg-gray-900' : 'bg-white'
          )}
        >
          <div className="text-center">
            <Satellite className="w-8 h-8 mx-auto mb-2 text-blue-500 animate-pulse" />
            <p className={cn('text-sm', isDark ? 'text-gray-300' : 'text-gray-600')}>
              Loading robot GPS data...
            </p>
          </div>
        </div>
      )}

      {/* No GPS Data State */}
      {!isLoading && robotGPSData.size === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin
              className={cn('w-12 h-12 mx-auto mb-4', isDark ? 'text-gray-500' : 'text-gray-400')}
            />
            <h3
              className={cn(
                'text-lg font-semibold mb-2',
                isDark ? 'text-gray-300' : 'text-gray-600'
              )}
            >
              No GPS Data Available
            </h3>
            <p className={cn('text-sm max-w-sm', isDark ? 'text-gray-400' : 'text-gray-500')}>
              No robots are currently sending GPS coordinates. Start sending GPS telemetry data to
              see robots on the map.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
