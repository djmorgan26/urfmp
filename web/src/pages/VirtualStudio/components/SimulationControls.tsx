import React from 'react';
import { Gauge, Clock } from 'lucide-react';

interface SimulationControlsProps {
  isPlaying: boolean;
  simulationSpeed: number;
  onSpeedChange: (speed: number) => void;
}

const SimulationControls: React.FC<SimulationControlsProps> = ({
  isPlaying,
  simulationSpeed,
  onSpeedChange,
}) => {
  const speedOptions = [0.25, 0.5, 1, 2, 4];

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-6">
        {/* Simulation Status */}
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}
          />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {isPlaying ? 'Running' : 'Paused'}
          </span>
        </div>

        {/* Simulation Time */}
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
          <Clock size={16} />
          <span className="text-sm font-mono">00:00:00</span>
        </div>
      </div>

      {/* Simulation Speed Control */}
      <div className="flex items-center space-x-3">
        <Gauge size={16} className="text-gray-600 dark:text-gray-300" />
        <span className="text-sm text-gray-600 dark:text-gray-300">Speed:</span>
        <div className="flex items-center space-x-1">
          {speedOptions.map((speed) => (
            <button
              key={speed}
              onClick={() => onSpeedChange(speed)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                simulationSpeed === speed
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
        <div>
          <span className="font-medium">FPS:</span>{' '}
          <span className="font-mono">60</span>
        </div>
        <div>
          <span className="font-medium">Physics:</span>{' '}
          <span className="font-mono text-green-600 dark:text-green-400">
            Active
          </span>
        </div>
      </div>
    </div>
  );
};

export default SimulationControls;
