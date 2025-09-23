import { useState, useEffect, useRef } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  Polygon,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Satellite, Home, ZoomIn, ZoomOut } from 'lucide-react'
import { useURFMP } from '../../hooks/useURFMP'
import { useTheme } from '../../contexts/ThemeContext'
import { cn } from '../../lib/utils'
import { Robot } from '@urfmp/types'
import { Geofence } from '../../hooks/useGeofencing'
import L from 'leaflet'

// Fix Leaflet default markers in webpack
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

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

interface SimpleRobotMapProps {
  robots: Robot[]
  selectedRobotId?: string
  onRobotSelect?: (robotId: string) => void
  geofences?: Geofence[]
  waypoints?: any[]
  paths?: any[]
  className?: string
}

interface RobotGPSData {
  robotId: string
  position: GPSPosition
  timestamp: Date
}

// Create a custom waypoint icon
const createWaypointIcon = (waypoint: any) => {
  const size = 20
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  canvas.width = size + 8
  canvas.height = size + 8

  const centerX = canvas.width / 2
  const centerY = canvas.height / 2

  // Get waypoint color based on type
  const getWaypointColor = (type: string) => {
    switch (type) {
      case 'pickup':
        return '#10b981' // green
      case 'dropoff':
        return '#ef4444' // red
      case 'charging':
        return '#f59e0b' // yellow
      case 'maintenance':
        return '#8b5cf6' // purple
      case 'checkpoint':
        return '#3b82f6' // blue
      default:
        return '#6b7280' // gray
    }
  }

  const color = getWaypointColor(waypoint.type)

  // Draw main circle
  ctx.beginPath()
  ctx.arc(centerX, centerY, size / 2, 0, 2 * Math.PI)
  ctx.fillStyle = color
  ctx.fill()

  // Draw white border
  ctx.beginPath()
  ctx.arc(centerX, centerY, size / 2, 0, 2 * Math.PI)
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 2
  ctx.stroke()

  // Draw waypoint symbol (circle in center)
  ctx.beginPath()
  ctx.arc(centerX, centerY, size / 4, 0, 2 * Math.PI)
  ctx.fillStyle = 'white'
  ctx.fill()

  return L.icon({
    iconUrl: canvas.toDataURL(),
    iconSize: [canvas.width, canvas.height],
    iconAnchor: [canvas.width / 2, canvas.height / 2],
    popupAnchor: [0, -canvas.height / 2],
  })
}

// Create a simple, reliable robot icon using Canvas
const createRobotIcon = (robot: Robot, isSelected: boolean) => {
  const color = getRobotColor(robot.status)
  const size = isSelected ? 30 : 24

  // Create canvas for the marker
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  canvas.width = size + 8
  canvas.height = size + 8

  const centerX = canvas.width / 2
  const centerY = canvas.height / 2

  // Draw outer ring for selected robot
  if (isSelected) {
    ctx.beginPath()
    ctx.arc(centerX, centerY, (size + 8) / 2, 0, 2 * Math.PI)
    ctx.fillStyle = color + '40'
    ctx.fill()
  }

  // Draw main circle
  ctx.beginPath()
  ctx.arc(centerX, centerY, size / 2, 0, 2 * Math.PI)
  ctx.fillStyle = color
  ctx.fill()

  // Draw white border
  ctx.beginPath()
  ctx.arc(centerX, centerY, size / 2, 0, 2 * Math.PI)
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 3
  ctx.stroke()

  // Draw white triangle (robot icon)
  ctx.beginPath()
  ctx.moveTo(centerX, centerY - size * 0.2)
  ctx.lineTo(centerX - size * 0.15, centerY + size * 0.1)
  ctx.lineTo(centerX + size * 0.15, centerY + size * 0.1)
  ctx.closePath()
  ctx.fillStyle = 'white'
  ctx.fill()

  // Draw status indicator dot
  const statusColor =
    robot.status === 'online' ? '#10b981' : robot.status === 'error' ? '#ef4444' : '#6b7280'
  ctx.beginPath()
  ctx.arc(centerX + size * 0.3, centerY - size * 0.3, 4, 0, 2 * Math.PI)
  ctx.fillStyle = statusColor
  ctx.fill()
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 2
  ctx.stroke()

  // Convert canvas to data URL
  const dataUrl = canvas.toDataURL()

  return L.icon({
    iconUrl: dataUrl,
    iconSize: [canvas.width, canvas.height],
    iconAnchor: [canvas.width / 2, canvas.height / 2],
    popupAnchor: [0, -canvas.height / 2],
  })
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
      return '#8b5cf6' // purple
  }
}

