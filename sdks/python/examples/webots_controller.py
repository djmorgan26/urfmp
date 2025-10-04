"""
Webots Controller Integration - URFMP SDK

Example Webots robot controller that streams telemetry to URFMP.
This file should be placed in your Webots project controllers directory.

Prerequisites:
- Webots R2023b or later
- Install: pip install urfmp-sdk
- Add this controller to your robot in Webots scene tree

Controller name: urfmp_controller
"""

import asyncio
from controller import Robot as WebotsRobot
from urfmp_sdk import VirtualRobot, RobotPosition, RobotOrientation


class URFMPWebotsController:
    """Webots robot controller with URFMP integration."""

    def __init__(self):
        # Initialize Webots robot
        self.webots_robot = WebotsRobot()
        self.timestep = int(self.webots_robot.getBasicTimeStep())

        # Get Webots devices
        self.left_motor = self.webots_robot.getDevice('left wheel motor')
        self.right_motor = self.webots_robot.getDevice('right wheel motor')
        self.gps = self.webots_robot.getDevice('gps')
        self.compass = self.webots_robot.getDevice('compass')
        self.lidar = self.webots_robot.getDevice('lidar')

        # Enable devices
        if self.gps:
            self.gps.enable(self.timestep)
        if self.compass:
            self.compass.enable(self.timestep)
        if self.lidar:
            self.lidar.enable(self.timestep)
            self.lidar.enablePointCloud()

        # URFMP connection
        self.urfmp_robot = None

    async def connect_urfmp(self):
        """Connect to URFMP cloud platform."""
        self.urfmp_robot = VirtualRobot(
            robot_id="webots-pioneer-1",
            urfmp_url="ws://localhost:3000/rosbridge"
        )
        await self.urfmp_robot.connect()
        print("✅ Webots robot connected to URFMP")

    async def stream_telemetry(self):
        """Stream Webots sensor data to URFMP."""
        # Get GPS position
        if self.gps:
            gps_values = self.gps.getValues()
            await self.urfmp_robot.publish_position(
                x=gps_values[0],
                y=gps_values[1],
                z=gps_values[2]
            )

        # Get compass orientation
        if self.compass:
            compass_values = self.compass.getValues()
            # Convert compass to quaternion (simplified)
            await self.urfmp_robot.publish_pose(
                position=RobotPosition(gps_values[0], gps_values[1], gps_values[2]),
                orientation=RobotOrientation(0, 0, compass_values[2], compass_values[0])
            )

        # Get LIDAR scan
        if self.lidar:
            ranges = self.lidar.getRangeImage()
            await self.urfmp_robot.publish_lidar(
                ranges=list(ranges),
                angle_min=-1.57,
                angle_max=1.57,
                angle_increment=0.017
            )

    async def run(self):
        """Main control loop."""
        await self.connect_urfmp()

        try:
            while self.webots_robot.step(self.timestep) != -1:
                # Simple forward motion
                self.left_motor.setVelocity(2.0)
                self.right_motor.setVelocity(2.0)

                # Stream telemetry to URFMP
                await self.stream_telemetry()

                # Publish velocity
                await self.urfmp_robot.publish_velocity(
                    linear_x=0.5,
                    angular_z=0.0
                )

                await asyncio.sleep(0.01)  # 100 Hz

        except KeyboardInterrupt:
            print("\n⏹️  Stopping Webots controller...")

        finally:
            if self.urfmp_robot:
                await self.urfmp_robot.disconnect()
            print("👋 Webots controller stopped")


def main():
    """Entry point for Webots controller."""
    controller = URFMPWebotsController()
    asyncio.run(controller.run())


if __name__ == "__main__":
    main()
