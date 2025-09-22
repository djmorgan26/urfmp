import { Coordinate, Waypoint } from '../hooks/useGeofencing'

export interface OptimizedPath {
  waypoints: string[]
  totalDistance: number
  estimatedDuration: number
  optimization: {
    originalDistance: number
    optimizedDistance: number
    improvementPercentage: number
    algorithm: string
  }
}

/**
 * Calculate the great circle distance between two GPS coordinates using the Haversine formula
 */
export function calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (coord1.latitude * Math.PI) / 180
  const φ2 = (coord2.latitude * Math.PI) / 180
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

/**
 * Calculate the total distance for a given path
 */
export function calculatePathDistance(waypoints: Waypoint[], path: string[]): number {
  let totalDistance = 0

  for (let i = 0; i < path.length - 1; i++) {
    const current = waypoints.find((w) => w.id === path[i])
    const next = waypoints.find((w) => w.id === path[i + 1])

    if (current && next) {
      totalDistance += calculateDistance(current.coordinates, next.coordinates)
    }
  }

  return totalDistance
}

/**
 * Estimate duration based on distance and average robot speed
 */
export function estimateDuration(distance: number, averageSpeed: number = 1.5): number {
  // Average speed in m/s, typical robot speed is 1-2 m/s
  return Math.round(distance / averageSpeed)
}

/**
 * Nearest Neighbor Algorithm for TSP
 * Good for initial optimization, O(n²) complexity
 */
export function nearestNeighborOptimization(
  waypoints: Waypoint[],
  startWaypointId?: string
): OptimizedPath {
  if (waypoints.length < 2) {
    return {
      waypoints: waypoints.map((w) => w.id),
      totalDistance: 0,
      estimatedDuration: 0,
      optimization: {
        originalDistance: 0,
        optimizedDistance: 0,
        improvementPercentage: 0,
        algorithm: 'Nearest Neighbor',
      },
    }
  }

  const unvisited = [...waypoints]
  const path: string[] = []

  // Start from specified waypoint or first one
  let current = startWaypointId
    ? waypoints.find((w) => w.id === startWaypointId) || waypoints[0]
    : waypoints[0]

  path.push(current.id)
  unvisited.splice(
    unvisited.findIndex((w) => w.id === current.id),
    1
  )

  while (unvisited.length > 0) {
    let nearestIndex = 0
    let shortestDistance = Infinity

    // Find the nearest unvisited waypoint
    for (let i = 0; i < unvisited.length; i++) {
      const distance = calculateDistance(current.coordinates, unvisited[i].coordinates)
      if (distance < shortestDistance) {
        shortestDistance = distance
        nearestIndex = i
      }
    }

    current = unvisited[nearestIndex]
    path.push(current.id)
    unvisited.splice(nearestIndex, 1)
  }

  const originalDistance = calculatePathDistance(
    waypoints,
    waypoints.map((w) => w.id)
  )
  const optimizedDistance = calculatePathDistance(waypoints, path)
  const improvementPercentage =
    originalDistance > 0 ? ((originalDistance - optimizedDistance) / originalDistance) * 100 : 0

  return {
    waypoints: path,
    totalDistance: Math.round(optimizedDistance),
    estimatedDuration: estimateDuration(optimizedDistance),
    optimization: {
      originalDistance: Math.round(originalDistance),
      optimizedDistance: Math.round(optimizedDistance),
      improvementPercentage: Math.round(improvementPercentage * 100) / 100,
      algorithm: 'Nearest Neighbor',
    },
  }
}

/**
 * 2-opt improvement algorithm
 * Iteratively improves a tour by swapping edges
 */
export function twoOptOptimization(waypoints: Waypoint[], initialPath: string[]): OptimizedPath {
  let currentPath = [...initialPath]
  let currentDistance = calculatePathDistance(waypoints, currentPath)
  let improved = true
  let iterations = 0
  const maxIterations = 100

  while (improved && iterations < maxIterations) {
    improved = false
    iterations++

    for (let i = 1; i < currentPath.length - 2; i++) {
      for (let j = i + 1; j < currentPath.length; j++) {
        if (j - i === 1) continue // Skip adjacent edges

        // Create new path by reversing the segment between i and j
        const newPath = [
          ...currentPath.slice(0, i),
          ...currentPath.slice(i, j).reverse(),
          ...currentPath.slice(j),
        ]

        const newDistance = calculatePathDistance(waypoints, newPath)

        if (newDistance < currentDistance) {
          currentPath = newPath
          currentDistance = newDistance
          improved = true
        }
      }
    }
  }

  const originalDistance = calculatePathDistance(waypoints, initialPath)
  const improvementPercentage =
    originalDistance > 0 ? ((originalDistance - currentDistance) / originalDistance) * 100 : 0

  return {
    waypoints: currentPath,
    totalDistance: Math.round(currentDistance),
    estimatedDuration: estimateDuration(currentDistance),
    optimization: {
      originalDistance: Math.round(originalDistance),
      optimizedDistance: Math.round(currentDistance),
      improvementPercentage: Math.round(improvementPercentage * 100) / 100,
      algorithm: `2-opt (${iterations} iterations)`,
    },
  }
}

/**
 * Hybrid optimization: Nearest Neighbor + 2-opt
 * Best balance of performance and quality
 */