// Get location name based on GPS coordinates
const getLocationName = (lat: number, lng: number): string => {
  if (lat >= 40.6 && lat <= 40.9 && lng >= -74.3 && lng <= -73.7) {
    return 'New York City, USA'
  } else if (lat >= 37.6 && lat <= 37.9 && lng >= -122.6 && lng <= -122.3) {
    return 'San Francisco, USA'
  } else if (lat >= 51.4 && lat <= 51.6 && lng >= -0.3 && lng <= 0.2) {
    return 'London, UK'
  } else if (lat >= 48.7 && lat <= 49.0 && lng >= 2.2 && lng <= 2.5) {
    return 'Paris, France'
  } else if (lat >= 35.6 && lat <= 35.8 && lng >= 139.6 && lng <= 139.9) {
    return 'Tokyo, Japan'
  } else if (lat >= -33.9 && lat <= -33.8 && lng >= 151.1 && lng <= 151.3) {
    return 'Sydney, Australia'
  }

  return `${lat >= 0 ? lat.toFixed(2) + '°N' : Math.abs(lat).toFixed(2) + '°S'}, ${lng >= 0 ? lng.toFixed(2) + '°E' : Math.abs(lng).toFixed(2) + '°W'}`
}

// Map controller component
function MapController({
  robotGPSData,
  selectedRobotId,
}: {
  robotGPSData: Map<string, RobotGPSData[]>
  selectedRobotId?: string
}) {
  const map = useMap()

  // Auto-center on robots when they're loaded
  useEffect(() => {
    if (robotGPSData.size > 0) {
      const allPositions = Array.from(robotGPSData.values()).flat()
      if (allPositions.length > 0) {
        const bounds = L.latLngBounds(
          allPositions.map((p) => [p.position.latitude, p.position.longitude])
        )
        map.fitBounds(bounds, { padding: [20, 20] })
      }
    }
  }, [map, robotGPSData])

  // Follow selected robot
  useEffect(() => {
    if (selectedRobotId) {
      const gpsData = robotGPSData.get(selectedRobotId)
      if (gpsData && gpsData.length > 0) {
        const latest = gpsData[gpsData.length - 1]
        map.setView([latest.position.latitude, latest.position.longitude], 16, {
          animate: true,
          duration: 1,
        })
      }
    }
  }, [selectedRobotId, robotGPSData, map])

  return null
}

// Map click handler
function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
  useMapEvents({
    click: onMapClick,
  })
  return null
}

