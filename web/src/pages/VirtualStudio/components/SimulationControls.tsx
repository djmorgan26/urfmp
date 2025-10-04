import React from 'react'
import { Gauge, Clock } from 'lucide-react'

interface SimulationControlsProps {
  isPlaying: boolean
  simulationSpeed: number
  onSpeedChange: (speed: number) => void
}

const SimulationControls: React.FC<SimulationControlsProps> = ({
  isPlaying,
  simulationSpeed,
  onSpeedChange,
}) => {
  const speedOptions = [0.25, 0.5, 1, 2, 4]

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 select-none">
      <div className="flex items-center space-x-4">
        {/* Simulation Status */}
        <div className="flex items-center space-x-1.5">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400 dark:bg-gray-600'
            }`}
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {isPlaying ? 'Running' : 'Paused'}
          </span>
        </div>

        {/* Simulation Time */}
        <div className="flex items-center space-x-1.5 text-gray-600 dark:text-gray-400">
          <Clock size={14} />
          <span className="text-xs font-mono">00:00:00</span>
        </div>
      </div>

      {/* Simulation Speed Control */}
      <div className="flex items-center space-x-2">
        <Gauge size={14} className="text-gray-600 dark:text-gray-400" />
        <span className="text-xs text-gray-600 dark:text-gray-400">Speed:</span>
        <div className="flex items-center space-x-1">
          {speedOptions.map((speed) => (
            <button
              key={speed}
              onClick={() => onSpeedChange(speed)}
              className={`px-2 py-0.5 rounded-md text-xs transition-colors ${
                simulationSpeed === speed
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
        <div>
          <span className="font-medium">FPS:</span> <span className="font-mono">60</span>
        </div>
        <div>
          <span className="font-medium">Physics:</span>{' '}
          <span className="font-mono text-green-600 dark:text-green-400">Active</span>
        </div>
      </div>
    </div>
  )
}

export default SimulationControls
