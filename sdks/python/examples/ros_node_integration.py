"""
ROS Node Integration Example - URFMP SDK

Shows how to integrate URFMP SDK with an existing ROS1/ROS2 node.
This example bridges ROS topics to URFMP cloud platform.

Prerequisites:
- ROS1 (Noetic) or ROS2 (Humble/Iron)
- rosbridge_server: ros-noetic-rosbridge-server or ros-humble-rosbridge-server
- Launch: roslaunch rosbridge_server rosbridge_websocket.launch
"""

import asyncio
import json
from urfmp_sdk import VirtualRobot

# Try ROS2 first, fall back to ROS1
try:
    import rclpy
    from rclpy.node import Node
    from geometry_msgs.msg import Twist
    from nav_msgs.msg import Odometry
    from sensor_msgs.msg import LaserScan
    ROS_VERSION = 2
    print("🟢 Using ROS2")
except ImportError:
    try:
        import rospy
        from geometry_msgs.msg import Twist
        from nav_msgs.msg import Odometry
        from sensor_msgs.msg import LaserScan
        ROS_VERSION = 1
        print("🟢 Using ROS1")
    except ImportError:
        print("❌ Neither ROS1 nor ROS2 found. Install ROS first.")
        exit(1)


class URFMPROSBridge:
    """Bridge ROS topics to URFMP cloud."""

    def __init__(self, robot_id: str):
        self.robot_id = robot_id
        self.urfmp_robot = None

    async def connect_urfmp(self):
        """Connect to URFMP cloud."""
        self.urfmp_robot = VirtualRobot(
            robot_id=self.robot_id,
            urfmp_url="ws://localhost:3000/rosbridge"
        )
        await self.urfmp_robot.connect()
        print(f"✅ {self.robot_id} connected to URFMP")

    async def odom_callback(self, msg):
        """Callback for ROS odometry messages."""
        position = msg.pose.pose.position
        orientation = msg.pose.pose.orientation

        # Forward to URFMP
        await self.urfmp_robot.publish_pose(
            position={'x': position.x, 'y': position.y, 'z': position.z},
            orientation={'x': orientation.x, 'y': orientation.y, 'z': orientation.z, 'w': orientation.w}
        )
        print(f"📍 Odometry → URFMP: ({position.x:.2f}, {position.y:.2f}, {position.z:.2f})")

    async def scan_callback(self, msg):
        """Callback for ROS LIDAR scan messages."""
        await self.urfmp_robot.publish_lidar(
            ranges=list(msg.ranges),
            angle_min=msg.angle_min,
            angle_max=msg.angle_max,
            angle_increment=msg.angle_increment
        )
        print(f"🌐 LIDAR scan → URFMP: {len(msg.ranges)} points")

    async def cmd_vel_callback(self, topic: str, message: dict):
        """Callback for URFMP velocity commands."""
        print(f"🎮 URFMP command received: {message}")
        # In real implementation, publish this to ROS /cmd_vel topic

    async def disconnect(self):
        """Disconnect from URFMP."""
        if self.urfmp_robot:
            await self.urfmp_robot.disconnect()


# ROS2 Implementation
class ROS2URFMPBridge(Node):
    """ROS2 node that bridges to URFMP."""

    def __init__(self):
        super().__init__('urfmp_bridge')
        self.bridge = URFMPROSBridge('ros2-robot-1')

        # ROS2 subscribers
        self.odom_sub = self.create_subscription(
            Odometry,
            '/odom',
            self.odom_callback,
            10
        )

        self.scan_sub = self.create_subscription(
            LaserScan,
            '/scan',
            self.scan_callback,
            10
        )

        print("🟢 ROS2 Bridge Node initialized")

    def odom_callback(self, msg):
        asyncio.create_task(self.bridge.odom_callback(msg))

    def scan_callback(self, msg):
        asyncio.create_task(self.bridge.scan_callback(msg))


# ROS1 Implementation
def ros1_bridge():
    """ROS1 bridge to URFMP."""
    rospy.init_node('urfmp_bridge', anonymous=True)

    bridge = URFMPROSBridge('ros1-robot-1')

    # Connect to URFMP
    asyncio.run(bridge.connect_urfmp())

    # ROS1 subscribers
    def odom_cb(msg):
        asyncio.run(bridge.odom_callback(msg))

    def scan_cb(msg):
        asyncio.run(bridge.scan_callback(msg))

    rospy.Subscriber('/odom', Odometry, odom_cb)
    rospy.Subscriber('/scan', LaserScan, scan_cb)

    # Subscribe to URFMP commands
    asyncio.create_task(bridge.urfmp_robot.subscribe('/cmd_vel', bridge.cmd_vel_callback))

    print("🟢 ROS1 Bridge Node initialized")

    try:
        rospy.spin()
    except KeyboardInterrupt:
        print("\n⏹️  Shutting down ROS1 bridge...")
    finally:
        asyncio.run(bridge.disconnect())


async def ros2_bridge_async():
    """Run ROS2 bridge asynchronously."""
    rclpy.init()
    node = ROS2URFMPBridge()

    # Connect to URFMP
    await node.bridge.connect_urfmp()

    # Subscribe to URFMP commands
    await node.bridge.urfmp_robot.subscribe('/cmd_vel', node.bridge.cmd_vel_callback)

    try:
        while rclpy.ok():
            rclpy.spin_once(node, timeout_sec=0.1)
            await asyncio.sleep(0.01)
    except KeyboardInterrupt:
        print("\n⏹️  Shutting down ROS2 bridge...")
    finally:
        await node.bridge.disconnect()
        node.destroy_node()
        rclpy.shutdown()


def main():
    """Main entry point."""
    print("🚀 Starting ROS ↔ URFMP Bridge")

    if ROS_VERSION == 2:
        asyncio.run(ros2_bridge_async())
    else:
        ros1_bridge()


if __name__ == "__main__":
    main()
