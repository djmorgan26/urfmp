import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Box } from '@react-three/drei';
import { SimpleBot, UR5Arm, Drone } from './RobotModels';

type RobotType = 'simple' | 'ur5' | 'drone';

interface RobotCanvas3DProps {
  isPlaying: boolean;
  position?: { x: number; y: number; z: number };
  rotation?: number;
  robotType?: RobotType;
}

const RobotCanvas3D: React.FC<RobotCanvas3DProps> = ({
  isPlaying,
  position,
  rotation,
  robotType = 'simple',
}) => {
  const RobotComponent = {
    simple: SimpleBot,
    ur5: UR5Arm,
    drone: Drone,
  }[robotType];
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        shadows
        className="bg-gray-50 dark:bg-gray-900"
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.5} />

        {/* Grid floor */}
        <Grid
          args={[20, 20]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#6b7280"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#3b82f6"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={false}
        />

        {/* Robot */}
        <RobotComponent position={position} rotation={rotation} />

        {/* Environment obstacles */}
        <Box args={[1, 2, 1]} position={[3, 1, -3]}>
          <meshStandardMaterial color="#ef4444" />
        </Box>
        <Box args={[1, 1, 1]} position={[-3, 0.5, -5]}>
          <meshStandardMaterial color="#10b981" />
        </Box>

        {/* Camera controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2}
        />

        {/* Axes helper */}
        <axesHelper args={[5]} />
      </Canvas>
    </div>
  );
};

export default RobotCanvas3D;
