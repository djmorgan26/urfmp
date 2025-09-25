import {
  Robot,
  RobotVendor,
  RobotStatus,
  RobotCommandType,
  CommandStatus,
  CommandPriority,
  RobotCapability,
} from '../robot'

describe('Robot Types', () => {
  describe('RobotVendor enum', () => {
    it('should have all expected vendor values', () => {
      expect(RobotVendor.UNIVERSAL_ROBOTS).toBe('universal_robots')
      expect(RobotVendor.KUKA).toBe('kuka')
      expect(RobotVendor.ABB).toBe('abb')
      expect(RobotVendor.FANUC).toBe('fanuc')
      expect(RobotVendor.YASKAWA).toBe('yaskawa')
      expect(RobotVendor.DOOSAN).toBe('doosan')
      expect(RobotVendor.TECHMAN).toBe('techman')
      expect(RobotVendor.CUSTOM).toBe('custom')
    })

    it('should contain all defined values', () => {
      const vendorValues = Object.values(RobotVendor)
      expect(vendorValues).toHaveLength(8)
      expect(vendorValues).toContain('universal_robots')
      expect(vendorValues).toContain('custom')
    })
  })

  describe('RobotStatus enum', () => {
    it('should have all expected status values', () => {
      expect(RobotStatus.ONLINE).toBe('online')
      expect(RobotStatus.OFFLINE).toBe('offline')
      expect(RobotStatus.ERROR).toBe('error')
      expect(RobotStatus.MAINTENANCE).toBe('maintenance')
      expect(RobotStatus.RUNNING).toBe('running')
      expect(RobotStatus.IDLE).toBe('idle')
      expect(RobotStatus.STOPPED).toBe('stopped')
      expect(RobotStatus.EMERGENCY_STOP).toBe('emergency_stop')
    })

    it('should contain all defined values', () => {
      const statusValues = Object.values(RobotStatus)
      expect(statusValues).toHaveLength(8)
      expect(statusValues).toContain('online')
      expect(statusValues).toContain('emergency_stop')
    })
  })

  describe('RobotCommandType enum', () => {
    it('should have all expected command types', () => {
      expect(RobotCommandType.START).toBe('start')
      expect(RobotCommandType.STOP).toBe('stop')
      expect(RobotCommandType.PAUSE).toBe('pause')
      expect(RobotCommandType.RESUME).toBe('resume')
      expect(RobotCommandType.EMERGENCY_STOP).toBe('emergency_stop')
      expect(RobotCommandType.RESET).toBe('reset')
    })
  })

  describe('CommandStatus enum', () => {
    it('should have all expected command status values', () => {
      expect(CommandStatus.PENDING).toBe('pending')
      expect(CommandStatus.EXECUTING).toBe('executing')
      expect(CommandStatus.COMPLETED).toBe('completed')
      expect(CommandStatus.FAILED).toBe('failed')
      expect(CommandStatus.CANCELLED).toBe('cancelled')
    })
  })

  describe('CommandPriority enum', () => {
    it('should have all expected priority values', () => {
      expect(CommandPriority.LOW).toBe('low')
      expect(CommandPriority.NORMAL).toBe('normal')
      expect(CommandPriority.HIGH).toBe('high')
      expect(CommandPriority.CRITICAL).toBe('critical')
    })
  })

  describe('RobotCapability enum', () => {
    it('should have all expected capability values', () => {
      expect(RobotCapability.WELDING).toBe('welding')
      expect(RobotCapability.PAINTING).toBe('painting')
      expect(RobotCapability.ASSEMBLY).toBe('assembly')
      expect(RobotCapability.MATERIAL_HANDLING).toBe('material_handling')
      expect(RobotCapability.CUSTOM).toBe('custom')
    })
  })

  describe('Robot interface', () => {
    it('should accept valid robot data', () => {
      const validRobot: Robot = {
        id: 'robot-123',
        organizationId: 'org-456',
        name: 'Test Robot UR5e',
        model: 'UR5e',
        vendor: RobotVendor.UNIVERSAL_ROBOTS,
        serialNumber: 'SN123456',
        firmwareVersion: '5.11.0',
        status: RobotStatus.ONLINE,
        configuration: {
          axes: 6,
          payload: 5.0,
          reach: 850,
          capabilities: [RobotCapability.WELDING, RobotCapability.ASSEMBLY],
          customSettings: {
            safetyMode: 'collaborative',
            speedLimit: 100,
          },
        },
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(validRobot.id).toBe('robot-123')
      expect(validRobot.vendor).toBe(RobotVendor.UNIVERSAL_ROBOTS)
      expect(validRobot.status).toBe(RobotStatus.ONLINE)
      expect(validRobot.configuration).toBeDefined()
      expect(validRobot.configuration.axes).toBe(6)
      expect(validRobot.configuration.capabilities).toContain(RobotCapability.WELDING)
    })

    it('should accept robot with optional location', () => {
      const robotWithLocation: Robot = {
        id: 'robot-123',
        organizationId: 'org-456',
        name: 'Test Robot',
        model: 'UR5e',
        vendor: RobotVendor.UNIVERSAL_ROBOTS,
        serialNumber: 'SN123456',
        firmwareVersion: '5.11.0',
        status: RobotStatus.ONLINE,
        location: {
          facility: 'Factory A',
          area: 'Assembly Line 1',
          cell: 'Cell 3',
          coordinates: {
            x: 125.5,
            y: 245.8,
            z: 300.2,
          },
        },
        configuration: {
          axes: 6,
          payload: 5.0,
          reach: 850,
          capabilities: [],
          customSettings: {},
        },
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(robotWithLocation.location).toBeDefined()
      expect(robotWithLocation.location?.facility).toBe('Factory A')
      expect(robotWithLocation.location?.coordinates?.x).toBe(125.5)
      expect(robotWithLocation.location?.coordinates?.z).toBe(300.2)
    })
  })
})
