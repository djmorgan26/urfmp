import { useEffect, useRef, useCallback } from 'react'
import { useURFMP } from '../../../hooks/useURFMP'

interface Position {
  x: number
  y: number
  z: number
}

interface VirtualRobotState {
  id: string
  position: Position
  rotation: number
  speed: number
  battery: number
  status: 'idle' | 'moving' | 'error'
}

interface TelemetryData {
  robotId: string
  position: {
    x: number
    y: number
    z: number
  }
  rotation: number
  velocity: number
  battery: number
  status: string
  timestamp: number
  metrics: {
    [key: string]: number | string | boolean
  }
}

export const useVirtualRobotTelemetry = (robotId: string) => {
  const { urfmp, isConnected } = useURFMP()
  const telemetryIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const robotStateRef = useRef<VirtualRobotState>({
    id: robotId,
    position: { x: 0, y: 0.5, z: 0 },
    rotation: 0,
    speed: 0,
    battery: 100,
    status: 'idle',
  })

  // Send telemetry to URFMP backend
  const sendTelemetry = useCallback(
    async (data: Partial<TelemetryData>) => {
      if (!urfmp) {
        console.warn('[Virtual Robot] URFMP SDK not initialized')
        return
      }

      const state = robotStateRef.current
      const telemetryPayload = {
        position: data.position || state.position,
        rotation: data.rotation ?? state.rotation,
        velocity: data.velocity ?? state.speed,
        battery: data.battery ?? state.battery,
        status: data.status || state.status,
        timestamp: new Date(),
        metrics: {
          type: 'virtual',
          simulator: 'urfmp-studio',
          ...data.metrics,
        },
      }

      try {
        await urfmp.sendTelemetry(robotId, telemetryPayload)
        console.log('[Virtual Robot] Telemetry sent:', telemetryPayload)
      } catch (error) {
        console.error('[Virtual Robot] Failed to send telemetry:', error)
      }
    },
    [urfmp, robotId]
  )

  // Update robot state
  const updateRobotState = useCallback(
    (updates: Partial<VirtualRobotState>) => {
      robotStateRef.current = {
        ...robotStateRef.current,
        ...updates,
      }

      // Send telemetry when state changes
      sendTelemetry(updates)
    },
    [sendTelemetry]
  )

  // Start periodic telemetry streaming (every 2 seconds)
  const startTelemetryStream = useCallback(() => {
    if (telemetryIntervalRef.current) return // Already streaming

    telemetryIntervalRef.current = setInterval(() => {
      sendTelemetry({})
    }, 2000)

    console.log('[Virtual Robot] Started telemetry streaming')
  }, [sendTelemetry])

  // Stop periodic telemetry streaming
  const stopTelemetryStream = useCallback(() => {
    if (telemetryIntervalRef.current) {
      clearInterval(telemetryIntervalRef.current)
      telemetryIntervalRef.current = null
      console.log('[Virtual Robot] Stopped telemetry streaming')
    }
  }, [])

  // Start telemetry streaming when connected
  useEffect(() => {
    if (!isConnected || !urfmp) return

    console.log(`[Virtual Robot] Connected to URFMP: ${robotId}`)
    startTelemetryStream()

    return () => {
      stopTelemetryStream()
      console.log(`[Virtual Robot] Disconnected: ${robotId}`)
    }
  }, [isConnected, urfmp, robotId, startTelemetryStream, stopTelemetryStream])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTelemetryStream()
    }
  }, [stopTelemetryStream])

  return {
    sendTelemetry,
    updateRobotState,
    robotState: robotStateRef.current,
    isConnected,
    startTelemetryStream,
    stopTelemetryStream,
  }
}
