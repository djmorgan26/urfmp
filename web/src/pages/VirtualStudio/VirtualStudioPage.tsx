import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import RobotCanvas3D from './components/RobotCanvas3D'
import SimulationControls from './components/SimulationControls'
import CodeEditor from './components/CodeEditor'
import { EnvironmentSelectorUI, type EnvironmentType } from './components/EnvironmentSelector'
import { useRobotAPI } from './hooks/useRobotAPI'
import { useVirtualRobotTelemetry } from './hooks/useVirtualRobotTelemetry'

interface RobotCommand {
  type: 'move' | 'rotate' | 'speed'
  data: any
}

type RobotType = 'simple' | 'ur5' | 'drone'

const VirtualStudioPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [simulationSpeed, setSimulationSpeed] = useState(1)
  const [selectedRobot, setSelectedRobot] = useState<RobotType>('simple')
  const [selectedEnvironment, setSelectedEnvironment] = useState<EnvironmentType>('warehouse')
  const [robotPosition, setRobotPosition] = useState({ x: 0, y: 0.5, z: 0 })
  const [robotRotation, setRobotRotation] = useState(0)
  const [enabledSensors, setEnabledSensors] = useState({
    camera: true,
    lidar: true,
    imu: true,
    distance: false,
    gps: false,
  })
  const [telemetryData, setTelemetryData] = useState<any>({
    position: '(0.0, 0.5, 0.0)',
    velocity: '0.0 m/s',
    battery: '100%',
  })
  const commandQueueRef = useRef<RobotCommand[]>([])
  const [editorHeight, setEditorHeight] = useState(250) // Default 250px - balanced for canvas/editor
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ y: number; height: number } | null>(null)

  // Virtual Robot Telemetry Integration
  const virtualRobotId = `virtual-robot-${selectedRobot}-${Date.now()}`
  const { updateRobotState, isConnected } = useVirtualRobotTelemetry(virtualRobotId)

  const handleMove = useCallback(
    (x: number, y: number, z: number) => {
      commandQueueRef.current.push({ type: 'move', data: { x, y, z } })
      setRobotPosition({ x, y, z })
      setTelemetryData((prev: any) => ({
        ...prev,
        position: `(${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)})`,
      }))

      // Send telemetry update
      updateRobotState({
        position: { x, y, z },
        status: 'moving',
      })
    },
    [updateRobotState]
  )

  const handleRotate = useCallback(
    (angle: number) => {
      commandQueueRef.current.push({ type: 'rotate', data: { angle } })
      setRobotRotation(angle)

      // Send telemetry update
      updateRobotState({
        rotation: angle,
        status: 'moving',
      })
    },
    [updateRobotState]
  )

  const handleSpeedChange = useCallback(
    (speed: number) => {
      commandQueueRef.current.push({ type: 'speed', data: { speed } })
      setTelemetryData((prev: any) => ({
        ...prev,
        velocity: `${speed.toFixed(1)} m/s`,
      }))

      // Send telemetry update
      updateRobotState({
        speed,
      })
    },
    [updateRobotState]
  )

  const handleTelemetry = useCallback((data: any) => {
    console.log('[Telemetry]:', data)
  }, [])

  const { executeCode } = useRobotAPI(handleMove, handleRotate, handleSpeedChange, handleTelemetry)

  const handleRunCode = useCallback(
    async (code: string) => {
      setIsPlaying(true)
      const result = await executeCode(code)
      if (!result.success) {
        console.error('Code execution failed:', result.error)
      }
      setTimeout(() => setIsPlaying(false), 100)
    },
    [executeCode]
  )

  const handlePlay = () => setIsPlaying(true)
  const handlePause = () => setIsPlaying(false)
  const handleReset = () => {
    setIsPlaying(false)
    setRobotPosition({ x: 0, y: 0.5, z: 0 })
    setRobotRotation(0)
    commandQueueRef.current = []
    setTelemetryData({
      position: '(0.0, 0.5, 0.0)',
      velocity: '0.0 m/s',
      battery: '100%',
    })
  }

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      dragStartRef.current = {
        y: e.clientY,
        height: editorHeight,
      }
      setIsDragging(true)
    },
    [editorHeight]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && dragStartRef.current) {
        e.preventDefault()
        const delta = dragStartRef.current.y - e.clientY // Positive when dragging up
        const newHeight = dragStartRef.current.height + delta
        setEditorHeight(Math.max(150, Math.min(newHeight, window.innerHeight - 250)))
      }
    },
    [isDragging]
  )

  const handleMouseUp = useCallback((e: MouseEvent) => {
    e.preventDefault()
    setIsDragging(false)
    dragStartRef.current = null
  }, [])

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'row-resize'
      document.body.style.userSelect = 'none'
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Virtual Robot Studio
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Design, code, and test robots in real-time 3D simulation
          </p>
        </div>
        <button
          onClick={handleReset}
          className="px-2.5 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md flex items-center space-x-1.5 transition-colors"
        >
          <RotateCcw size={13} />
          <span>Reset Scene</span>
        </button>
      </div>

      {/* Main Content - Top Section */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar - Robot Library & Environments */}
        <div className="w-40 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="p-3 flex-shrink-0">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
              Robot Models
            </h2>
            <div className="space-y-1.5">
              <div
                onClick={() => setSelectedRobot('simple')}
                className={`p-2.5 rounded-md cursor-pointer transition-all ${
                  selectedRobot === 'simple'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <h3 className="text-sm font-medium">Simple Bot</h3>
                <p
                  className={`text-xs mt-0.5 ${selectedRobot === 'simple' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  Wheeled robot
                </p>
              </div>
              <div
                onClick={() => setSelectedRobot('ur5')}
                className={`p-2.5 rounded-md cursor-pointer transition-all ${
                  selectedRobot === 'ur5'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <h3 className="text-sm font-medium">UR5 Arm</h3>
                <p
                  className={`text-xs mt-0.5 ${selectedRobot === 'ur5' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  6-DOF articulated arm
                </p>
              </div>
              <div
                onClick={() => setSelectedRobot('drone')}
                className={`p-2.5 rounded-md cursor-pointer transition-all ${
                  selectedRobot === 'drone'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <h3 className="text-sm font-medium">Drone</h3>
                <p
                  className={`text-xs mt-0.5 ${selectedRobot === 'drone' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  Quadcopter UAV
                </p>
              </div>
            </div>
          </div>

          {/* Environment Selector */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
              Environments
            </h2>
            <EnvironmentSelectorUI
              currentEnvironment={selectedEnvironment}
              onEnvironmentChange={setSelectedEnvironment}
            />
          </div>
        </div>

        {/* Center - 3D Viewport */}
        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden">
          <div className="flex-1 relative">
            <RobotCanvas3D
              isPlaying={isPlaying}
              position={robotPosition}
              rotation={robotRotation}
              robotType={selectedRobot}
              environment={selectedEnvironment}
              enabledSensors={enabledSensors}
            />
          </div>

          {/* Simulation Controls Bar */}
          <SimulationControls
            isPlaying={isPlaying}
            simulationSpeed={simulationSpeed}
            onSpeedChange={setSimulationSpeed}
          />
        </div>

        {/* Right Sidebar - Telemetry & Sensors */}
        <div className="w-48 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="p-3 flex-shrink-0">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
              Live Telemetry
            </h2>
            <div className="space-y-2">
              <div className="p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Position</span>
                  <span className="text-xs font-mono text-gray-900 dark:text-white">
                    {telemetryData.position}
                  </span>
                </div>
              </div>
              <div className="p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Velocity</span>
                  <span className="text-xs font-mono text-gray-900 dark:text-white">
                    {telemetryData.velocity}
                  </span>
                </div>
              </div>
              <div className="p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Battery</span>
                  <span className="text-xs font-mono text-green-600 dark:text-green-400">
                    {telemetryData.battery}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sensor Controls */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
              Sensors
            </h2>
            <div className="space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-gray-700 dark:text-gray-300">Camera</span>
                <input
                  type="checkbox"
                  checked={enabledSensors.camera}
                  onChange={(e) =>
                    setEnabledSensors((prev) => ({ ...prev, camera: e.target.checked }))
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-gray-700 dark:text-gray-300">LIDAR</span>
                <input
                  type="checkbox"
                  checked={enabledSensors.lidar}
                  onChange={(e) =>
                    setEnabledSensors((prev) => ({ ...prev, lidar: e.target.checked }))
                  }
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-gray-700 dark:text-gray-300">IMU</span>
                <input
                  type="checkbox"
                  checked={enabledSensors.imu}
                  onChange={(e) =>
                    setEnabledSensors((prev) => ({ ...prev, imu: e.target.checked }))
                  }
                  className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-gray-700 dark:text-gray-300">Distance</span>
                <input
                  type="checkbox"
                  checked={enabledSensors.distance}
                  onChange={(e) =>
                    setEnabledSensors((prev) => ({ ...prev, distance: e.target.checked }))
                  }
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-gray-700 dark:text-gray-300">GPS</span>
                <input
                  type="checkbox"
                  checked={enabledSensors.gps}
                  onChange={(e) =>
                    setEnabledSensors((prev) => ({ ...prev, gps: e.target.checked }))
                  }
                  className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Resizable Divider */}
      <div
        onMouseDown={handleMouseDown}
        className={`h-2 bg-gray-300 dark:bg-gray-600 hover:bg-blue-400 dark:hover:bg-blue-500 cursor-row-resize transition-all flex items-center justify-center ${
          isDragging ? 'bg-blue-500 dark:bg-blue-400' : ''
        }`}
        title="Drag to resize editor"
      >
        <div className="w-12 h-1 bg-gray-400 dark:bg-gray-500 rounded-full" />
      </div>

      {/* Code Editor Section - Full Width Bottom */}
      <div style={{ height: `${editorHeight}px` }} className="overflow-hidden flex flex-col">
        <CodeEditor onRunCode={handleRunCode} isPlaying={isPlaying} />
      </div>
    </div>
  )
}

export default VirtualStudioPage
