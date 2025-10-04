import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  Users,
  Keyboard,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import RobotCanvas3D from './components/RobotCanvas3D'
import SimulationControls from './components/SimulationControls'
import CodeEditor from './components/CodeEditor'
import { EnvironmentSelectorUI, type EnvironmentType } from './components/EnvironmentSelector'
import RobotManagerPanel from './components/RobotManagerPanel'
import { useRobotAPI } from './hooks/useRobotAPI'
import { useVirtualRobotTelemetry } from './hooks/useVirtualRobotTelemetry'
import { useMultiRobotManager } from './hooks/useMultiRobotManager'

interface RobotCommand {
  type: 'move' | 'rotate' | 'speed'
  data: any
}

type RobotType = 'simple' | 'ur5' | 'drone'

type ConsoleMessage = {
  id: string
  type: 'log' | 'error' | 'success' | 'info'
  message: string
  timestamp: Date
}

type ExecutionStatus = 'idle' | 'running' | 'success' | 'error'

const VirtualStudioPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [simulationSpeed, setSimulationSpeed] = useState(1)
  const [multiRobotMode, setMultiRobotMode] = useState(false)
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

  // Multi-robot manager
  const {
    robots,
    activeRobotId,
    addRobot,
    removeRobot,
    updateRobotPosition,
    updateRobotRotation,
    setActiveRobot,
    getActiveRobot,
    resetAllRobots,
  } = useMultiRobotManager()
  const [telemetryData, setTelemetryData] = useState<any>({
    position: '(0.0, 0.5, 0.0)',
    velocity: '0.0 m/s',
    battery: '100%',
  })
  const commandQueueRef = useRef<RobotCommand[]>([])
  const [editorHeight, setEditorHeight] = useState(250) // Default 250px - balanced for canvas/editor
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ y: number; height: number } | null>(null)

  // Console and execution feedback
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([])
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>('idle')
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const consoleRef = useRef<HTMLDivElement>(null)

  // Virtual Robot Telemetry Integration
  const virtualRobotId = `virtual-robot-${selectedRobot}-${Date.now()}`
  const { updateRobotState, isConnected } = useVirtualRobotTelemetry(virtualRobotId)

  const handleMove = useCallback(
    (x: number, y: number, z: number) => {
      commandQueueRef.current.push({ type: 'move', data: { x, y, z } })

      if (multiRobotMode) {
        updateRobotPosition(activeRobotId, { x, y, z })
      } else {
        setRobotPosition({ x, y, z })
      }

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
    [updateRobotState, multiRobotMode, activeRobotId, updateRobotPosition]
  )

  const handleRotate = useCallback(
    (angle: number) => {
      commandQueueRef.current.push({ type: 'rotate', data: { angle } })

      if (multiRobotMode) {
        updateRobotRotation(activeRobotId, angle)
      } else {
        setRobotRotation(angle)
      }

      // Send telemetry update
      updateRobotState({
        rotation: angle,
        status: 'moving',
      })
    },
    [updateRobotState, multiRobotMode, activeRobotId, updateRobotRotation]
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

  // Add console message helper
  const addConsoleMessage = useCallback((type: ConsoleMessage['type'], message: string) => {
    const newMessage: ConsoleMessage = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      message,
      timestamp: new Date(),
    }
    setConsoleMessages((prev) => [...prev, newMessage])

    // Auto-scroll to bottom
    setTimeout(() => {
      if (consoleRef.current) {
        consoleRef.current.scrollTop = consoleRef.current.scrollHeight
      }
    }, 10)
  }, [])

  const handleRunCode = useCallback(
    async (code: string) => {
      setExecutionStatus('running')
      addConsoleMessage('info', '▶ Running code...')
      setIsPlaying(true)

      const result = await executeCode(code)

      if (result.success) {
        setExecutionStatus('success')
        addConsoleMessage('success', '✓ Code executed successfully')
      } else {
        setExecutionStatus('error')
        addConsoleMessage('error', `✗ Error: ${result.error}`)
      }

      setTimeout(() => {
        setIsPlaying(false)
        setExecutionStatus('idle')
      }, 2000)
    },
    [executeCode, addConsoleMessage]
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
    setConsoleMessages([])
    setExecutionStatus('idle')
    addConsoleMessage('info', '🔄 Simulation reset')
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter to run code
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        const codeElement = document.querySelector('.monaco-editor textarea') as HTMLTextAreaElement
        if (codeElement) {
          const code = (window as any).monacoEditorValue || ''
          handleRunCode(code)
        }
      }

      // Ctrl+R or Cmd+R to reset
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault()
        handleReset()
      }

      // Ctrl+K or Cmd+K to show keyboard shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowKeyboardShortcuts(true)
      }

      // Escape to close keyboard shortcuts
      if (e.key === 'Escape') {
        setShowKeyboardShortcuts(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleRunCode, handleReset])

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
        <div className="flex items-center space-x-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Virtual Robot Studio
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Design, code, and test robots in real-time 3D simulation
            </p>
          </div>

          {/* Execution Status Badge */}
          {executionStatus !== 'idle' && (
            <div className="flex items-center space-x-1.5">
              {executionStatus === 'running' && (
                <div className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md flex items-center space-x-1.5 text-xs">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span>Running...</span>
                </div>
              )}
              {executionStatus === 'success' && (
                <div className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md flex items-center space-x-1.5 text-xs">
                  <CheckCircle size={12} />
                  <span>Success</span>
                </div>
              )}
              {executionStatus === 'error' && (
                <div className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md flex items-center space-x-1.5 text-xs">
                  <XCircle size={12} />
                  <span>Error</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowKeyboardShortcuts(true)}
            className="px-2.5 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md flex items-center space-x-1.5 transition-colors"
            title="Keyboard shortcuts (⌘K)"
          >
            <Keyboard size={13} />
            <span className="hidden sm:inline">Shortcuts</span>
          </button>
          <button
            onClick={() => setMultiRobotMode(!multiRobotMode)}
            className={`px-2.5 py-1 text-xs rounded-md flex items-center space-x-1.5 transition-colors ${
              multiRobotMode
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}
            title="Toggle multi-robot mode"
          >
            <Users size={13} />
            <span>Multi-Robot</span>
          </button>
          <button
            onClick={multiRobotMode ? resetAllRobots : handleReset}
            className="px-2.5 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md flex items-center space-x-1.5 transition-colors"
            title={`Reset ${multiRobotMode ? 'all robots' : 'scene'} (⌘R)`}
          >
            <RotateCcw size={13} />
            <span>Reset {multiRobotMode ? 'All' : 'Scene'}</span>
          </button>
        </div>
      </div>

      {/* Main Content - Top Section */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar - Robot Library & Environments */}
        <div className="w-40 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          {/* Multi-Robot Manager or Single Robot Selector */}
          {multiRobotMode ? (
            <div className="p-3 flex-shrink-0">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                Fleet Manager
              </h2>
              <RobotManagerPanel
                robots={robots}
                activeRobotId={activeRobotId}
                onAddRobot={addRobot}
                onRemoveRobot={removeRobot}
                onSetActiveRobot={setActiveRobot}
              />
            </div>
          ) : (
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
          )}

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
              robots={multiRobotMode ? robots : undefined}
              activeRobotId={multiRobotMode ? activeRobotId : undefined}
              position={!multiRobotMode ? robotPosition : undefined}
              rotation={!multiRobotMode ? robotRotation : undefined}
              robotType={!multiRobotMode ? selectedRobot : undefined}
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

      {/* Console Output Panel */}
      <div className="h-32 bg-gray-900 dark:bg-black border-t border-gray-700 dark:border-gray-800 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 dark:bg-gray-900 border-b border-gray-700">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Console Output
          </h3>
          <button
            onClick={() => setConsoleMessages([])}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Clear
          </button>
        </div>
        <div
          ref={consoleRef}
          className="flex-1 overflow-y-auto px-3 py-2 font-mono text-xs space-y-1"
        >
          {consoleMessages.length === 0 ? (
            <div className="text-gray-500 italic">No output yet. Run your code to see results.</div>
          ) : (
            consoleMessages.map((msg) => (
              <div key={msg.id} className="flex items-start space-x-2">
                <span className="text-gray-600 dark:text-gray-500 text-[10px] mt-0.5 whitespace-nowrap">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
                <span
                  className={`flex-1 ${
                    msg.type === 'error'
                      ? 'text-red-400'
                      : msg.type === 'success'
                        ? 'text-green-400'
                        : msg.type === 'info'
                          ? 'text-blue-400'
                          : 'text-gray-300'
                  }`}
                >
                  {msg.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowKeyboardShortcuts(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <Keyboard size={20} />
                <span>Keyboard Shortcuts</span>
              </h2>
              <button
                onClick={() => setShowKeyboardShortcuts(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300">Run code</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-900 dark:text-white">
                  ⌘ Enter
                </kbd>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300">Reset simulation</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-900 dark:text-white">
                  ⌘ R
                </kbd>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300">Show shortcuts</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-900 dark:text-white">
                  ⌘ K
                </kbd>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">Close modal</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-900 dark:text-white">
                  Esc
                </kbd>
              </div>
            </div>

            <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Tip:</strong> Use ⌘ on Mac or Ctrl on Windows/Linux
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VirtualStudioPage
