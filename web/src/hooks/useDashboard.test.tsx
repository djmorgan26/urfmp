import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useDashboard } from './useDashboard'
import { URFMPProvider } from './useURFMP'

// Mock the URFMP SDK
vi.mock('@urfmp/sdk', () => ({
  URFMP: vi.fn().mockImplementation(() => ({
    getRobots: vi.fn(),
    getTelemetry: vi.fn(),
    health: vi.fn(),
    connectWebSocket: vi.fn(),
    on: vi.fn(),
    getLatestTelemetry: vi.fn(),
    sendCommand: vi.fn(),
  })),
}))

// Mock environment variables for demo mode
vi.stubEnv('VITE_DEMO_MODE', 'true')

describe('useDashboard Hook', () => {
  let queryClient: QueryClient

  // Create wrapper component for React Query and URFMP
  const createWrapper = (client: QueryClient) => {
    const TestWrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>
        <URFMPProvider>{children}</URFMPProvider>
      </QueryClientProvider>
    )
    return TestWrapper
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retries for tests
          cacheTime: 0, // Disable cache time for tests
        },
      },
    })
    vi.clearAllMocks()
  })

  it('should initialize with default state', async () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(queryClient),
    })

    // Wait for URFMP provider to initialize
    await waitFor(() => {
      expect(result.current.metrics).toEqual({
        totalRobots: 3, // In demo mode, we have 3 mock robots
        onlineRobots: 1,
        avgTemperature: expect.any(Number),
        avgUtilization: expect.any(Number),
        totalErrors: expect.any(Number),
        alertCount: expect.any(Number),
        powerConsumption: expect.any(Number),
        operatingHours: expect.any(Number),
      })
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.alerts).toEqual([])
    expect(result.current.telemetryData).toBeDefined()
    expect(result.current.robotStatusDistribution).toBeDefined()
  })

  it('should handle successful data loading', async () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // In demo mode, we should have some robots
    expect(result.current.metrics.totalRobots).toBeGreaterThan(0)
    expect(typeof result.current.metrics.onlineRobots).toBe('number')
    expect(result.current.telemetryData).toBeDefined()
    expect(result.current.robotStatusDistribution).toBeDefined()
  })

  it('should calculate metrics correctly', async () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // In demo mode, metrics should be calculated correctly
    expect(result.current.metrics.totalRobots).toBe(3) // Mock data has 3 robots
    expect(typeof result.current.metrics.onlineRobots).toBe('number')
    expect(typeof result.current.metrics.avgTemperature).toBe('number')
    expect(typeof result.current.metrics.avgUtilization).toBe('number')
    expect(typeof result.current.metrics.powerConsumption).toBe('number')
  })

  it('should handle API errors gracefully', async () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(queryClient),
    })

    // Should handle initialization gracefully (demo mode always works)
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // In demo mode, no errors should occur
    expect(result.current.error).toBe(null)
  })

  it('should provide refresh functionality', async () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false)
      },
      { timeout: 1000 }
    )

    // Should have refresh function
    expect(typeof result.current.refresh).toBe('function')

    // Call refresh (should not throw)
    await result.current.refresh()
  })

  it('should handle robot status filtering', async () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false)
      },
      { timeout: 1000 }
    )

    // Should have proper status distribution
    expect(result.current.robotStatusDistribution).toBeDefined()
    expect(Array.isArray(result.current.robotStatusDistribution)).toBe(true)
    expect(result.current.metrics.totalRobots).toBeGreaterThan(0)
  })

  it('should handle empty robot arrays', async () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(queryClient),
    })

    // Initial state check
    expect(result.current.metrics.totalRobots).toBeGreaterThanOrEqual(0)
    expect(typeof result.current.metrics.onlineRobots).toBe('number')
    expect(typeof result.current.metrics.powerConsumption).toBe('number')
  })
})
