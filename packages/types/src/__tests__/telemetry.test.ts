import {
  TelemetryData,
  RobotTelemetry,
  AngleUnit,
  VelocityUnit,
  CoordinateFrame,
  TelemetrySource
} from '../telemetry'

describe('Telemetry Types', () => {
  describe('Unit enums', () => {
    it('should have correct angle unit values', () => {
      expect(AngleUnit.DEGREES).toBe('degrees')
      expect(AngleUnit.RADIANS).toBe('radians')
    })

    it('should have correct velocity unit values', () => {
      expect(VelocityUnit.METERS_PER_SECOND).toBe('m/s')
      expect(VelocityUnit.MILLIMETERS_PER_SECOND).toBe('mm/s')
      expect(VelocityUnit.INCHES_PER_SECOND).toBe('in/s')
    })

    it('should have correct coordinate frame values', () => {
      expect(CoordinateFrame.BASE).toBe('base')
      expect(CoordinateFrame.TOOL).toBe('tool')
      expect(CoordinateFrame.WORLD).toBe('world')
      expect(CoordinateFrame.USER).toBe('user')
    })
  })

  describe('Telemetry metadata enums', () => {
    it('should have correct telemetry source values', () => {
      expect(TelemetrySource.ROBOT_CONTROLLER).toBe('robot_controller')
      expect(TelemetrySource.EXTERNAL_SENSOR).toBe('external_sensor')
      // expect(TelemetrySource.SIMULATED).toBe('simulated') // This enum value doesn't exist
    })
  })

  describe('TelemetryData interface', () => {
    it('should accept minimal telemetry data', () => {
      const minimalData: TelemetryData = {
        position: {
          x: 100,
          y: 200,
          z: 300
        }
      }

      expect(minimalData.position?.x).toBe(100)
      expect(minimalData.gpsPosition).toBeUndefined()
      expect(minimalData.jointAngles).toBeUndefined()
    })

    it('should accept position data with rotation', () => {
      const positionData: TelemetryData = {
        position: {
          x: 125.5,
          y: 245.8,
          z: 300.2,
          rx: 0.1,
          ry: 0.2,
          rz: 0.3,
          frame: CoordinateFrame.BASE
        }
      }

      expect(positionData.position?.x).toBe(125.5)
      expect(positionData.position?.rx).toBe(0.1)
      expect(positionData.position?.frame).toBe(CoordinateFrame.BASE)
    })

    it('should accept joint angles data', () => {
      const jointData: TelemetryData = {
        jointAngles: {
          joint1: 0.1,
          joint2: 0.2,
          joint3: 0.3,
          joint4: 0.4,
          joint5: 0.5,
          joint6: 0.6,
          unit: AngleUnit.RADIANS
        }
      }

      expect(jointData.jointAngles?.joint1).toBe(0.1)
      expect(jointData.jointAngles?.joint6).toBe(0.6)
      expect(jointData.jointAngles?.unit).toBe(AngleUnit.RADIANS)
    })
  })

  describe('RobotTelemetry interface', () => {
    it('should accept valid robot telemetry', () => {
      const telemetry: RobotTelemetry = {
        id: 'telem-123',
        robotId: 'robot-456',
        timestamp: new Date(),
        data: {
          position: {
            x: 125.5,
            y: 245.8,
            z: 300.2
          }
        },
        metadata: {
          source: TelemetrySource.ROBOT_CONTROLLER,
          quality: 'good' as any,
          samplingRate: 10
        }
      }

      expect(telemetry.robotId).toBe('robot-456')
      expect(telemetry.timestamp).toBeInstanceOf(Date)
      expect(telemetry.data.position?.x).toBe(125.5)
      expect(telemetry.metadata?.source).toBe(TelemetrySource.ROBOT_CONTROLLER)
    })

    it('should accept telemetry without optional metadata', () => {
      const simpleTelemetry: RobotTelemetry = {
        id: 'telem-789',
        robotId: 'robot-123',
        timestamp: new Date(),
        data: {
          position: { x: 0, y: 0, z: 0 }
        }
      }

      expect(simpleTelemetry.metadata).toBeUndefined()
      expect(simpleTelemetry.data.position?.x).toBe(0)
    })
  })

  describe('GPS coordinate validation', () => {
    it('should accept valid GPS coordinates', () => {
      const validCoordinates = [
        { latitude: 40.7589, longitude: -73.9851 }, // NYC
        { latitude: -33.8688, longitude: 151.2093 }, // Sydney
        { latitude: 51.5074, longitude: -0.1278 }, // London
        { latitude: 35.6762, longitude: 139.6503 }, // Tokyo
        { latitude: 0, longitude: 0 }, // Null Island
        { latitude: 90, longitude: 180 }, // North Pole, Date Line
        { latitude: -90, longitude: -180 } // South Pole, Date Line
      ]

      validCoordinates.forEach(coord => {
        expect(coord.latitude).toBeGreaterThanOrEqual(-90)
        expect(coord.latitude).toBeLessThanOrEqual(90)
        expect(coord.longitude).toBeGreaterThanOrEqual(-180)
        expect(coord.longitude).toBeLessThanOrEqual(180)
      })
    })
  })
})