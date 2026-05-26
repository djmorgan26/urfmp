import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { URFMP } from '@urfmp/sdk'
import { Robot, RobotTelemetry } from '@urfmp/types'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { getAccessToken } from '../lib/auth'
import { isDemoMode } from '../lib/demo'
import { generateDemoRobots, generateDemoTelemetry } from '../lib/demoFixtures'

// Backwards-compatible alias: demo fleet now lives in lib/demoFixtures.ts.
const generateMockRobots = generateDemoRobots

interface URFMPContextType {
  urfmp: URFMP | null
  robots: Robot[]
  isConnected: boolean
  isLoading: boolean
  error: string | null
  refreshRobots: (force?: boolean) => Promise<void>
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
  const { isAuthenticated, tokens } = useAuth()

  useEffect(() => {
    // Only initialize URFMP if user is authenticated
    if (isAuthenticated && tokens) {
      initializeURFMP()
    } else {
      // Clear state if not authenticated
      setUrfmp(null)
      setRobots([])
      setIsConnected(false)
      setIsLoading(false)
      setError(null)
    }
  }, [isAuthenticated])

  // Update URFMP client token when it changes (e.g., after refresh)
  useEffect(() => {
    if (urfmp && tokens?.accessToken && typeof urfmp.updateToken === 'function') {
      urfmp.updateToken(tokens.accessToken)
    }
  }, [tokens?.accessToken, urfmp])

  // Demo mode: simulate "live" telemetry by drifting each robot's position
  // and lastSeen on an interval, so the UI feels real-time without a backend.
  const demoTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    if (!isDemoMode()) return

    demoTimer.current = setInterval(() => {
      setRobots((prev) =>
        prev.map((robot) => {
          const isDown = robot.status === 'maintenance' || robot.status === 'error'
          const sample = generateDemoTelemetry(robot.id)
          return {
            ...robot,
            location: robot.location
              ? {
                  ...robot.location,
                  coordinates: isDown ? robot.location.coordinates : sample.data.position,
                }
              : robot.location,
            lastSeen: isDown ? robot.lastSeen : new Date(),
            updatedAt: new Date(),
          }
        })
      )
    }, 3000)

    return () => {
      if (demoTimer.current) clearInterval(demoTimer.current)
    }
  }, [])

  const initializeURFMP = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Demo mode: render entirely from in-memory fixtures. No backend, no
      // WebSocket, no auth tokens. This runs before any network/token logic.
      if (isDemoMode()) {
        console.log('🎭 Running in demo mode - using simulated fleet data')
        setUrfmp(null)
        setIsConnected(true)
        setRobots(generateMockRobots())
        setIsLoading(false)
        return
      }

      // Get access token from auth
      const accessToken = getAccessToken()
      if (!accessToken) {
        console.warn('No access token available')
        setIsLoading(false)
        return
      }

      // Check if we're in demo mode - MUST be explicitly set to "true"
      const isDemo = import.meta.env.VITE_DEMO_MODE === 'true'

      // Decode JWT to show user/org info
      const tokenParts = accessToken.split('.')
      let decodedToken = null
      if (tokenParts.length === 3) {
        try {
          decodedToken = JSON.parse(atob(tokenParts[1]))
        } catch (e) {
          console.error('Failed to decode JWT:', e)
        }
      }

      // Enable SDK debug logging
      ;(window as any).DEBUG_SDK = true

      console.log('🔍 Environment check:', {
        VITE_DEMO_MODE: import.meta.env.VITE_DEMO_MODE,
        VITE_URFMP_API_URL: import.meta.env.VITE_URFMP_API_URL,
        VITE_URFMP_WS_URL: import.meta.env.VITE_URFMP_WS_URL,
        isDemo,
        userInfo: decodedToken
          ? {
              userId: decodedToken.sub,
              orgId: decodedToken.org,
              email: decodedToken.email,
              role: decodedToken.role,
            }
          : 'Failed to decode',
      })

      if (isDemo) {
        console.log('🎭 Running in demo mode - using mock data')
        setUrfmp(null) // No real client in demo mode
        setIsConnected(true)
        setIsLoading(false)
        setRobots(generateMockRobots())
        return
      }

      // Initialize URFMP client with JWT token instead of API key
      const client = new URFMP({
        apiKey: accessToken, // Use JWT token as API key
        baseUrl: import.meta.env.VITE_URFMP_API_URL || 'http://localhost:3000',
        websocketUrl: import.meta.env.VITE_URFMP_WS_URL || 'ws://localhost:3000',
        useJWT: true, // Explicitly set JWT mode
      })

      setUrfmp(client)

      // Load initial robots first (don't wait for WebSocket)
      await refreshRobots(client)

      // Set up event handlers before connecting
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

      // Connect to WebSocket in background (don't block on this)
      client
        .connectWebSocket()
        .then(() => {
          console.log('WebSocket connected')
          setIsConnected(true)
        })
        .catch((err) => {
          console.warn('WebSocket connection failed (non-critical):', err)
          // Don't fail the whole app if WebSocket doesn't work
        })
    } catch (err) {
      console.error('Failed to initialize URFMP:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize URFMP')
      toast.error('Failed to connect to URFMP')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshRobots = async (client?: URFMP, force = false) => {
    try {
      // Handle demo mode. The live-telemetry interval keeps the fleet fresh,
      // so a manual refresh just re-seeds it once (and never hits the network).
      const isDemo = isDemoMode()

      if (isDemo) {
        console.log('🎭 Demo mode: using simulated fleet (no API call)')
        setRobots((prev) => (prev.length > 0 ? prev : generateMockRobots()))
        return
      }

      const urfmpClient = client || urfmp
      if (!urfmpClient) {
        console.warn('⚠️ No URFMP client available')
        return
      }

      // Rate limiting with exponential backoff (skip if force=true)
      const now = Date.now()
      if (!force && now - lastRefresh < backoffDelay) {
        console.log(`⏸️ Rate limiting: skipping robots refresh (backoff: ${backoffDelay}ms)`)
        return
      }

      console.log('🚀 Fetching robots from API...', force ? '(FORCED)' : '')
      setLastRefresh(now)
      const robotList = await urfmpClient.getRobots()
      console.log('✅ Robots fetched successfully:', robotList.length, 'robots')
      console.log('📋 Robot data:', robotList)
      setRobots(robotList)
      setError(null) // Clear any previous errors on success

      // Reset backoff delay on success
      setBackoffDelay(5000)
    } catch (err: any) {
      console.error('❌ Failed to refresh robots:', err)
      console.error('Error details:', {
        message: err?.message,
        response: err?.response?.data,
        status: err?.response?.status,
        config: {
          url: err?.config?.url,
          baseURL: err?.config?.baseURL,
          headers: err?.config?.headers,
        },
      })

      // Handle 429 errors with exponential backoff
      if (
        err instanceof Error &&
        (err.message.includes('429') || err.message.includes('Too Many Requests'))
      ) {
        console.log('⚠️ 429 detected, increasing backoff delay')
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
      // Handle demo mode — acknowledge locally, never hit the API.
      if (isDemoMode()) {
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
    refreshRobots: (force?: boolean) => refreshRobots(undefined, force),
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
