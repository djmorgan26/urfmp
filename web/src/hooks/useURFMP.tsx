import React, { createContext, useContext, useEffect, useState } from 'react'
import { URFMP } from '@urfmp/sdk'
import { Robot, RobotTelemetry } from '@urfmp/types'
import type { RobotVendor } from '@urfmp/types'
import { toast } from 'sonner'

// Mock data for demo mode
const generateMockRobots = (): Robot[] => [
  {
    id: 'demo-robot-1',
    name: 'UR5e Production Line Alpha',
    model: 'UR5e',
    serialNumber: 'UR5E-2024-001',
    vendor: 'Universal Robots' as RobotVendor,
    status: 'online' as any,
    location: {
      facility: 'Demo Factory',
      area: 'Production Floor',
      cell: 'Assembly Line A',
      coordinates: { x: 125.5, y: 245.8, z: 300.2 }
    },
    configuration: {
      axes: 6,
      payload: 5.0,
      reach: 850,
      capabilities: [],
      customSettings: {}
    },
    organizationId: 'demo-org',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    lastSeen: new Date(),
    firmwareVersion: '5.15.0',
  },
  {
    id: 'demo-robot-2',
    name: 'UR10e Packaging Station',
    model: 'UR10e',
    serialNumber: 'UR10E-2024-002',
    vendor: 'Universal Robots' as RobotVendor,
    status: 'idle' as any,
    location: {
      facility: 'Demo Factory',
      area: 'Production Floor',
      cell: 'Packaging Line B',
      coordinates: { x: 200.1, y: 180.5, z: 285.0 }
    },
    configuration: {
      axes: 6,
      payload: 10.0,
      reach: 1300,
      capabilities: [],
      customSettings: {}
    },
    organizationId: 'demo-org',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date(),
    lastSeen: new Date(),
    firmwareVersion: '5.15.0',
  },
  {
    id: 'demo-robot-3',
    name: 'UR16e Heavy Lifting Unit',
    model: 'UR16e',
    serialNumber: 'UR16E-2024-003',
    vendor: 'Universal Robots' as RobotVendor,
    status: 'maintenance' as any,
    location: {
      facility: 'Demo Factory',
      area: 'Production Floor',
      cell: 'Heavy Assembly C',
      coordinates: { x: 75.2, y: 320.1, z: 250.5 }
    },
    configuration: {
      axes: 6,
      payload: 16.0,
      reach: 900,
      capabilities: [],
      customSettings: {}
    },
    organizationId: 'demo-org',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date(),
    lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
    firmwareVersion: '5.14.2',
  }
]

interface URFMPContextType {
  urfmp: URFMP | null
  robots: Robot[]
  isConnected: boolean
  isLoading: boolean
  error: string | null
  refreshRobots: () => Promise<void>
  sendCommand: (robotId: string, command: any) => Promise<void>
}

const URFMPContext = createContext<URFMPContextType | undefined>(undefined)

interface URFMPProviderProps {
  children: React.ReactNode
}

