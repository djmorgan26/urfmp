import React, { createContext, useContext, useEffect, useState } from 'react'
import { URFMP } from '@urfmp/sdk'
import { Robot, RobotTelemetry } from '@urfmp/types'
import { toast } from 'sonner'

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

  useEffect(() => {
    initializeURFMP()
  }, [])

  const initializeURFMP = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Initialize URFMP client
      const client = new URFMP({
        apiKey: import.meta.env.VITE_URFMP_API_KEY || 'demo-api-key',
        baseUrl: import.meta.env.VITE_URFMP_API_URL || 'http://localhost:3000',
        websocketUrl: import.meta.env.VITE_URFMP_WS_URL || 'ws://localhost:3000',
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
      const urfmpClient = client || urfmp
      if (!urfmpClient) return

      const robotList = await urfmpClient.getRobots()
      setRobots(robotList)
    } catch (err) {
      console.error('Failed to refresh robots:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh robots')
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
