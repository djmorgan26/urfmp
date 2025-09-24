import React from 'react'
import { Robot } from '@urfmp/types'
import { Geofence } from '../../hooks/useGeofencing'

interface RobotMap3DProps {
  robots: Robot[]
  selectedRobotId?: string
  onRobotSelect?: (robotId: string) => void
  geofences?: Geofence[]
  showPaths?: boolean
  showGeofences?: boolean
  className?: string
}

const RobotMap3D: React.FC<RobotMap3DProps> = ({ robots, className }) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="text-6xl mb-4">🌍</div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            3D Map View
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            3D visualization temporarily disabled for CI/CD compatibility
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Tracking {robots.length} robots
          </p>
        </div>
      </div>
    </div>
  )
}

export default RobotMap3D
