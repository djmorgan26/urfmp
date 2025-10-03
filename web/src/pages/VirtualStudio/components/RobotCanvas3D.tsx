import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface RobotCanvas3DProps {
  isPlaying: boolean;
}

// Simple robot component - a box with a sphere on top
const SimpleRobot: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
  const robotRef = useRef<THREE.Group>(null);
  const [position, setPosition] = useState<[number, number, number]>([0, 0.5, 0]);

  useFrame((state, delta) => {
    if (isPlaying && robotRef.current) {
      // Simple animation - move forward
      robotRef.current.position.z -= delta * 0.5;

      // Reset if too far
      if (robotRef.current.position.z < -10) {
        robotRef.current.position.z = 10;
      }
    }
  });

  return (
    <group ref={robotRef} position={position}>
      {/* Robot body */}
      <Box args={[1, 0.5, 1.5]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#3b82f6" />
      </Box>

      {/* Robot head/sensor */}
      <Sphere args={[0.3, 32, 32]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#60a5fa" />
      </Sphere>

      {/* Wheels */}
      <Sphere args={[0.2, 16, 16]} position={[0.5, -0.3, 0.5]}>
        <meshStandardMaterial color="#1f2937" />
      </Sphere>
      <Sphere args={[0.2, 16, 16]} position={[-0.5, -0.3, 0.5]}>
        <meshStandardMaterial color="#1f2937" />
      </Sphere>
      <Sphere args={[0.2, 16, 16]} position={[0.5, -0.3, -0.5]}>
        <meshStandardMaterial color="#1f2937" />
      </Sphere>
      <Sphere args={[0.2, 16, 16]} position={[-0.5, -0.3, -0.5]}>
        <meshStandardMaterial color="#1f2937" />
      </Sphere>
    </group>
  );
};

const RobotCanvas3D: React.FC<RobotCanvas3DProps> = ({ isPlaying }) => {
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
        <SimpleRobot isPlaying={isPlaying} />

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
