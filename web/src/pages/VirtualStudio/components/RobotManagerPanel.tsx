import React from 'react'
import { Plus, Trash2, Target } from 'lucide-react'
import type { Robot } from '../hooks/useMultiRobotManager'

interface RobotManagerPanelProps {
  robots: Robot[]
  activeRobotId: string
  onAddRobot: (type: 'simple' | 'ur5' | 'drone') => void
  onRemoveRobot: (robotId: string) => void
  onSetActiveRobot: (robotId: string) => void
}

const RobotManagerPanel: React.FC<RobotManagerPanelProps> = ({
  robots,
  activeRobotId,
  onAddRobot,
  onRemoveRobot,
  onSetActiveRobot,
}) => {
  const [showAddMenu, setShowAddMenu] = React.useState(false)

  const getRobotIcon = (type: 'simple' | 'ur5' | 'drone') => {
    switch (type) {
      case 'simple':
        return '🤖'
      case 'ur5':
        return '🦾'
      case 'drone':
        return '🚁'
    }
  }

  return (
    <div className="space-y-2">
      {/* Add Robot Button */}
      <div className="relative">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full px-2.5 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center justify-center space-x-1.5 text-xs font-medium transition-colors"
        >
          <Plus size={14} />
          <span>Add Robot</span>
        </button>

        {/* Add Menu Dropdown */}
        {showAddMenu && (
          <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
            <button
              onClick={() => {
                onAddRobot('simple')
                setShowAddMenu(false)
              }}
              className="w-full px-2.5 py-2 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center space-x-2"
            >
              <span>🤖</span>
              <span>Simple Bot</span>
            </button>
            <button
              onClick={() => {
                onAddRobot('ur5')
                setShowAddMenu(false)
              }}
              className="w-full px-2.5 py-2 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center space-x-2"
            >
              <span>🦾</span>
              <span>UR5 Arm</span>
            </button>
            <button
              onClick={() => {
                onAddRobot('drone')
                setShowAddMenu(false)
              }}
              className="w-full px-2.5 py-2 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center space-x-2"
            >
              <span>🚁</span>
              <span>Drone</span>
            </button>
          </div>
        )}
      </div>

      {/* Robot List */}
      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {robots.map((robot) => {
          const isActive = robot.id === activeRobotId

          return (
            <div
              key={robot.id}
              onClick={() => onSetActiveRobot(robot.id)}
              className={`p-2 rounded-md cursor-pointer transition-all ${
                isActive
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1">
                  <span className="text-base">{getRobotIcon(robot.type)}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-medium truncate">{robot.name}</h3>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: robot.color }}
                      />
                      <p
                        className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}
                      >
                        {robot.type.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Active indicator */}
                {isActive && <Target size={14} className="text-blue-100 flex-shrink-0" />}

                {/* Delete button */}
                {robots.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveRobot(robot.id)
                    }}
                    className={`ml-2 p-1 rounded hover:bg-red-500/20 transition-colors flex-shrink-0 ${
                      isActive ? 'text-white hover:bg-red-500/30' : 'text-red-500'
                    }`}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              {/* Position info */}
              <div className="mt-1.5 pt-1.5 border-t border-white/10">
                <p
                  className={`text-xs font-mono ${isActive ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  ({robot.position.x.toFixed(1)}, {robot.position.y.toFixed(1)},{' '}
                  {robot.position.z.toFixed(1)})
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Robot count */}
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {robots.length} robot{robots.length !== 1 ? 's' : ''} in scene
        </p>
      </div>
    </div>
  )
}

export default RobotManagerPanel
