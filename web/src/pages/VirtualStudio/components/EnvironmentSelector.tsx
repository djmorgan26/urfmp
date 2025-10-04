import React from 'react'
import { Box, Cylinder, Sphere } from '@react-three/drei'

export type EnvironmentType = 'warehouse' | 'factory' | 'outdoor' | 'laboratory'

interface EnvironmentConfig {
  name: string
  description: string
  obstacles: Array<{
    position: [number, number, number]
    size: [number, number, number]
    color: string
    type: 'box' | 'cylinder' | 'sphere'
  }>
  gridColor: string
  gridSectionColor: string
  ambientIntensity: number
}

export const environmentConfigs: Record<EnvironmentType, EnvironmentConfig> = {
  warehouse: {
    name: 'Warehouse',
    description: 'Storage facility with shelves and pallets',
    gridColor: '#6b7280',
    gridSectionColor: '#3b82f6',
    ambientIntensity: 0.5,
    obstacles: [
      // Shelving units
      { position: [3, 1.5, -3], size: [1, 3, 1], color: '#ef4444', type: 'box' },
      { position: [-3, 1.5, -3], size: [1, 3, 1], color: '#ef4444', type: 'box' },
      { position: [3, 1.5, 3], size: [1, 3, 1], color: '#ef4444', type: 'box' },
      { position: [-3, 1.5, 3], size: [1, 3, 1], color: '#ef4444', type: 'box' },
      // Pallets
      { position: [0, 0.3, -6], size: [2, 0.6, 2], color: '#92400e', type: 'box' },
      { position: [5, 0.3, 0], size: [1.5, 0.6, 1.5], color: '#92400e', type: 'box' },
      // Loading area markers
      { position: [-6, 0.5, -6], size: [0.3, 1, 0.3], color: '#f59e0b', type: 'cylinder' },
      { position: [6, 0.5, -6], size: [0.3, 1, 0.3], color: '#f59e0b', type: 'cylinder' },
    ],
  },
  factory: {
    name: 'Factory Floor',
    description: 'Manufacturing facility with machinery',
    gridColor: '#4b5563',
    gridSectionColor: '#ef4444',
    ambientIntensity: 0.6,
    obstacles: [
      // Manufacturing machines
      { position: [4, 1, -4], size: [1.5, 2, 1.5], color: '#6b7280', type: 'box' },
      { position: [-4, 1, -4], size: [1.5, 2, 1.5], color: '#6b7280', type: 'box' },
      { position: [4, 1, 4], size: [1.5, 2, 1.5], color: '#6b7280', type: 'box' },
      // Conveyor belt segments
      { position: [0, 0.3, -2], size: [6, 0.6, 0.8], color: '#374151', type: 'box' },
      { position: [0, 0.3, 2], size: [6, 0.6, 0.8], color: '#374151', type: 'box' },
      // Safety barriers
      { position: [-6, 0.5, 0], size: [0.2, 1, 8], color: '#fbbf24', type: 'box' },
      { position: [6, 0.5, 0], size: [0.2, 1, 8], color: '#fbbf24', type: 'box' },
    ],
  },
  outdoor: {
    name: 'Outdoor Test Area',
    description: 'Open area with natural obstacles',
    gridColor: '#65a30d',
    gridSectionColor: '#84cc16',
    ambientIntensity: 0.7,
    obstacles: [
      // Trees (cylinders for trunks, spheres for canopy)
      { position: [4, 1.5, -5], size: [0.4, 3, 0.4], color: '#92400e', type: 'cylinder' },
      { position: [4, 4, -5], size: [1.5, 1.5, 1.5], color: '#15803d', type: 'sphere' },
      { position: [-5, 1.5, -3], size: [0.4, 3, 0.4], color: '#92400e', type: 'cylinder' },
      { position: [-5, 4, -3], size: [1.5, 1.5, 1.5], color: '#15803d', type: 'sphere' },
      // Rocks
      { position: [2, 0.4, 3], size: [0.8, 0.8, 0.8], color: '#78716c', type: 'sphere' },
      { position: [-3, 0.5, 5], size: [1, 1, 1], color: '#78716c', type: 'sphere' },
      { position: [6, 0.3, 2], size: [0.6, 0.6, 0.6], color: '#78716c', type: 'sphere' },
      // Test markers
      { position: [0, 0.5, -8], size: [0.3, 1, 0.3], color: '#dc2626', type: 'cylinder' },
      { position: [0, 0.5, 8], size: [0.3, 1, 0.3], color: '#16a34a', type: 'cylinder' },
    ],
  },
  laboratory: {
    name: 'Research Laboratory',
    description: 'Clean room with test equipment',
    gridColor: '#cbd5e1',
    gridSectionColor: '#0ea5e9',
    ambientIntensity: 0.8,
    obstacles: [
      // Lab benches
      { position: [4, 0.5, -4], size: [2, 1, 1.5], color: '#f8fafc', type: 'box' },
      { position: [-4, 0.5, -4], size: [2, 1, 1.5], color: '#f8fafc', type: 'box' },
      { position: [4, 0.5, 4], size: [2, 1, 1.5], color: '#f8fafc', type: 'box' },
      { position: [-4, 0.5, 4], size: [2, 1, 1.5], color: '#f8fafc', type: 'box' },
      // Equipment
      { position: [0, 0.8, -6], size: [1.2, 1.6, 1.2], color: '#e2e8f0', type: 'box' },
      { position: [-6, 1, 0], size: [1, 2, 1], color: '#e2e8f0', type: 'box' },
      // Test area markers
      { position: [0, 0.1, 0], size: [3, 0.2, 3], color: '#0ea5e9', type: 'cylinder' },
    ],
  },
}

