import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useDashboard } from './useDashboard'

// Mock the URFMP SDK
vi.mock('@urfmp/sdk', () => ({
  URFMP: vi.fn().mockImplementation(() => ({
    getRobots: vi.fn(),
    getTelemetry: vi.fn(),
    health: vi.fn(),
  })),
}))

describe('useDashboard Hook', () => {
  let queryClient: QueryClient

  // Create wrapper component for React Query
  const createWrapper = (client: QueryClient) => {
    const TestWrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    return TestWrapper
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retries for tests
          gcTime: 0, // Disable garbage collection
        },
      },
    })
    vi.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(queryClient),
    })

    expect(result.current.metrics).toEqual({
      totalRobots: 0,
      activeRobots: 0,
      offlineRobots: 0,
      alertsCount: 0,
      totalPowerConsumption: 0,
      averageEfficiency: 0,
      uptimePercentage: 0,
      totalTasksCompleted: 0,
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBe(null)
    expect(result.current.robots).toEqual([])
    expect(result.current.alerts).toEqual([])
  })

  it('should handle successful data loading', async () => {
    const mockRobots = [
      {
        id: '1',
        name: 'Robot 1',
        status: 'online',
        powerConsumption: 100,
        efficiency: 85,
        lastSeen: new Date(),
      },
      {
        id: '2',
        name: 'Robot 2',
        status: 'offline',
        powerConsumption: 0,
        efficiency: 0,
        lastSeen: new Date(),
      },
    ]

    const mockSDK = await import('@urfmp/sdk')
    const mockURFMP = mockSDK.URFMP as any
    mockURFMP.mockImplementation(() => ({
      getRobots: vi.fn().mockResolvedValue({ data: mockRobots }),
      getTelemetry: vi.fn().mockResolvedValue({ data: [] }),
      health: vi.fn().mockResolvedValue({ status: 'ok' }),
    }))

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.robots).toHaveLength(2)
    expect(result.current.metrics.totalRobots).toBe(2)
    expect(result.current.metrics.activeRobots).toBe(1)
    expect(result.current.metrics.offlineRobots).toBe(1)
  })

  it('should calculate metrics correctly', async () => {
    const mockRobots = [
      {
        id: '1',
        name: 'Robot 1',
        status: 'running',
        powerConsumption: 150,
        efficiency: 90,
        lastSeen: new Date(),
      },
      {
        id: '2',
        name: 'Robot 2',
        status: 'running',
        powerConsumption: 120,
        efficiency: 80,
        lastSeen: new Date(),
      },
      {
        id: '3',
        name: 'Robot 3',
        status: 'idle',
        powerConsumption: 50,
        efficiency: 95,
        lastSeen: new Date(),
      },
    ]

    const mockSDK = await import('@urfmp/sdk')
    const mockURFMP = mockSDK.URFMP as any
    mockURFMP.mockImplementation(() => ({
      getRobots: vi.fn().mockResolvedValue({ data: mockRobots }),
      getTelemetry: vi.fn().mockResolvedValue({ data: [] }),
      health: vi.fn().mockResolvedValue({ status: 'ok' }),
    }))

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.metrics.totalRobots).toBe(3)
    expect(result.current.metrics.activeRobots).toBe(3) // running + idle = active
    expect(result.current.metrics.totalPowerConsumption).toBe(320) // 150 + 120 + 50
    expect(result.current.metrics.averageEfficiency).toBe(88.33) // (90 + 80 + 95) / 3
  })

  it('should handle API errors gracefully', async () => {
    const mockSDK = await import('@urfmp/sdk')
    const mockURFMP = mockSDK.URFMP as any
    mockURFMP.mockImplementation(() => ({
      getRobots: vi.fn().mockRejectedValue(new Error('API Error')),
      getTelemetry: vi.fn().mockRejectedValue(new Error('API Error')),
      health: vi.fn().mockRejectedValue(new Error('API Error')),
    }))

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.robots).toEqual([])
    expect(result.current.metrics.totalRobots).toBe(0)
  })

  it('should provide refresh functionality', async () => {
    const mockSDK = await import('@urfmp/sdk')
    const mockURFMP = mockSDK.URFMP as any
    const mockGetRobots = vi.fn().mockResolvedValue({ data: [] })

    mockURFMP.mockImplementation(() => ({
      getRobots: mockGetRobots,
      getTelemetry: vi.fn().mockResolvedValue({ data: [] }),
      health: vi.fn().mockResolvedValue({ status: 'ok' }),
    }))

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Call refresh
    result.current.refresh()

    await waitFor(() => {
      expect(mockGetRobots).toHaveBeenCalledTimes(2) // Initial + refresh
    })
  })

  it('should handle robot status filtering', async () => {
    const mockRobots = [
      { id: '1', name: 'Robot 1', status: 'online', powerConsumption: 100, efficiency: 85 },
      { id: '2', name: 'Robot 2', status: 'offline', powerConsumption: 0, efficiency: 0 },
      { id: '3', name: 'Robot 3', status: 'error', powerConsumption: 0, efficiency: 0 },
      { id: '4', name: 'Robot 4', status: 'running', powerConsumption: 150, efficiency: 90 },
      { id: '5', name: 'Robot 5', status: 'idle', powerConsumption: 20, efficiency: 95 },
    ]

    const mockSDK = await import('@urfmp/sdk')
    const mockURFMP = mockSDK.URFMP as any
    mockURFMP.mockImplementation(() => ({
      getRobots: vi.fn().mockResolvedValue({ data: mockRobots }),
      getTelemetry: vi.fn().mockResolvedValue({ data: [] }),
      health: vi.fn().mockResolvedValue({ status: 'ok' }),
    }))

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.metrics.totalRobots).toBe(5)
    expect(result.current.metrics.activeRobots).toBe(3) // online, running, idle
    expect(result.current.metrics.offlineRobots).toBe(2) // offline, error
  })

  it('should handle empty robot arrays', () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(queryClient),
    })

    expect(result.current.metrics.totalRobots).toBe(0)
    expect(result.current.metrics.activeRobots).toBe(0)
    expect(result.current.metrics.offlineRobots).toBe(0)
    expect(result.current.metrics.totalPowerConsumption).toBe(0)
    expect(result.current.metrics.averageEfficiency).toBe(0)
  })
})
