import { useCallback, useRef } from 'react';

interface Position {
  x: number;
  y: number;
  z: number;
}

interface RobotState {
  position: Position;
  rotation: number;
  speed: number;
}

export const useRobotAPI = (
  onMove: (x: number, y: number, z: number) => void,
  onRotate: (angle: number) => void,
  onSpeedChange: (speed: number) => void,
  onTelemetry: (data: any) => void
) => {
  const stateRef = useRef<RobotState>({
    position: { x: 0, y: 0.5, z: 0 },
    rotation: 0,
    speed: 1,
  });

  const robotAPI = useRef({
    move: async (x: number, y: number, z: number) => {
      return new Promise<void>((resolve) => {
        stateRef.current.position = { x, y, z };
        onMove(x, y, z);
        // Simulate movement time
        setTimeout(resolve, 1000);
      });
    },

    rotate: async (angle: number) => {
      return new Promise<void>((resolve) => {
        stateRef.current.rotation = angle;
        onRotate(angle);
        setTimeout(resolve, 500);
      });
    },

    setSpeed: (speed: number) => {
      stateRef.current.speed = speed;
      onSpeedChange(speed);
    },

    getPosition: () => {
      return { ...stateRef.current.position };
    },

    getRotation: () => {
      return stateRef.current.rotation;
    },

    sendTelemetry: (data: any) => {
      onTelemetry({
        ...data,
        robotId: 'virtual-robot-1',
        timestamp: Date.now(),
      });
    },
  });

  const executeCode = useCallback(async (code: string) => {
    try {
      // Create a safe execution context
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

      // Inject robot API into the code execution context
      const func = new AsyncFunction('robot', 'console', code);

      // Create a safe console proxy
      const consoleProxy = {
        log: (...args: any[]) => console.log('[Robot Code]:', ...args),
        error: (...args: any[]) => console.error('[Robot Code]:', ...args),
        warn: (...args: any[]) => console.warn('[Robot Code]:', ...args),
      };

      // Execute the code with robot API
      await func(robotAPI.current, consoleProxy);

      return { success: true };
    } catch (error: any) {
      console.error('[Code Execution Error]:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
      };
    }
  }, []);

  return {
    executeCode,
    robotAPI: robotAPI.current,
  };
};