interface EnvironmentSceneProps {
  environment: EnvironmentType
  onObstacleCollision?: (index: number) => void
  collidingObstacles?: Set<number>
}

export const EnvironmentScene: React.FC<EnvironmentSceneProps> = ({
  environment,
  collidingObstacles = new Set(),
}) => {
  const config = environmentConfigs[environment]

  return (
    <>
      {config.obstacles.map((obstacle, index) => {
        const isColliding = collidingObstacles.has(index)
        const Component =
          obstacle.type === 'box' ? Box : obstacle.type === 'cylinder' ? Cylinder : Sphere

        return (
          <Component
            key={`${environment}-${index}`}
            args={obstacle.size as any}
            position={obstacle.position}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color={isColliding ? '#dc2626' : obstacle.color}
              emissive={isColliding ? '#dc2626' : '#000000'}
              emissiveIntensity={isColliding ? 0.5 : 0}
            />
          </Component>
        )
      })}
    </>
  )
}

interface EnvironmentSelectorUIProps {
  currentEnvironment: EnvironmentType
  onEnvironmentChange: (env: EnvironmentType) => void
}

export const EnvironmentSelectorUI: React.FC<EnvironmentSelectorUIProps> = ({
  currentEnvironment,
  onEnvironmentChange,
}) => {
  const environments: EnvironmentType[] = ['warehouse', 'factory', 'outdoor', 'laboratory']

  return (
    <div className="space-y-2">
      {environments.map((env) => {
        const config = environmentConfigs[env]
        return (
          <button
            key={env}
            onClick={() => onEnvironmentChange(env)}
            className={`w-full p-2.5 rounded-md text-left transition-all ${
              currentEnvironment === env
                ? 'bg-purple-500 text-white shadow-sm'
                : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <h3 className="text-sm font-medium">{config.name}</h3>
            <p
              className={`text-xs mt-0.5 ${
                currentEnvironment === env ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {config.description}
            </p>
          </button>
        )
      })}
    </div>
  )
}

export default EnvironmentScene
