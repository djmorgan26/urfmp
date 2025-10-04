"""
Basic Robot Example - URFMP SDK

Demonstrates the simplest way to connect a robot to URFMP and stream telemetry.
This example shows the "7 lines of code" promise in action.
"""

import asyncio
import random
from urfmp_sdk import VirtualRobot, RobotPosition, RobotOrientation


async def main():
    """Basic robot telemetry streaming example."""

    # Initialize robot (Line 1)
    robot = VirtualRobot(
        robot_id="basic-robot-1",
        urfmp_url="ws://localhost:3000/rosbridge"
    )

    # Connect to URFMP (Line 2)
    await robot.connect()
    print(f"✅ Robot {robot.robot_id} connected to URFMP")

    try:
        # Simulate robot movement and publish telemetry
        for i in range(20):
            # Publish position (Line 3)
            x = i * 0.5
            y = random.uniform(-1.0, 1.0)
            await robot.publish_position(x=x, y=y, z=0.0)

            # Publish velocity (Line 4)
            linear_x = 0.5
            angular_z = random.uniform(-0.3, 0.3)
            await robot.publish_velocity(
                linear_x=linear_x,
                angular_z=angular_z
            )

            print(f"📍 Position: ({x:.2f}, {y:.2f}, 0.00) | Velocity: {linear_x:.2f} m/s")

            await asyncio.sleep(1.0)  # 1 Hz update rate

    except KeyboardInterrupt:
        print("\n⏹️  Stopping robot...")

    finally:
        # Disconnect (Line 5)
        await robot.disconnect()
        print("👋 Robot disconnected")


if __name__ == "__main__":
    asyncio.run(main())