export function SimpleRobotMap({
  robots,
  selectedRobotId,
  onRobotSelect,
  geofences = [],
  waypoints = [],
  paths = [],
  className,
}: SimpleRobotMapProps) {
  const { urfmp } = useURFMP()
  const { isDark } = useTheme()
  const [robotGPSData, setRobotGPSData] = useState<Map<string, RobotGPSData[]>>(new Map())
  const [mapCenter] = useState<[number, number]>([40.7589, -73.9851]) // NYC default
  const [isLoading, setIsLoading] = useState(true)
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite' | 'dark'>('street')
  const mapRef = useRef<L.Map>(null)

  // Load robot GPS data
  useEffect(() => {
    // Check if we're in demo mode
    const isDemo = import.meta.env.VITE_DEMO_MODE === 'true' ||
                  (!import.meta.env.VITE_URFMP_API_URL && window.location.hostname !== 'localhost')

    // In demo mode, we don't need urfmp instance, just use mock data
    if (!isDemo && !urfmp) return

    const loadRobotGPSData = async () => {
      setIsLoading(true)
      const gpsDataMap = new Map<string, RobotGPSData[]>()

      for (const robot of robots) {
        try {
          // Generate mock GPS data for demonstration
          const mockGPSData: RobotGPSData[] = []
          if (robot.status === 'online' || robot.status === 'running') {
            // Create demo GPS positions around NYC for demonstration
            const baseLocations = [
              { lat: 40.7589, lng: -73.9851, name: 'Times Square' },
              { lat: 40.7505, lng: -73.9934, name: 'Empire State' },
              { lat: 40.7614, lng: -73.9776, name: 'Central Park' },
              { lat: 40.7128, lng: -74.006, name: 'Downtown' },
              { lat: 40.7282, lng: -73.7949, name: 'JFK Airport' },
              { lat: 40.6892, lng: -74.0445, name: 'Statue of Liberty' },
            ]

            const robotIndex = robots.indexOf(robot)
            const baseLocation = baseLocations[robotIndex % baseLocations.length]

            // Generate a trail of GPS points around the base location
            for (let i = 0; i < 8; i++) {
              const latOffset = (Math.random() - 0.5) * 0.005 // ~250m radius
              const lngOffset = (Math.random() - 0.5) * 0.005
              const timestamp = new Date(Date.now() - (7 - i) * 3 * 60 * 1000) // 3-minute intervals

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

          if (mockGPSData.length > 0) {
            gpsDataMap.set(robot.id, mockGPSData)
          }
        } catch (error) {
          console.error(`Failed to load GPS data for robot ${robot.id}:`, error)
        }
      }

      setRobotGPSData(gpsDataMap)
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
          const newData = [...existingData, newGPSData].slice(-50) // Keep last 50 points
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

  // Get tile layer URL based on style and theme
  const getTileLayerUrl = () => {
    switch (mapStyle) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      case 'dark':
        return isDark
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    }
  }

  const getTileLayerAttribution = () => {
    switch (mapStyle) {
      case 'satellite':
        return '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      case 'dark':
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      default:
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  }

  const handleCenterOnRobots = () => {
    if (robotGPSData.size === 0 || !mapRef.current) return

    const allPositions = Array.from(robotGPSData.values()).flat()
    if (allPositions.length > 0) {
      const bounds = L.latLngBounds(
        allPositions.map((p) => [p.position.latitude, p.position.longitude])
      )
      mapRef.current.fitBounds(bounds, { padding: [20, 20] })
    }
  }

  return (
    <div className={cn('relative w-full h-full overflow-hidden', className)}>
      {/* Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={12}
        className="w-full h-full"
        ref={mapRef}
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
      >
        {/* Tile Layer */}
        <TileLayer url={getTileLayerUrl()} attribution={getTileLayerAttribution()} maxZoom={19} />

        {/* Map Controller */}
        <MapController robotGPSData={robotGPSData} selectedRobotId={selectedRobotId} />

        {/* Map Click Handler */}
        <MapClickHandler onMapClick={() => onRobotSelect?.('')} />

        {/* Robot Markers and Trails */}
        {Array.from(robotGPSData.entries()).map(([robotId, gpsData]) => {
          if (gpsData.length === 0) return null

          const robot = robots.find((r) => r.id === robotId)
          if (!robot) return null

          const latestPosition = gpsData[gpsData.length - 1]
          const isSelected = selectedRobotId === robotId

          return (
            <div key={`robot-container-${robotId}-${latestPosition.timestamp.getTime()}`}>
              {/* Robot trail */}
              {gpsData.length > 1 && (
                <Polyline
                  key={`trail-${robotId}`}
                  positions={gpsData.map((data) => [
                    data.position.latitude,
                    data.position.longitude,
                  ])}
                  color={getRobotColor(robot.status)}
                  weight={isSelected ? 4 : 2}
                  opacity={isSelected ? 0.8 : 0.6}
                  smoothFactor={1}
                />
              )}

              {/* Robot marker */}
              <Marker
                key={`robot-${robotId}-${isSelected}`}
                position={[latestPosition.position.latitude, latestPosition.position.longitude]}
                icon={createRobotIcon(robot, isSelected)}
                eventHandlers={{
                  click: () => onRobotSelect?.(robotId),
                }}
                zIndexOffset={isSelected ? 1000 : 0}
              >
                <Popup className="robot-popup">
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getRobotColor(robot.status) }}
                      />
                      <h3 className="font-bold text-base">{robot.name}</h3>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div>
                        <strong>Status:</strong> {robot.status}
                      </div>
                      <div>
                        <strong>Model:</strong> {robot.model}
                      </div>
                      <div>
                        <strong>Location:</strong>{' '}
                        {getLocationName(
                          latestPosition.position.latitude,
                          latestPosition.position.longitude
                        )}
                      </div>

                      {latestPosition.position.speed !== undefined && (
                        <div>
                          <strong>Speed:</strong> {latestPosition.position.speed.toFixed(1)} m/s
                        </div>
                      )}

                      {latestPosition.position.accuracy && (
                        <div>
                          <strong>GPS Accuracy:</strong> ±
                          {latestPosition.position.accuracy.horizontal?.toFixed(1)}m
                        </div>
                      )}

                      <div className="text-xs text-gray-500 mt-2">
                        Last update: {latestPosition.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </div>
          )
        })}

        {/* Geofences */}
        {geofences.map((geofence) => {
          if (!geofence.isActive || !geofence.coordinates.length) return null

          const getGeofenceColor = (type: string) => {
            switch (type) {
              case 'safety':
                return '#ef4444' // red
              case 'work':
                return '#10b981' // green
              case 'restricted':
                return '#f59e0b' // yellow
              case 'charging':
                return '#3b82f6' // blue
              default:
                return '#8b5cf6' // purple
            }
          }

          const color = getGeofenceColor(geofence.type)

          if (geofence.type === 'circle' && geofence.coordinates.length > 0) {
            const center = geofence.coordinates[0]
            return (
              <Circle
                key={geofence.id}
                center={[center.latitude, center.longitude]}
                radius={geofence.radius || 100}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.2,
                  weight: 2,
                  opacity: 0.8,
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{geofence.name}</strong>
                    <br />
                    {geofence.description && (
                      <span>
                        {geofence.description}
                        <br />
                      </span>
                    )}
                    Type: {geofence.type}
                    <br />
                    Shape: {geofence.type}
                    <br />
                    Radius: {geofence.radius}m<br />
                    Rules: {geofence.rules?.length || 0}
                  </div>
                </Popup>
              </Circle>
            )
          }

          if (geofence.type === 'polygon' && geofence.coordinates.length >= 3) {
            const positions = geofence.coordinates.map(
              (coord) => [coord.latitude, coord.longitude] as [number, number]
            )
            return (
              <Polygon
                key={geofence.id}
                positions={positions}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.2,
                  weight: 2,
                  opacity: 0.8,
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{geofence.name}</strong>
                    <br />
                    {geofence.description && (
                      <span>
                        {geofence.description}
                        <br />
                      </span>
                    )}
                    Type: {geofence.type}
                    <br />
                    Shape: {geofence.type}
                    <br />
                    Points: {geofence.coordinates.length}
                    <br />
                    Rules: {geofence.rules?.length || 0}
                  </div>
                </Popup>
              </Polygon>
            )
          }

          if (geofence.type === 'rectangle' && geofence.coordinates.length >= 2) {
            const [topLeft, bottomRight] = geofence.coordinates
            const positions = [
              [topLeft.latitude, topLeft.longitude],
              [topLeft.latitude, bottomRight.longitude],
              [bottomRight.latitude, bottomRight.longitude],
              [bottomRight.latitude, topLeft.longitude],
            ] as [number, number][]

            return (
              <Polygon
                key={geofence.id}
                positions={positions}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.2,
                  weight: 2,
                  opacity: 0.8,
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{geofence.name}</strong>
                    <br />
                    {geofence.description && (
                      <span>
                        {geofence.description}
                        <br />
                      </span>
                    )}
                    Type: {geofence.type}
                    <br />
                    Shape: {geofence.type}
                    <br />
                    Rules: {geofence.rules?.length || 0}
                  </div>
                </Popup>
              </Polygon>
            )
          }

          return null
        })}

        {/* Waypoints */}
        {waypoints.map((waypoint) => {
          if (!waypoint.isActive || !waypoint.coordinates) return null

          return (
            <Marker
              key={waypoint.id}
              position={[waypoint.coordinates.latitude, waypoint.coordinates.longitude]}
              icon={createWaypointIcon(waypoint)}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{waypoint.name}</strong>
                  <br />
                  {waypoint.description && (
                    <span>
                      {waypoint.description}
                      <br />
                    </span>
                  )}
                  Type: {waypoint.type}
                  <br />
                  Radius: {waypoint.radius}m<br />
                  Actions: {waypoint.actions?.length || 0}
                  <br />
                  Status: {waypoint.isActive ? 'Active' : 'Inactive'}
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Paths */}
        {paths.map((path) => {
          if (!path.isActive || !path.waypoints.length) return null

          // Get waypoint coordinates for the path
          const pathCoordinates = path.waypoints
            .map((waypointId: string) => waypoints.find((wp: any) => wp.id === waypointId))
            .filter((wp: any) => wp && wp.coordinates)
            .map(
              (wp: any) => [wp.coordinates.latitude, wp.coordinates.longitude] as [number, number]
            )

          if (pathCoordinates.length < 2) return null

          const getPathColor = (status: string) => {
            switch (status) {
              case 'active':
                return '#10b981' // green
              case 'paused':
                return '#f59e0b' // yellow
              case 'completed':
                return '#6b7280' // gray
              case 'error':
                return '#ef4444' // red
              default:
                return '#8b5cf6' // purple
            }
          }

          return (
            <Polyline
              key={path.id}
              positions={pathCoordinates}
              pathOptions={{
                color: getPathColor(path.status),
                weight: 4,
                opacity: 0.8,
                dashArray: path.status === 'paused' ? '10, 10' : undefined,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{path.name}</strong>
                  <br />
                  {path.description && (
                    <span>
                      {path.description}
                      <br />
                    </span>
                  )}
                  Robot: {path.robotId}
                  <br />
                  Status: {path.status}
                  <br />
                  Waypoints: {path.waypoints.length}
                  <br />
                  Distance: {path.totalDistance?.toFixed(0)}m<br />
                  Est. Time:{' '}
                  {path.estimatedTime ? `${Math.round(path.estimatedTime / 60)}min` : 'N/A'}
                </div>
              </Popup>
            </Polyline>
          )
        })}
      </MapContainer>

      {/* Map Style Controls */}
      <div className="absolute top-4 right-2 z-[1000]">
        {/* Style Selector */}
        <div
          className={cn(
            'rounded-lg shadow-lg p-2 backdrop-blur-sm',
            isDark ? 'bg-gray-800/90 border border-gray-700' : 'bg-white/90 border border-gray-200'
          )}
        >
          <div className="flex gap-1">
            <button
              onClick={() => setMapStyle('street')}
              className={cn(
                'p-2 rounded text-xs font-medium transition-colors',
                mapStyle === 'street'
                  ? 'bg-blue-500 text-white'
                  : isDark
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              Street
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={cn(
                'p-2 rounded text-xs font-medium transition-colors',
                mapStyle === 'satellite'
                  ? 'bg-blue-500 text-white'
                  : isDark
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapStyle('dark')}
              className={cn(
                'p-2 rounded text-xs font-medium transition-colors',
                mapStyle === 'dark'
                  ? 'bg-blue-500 text-white'
                  : isDark
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {isDark ? 'Dark' : 'Light'}
            </button>
          </div>
        </div>
      </div>

      {/* Zoom and Center Controls */}
      <div className="absolute top-20 right-2 z-[1000]">
        <div
          className={cn(
            'rounded shadow-sm backdrop-blur-sm flex flex-col w-fit',
            isDark ? 'bg-gray-800/90 border border-gray-700' : 'bg-white/90 border border-gray-200'
          )}
        >
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className={cn(
              'flex items-center justify-center w-6 h-6 rounded',
              isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className={cn(
              'flex items-center justify-center w-6 h-6 rounded',
              isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleCenterOnRobots}
            className={cn(
              'flex items-center justify-center w-6 h-6 rounded',
              isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Info */}
      <div
        className={cn(
          'absolute bottom-4 left-4 rounded-lg shadow-lg p-3 backdrop-blur-sm z-[1000]',
          isDark ? 'bg-gray-800/90 border border-gray-700' : 'bg-white/90 border border-gray-200'
        )}
      >
        <div className={cn('text-sm font-medium mb-1', isDark ? 'text-gray-200' : 'text-gray-900')}>
          Robot Fleet Map
        </div>
        <div className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
          {robotGPSData.size} robots with GPS
        </div>
        <div className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
          Map: {mapStyle.charAt(0).toUpperCase() + mapStyle.slice(1)}
        </div>
      </div>

      {/* Robot Info Panel */}
      {selectedRobotId && (
        <div
          className={cn(
            'absolute bottom-4 right-4 rounded-lg shadow-lg p-4 max-w-sm backdrop-blur-sm z-[1000]',
            isDark ? 'bg-gray-800/90 border border-gray-700' : 'bg-white/90 border border-gray-200'
          )}
        >
          {(() => {
            const robot = robots.find((r) => r.id === selectedRobotId)
            const gpsData = robotGPSData.get(selectedRobotId)
            const latestGPS = gpsData?.[gpsData.length - 1]

            if (!robot || !latestGPS) return null

            return (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getRobotColor(robot.status) }}
                  />
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

                <div className="space-y-2">
                  <div
                    className={cn(
                      'text-sm font-medium',
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    )}
                  >
                    📍 {getLocationName(latestGPS.position.latitude, latestGPS.position.longitude)}
                  </div>

                  <div
                    className={cn(
                      'text-xs font-mono p-2 rounded',
                      isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-900'
                    )}
                  >
                    {latestGPS.position.latitude.toFixed(6)}°,{' '}
                    {latestGPS.position.longitude.toFixed(6)}°
                    {latestGPS.position.altitude && (
                      <>
                        <br />
                        Alt: {latestGPS.position.altitude.toFixed(1)}m
                      </>
                    )}
                  </div>

                  {latestGPS.position.speed !== undefined && (
                    <div className="text-sm">
                      <span className={cn(isDark ? 'text-gray-400' : 'text-gray-600')}>Speed:</span>
                      <span className={cn('ml-1', isDark ? 'text-gray-200' : 'text-gray-900')}>
                        {latestGPS.position.speed.toFixed(1)} m/s
                      </span>
                    </div>
                  )}

                  <div className={cn('text-xs', isDark ? 'text-gray-500' : 'text-gray-500')}>
                    Last update: {latestGPS.timestamp.toLocaleTimeString()}
                  </div>
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
            'absolute inset-0 bg-opacity-90 flex items-center justify-center z-[1000]',
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
        <div className="absolute inset-0 flex items-center justify-center z-[1000]">
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
