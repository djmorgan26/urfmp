"""
Drone Simulation Example - URFMP SDK

Demonstrates UAV/drone telemetry streaming to URFMP.
Shows 3D position, IMU data, GPS, and battery monitoring.
"""

import asyncio
import math
from urfmp_sdk import VirtualRobot, RobotPosition, RobotOrientation, IMUData


async def main():
    """Drone simulation with full sensor suite."""

    drone = VirtualRobot(
        robot_id="quadcopter-drone-1",
        urfmp_url="ws://localhost:3000/rosbridge"
    )

    await drone.connect()
    print("🚁 Drone connected to URFMP")

    # Mission parameters
    waypoints = [
        (0.0, 0.0, 0.0),      # Takeoff
        (0.0, 0.0, 10.0),     # Ascend to 10m
        (10.0, 0.0, 10.0),    # Move forward
        (10.0, 10.0, 10.0),   # Move right
        (0.0, 10.0, 10.0),    # Move back
        (0.0, 0.0, 10.0),     # Return to start
        (0.0, 0.0, 0.0),      # Land
    ]

    try:
        for wp_idx, (target_x, target_y, target_z) in enumerate(waypoints):
            print(f"🎯 Waypoint {wp_idx + 1}/{len(waypoints)}: ({target_x}, {target_y}, {target_z})")

            # Move to waypoint (simplified motion)
            steps = 30
            for i in range(steps):
                t = i / steps
                x = target_x * t
                y = target_y * t
                z = target_z * t

                # Publish 3D position
                await drone.publish_position(x=x, y=y, z=z)

                # Simulate orientation (slight tilt during movement)
                roll = math.sin(t * math.pi) * 0.1
                pitch = math.cos(t * math.pi) * 0.1
                yaw = math.atan2(target_y - y, target_x - x) if target_x != x else 0.0

                orientation = RobotOrientation(
                    x=roll,
                    y=pitch,
                    z=math.sin(yaw/2),
                    w=math.cos(yaw/2)
                )

                # Publish pose (position + orientation)
                position = RobotPosition(x, y, z)
                await drone.publish_pose(position, orientation)

                # Publish velocity
                velocity = 2.0 if i < steps - 5 else 0.5  # Slow down near waypoint
                await drone.publish_velocity(
                    linear_x=velocity * math.cos(yaw) if target_x != x else 0.0,
                    linear_y=velocity * math.sin(yaw) if target_y != y else 0.0,
                    linear_z=(target_z - z) * 0.3
                )

                # Publish IMU data
                imu_data = IMUData(
                    orientation=orientation,
                    angular_velocity=RobotPosition(
                        x=roll * 0.5,
                        y=pitch * 0.5,
                        z=yaw * 0.2
                    ),
                    linear_acceleration=RobotPosition(
                        x=0.1,
                        y=0.05,
                        z=9.81 - z * 0.1  # Account for altitude change
                    )
                )
                await drone.publish_imu(imu_data)

                # Publish GPS position
                # Convert local position to GPS (simplified)
                base_lat = 37.7749  # San Francisco
                base_lon = -122.4194
                lat = base_lat + (y / 111000.0)  # ~111km per degree
                lon = base_lon + (x / (111000.0 * math.cos(math.radians(base_lat))))

                await drone.publish_gps(
                    latitude=lat,
                    longitude=lon,
                    altitude=z
                )

                # Publish battery status (custom message)
                battery_percent = max(100 - (wp_idx * 15) - (i * 0.1), 10)
                voltage = 11.1 + (battery_percent / 100.0) * 1.5  # 11.1V - 12.6V (3S LiPo)

                await drone.publish_custom(
                    topic="/battery",
                    message={
                        "percentage": battery_percent,
                        "voltage": voltage,
                        "current": 15.5,  # Amps
                        "remaining_time": int(battery_percent * 2)  # Estimated minutes
                    },
                    message_type="sensor_msgs/BatteryState"
                )

                print(f"  📍 Alt: {z:.1f}m | Battery: {battery_percent:.1f}% | GPS: {lat:.6f}, {lon:.6f}")

                await asyncio.sleep(0.1)  # 10 Hz

            print(f"✅ Reached waypoint {wp_idx + 1}")
            await asyncio.sleep(1.0)  # Pause at waypoint

        print("🎉 Mission complete!")

    except KeyboardInterrupt:
        print("\n⏹️  Emergency landing...")

    finally:
        await drone.disconnect()
        print("👋 Drone disconnected")


if __name__ == "__main__":
    print("🚀 Starting Drone Mission Simulation")
    asyncio.run(main())
