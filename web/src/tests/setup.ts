/**
 * Vitest Test Setup
 *
 * This file runs before all tests and sets up the testing environment
 */

import { vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock environment variables for tests
vi.mock('import.meta.env', () => ({
  VITE_COMPANY_NAME: 'URFMP',
  VITE_PRODUCT_NAME: 'URFMP',
  VITE_PRODUCT_FULL_NAME: 'Universal Robot Fleet Management Platform',
  VITE_TAGLINE: 'The Stripe of Robotics',
  VITE_DESCRIPTION: 'Monitor any robot in 7 lines of code',
  VITE_URFMP_API_KEY: 'urfmp_test_key_12345',
  NODE_ENV: 'test',
  DEV_MOCK_ROBOTS: 'true'
}))

// Mock external dependencies
vi.mock('leaflet', () => ({
  Map: vi.fn(),
  TileLayer: vi.fn(),
  Marker: vi.fn(),
  Icon: {
    Default: {
      prototype: {},
      mergeOptions: vi.fn()
    }
  },
  latLngBounds: vi.fn(),
  icon: vi.fn()
}))

// Mock react-leaflet components
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => children,
  TileLayer: () => null,
  Marker: () => null,
  Popup: ({ children }: any) => children,
  Polyline: () => null,
  Circle: () => null,
  Polygon: () => null,
  useMap: () => ({
    fitBounds: vi.fn(),
    setView: vi.fn(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn()
  }),
  useMapEvents: () => null
}))

// Mock Lucide React icons
vi.mock('lucide-react', () => {
  const MockIcon = ({ className, ...props }: any) =>
    ({ type: 'span', props: { className, ...props, 'data-testid': 'mock-icon' } })

  return new Proxy({}, {
    get: () => MockIcon
  })
})

// Mock Sonner toasts
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  },
  Toaster: () => null
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (target, prop) => {
      return ({ children, ...props }: any) => ({
        type: prop,
        props: { ...props, children }
      })
    }
  }),
  AnimatePresence: ({ children }: any) => children
}))

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => children,
  LineChart: () => null,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  BarChart: () => null,
  Bar: () => null,
  PieChart: () => null,
  Pie: () => null,
  Cell: () => null
}))

// Mock WebSocket
global.WebSocket = vi.fn(() => ({
  close: vi.fn(),
  send: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: 1,
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
})) as any

// Mock fetch for API calls
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}
vi.stubGlobal('localStorage', localStorageMock)

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}
vi.stubGlobal('sessionStorage', sessionStorageMock)

// Mock URL.createObjectURL
vi.stubGlobal('URL', {
  createObjectURL: vi.fn(() => 'mocked-object-url'),
  revokeObjectURL: vi.fn()
})

// Mock canvas for map icons
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Array(4) })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => []),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 10 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
  toDataURL: vi.fn(() => 'data:image/png;base64,test')
})) as any

HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,test')

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Console spy for testing console outputs
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
}

// Export test utilities
export const mockFetch = (data: any, ok = true) => {
  (global.fetch as any).mockResolvedValueOnce({
    ok,
    json: async () => data,
    text: async () => JSON.stringify(data),
    status: ok ? 200 : 500,
    statusText: ok ? 'OK' : 'Internal Server Error'
  })
}

export const mockFetchError = (error: string) => {
  (global.fetch as any).mockRejectedValueOnce(new Error(error))
}

export const createMockRobot = (overrides = {}) => ({
  id: 'test-robot-1',
  name: 'Test Robot UR5e',
  model: 'UR5e',
  vendor: 'Universal Robots',
  status: 'online',
  powerConsumption: 150,
  efficiency: 85,
  lastSeen: new Date(),
  organizationId: 'd8077863-d602-45fd-a253-78ee0d3d49a8',
  ...overrides
})

export const createMockGeofence = (overrides = {}) => ({
  id: 'test-geofence-1',
  name: 'Test Safety Zone',
  type: 'circle',
  coordinates: [{ latitude: 40.7589, longitude: -73.9851 }],
  radius: 100,
  rules: [],
  isActive: true,
  color: '#ef4444',
  strokeWidth: 2,
  fillOpacity: 0.2,
  robotIds: ['robot-1'],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
})

export const createMockWaypoint = (overrides = {}) => ({
  id: 'test-waypoint-1',
  name: 'Pickup Point A',
  type: 'pickup',
  coordinates: { latitude: 40.7589, longitude: -73.9851, altitude: 10 },
  radius: 5,
  actions: [],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
})

// Test data generators
export const generateMockTelemetry = (robotId: string, count = 10) => {
  return Array.from({ length: count }, (_, i) => ({
    robotId,
    timestamp: new Date(Date.now() - (count - i) * 60000),
    data: {
      position: { x: 100 + i, y: 200 + i, z: 300 },
      temperature: { ambient: 25 + Math.random() * 5 },
      power: { total: 100 + Math.random() * 50 },
      gpsPosition: {
        latitude: 40.7589 + Math.random() * 0.001,
        longitude: -73.9851 + Math.random() * 0.001
      }
    }
  }))
}