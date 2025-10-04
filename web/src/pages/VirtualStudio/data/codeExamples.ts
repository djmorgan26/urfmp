// Code Examples Library for Virtual Robot Studio

export interface CodeExample {
  id: string
  title: string
  category: 'basics' | 'movement' | 'sensors' | 'advanced' | 'multi-robot'
  description: string
  code: string
  robotType?: 'simple' | 'ur5' | 'drone' | 'any'
}

export const codeExamples: CodeExample[] = [
  // BASICS
  {
    id: 'hello-world',
    title: 'Hello World',
    category: 'basics',
    description: 'Simple introduction to robot programming',
    robotType: 'any',
    code: `// Your first robot program!
// Available API:
// - robot.move(x, y, z)
// - robot.rotate(angle)
// - robot.setSpeed(speed)
// - robot.sendTelemetry(data)

async function main() {
  console.log('Hello from Virtual Robot!');

  // Move forward 2 units
  await robot.move(0, 0, -2);

  console.log('Robot moved successfully!');
}

main();`,
  },
  {
    id: 'basic-movement',
    title: 'Basic Movement',
    category: 'basics',
    description: 'Learn basic movement commands',
    robotType: 'any',
    code: `async function main() {
  // Move forward
  await robot.move(0, 0, -3);

  // Rotate 90 degrees right
  await robot.rotate(90);

  // Move forward again
  await robot.move(0, 0, -3);

  // Rotate back to start
  await robot.rotate(0);

  console.log('Movement complete!');
}

main();`,
  },

  // MOVEMENT PATTERNS
  {
    id: 'square-pattern',
    title: 'Square Pattern',
    category: 'movement',
    description: 'Move robot in a square path',
    robotType: 'simple',
    code: `async function main() {
  const sideLength = 3;

  // Draw a square
  for (let i = 0; i < 4; i++) {
    await robot.move(0, 0, -sideLength);
    await robot.rotate(90 * (i + 1));
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('Square pattern complete!');
}

main();`,
  },
  {
    id: 'circle-pattern',
    title: 'Circle Pattern',
    category: 'movement',
    description: 'Move robot in a circular path',
    robotType: 'simple',
    code: `async function main() {
  const radius = 3;
  const steps = 16; // Number of steps for smooth circle

  for (let i = 0; i < steps; i++) {
    const angle = (i * 360) / steps;
    const x = radius * Math.cos(angle * Math.PI / 180);
    const z = radius * Math.sin(angle * Math.PI / 180);

    await robot.move(x, 0.5, z);
    await robot.rotate(angle);
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('Circle complete!');
}

main();`,
  },
  {
    id: 'figure-eight',
    title: 'Figure-8 Pattern',
    category: 'movement',
    description: 'Complex figure-8 movement pattern',
    robotType: 'simple',
    code: `async function main() {
  const radius = 2;
  const steps = 32;

  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const x = radius * Math.sin(t);
    const z = radius * Math.sin(t) * Math.cos(t);

    await robot.move(x, 0.5, z);
    await robot.rotate((t * 180 / Math.PI) % 360);
    await new Promise(resolve => setTimeout(resolve, 150));
  }

  console.log('Figure-8 complete!');
}

main();`,
  },
  {
    id: 'patrol-pattern',
    title: 'Patrol Route',
    category: 'movement',
    description: 'Patrol between waypoints',
    robotType: 'simple',
    code: `async function main() {
  const waypoints = [
    { x: 0, y: 0.5, z: 0 },
    { x: -3, y: 0.5, z: -3 },
    { x: 3, y: 0.5, z: -3 },
    { x: 3, y: 0.5, z: 3 },
    { x: -3, y: 0.5, z: 3 },
    { x: 0, y: 0.5, z: 0 },
  ];

  for (const point of waypoints) {
    console.log(\`Moving to: (\${point.x}, \${point.y}, \${point.z})\`);
    await robot.move(point.x, point.y, point.z);
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  console.log('Patrol complete!');
}

main();`,
  },

  // SENSOR EXAMPLES
  {
    id: 'sensor-reading',
    title: 'Read Sensors',
    category: 'sensors',
    description: 'Read and display sensor data',
    robotType: 'any',
    code: `async function main() {
  // Simulate sensor readings
  const position = robot.getPosition();
  const rotation = robot.getRotation();

  robot.sendTelemetry({
    position: position,
    rotation: rotation,
    sensors: {
      camera: true,
      lidar: true,
      imu: true,
    },
    timestamp: Date.now(),
  });

  console.log('Sensor data:', {
    position,
    rotation,
    timestamp: new Date().toISOString(),
  });
}

main();`,
  },
  {
    id: 'obstacle-avoidance',
    title: 'Obstacle Avoidance',
    category: 'sensors',
    description: 'Use distance sensor to avoid obstacles',
    robotType: 'simple',
    code: `async function main() {
  const safeDistance = 2.0;

  for (let i = 0; i < 10; i++) {
    // Simulate distance sensor reading
    const distance = Math.random() * 5;

    if (distance < safeDistance) {
      console.log('Obstacle detected! Turning...');
      await robot.rotate(robot.getRotation() + 90);
    } else {
      console.log('Path clear, moving forward');
      await robot.move(0, 0, -1);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('Navigation complete!');
}

main();`,
  },

  // ADVANCED EXAMPLES
  {
    id: 'pick-and-place',
    title: 'Pick and Place',
    category: 'advanced',
    description: 'Robotic arm pick and place operation',
    robotType: 'ur5',
    code: `async function main() {
  // Pick position
  const pickPos = { x: -2, y: 1, z: -2 };

  // Place position
  const placePos = { x: 2, y: 1, z: 2 };

  console.log('Moving to pick position...');
  await robot.move(pickPos.x, pickPos.y, pickPos.z);
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('Picking object...');
  await robot.move(pickPos.x, 0.5, pickPos.z); // Lower
  await new Promise(resolve => setTimeout(resolve, 300));

  console.log('Lifting object...');
  await robot.move(pickPos.x, pickPos.y, pickPos.z); // Raise

  console.log('Moving to place position...');
  await robot.move(placePos.x, placePos.y, placePos.z);
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('Placing object...');
  await robot.move(placePos.x, 0.5, placePos.z); // Lower
  await new Promise(resolve => setTimeout(resolve, 300));

  console.log('Pick and place complete!');
  await robot.move(0, 1, 0); // Return to home
}

main();`,
  },
  {
    id: 'drone-flight',
    title: 'Drone Flight Path',
    category: 'advanced',
    description: 'Autonomous drone flight pattern',
    robotType: 'drone',
    code: `async function main() {
  // Takeoff
  console.log('Taking off...');
  await robot.move(0, 3, 0);
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Flight path
  const flightPath = [
    { x: -3, y: 4, z: -3 },
    { x: 3, y: 5, z: -3 },
    { x: 3, y: 4, z: 3 },
    { x: -3, y: 3, z: 3 },
  ];

  for (const point of flightPath) {
    console.log(\`Flying to: (\${point.x}, \${point.y}, \${point.z})\`);
    await robot.move(point.x, point.y, point.z);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Landing
  console.log('Landing...');
  await robot.move(0, 0.5, 0);

  console.log('Flight complete!');
}

main();`,
  },
  {
    id: 'emergency-stop',
    title: 'Emergency Stop',
    category: 'advanced',
    description: 'Emergency stop and safety procedure',
    robotType: 'any',
    code: `async function main() {
  let emergencyStop = false;

  // Simulate emergency condition
  setTimeout(() => {
    emergencyStop = true;
    console.log('EMERGENCY STOP ACTIVATED!');
  }, 3000);

  try {
    for (let i = 0; i < 10; i++) {
      if (emergencyStop) {
        throw new Error('Emergency stop triggered');
      }

      await robot.move(0, 0, -1);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (error) {
    console.error('Emergency stop:', error.message);

    // Safety procedure
    await robot.setSpeed(0);
    robot.sendTelemetry({
      status: 'emergency_stop',
      position: robot.getPosition(),
      timestamp: Date.now(),
    });
  }
}

main();`,
  },

  // MULTI-ROBOT EXAMPLES
  {
    id: 'multi-robot-sync',
    title: 'Multi-Robot Sync',
    category: 'multi-robot',
    description: 'Synchronized multi-robot movement',
    robotType: 'any',
    code: `// Note: Switch to Multi-Robot mode to see this in action!

async function main() {
  // This example shows coordinated movement
  // In multi-robot mode, each robot moves in formation

  const formation = [
    { x: -2, y: 0.5, z: -2 },
    { x: 2, y: 0.5, z: -2 },
    { x: 0, y: 0.5, z: 2 },
  ];

  for (const pos of formation) {
    await robot.move(pos.x, pos.y, pos.z);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('Formation movement complete!');
}

main();`,
  },
]

export const exampleCategories = [
  { id: 'basics', label: 'Basics', icon: '📚' },
  { id: 'movement', label: 'Movement Patterns', icon: '🔄' },
  { id: 'sensors', label: 'Sensors', icon: '📡' },
  { id: 'advanced', label: 'Advanced', icon: '🚀' },
  { id: 'multi-robot', label: 'Multi-Robot', icon: '🤖' },
] as const

export function getExamplesByCategory(category: CodeExample['category']) {
  return codeExamples.filter((example) => example.category === category)
}

export function getExampleById(id: string) {
  return codeExamples.find((example) => example.id === id)
}
