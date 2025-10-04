"""
Multi-Robot Fleet Example - URFMP SDK

Demonstrates managing multiple robots simultaneously with URFMP.
Shows coordinated movement, fleet-wide commands, and concurrent telemetry streaming.
"""

import asyncio
from typing import List
from urfmp_sdk import VirtualRobot


class FleetRobot:
    """Individual robot in the fleet."""

    def __init__(self, robot_id: str, start_x: float, start_y: float):
        self.robot_id = robot_id
        self.x = start_x
        self.y = start_y
        self.target_x = start_x
        self.target_y = start_y
        self.robot = VirtualRobot(
            robot_id=robot_id,
            urfmp_url="ws://localhost:3000/rosbridge"
        )

    async def connect(self):
        """Connect robot to URFMP."""
        await self.robot.connect()
        print(f"✅ {self.robot_id} connected")

    async def move_to_target(self):
        """Move robot towards target position."""
        # Simple proportional controller
        dx = self.target_x - self.x
        dy = self.target_y - self.y
        distance = (dx**2 + dy**2) ** 0.5

        if distance > 0.1:
            # Move towards target
            velocity = min(distance * 0.5, 1.0)  # Max 1.0 m/s
            self.x += (dx / distance) * velocity * 0.1
            self.y += (dy / distance) * velocity * 0.1

            # Publish position and velocity
            await self.robot.publish_position(x=self.x, y=self.y, z=0.0)
            await self.robot.publish_velocity(
                linear_x=velocity,
                angular_z=0.0
            )
        else:
            # At target, stop
            await self.robot.publish_velocity(linear_x=0.0, angular_z=0.0)

    async def disconnect(self):
        """Disconnect robot from URFMP."""
        await self.robot.disconnect()


class RobotFleetManager:
    """Manages a fleet of robots."""

    def __init__(self, num_robots: int = 5):
        self.robots: List[FleetRobot] = []

        # Create robot fleet in a line
        for i in range(num_robots):
            robot = FleetRobot(
                robot_id=f"fleet-robot-{i+1}",
                start_x=i * 2.0,
                start_y=0.0
            )
            self.robots.append(robot)

    async def connect_all(self):
        """Connect all robots in parallel."""
        await asyncio.gather(*[robot.connect() for robot in self.robots])
        print(f"🤖 Fleet of {len(self.robots)} robots connected to URFMP")

    async def formation_circle(self, radius: float = 5.0):
        """Move robots into circular formation."""
        import math

        for i, robot in enumerate(self.robots):
            angle = (2 * math.pi / len(self.robots)) * i
            robot.target_x = radius * math.cos(angle)
            robot.target_y = radius * math.sin(angle)

        print(f"🔄 Moving to circle formation (radius: {radius}m)")

    async def formation_line(self, spacing: float = 2.0):
        """Move robots into line formation."""
        for i, robot in enumerate(self.robots):
            robot.target_x = i * spacing
            robot.target_y = 0.0

        print(f"📏 Moving to line formation (spacing: {spacing}m)")

    async def formation_grid(self, rows: int = 2, spacing: float = 2.0):
        """Move robots into grid formation."""
        cols = len(self.robots) // rows + (1 if len(self.robots) % rows else 0)

        for i, robot in enumerate(self.robots):
            row = i // cols
            col = i % cols
            robot.target_x = col * spacing
            robot.target_y = row * spacing

        print(f"📐 Moving to grid formation ({rows}x{cols})")

    async def update_loop(self):
        """Main update loop for all robots."""
        try:
            for step in range(200):
                # Update all robots concurrently
                await asyncio.gather(*[robot.move_to_target() for robot in self.robots])

                # Change formation every 50 steps
                if step == 50:
                    await self.formation_circle(radius=5.0)
                elif step == 100:
                    await self.formation_grid(rows=2, spacing=2.0)
                elif step == 150:
                    await self.formation_line(spacing=1.5)

                await asyncio.sleep(0.1)  # 10 Hz

        except KeyboardInterrupt:
            print("\n⏹️  Stopping fleet...")

    async def disconnect_all(self):
        """Disconnect all robots."""
        await asyncio.gather(*[robot.disconnect() for robot in self.robots])
        print("👋 Fleet disconnected")


async def main():
    """Run multi-robot fleet demonstration."""
    print("🚀 Starting URFMP Multi-Robot Fleet Demo")

    # Create fleet manager with 6 robots
    fleet = RobotFleetManager(num_robots=6)

    # Connect all robots
    await fleet.connect_all()

    # Run coordinated movement
    await fleet.update_loop()

    # Disconnect all robots
    await fleet.disconnect_all()


if __name__ == "__main__":
    asyncio.run(main())
