import { Coordinate, Geofence, GeofenceEvent } from '../hooks/useGeofencing'

export interface GeofenceViolation {
  geofenceId: string
  robotId: string
  violationType: 'enter' | 'exit' | 'dwell' | 'speed_limit'
  coordinates: Coordinate
  timestamp: Date
  severity: 'info' | 'warning' | 'error' | 'critical'
  additionalData?: Record<string, any>
}

/**
 * Check if a point is inside a circular geofence
 */
export function isPointInCircle(point: Coordinate, center: Coordinate, radius: number): boolean {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (point.latitude * Math.PI) / 180
  const φ2 = (center.latitude * Math.PI) / 180
  const Δφ = ((center.latitude - point.latitude) * Math.PI) / 180
  const Δλ = ((center.longitude - point.longitude) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const distance = R * c
  return distance <= radius
}

/**
 * Check if a point is inside a polygon using ray casting algorithm
 */
export function isPointInPolygon(point: Coordinate, polygon: Coordinate[]): boolean {
  if (polygon.length < 3) return false

  const x = point.longitude
  const y = point.latitude
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].longitude
    const yi = polygon[i].latitude
    const xj = polygon[j].longitude
    const yj = polygon[j].latitude

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }

  return inside
}

/**
 * Check if a point is inside a rectangular geofence
 */
export function isPointInRectangle(point: Coordinate, rectangle: Coordinate[]): boolean {
  if (rectangle.length !== 4) return false

  // Find bounding box
  const lats = rectangle.map((p) => p.latitude)
  const lngs = rectangle.map((p) => p.longitude)

  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)

  return (
    point.latitude >= minLat &&
    point.latitude <= maxLat &&
    point.longitude >= minLng &&
    point.longitude <= maxLng
  )
}

/**
 * Check if a robot is currently inside a geofence
 */
export function isRobotInGeofence(robotPosition: Coordinate, geofence: Geofence): boolean {
  switch (geofence.type) {
    case 'circle':
      if (geofence.coordinates.length > 0 && geofence.radius) {
        return isPointInCircle(robotPosition, geofence.coordinates[0], geofence.radius)
      }
      return false

    case 'polygon':
      return isPointInPolygon(robotPosition, geofence.coordinates)

    case 'rectangle':
      return isPointInRectangle(robotPosition, geofence.coordinates)

    default:
      return false
  }
}

/**
 * Monitor robot position against a single geofence
 */
export function checkGeofenceViolation(
  robotId: string,
  currentPosition: Coordinate,
  previousPosition: Coordinate | null,
  geofence: Geofence,
  dwellStartTime?: Date,
  robotSpeed?: number
): GeofenceViolation[] {
  if (!geofence.isActive) return []

  const violations: GeofenceViolation[] = []
  const currentlyInside = isRobotInGeofence(currentPosition, geofence)
  const previouslyInside = previousPosition
    ? isRobotInGeofence(previousPosition, geofence)
    : currentlyInside

  for (const rule of geofence.rules) {
    if (!rule.isActive) continue

    switch (rule.trigger) {
      case 'enter':
        if (currentlyInside && !previouslyInside) {
          violations.push({
            geofenceId: geofence.id,
            robotId,
            violationType: 'enter',
            coordinates: currentPosition,
            timestamp: new Date(),
            severity: determineSeverity(rule.actions),
            additionalData: { geofenceName: geofence.name, ruleName: rule.name },
          })
        }
        break

      case 'exit':
        if (!currentlyInside && previouslyInside) {
          violations.push({
            geofenceId: geofence.id,
            robotId,
            violationType: 'exit',
            coordinates: currentPosition,
            timestamp: new Date(),
            severity: determineSeverity(rule.actions),
            additionalData: { geofenceName: geofence.name, ruleName: rule.name },
          })
        }
        break

      case 'dwell':
        if (currentlyInside && dwellStartTime && rule.condition?.minDuration) {
          const dwellTime = Date.now() - dwellStartTime.getTime()
          if (dwellTime >= rule.condition.minDuration * 1000) {
            violations.push({
              geofenceId: geofence.id,
              robotId,
              violationType: 'dwell',
              coordinates: currentPosition,
              timestamp: new Date(),
              severity: determineSeverity(rule.actions),
              additionalData: {
                geofenceName: geofence.name,
                ruleName: rule.name,
                dwellTime: Math.round(dwellTime / 1000),
              },
            })
          }
        }
        break

      case 'speed_limit':
        if (currentlyInside && robotSpeed && rule.condition?.maxSpeed) {
          if (robotSpeed > rule.condition.maxSpeed) {
            violations.push({
              geofenceId: geofence.id,
              robotId,
              violationType: 'speed_limit',
              coordinates: currentPosition,
              timestamp: new Date(),
              severity: determineSeverity(rule.actions),
              additionalData: {
                geofenceName: geofence.name,
                ruleName: rule.name,
                currentSpeed: robotSpeed,
                speedLimit: rule.condition.maxSpeed,
              },
            })
          }
        }
        break
    }
  }

  return violations
}

/**
 * Monitor robot positions against all geofences
 */
export function monitorGeofenceViolations(
  robotPositions: Map<
    string,
    { current: Coordinate; previous: Coordinate | null; speed?: number; dwellStart?: Date }
  >,
  geofences: Geofence[]
): GeofenceViolation[] {
  const allViolations: GeofenceViolation[] = []

  for (const [robotId, positionData] of robotPositions) {
    for (const geofence of geofences) {
      // Check if this geofence applies to this robot
      if (geofence.robotIds.length > 0 && !geofence.robotIds.includes(robotId)) {
        continue
      }

      const violations = checkGeofenceViolation(
        robotId,
        positionData.current,
        positionData.previous,
        geofence,
        positionData.dwellStart,
        positionData.speed
      )

      allViolations.push(...violations)
    }
  }

  return allViolations
}