export function hybridOptimization(waypoints: Waypoint[], startWaypointId?: string): OptimizedPath {
  // First, get a good initial solution with Nearest Neighbor
  const nnResult = nearestNeighborOptimization(waypoints, startWaypointId)

  // Then improve it with 2-opt
  const optimizedResult = twoOptOptimization(waypoints, nnResult.waypoints)

  const originalDistance = calculatePathDistance(
    waypoints,
    waypoints.map((w) => w.id)
  )
  const improvementPercentage =
    originalDistance > 0
      ? ((originalDistance - optimizedResult.totalDistance) / originalDistance) * 100
      : 0

  return {
    ...optimizedResult,
    optimization: {
      originalDistance: Math.round(originalDistance),
      optimizedDistance: optimizedResult.totalDistance,
      improvementPercentage: Math.round(improvementPercentage * 100) / 100,
      algorithm: 'Hybrid (Nearest Neighbor + 2-opt)',
    },
  }
}

/**
 * Optimize path considering waypoint types and priorities
 */
export function smartOptimization(waypoints: Waypoint[], startWaypointId?: string): OptimizedPath {
  // Group waypoints by type priority
  const priorityOrder = ['charging', 'maintenance', 'pickup', 'dropoff', 'checkpoint', 'custom']

  const groupedWaypoints = priorityOrder.reduce(
    (groups, type) => {
      groups[type] = waypoints.filter((w) => w.type === type)
      return groups
    },
    {} as Record<string, Waypoint[]>
  )

  // Create a smart path that respects logical workflow
  const smartPath: string[] = []

  // Start point
  const startWaypoint = startWaypointId
    ? waypoints.find((w) => w.id === startWaypointId)
    : waypoints[0]

  if (startWaypoint) {
    smartPath.push(startWaypoint.id)
  }

  // Add charging stations first if needed
  if (groupedWaypoints.charging.length > 0) {
    const chargingOptimized = nearestNeighborOptimization(groupedWaypoints.charging)
    smartPath.push(...chargingOptimized.waypoints.filter((id) => id !== startWaypoint?.id))
  }

  // Then pickup -> dropoff pairs
  const pickups = groupedWaypoints.pickup
  const dropoffs = groupedWaypoints.dropoff

  for (const pickup of pickups) {
    if (!smartPath.includes(pickup.id)) {
      smartPath.push(pickup.id)

      // Find nearest dropoff
      let nearestDropoff: Waypoint | null = null
      let shortestDistance = Infinity

      for (const dropoff of dropoffs) {
        if (!smartPath.includes(dropoff.id)) {
          const distance = calculateDistance(pickup.coordinates, dropoff.coordinates)
          if (distance < shortestDistance) {
            shortestDistance = distance
            nearestDropoff = dropoff
          }
        }
      }

      if (nearestDropoff) {
        smartPath.push(nearestDropoff.id)
      }
    }
  }

  // Add remaining waypoints
  const remaining = waypoints.filter((w) => !smartPath.includes(w.id))
  if (remaining.length > 0) {
    const remainingOptimized = nearestNeighborOptimization(remaining)
    smartPath.push(...remainingOptimized.waypoints)
  }

  // Final 2-opt optimization
  const finalResult = twoOptOptimization(waypoints, smartPath)

  const originalDistance = calculatePathDistance(
    waypoints,
    waypoints.map((w) => w.id)
  )
  const improvementPercentage =
    originalDistance > 0
      ? ((originalDistance - finalResult.totalDistance) / originalDistance) * 100
      : 0

  return {
    ...finalResult,
    optimization: {
      originalDistance: Math.round(originalDistance),
      optimizedDistance: finalResult.totalDistance,
      improvementPercentage: Math.round(improvementPercentage * 100) / 100,
      algorithm: 'Smart Workflow + 2-opt',
    },
  }
}

/**
 * Main optimization function that chooses the best algorithm based on waypoint count
 */
export function optimizePath(
  waypoints: Waypoint[],
  startWaypointId?: string,
  algorithm: 'auto' | 'nearest-neighbor' | '2-opt' | 'hybrid' | 'smart' = 'auto'
): OptimizedPath {
  if (waypoints.length === 0) {
    return {
      waypoints: [],
      totalDistance: 0,
      estimatedDuration: 0,
      optimization: {
        originalDistance: 0,
        optimizedDistance: 0,
        improvementPercentage: 0,
        algorithm: 'No waypoints',
      },
    }
  }

  if (waypoints.length === 1) {
    return {
      waypoints: [waypoints[0].id],
      totalDistance: 0,
      estimatedDuration: 0,
      optimization: {
        originalDistance: 0,
        optimizedDistance: 0,
        improvementPercentage: 0,
        algorithm: 'Single waypoint',
      },
    }
  }

  switch (algorithm) {
    case 'nearest-neighbor':
      return nearestNeighborOptimization(waypoints, startWaypointId)

    case '2-opt': {
      const initialPath = waypoints.map((w) => w.id)
      return twoOptOptimization(waypoints, initialPath)
    }

    case 'hybrid':
      return hybridOptimization(waypoints, startWaypointId)

    case 'smart':
      return smartOptimization(waypoints, startWaypointId)

    case 'auto':
    default:
      // Choose algorithm based on problem size
      if (waypoints.length <= 5) {
        return nearestNeighborOptimization(waypoints, startWaypointId)
      } else if (waypoints.length <= 15) {
        return hybridOptimization(waypoints, startWaypointId)
      } else {
        return smartOptimization(waypoints, startWaypointId)
      }
  }
}
