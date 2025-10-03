import React, { useState, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import RobotCanvas3D from './components/RobotCanvas3D';
import SimulationControls from './components/SimulationControls';
import CodeEditor from './components/CodeEditor';
import { useRobotAPI } from './hooks/useRobotAPI';

interface RobotCommand {
  type: 'move' | 'rotate' | 'speed';
  data: any;
}

const VirtualStudioPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [robotPosition, setRobotPosition] = useState({ x: 0, y: 0.5, z: 0 });
  const [robotRotation, setRobotRotation] = useState(0);
  const [telemetryData, setTelemetryData] = useState<any>({
    position: '(0.0, 0.5, 0.0)',
    velocity: '0.0 m/s',
    battery: '100%',
  });
  const commandQueueRef = useRef<RobotCommand[]>([]);

  const handleMove = useCallback((x: number, y: number, z: number) => {
    commandQueueRef.current.push({ type: 'move', data: { x, y, z } });
    setRobotPosition({ x, y, z });
    setTelemetryData((prev: any) => ({
      ...prev,
      position: `(${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)})`,
    }));
  }, []);

  const handleRotate = useCallback((angle: number) => {
    commandQueueRef.current.push({ type: 'rotate', data: { angle } });
    setRobotRotation(angle);
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    commandQueueRef.current.push({ type: 'speed', data: { speed } });
    setTelemetryData((prev: any) => ({
      ...prev,
      velocity: `${speed.toFixed(1)} m/s`,
    }));
  }, []);

  const handleTelemetry = useCallback((data: any) => {
    console.log('[Telemetry]:', data);
  }, []);

  const { executeCode } = useRobotAPI(
    handleMove,
    handleRotate,
    handleSpeedChange,
    handleTelemetry
  );

  const handleRunCode = useCallback(
    async (code: string) => {
      setIsPlaying(true);
      const result = await executeCode(code);
      if (!result.success) {
        console.error('Code execution failed:', result.error);
      }
      setTimeout(() => setIsPlaying(false), 100);
    },
    [executeCode]
  );

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleReset = () => {
    setIsPlaying(false);
    setRobotPosition({ x: 0, y: 0.5, z: 0 });
    setRobotRotation(0);
    commandQueueRef.current = [];
    setTelemetryData({
      position: '(0.0, 0.5, 0.0)',
      velocity: '0.0 m/s',
      battery: '100%',
    });
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

        {/* Center - 3D Viewport & Code Editor */}
        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900">
          <div className="flex-1 relative">
            <RobotCanvas3D
              isPlaying={isPlaying}
              position={robotPosition}
              rotation={robotRotation}
            />
          </div>

          {/* Simulation Controls Bar */}
          <SimulationControls
            isPlaying={isPlaying}
            simulationSpeed={simulationSpeed}
            onSpeedChange={setSimulationSpeed}
          />

          {/* Code Editor Section */}
          <div className="h-80">
            <CodeEditor onRunCode={handleRunCode} isPlaying={isPlaying} />
          </div>
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
                    {telemetryData.position}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Velocity
                  </span>
                  <span className="text-sm font-mono text-gray-900 dark:text-white">
                    {telemetryData.velocity}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Battery
                  </span>
                  <span className="text-sm font-mono text-green-600 dark:text-green-400">
                    {telemetryData.battery}
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