/**
 * Calculate robot speed based on position history
 */
export function calculateRobotSpeed(
  currentPosition: Coordinate,
  previousPosition: Coordinate,
  timeDelta: number // seconds
): number {
  if (timeDelta <= 0) return 0

  const R = 6371e3 // Earth's radius in meters
  const φ1 = (previousPosition.latitude * Math.PI) / 180
  const φ2 = (currentPosition.latitude * Math.PI) / 180
  const Δφ = ((currentPosition.latitude - previousPosition.latitude) * Math.PI) / 180
  const Δλ = ((currentPosition.longitude - previousPosition.longitude) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const distance = R * c // Distance in meters
  return distance / timeDelta // Speed in m/s
}

/**
 * Convert violations to geofence events
 */
export function violationsToEvents(
  violations: GeofenceViolation[],
  robotNames: Map<string, string>,
  geofenceNames: Map<string, string>
): GeofenceEvent[] {
  return violations.map((violation) => ({
    id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    geofenceId: violation.geofenceId,
    geofenceName: geofenceNames.get(violation.geofenceId) || 'Unknown Geofence',
    robotId: violation.robotId,
    robotName: robotNames.get(violation.robotId) || 'Unknown Robot',
    ruleId: `rule-${violation.violationType}`,
    ruleName: `${violation.violationType.charAt(0).toUpperCase() + violation.violationType.slice(1)} Detection`,
    eventType: violation.violationType,
    coordinates: violation.coordinates,
    timestamp: violation.timestamp,
    severity: violation.severity,
    message: generateViolationMessage(violation, robotNames, geofenceNames),
    actionsTaken: generateActionsTaken(violation),
    acknowledged: false,
  }))
}

function determineSeverity(actions: any[]): 'info' | 'warning' | 'error' | 'critical' {
  const priorities = actions.map((action) => action.priority)

  if (priorities.includes('critical')) return 'critical'
  if (priorities.includes('high')) return 'error'
  if (priorities.includes('medium')) return 'warning'
  return 'info'
}

function generateViolationMessage(
  violation: GeofenceViolation,
  robotNames: Map<string, string>,
  geofenceNames: Map<string, string>
): string {
  const robotName = robotNames.get(violation.robotId) || 'Unknown Robot'
  const geofenceName = geofenceNames.get(violation.geofenceId) || 'Unknown Geofence'

  switch (violation.violationType) {
    case 'enter':
      return `${robotName} entered ${geofenceName}`
    case 'exit':
      return `${robotName} exited ${geofenceName}`
    case 'dwell': {
      const dwellTime = violation.additionalData?.dwellTime || 0
      return `${robotName} has been in ${geofenceName} for ${dwellTime} seconds`
    }
    case 'speed_limit': {
      const speed = violation.additionalData?.currentSpeed || 0
      const limit = violation.additionalData?.speedLimit || 0
      return `${robotName} exceeded speed limit in ${geofenceName} (${speed.toFixed(1)} m/s > ${limit.toFixed(1)} m/s)`
    }
    default:
      return `${robotName} triggered ${violation.violationType} in ${geofenceName}`
  }
}

function generateActionsTaken(violation: GeofenceViolation): string[] {
  const actions = []

  switch (violation.severity) {
    case 'critical':
      actions.push('Emergency stop initiated')
      actions.push('Alert sent to operators')
      break
    case 'error':
      actions.push('Robot slowed down')
      actions.push('Alert sent to operators')
      break
    case 'warning':
      actions.push('Warning notification sent')
      break
    case 'info':
      actions.push('Event logged for monitoring')
      break
  }

  return actions
}

/**
 * Real-time geofence monitor class
 */
export class GeofenceMonitor {
  private robotPositions = new Map<
    string,
    {
      current: Coordinate
      previous: Coordinate | null
      lastUpdate: Date
      speed?: number
      dwellStart?: Date
    }
  >()

  private violations: GeofenceViolation[] = []
  private onViolation?: (violations: GeofenceViolation[]) => void

  constructor(onViolation?: (violations: GeofenceViolation[]) => void) {
    this.onViolation = onViolation
  }

  updateRobotPosition(robotId: string, position: Coordinate) {
    const now = new Date()
    const existing = this.robotPositions.get(robotId)

    let speed: number | undefined
    let dwellStart: Date | undefined

    if (existing) {
      const timeDelta = (now.getTime() - existing.lastUpdate.getTime()) / 1000
      speed = calculateRobotSpeed(position, existing.current, timeDelta)
      dwellStart = existing.dwellStart
    }

    this.robotPositions.set(robotId, {
      current: position,
      previous: existing?.current || null,
      lastUpdate: now,
      speed,
      dwellStart,
    })
  }

  checkViolations(geofences: Geofence[]): GeofenceViolation[] {
    const newViolations = monitorGeofenceViolations(this.robotPositions, geofences)

    if (newViolations.length > 0) {
      this.violations.push(...newViolations)
      this.onViolation?.(newViolations)
    }

    return newViolations
  }

  getViolationHistory(): GeofenceViolation[] {
    return [...this.violations]
  }

  clearHistory() {
    this.violations = []
  }
}
