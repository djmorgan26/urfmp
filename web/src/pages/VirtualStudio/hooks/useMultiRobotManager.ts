import { useState, useCallback } from 'react'

export interface Robot {
  id: string
  name: string
  type: 'simple' | 'ur5' | 'drone'
  position: { x: number; y: number; z: number }
  rotation: number
  color: string
  active: boolean
}

const generateRobotId = () => `robot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

const defaultRobotPositions = [
  { x: 0, y: 0.5, z: 0 },
  { x: -3, y: 0.5, z: -3 },
  { x: 3, y: 0.5, z: -3 },
  { x: -3, y: 0.5, z: 3 },
  { x: 3, y: 0.5, z: 3 },
]

const robotColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

export const useMultiRobotManager = () => {
  const [robots, setRobots] = useState<Robot[]>([
    {
      id: generateRobotId(),
      name: 'Robot 1',
      type: 'simple',
      position: { x: 0, y: 0.5, z: 0 },
      rotation: 0,
      color: '#3b82f6',
      active: true,
    },
  ])

  const [activeRobotId, setActiveRobotId] = useState<string>(robots[0]?.id || '')

  const addRobot = useCallback(
    (type: 'simple' | 'ur5' | 'drone') => {
      const newRobot: Robot = {
        id: generateRobotId(),
        name: `Robot ${robots.length + 1}`,
        type,
        position: defaultRobotPositions[robots.length % defaultRobotPositions.length],
        rotation: 0,
        color: robotColors[robots.length % robotColors.length],
        active: false,
      }

      setRobots((prev) => [...prev, newRobot])
      setActiveRobotId(newRobot.id)
    },
    [robots.length]
  )

  const removeRobot = useCallback(
    (robotId: string) => {
      setRobots((prev) => {
        const filtered = prev.filter((r) => r.id !== robotId)
        if (filtered.length === 0) {
          // Always keep at least one robot
          return prev
        }
        return filtered
      })

      setActiveRobotId((prevId) => {
        if (prevId === robotId && robots.length > 1) {
          return robots.find((r) => r.id !== robotId)?.id || ''
        }
        return prevId
      })
    },
    [robots]
  )

  const updateRobotPosition = useCallback(
    (robotId: string, position: { x: number; y: number; z: number }) => {
      setRobots((prev) =>
        prev.map((robot) => (robot.id === robotId ? { ...robot, position } : robot))
      )
    },
    []
  )

  const updateRobotRotation = useCallback((robotId: string, rotation: number) => {
    setRobots((prev) =>
      prev.map((robot) => (robot.id === robotId ? { ...robot, rotation } : robot))
    )
  }, [])

  const updateRobotType = useCallback((robotId: string, type: 'simple' | 'ur5' | 'drone') => {
    setRobots((prev) => prev.map((robot) => (robot.id === robotId ? { ...robot, type } : robot)))
  }, [])

  const setActiveRobot = useCallback((robotId: string) => {
    setActiveRobotId(robotId)
    setRobots((prev) => prev.map((robot) => ({ ...robot, active: robot.id === robotId })))
  }, [])

  const getActiveRobot = useCallback(() => {
    return robots.find((r) => r.id === activeRobotId)
  }, [robots, activeRobotId])

  const resetAllRobots = useCallback(() => {
    setRobots((prev) =>
      prev.map((robot, index) => ({
        ...robot,
        position: defaultRobotPositions[index % defaultRobotPositions.length],
        rotation: 0,
      }))
    )
  }, [])

  return {
    robots,
    activeRobotId,
    addRobot,
    removeRobot,
    updateRobotPosition,
    updateRobotRotation,
    updateRobotType,
    setActiveRobot,
    getActiveRobot,
    resetAllRobots,
  }
}
