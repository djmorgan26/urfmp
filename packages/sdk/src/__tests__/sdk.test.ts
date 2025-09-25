/**
 * SDK Core Tests
 * Tests for the main SDK exports and functionality
 */

import { URFMP, RobotMonitor, TelemetryStream } from '../index'
import type { URFMPConfig } from '../index'

// Mock the ws module for Node.js testing
jest.mock('ws', () => {
  return jest.fn()
})

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
}))

describe('URFMP SDK', () => {
  describe('SDK Exports', () => {
    it('should export URFMP client class', () => {
      expect(URFMP).toBeDefined()
      expect(typeof URFMP).toBe('function')
    })

    it('should export RobotMonitor class', () => {
      expect(RobotMonitor).toBeDefined()
      expect(typeof RobotMonitor).toBe('function')
    })

    it('should export TelemetryStream class', () => {
      expect(TelemetryStream).toBeDefined()
      expect(typeof TelemetryStream).toBe('function')
    })

    it('should export all types from @urfmp/types', () => {
      // Test that we can import the types namespace
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const types = require('@urfmp/types')

      expect(types.RobotStatus).toBeDefined()
      expect(types.RobotVendor).toBeDefined()
      expect(types.RobotCommandType).toBeDefined()
    })
  })

  describe('URFMP Client Configuration', () => {
    it('should accept valid configuration', () => {
      const config: URFMPConfig = {
        apiKey: 'test-key',
        baseUrl: 'http://localhost:3000',
      }

      expect(() => new URFMP(config)).not.toThrow()
    })

    it('should create client with minimal configuration', () => {
      const config: URFMPConfig = {
        apiKey: 'test-key',
      }

      expect(() => new URFMP(config)).not.toThrow()
    })

    it('should use default configuration values', () => {
      const client = new URFMP({ apiKey: 'test-key' })
      expect(client).toBeDefined()
    })

    it('should handle custom timeout and retries', () => {
      const config: URFMPConfig = {
        apiKey: 'test-key',
        timeout: 5000,
        retries: 5,
      }

      expect(() => new URFMP(config)).not.toThrow()
    })
  })

  describe('SDK Method Availability', () => {
    let client: URFMP

    beforeEach(() => {
      client = new URFMP({
        apiKey: 'test-key',
        baseUrl: 'http://localhost:3000',
      })
    })

    it('should have getRobots method', () => {
      expect(client.getRobots).toBeDefined()
      expect(typeof client.getRobots).toBe('function')
    })

    it('should have health method', () => {
      expect(client.health).toBeDefined()
      expect(typeof client.health).toBe('function')
    })

    it('should have sendCommand method', () => {
      expect(client.sendCommand).toBeDefined()
      expect(typeof client.sendCommand).toBe('function')
    })

    it('should have getLatestTelemetry method', () => {
      expect(client.getLatestTelemetry).toBeDefined()
      expect(typeof client.getLatestTelemetry).toBe('function')
    })

    it('should have connectWebSocket method', () => {
      expect(client.connectWebSocket).toBeDefined()
      expect(typeof client.connectWebSocket).toBe('function')
    })
  })

  describe('RobotMonitor Class', () => {
    let client: URFMP
    let mockRobot: any
    let monitor: RobotMonitor

    beforeEach(() => {
      client = new URFMP({ apiKey: 'test-key' })
      mockRobot = {
        id: 'test-robot-id',
        organizationId: 'test-org',
        name: 'Test Robot',
        vendor: 'universal_robots' as any,
        model: 'UR5',
        serialNumber: 'TEST-001',
        firmwareVersion: '1.0.0',
        status: 'online' as any,
        location: {},
        configuration: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSeen: new Date(),
      }
    })

    afterEach(() => {
      // Clean up any running monitors/streams
      if (monitor && typeof (monitor as any).stopMonitoring === 'function') {
        ;(monitor as any).stopMonitoring()
      }
    })

    it('should create monitor with client and robot', () => {
      expect(() => new RobotMonitor(client, mockRobot as any)).not.toThrow()
    })

    it('should have monitoring methods', () => {
      const monitor = new RobotMonitor(client, mockRobot as any)

      expect(monitor.startMonitoring).toBeDefined()
      expect(monitor.stopMonitoring).toBeDefined()
      expect(typeof monitor.startMonitoring).toBe('function')
      expect(typeof monitor.stopMonitoring).toBe('function')
    })

    it('should handle monitoring options', () => {
      monitor = new RobotMonitor(client, mockRobot as any)

      expect(() => monitor.startMonitoring({ pollRate: 2000, autoReconnect: true })).not.toThrow()
    })
  })

  describe('TelemetryStream Class', () => {
    let client: URFMP
    let stream: TelemetryStream

    beforeEach(() => {
      client = new URFMP({ apiKey: 'test-key' })
    })

    afterEach(() => {
      // Clean up any running streams
      if (stream && typeof (stream as any).stop === 'function') {
        ;(stream as any).stop()
      }
    })

    it('should create telemetry stream with client and robotId', () => {
      expect(() => new TelemetryStream(client, 'test-robot-id')).not.toThrow()
    })

    it('should have stream methods', () => {
      const stream = new TelemetryStream(client, 'test-robot-id')

      expect(stream.start).toBeDefined()
      expect(stream.stop).toBeDefined()
      expect(typeof stream.start).toBe('function')
      expect(typeof stream.stop).toBe('function')
    })

    it('should handle stream options', () => {
      stream = new TelemetryStream(client, 'test-robot-id')

      expect(() => stream.start({ batchSize: 20, flushInterval: 10000 })).not.toThrow()
    })
  })
})

describe('SDK Integration Patterns', () => {
  it('should support the "7 lines of code" pattern', () => {
    // This tests the main SDK value proposition
    const client = new URFMP({ apiKey: 'test-key' })
    const mockRobot = {
      id: 'robot-123',
      organizationId: 'test-org',
      name: 'Test Robot',
      vendor: 'universal_robots' as any,
      model: 'UR5',
      serialNumber: 'TEST-123',
      firmwareVersion: '1.0.0',
      status: 'online' as any,
      location: {},
      configuration: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSeen: new Date(),
    }
    const monitor = new RobotMonitor(client, mockRobot as any)

    expect(client).toBeDefined()
    expect(monitor).toBeDefined()

    // Verify the methods exist for the pattern
    expect(typeof client.getRobots).toBe('function')
    expect(typeof monitor.startMonitoring).toBe('function')
  })

  it('should handle SDK instantiation', () => {
    // Test that SDK creates properly
    const client = new URFMP({
      apiKey: 'urfmp_test_12345',
      baseUrl: 'http://localhost:3000',
    })

    expect(client).toBeInstanceOf(URFMP)
  })
})
