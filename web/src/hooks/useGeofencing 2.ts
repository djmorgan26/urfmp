import { useState, useEffect } from 'react'
import { useURFMP } from './useURFMP'

export interface Coordinate {
  latitude: number
  longitude: number
  altitude?: number
}

export interface Waypoint {
  id: string
  name: string
  description?: string
  coordinates: Coordinate
  type: 'pickup' | 'dropoff' | 'checkpoint' | 'charging' | 'maintenance' | 'custom'
  radius: number // meters
  actions: WaypointAction[]
  metadata?: Record<string, any>
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface WaypointAction {
  id: string
  type: 'pause' | 'notify' | 'execute_command' | 'capture_data' | 'wait'
  parameters: Record<string, any>
  duration?: number // seconds
}

export interface Geofence {
  id: string
  name: string
  description?: string
  type: 'circle' | 'polygon' | 'rectangle'
  coordinates: Coordinate[]
  radius?: number // for circle type
  rules: GeofenceRule[]
  isActive: boolean
  color: string
  strokeWidth: number
  fillOpacity: number
  robotIds: string[] // robots this geofence applies to
  createdAt: Date
  updatedAt: Date
}

export interface GeofenceRule {
  id: string
  name: string
  trigger: 'enter' | 'exit' | 'dwell' | 'speed_limit'
  condition?: {
    minDuration?: number // seconds for dwell
    maxSpeed?: number // m/s for speed limit
  }
  actions: GeofenceAction[]
  isActive: boolean
}

export interface GeofenceAction {
  id: string
  type: 'alert' | 'stop_robot' | 'slow_robot' | 'redirect' | 'notify' | 'log'
  parameters: Record<string, any>
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export interface GeofenceEvent {
  id: string
  geofenceId: string
  geofenceName: string
  robotId: string
  robotName: string
  ruleId: string
  ruleName: string
  eventType: 'enter' | 'exit' | 'dwell' | 'violation'
  coordinates: Coordinate
  timestamp: Date
  severity: 'info' | 'warning' | 'error' | 'critical'
  message: string
  actionsTaken: string[]
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
}

export interface Path {
  id: string
  name: string
  description?: string
  waypoints: string[] // waypoint IDs in order
  robotId?: string // if assigned to specific robot
  isOptimized: boolean
  totalDistance: number // meters
  estimatedDuration: number // seconds
  status: 'draft' | 'active' | 'completed' | 'paused' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export interface GeofencingData {
  waypoints: Waypoint[]
  geofences: Geofence[]
  paths: Path[]
  events: GeofenceEvent[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>

  // Waypoint management
  createWaypoint: (waypoint: Omit<Waypoint, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateWaypoint: (id: string, updates: Partial<Waypoint>) => Promise<void>
  deleteWaypoint: (id: string) => Promise<void>

  // Geofence management
  createGeofence: (geofence: Omit<Geofence, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateGeofence: (id: string, updates: Partial<Geofence>) => Promise<void>
  deleteGeofence: (id: string) => Promise<void>

  // Path management
  createPath: (path: Omit<Path, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updatePath: (id: string, updates: Partial<Path>) => Promise<void>
  deletePath: (id: string) => Promise<void>
  optimizePath: (pathId: string) => Promise<void>

  // Event management
  acknowledgeEvent: (eventId: string, acknowledgedBy: string) => Promise<void>
  clearEvents: () => Promise<void>
}

export function useGeofencing(): GeofencingData {
  const { urfmp, robots } = useURFMP()
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [geofences, setGeofences] = useState<Geofence[]>([])
  const [paths, setPaths] = useState<Path[]>([])
  const [events, setEvents] = useState<GeofenceEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGeofencingData = async () => {
    if (!urfmp || robots.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      // In a real implementation, these would be API calls
      // For now, we'll generate mock data
      const mockWaypoints = generateMockWaypoints()
      const mockGeofences = generateMockGeofences()
      const mockPaths = generateMockPaths(mockWaypoints)
      const mockEvents = generateMockEvents(mockGeofences, robots)

      setWaypoints(mockWaypoints)
      setGeofences(mockGeofences)
      setPaths(mockPaths)
      setEvents(mockEvents)
    } catch (err) {
      console.error('Failed to fetch geofencing data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch geofencing data')
    } finally {
      setIsLoading(false)
    }
  }

  const createWaypoint = async (waypointData: Omit<Waypoint, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newWaypoint: Waypoint = {
      ...waypointData,
      id: `waypoint-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setWaypoints((prev) => [...prev, newWaypoint])
  }

  const updateWaypoint = async (id: string, updates: Partial<Waypoint>) => {
    setWaypoints((prev) =>
      prev.map((wp) => (wp.id === id ? { ...wp, ...updates, updatedAt: new Date() } : wp))
    )
  }

  const deleteWaypoint = async (id: string) => {
    setWaypoints((prev) => prev.filter((wp) => wp.id !== id))
  }

  const createGeofence = async (geofenceData: Omit<Geofence, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGeofence: Geofence = {
      ...geofenceData,
      id: `geofence-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setGeofences((prev) => [...prev, newGeofence])
  }

  const updateGeofence = async (id: string, updates: Partial<Geofence>) => {
    setGeofences((prev) =>
      prev.map((gf) => (gf.id === id ? { ...gf, ...updates, updatedAt: new Date() } : gf))
    )
  }

  const deleteGeofence = async (id: string) => {
    setGeofences((prev) => prev.filter((gf) => gf.id !== id))
  }

  const createPath = async (pathData: Omit<Path, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPath: Path = {
      ...pathData,
      id: `path-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setPaths((prev) => [...prev, newPath])
  }

  const updatePath = async (id: string, updates: Partial<Path>) => {
    setPaths((prev) =>
      prev.map((path) => (path.id === id ? { ...path, ...updates, updatedAt: new Date() } : path))
    )
  }

  const deletePath = async (id: string) => {
    setPaths((prev) => prev.filter((path) => path.id !== id))
  }

  const optimizePath = async (pathId: string) => {
    // Mock path optimization
    setPaths((prev) =>
      prev.map((path) =>
        path.id === pathId
          ? {
              ...path,
              isOptimized: true,
              totalDistance: path.totalDistance * 0.9, // 10% improvement
              estimatedDuration: path.estimatedDuration * 0.9,
              updatedAt: new Date(),
            }
          : path
      )
    )
  }

  const acknowledgeEvent = async (eventId: string, acknowledgedBy: string) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId
          ? {
              ...event,
              acknowledged: true,
              acknowledgedBy,
              acknowledgedAt: new Date(),
            }
          : event
      )
    )
  }

  const clearEvents = async () => {
    setEvents([])
  }

  useEffect(() => {
    fetchGeofencingData()
  }, [urfmp, robots])

  return {
    waypoints,
    geofences,
    paths,
    events,
    isLoading,
    error,
    refresh: fetchGeofencingData,
    createWaypoint,
    updateWaypoint,
    deleteWaypoint,
    createGeofence,
    updateGeofence,
    deleteGeofence,
    createPath,
    updatePath,
    deletePath,
    optimizePath,
    acknowledgeEvent,
    clearEvents,
  }
}

// Mock data generators
function generateMockWaypoints(): Waypoint[] {
  return [
    {
      id: 'wp-pickup-1',
      name: 'Assembly Line A - Pickup',
      description: 'Material pickup point for assembly line A',
      coordinates: { latitude: 40.7589, longitude: -73.9851 },
      type: 'pickup',
      radius: 5,
      actions: [
        {
          id: 'action-1',
          type: 'pause',
          parameters: { duration: 10 },
          duration: 10,
        },
        {
          id: 'action-2',
          type: 'capture_data',
          parameters: { sensors: ['camera', 'weight'] },
        },
      ],
      isActive: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'wp-dropoff-1',
      name: 'Packaging Station - Dropoff',
      description: 'Material dropoff point at packaging station',
      coordinates: { latitude: 40.7594, longitude: -73.9847 },
      type: 'dropoff',
      radius: 3,
      actions: [
        {
          id: 'action-3',
          type: 'notify',
          parameters: { message: 'Package delivered', recipients: ['operator@company.com'] },
        },
      ],
      isActive: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'wp-charging-1',
      name: 'Charging Station Alpha',
      description: 'Primary charging station for fleet',
      coordinates: { latitude: 40.7585, longitude: -73.9855 },
      type: 'charging',
      radius: 2,
      actions: [
        {
          id: 'action-4',
          type: 'execute_command',
          parameters: { command: 'initiate_charging' },
        },
      ],
      isActive: true,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  ]
}

function generateMockGeofences(): Geofence[] {
  return [
    {
      id: 'gf-safe-zone',
      name: 'Safe Operating Zone',
      description: 'Main operational area for robot fleet',
      type: 'polygon',
      coordinates: [
        { latitude: 40.758, longitude: -73.986 },
        { latitude: 40.76, longitude: -73.986 },
        { latitude: 40.76, longitude: -73.984 },
        { latitude: 40.758, longitude: -73.984 },
      ],
      rules: [
        {
          id: 'rule-1',
          name: 'Exit Alert',
          trigger: 'exit',
          actions: [
            {
              id: 'action-1',
              type: 'alert',
              parameters: { message: 'Robot left safe zone', severity: 'warning' },
              priority: 'high',
            },
          ],
          isActive: true,
        },
      ],
      isActive: true,
      color: '#10B981',
      strokeWidth: 2,
      fillOpacity: 0.2,
      robotIds: [],
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'gf-restricted',
      name: 'Restricted Area',
      description: 'High-security area - no robot access',
      type: 'circle',
      coordinates: [{ latitude: 40.7595, longitude: -73.9845 }],
      radius: 10,
      rules: [
        {
          id: 'rule-2',
          name: 'Entry Forbidden',
          trigger: 'enter',
          actions: [
            {
              id: 'action-2',
              type: 'stop_robot',
              parameters: { immediate: true },
              priority: 'critical',
            },
            {
              id: 'action-3',
              type: 'alert',
              parameters: { message: 'Unauthorized area entry', severity: 'critical' },
              priority: 'critical',
            },
          ],
          isActive: true,
        },
      ],
      isActive: true,
      color: '#EF4444',
      strokeWidth: 3,
      fillOpacity: 0.3,
      robotIds: [],
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
  ]
}

function generateMockPaths(waypoints: Waypoint[]): Path[] {
  return [
    {
      id: 'path-assembly-cycle',
      name: 'Assembly Line Cycle',
      description: 'Standard pickup and delivery cycle for assembly line',
      waypoints: waypoints.slice(0, 2).map((wp) => wp.id),
      isOptimized: true,
      totalDistance: 150,
      estimatedDuration: 480,
      status: 'active',
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  ]
}

function generateMockEvents(geofences: Geofence[], robots: any[]): GeofenceEvent[] {
  const events: GeofenceEvent[] = []

  if (geofences.length > 0 && robots.length > 0) {
    events.push({
      id: 'event-1',
      geofenceId: geofences[0].id,
      geofenceName: geofences[0].name,
      robotId: robots[0].id,
      robotName: robots[0].name,
      ruleId: geofences[0].rules[0].id,
      ruleName: geofences[0].rules[0].name,
      eventType: 'exit',
      coordinates: { latitude: 40.7579, longitude: -73.9841 },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      severity: 'warning',
      message: `${robots[0].name} exited ${geofences[0].name}`,
      actionsTaken: ['Alert sent to operator'],
      acknowledged: false,
    })
  }

  return events
}