export function URFMPProvider({ children }: URFMPProviderProps) {
  const [urfmp, setUrfmp] = useState<URFMP | null>(null)
  const [robots, setRobots] = useState<Robot[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<number>(0)
  const [backoffDelay, setBackoffDelay] = useState<number>(5000)

  useEffect(() => {
    initializeURFMP()
  }, [])

  const initializeURFMP = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Check if we're in demo mode
      const isDemo = import.meta.env.VITE_DEMO_MODE === 'true' ||
                    (!import.meta.env.VITE_URFMP_API_URL && window.location.hostname !== 'localhost')

      if (isDemo) {
        console.log('🎭 Running in demo mode - using mock data')
        setIsConnected(true)
        setIsLoading(false)
        setRobots(generateMockRobots())
        return
      }

      // Initialize URFMP client
      const client = new URFMP({
        apiKey: import.meta.env.VITE_URFMP_API_KEY || 'demo-api-key',
        baseUrl: import.meta.env.VITE_URFMP_API_URL || 'http://localhost:3000',
        websocketUrl: import.meta.env.VITE_URFMP_WS_URL || 'ws://localhost:3000/ws',
      })

      setUrfmp(client)

      // Connect to WebSocket for real-time updates
      await client.connectWebSocket()
      setIsConnected(true)

      // Set up event handlers
      client.on('robot:status', (data: any) => {
        console.log('Robot status update:', data)
        updateRobotStatus(data.robotId, data.status)
        toast.info(`Robot ${data.robotName || data.robotId} status: ${data.status}`)
      })

      client.on('robot:alert', (data: any) => {
        console.log('Robot alert:', data)
        if (data.severity === 'critical') {
          toast.error(`Critical Alert: ${data.message}`)
        } else if (data.severity === 'warning') {
          toast.warning(`Warning: ${data.message}`)
        } else {
          toast.info(`Info: ${data.message}`)
        }
      })

      client.on('robot:telemetry', (data: any) => {
        // Handle real-time telemetry updates
        updateRobotTelemetry(data.robotId, data)
      })

      // Load initial robots
      await refreshRobots(client)
    } catch (err) {
      console.error('Failed to initialize URFMP:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize URFMP')
      toast.error('Failed to connect to URFMP')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshRobots = async (client?: URFMP) => {
    try {
      // Handle demo mode
      const isDemo = import.meta.env.VITE_DEMO_MODE === 'true' ||
                    (!import.meta.env.VITE_URFMP_API_URL && window.location.hostname !== 'localhost')

      if (isDemo) {
        setRobots(generateMockRobots())
        return
      }

      const urfmpClient = client || urfmp
      if (!urfmpClient) return

      // Rate limiting with exponential backoff
      const now = Date.now()
      if (now - lastRefresh < backoffDelay) {
        console.log(`Rate limiting: skipping robots refresh (backoff: ${backoffDelay}ms)`)
        return
      }

      setLastRefresh(now)
      const robotList = await urfmpClient.getRobots()
      setRobots(robotList)
      setError(null) // Clear any previous errors on success

      // Reset backoff delay on success
      setBackoffDelay(5000)
    } catch (err) {
      console.error('Failed to refresh robots:', err)

      // Handle 429 errors with exponential backoff
      if (
        err instanceof Error &&
        (err.message.includes('429') || err.message.includes('Too Many Requests'))
      ) {
        console.log('429 detected, increasing backoff delay')
        setBackoffDelay((prev) => Math.min(prev * 2, 60000)) // Max 1 minute backoff
      } else {
        setError(err instanceof Error ? err.message : 'Failed to refresh robots')
      }
    }
  }

  const updateRobotStatus = (robotId: string, status: string) => {
    setRobots((prev) =>
      prev.map((robot) => (robot.id === robotId ? { ...robot, status: status as any } : robot))
    )
  }

  const updateRobotTelemetry = (robotId: string, telemetry: RobotTelemetry) => {
    setRobots((prev) =>
      prev.map((robot) =>
        robot.id === robotId
          ? {
              ...robot,
              lastSeen: telemetry.timestamp,
              // Update any other relevant fields from telemetry
            }
          : robot
      )
    )
  }

  const sendCommand = async (robotId: string, command: any) => {
    try {
      // Handle demo mode
      if (import.meta.env.VITE_DEMO_MODE === 'true') {
        toast.success(`Demo: Command sent to ${robotId}: ${command.type}`)
        return
      }

      if (!urfmp) throw new Error('URFMP not initialized')

      const result = await urfmp.sendCommand(robotId, command)

      if (result.success) {
        toast.success(`Command sent successfully: ${command.type}`)
      } else {
        toast.error(`Command failed: ${result.error || 'Unknown error'}`)
      }
    } catch (err) {
      console.error('Failed to send command:', err)
      toast.error(`Failed to send command: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const value: URFMPContextType = {
    urfmp,
    robots,
    isConnected,
    isLoading,
    error,
    refreshRobots: () => refreshRobots(),
    sendCommand,
  }

  return <URFMPContext.Provider value={value}>{children}</URFMPContext.Provider>
}

export function useURFMP() {
  const context = useContext(URFMPContext)
  if (context === undefined) {
    throw new Error('useURFMP must be used within a URFMPProvider')
  }
  return context
}
