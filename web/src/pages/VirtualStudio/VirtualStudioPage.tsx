import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Maximize2 } from 'lucide-react';
import RobotCanvas3D from './components/RobotCanvas3D';
import SimulationControls from './components/SimulationControls';

const VirtualStudioPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleReset = () => {
    setIsPlaying(false);
    // Reset simulation state
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Virtual Robot Studio
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Develop and test robots in real-time simulation
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={isPlaying ? handlePause : handlePlay}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause size={16} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span>Run</span>
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Robot Library */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Robot Library
            </h2>
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded-lg cursor-pointer">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Simple Bot
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Basic wheeled robot
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  UR5 Arm
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  6-DOF robotic arm
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Drone
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Quadcopter UAV
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Center - 3D Viewport */}
        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900">
          <div className="flex-1 relative">
            <RobotCanvas3D isPlaying={isPlaying} />
          </div>

          {/* Simulation Controls Bar */}
          <SimulationControls
            isPlaying={isPlaying}
            simulationSpeed={simulationSpeed}
            onSpeedChange={setSimulationSpeed}
          />
        </div>

        {/* Right Sidebar - Telemetry */}
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Telemetry
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Position
                  </span>
                  <span className="text-sm font-mono text-gray-900 dark:text-white">
                    (0.0, 0.0, 0.0)
                  </span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Velocity
                  </span>
                  <span className="text-sm font-mono text-gray-900 dark:text-white">
                    0.0 m/s
                  </span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Battery
                  </span>
                  <span className="text-sm font-mono text-green-600 dark:text-green-400">
                    100%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualStudioPage;
