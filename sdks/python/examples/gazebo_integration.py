"""
Gazebo Simulation Integration - URFMP SDK

Connect a Gazebo-simulated robot to URFMP for cloud monitoring and control.

Prerequisites:
- Gazebo simulator running with rosbridge_server
- ROS package: sudo apt install ros-noetic-rosbridge-server
- Launch: roslaunch rosbridge_server rosbridge_websocket.launch

This example shows how to bridge a Gazebo robot to URFMP cloud platform.
"""

import asyncio
from urfmp_sdk import VirtualRobot


async def gazebo_robot_handler(topic: str, message: dict):
    """Callback for receiving commands from URFMP."""
    print(f"📥 Received command on {topic}: {message}")
    # In real implementation, forward this to Gazebo via ROS


async def main():
    """Connect Gazebo robot to URFMP cloud."""

    # Connect to local Gazebo rosbridge (default port 9090)
    robot = VirtualRobot(
        robot_id="gazebo-turtlebot-1",
        urfmp_url="ws://localhost:9090",  # Local Gazebo rosbridge
        auto_advertise=True
    )

    await robot.connect()
    print("🤖 Gazebo robot connected to URFMP")

    # Subscribe to URFMP commands
    await robot.subscribe("/cmd_vel", gazebo_robot_handler)

    try:
        # Stream Gazebo telemetry to URFMP cloud
        while True:
            # In real implementation, read these from Gazebo topics
            # For demo, we'll simulate the data

            # Publish odometry data
            await robot.publish_position(x=1.5, y=2.3, z=0.0)

            # Publish LIDAR scan (360 degree scan)
            ranges = [3.5] * 360  # Simulated LIDAR ranges
            await robot.publish_lidar(
                ranges=ranges,
                angle_min=0.0,
                angle_max=6.28,  # 2*pi radians
                angle_increment=0.017  # ~1 degree
            )

            # Publish GPS (if available)
            await robot.publish_gps(
                latitude=37.7749,
                longitude=-122.4194,
                altitude=10.0
            )

            print("📊 Telemetry streamed to URFMP cloud")

            await asyncio.sleep(0.1)  # 10 Hz update rate

    except KeyboardInterrupt:
        print("\n⏹️  Shutting down Gazebo bridge...")

    finally:
        await robot.disconnect()
        print("👋 Gazebo robot disconnected")


if __name__ == "__main__":
    print("🚀 Starting Gazebo → URFMP Bridge")
    print("📡 Make sure rosbridge_server is running on ws://localhost:9090")
    asyncio.run(main())
