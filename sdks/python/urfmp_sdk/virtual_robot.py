"""High-level Virtual Robot API for URFMP"""

import asyncio
import logging
from typing import Optional, Dict, Any, List

from .rosbridge_client import ROSBridgeClient
from .types import (
    RobotPosition,
    RobotOrientation,
    Twist,
    JointState,
    LidarScan,
    IMUData,
    GPSPosition,
    TelemetryData,
)

logger = logging.getLogger(__name__)


class VirtualRobot:
    """
    High-level API for connecting external robots to URFMP.

    Usage:
        ```python
        from urfmp_sdk import VirtualRobot

        robot = VirtualRobot(
            robot_id="my-robot-1",
            urfmp_url="ws://localhost:3000/rosbridge"
        )

        await robot.connect()
        await robot.publish_position(x=1.0, y=2.0, z=0.0)
        await robot.publish_velocity(linear_x=0.5, angular_z=0.3)
        await robot.disconnect()
        ```
    """

    def __init__(
        self,
        robot_id: str,
        urfmp_url: str = "ws://localhost:3000/rosbridge",
        auto_advertise: bool = True
    ):
        """
        Initialize VirtualRobot.

        Args:
            robot_id: Unique identifier for this robot
            urfmp_url: URL of URFMP ROSBridge server
            auto_advertise: Automatically advertise topics on first publish
        """
        self.robot_id = robot_id
        self.auto_advertise = auto_advertise

        self._client = ROSBridgeClient(url=urfmp_url, robot_id=robot_id)
        self._advertised_topics: set = set()

    async def connect(self) -> None:
        """
        Connect to URFMP server.

        Raises:
            ConnectionError: If connection fails
        """
        await self._client.connect()
        logger.info(f"Robot {self.robot_id} connected to URFMP")

    async def disconnect(self) -> None:
        """Disconnect from URFMP server."""
        await self._client.disconnect()
        logger.info(f"Robot {self.robot_id} disconnected from URFMP")

    async def _ensure_advertised(self, topic: str, message_type: str) -> None:
        """Ensure topic is advertised before publishing."""
        if self.auto_advertise and topic not in self._advertised_topics:
            await self._client.advertise(topic, message_type)
            self._advertised_topics.add(topic)

    # ===== Position & Orientation =====

    async def publish_position(
        self,
        x: float = 0.0,
        y: float = 0.0,
        z: float = 0.0
    ) -> None:
        """
        Publish robot position (odometry).

        Args:
            x: X coordinate (meters)
            y: Y coordinate (meters)
            z: Z coordinate (meters)
        """
        topic = "/odom"
        await self._ensure_advertised(topic, "nav_msgs/Odometry")

        message = {
            "pose": {
                "pose": {
                    "position": {"x": x, "y": y, "z": z},
                    "orientation": {"x": 0, "y": 0, "z": 0, "w": 1}
                }
            }
        }

        await self._client.publish(topic, message)

    async def publish_pose(
        self,
        position: RobotPosition,
        orientation: RobotOrientation
    ) -> None:
        """
        Publish full robot pose (position + orientation).

        Args:
            position: 3D position
            orientation: Quaternion orientation
        """
        topic = "/odom"
        await self._ensure_advertised(topic, "nav_msgs/Odometry")

        message = {
            "pose": {
                "pose": {
                    "position": position.to_dict(),
                    "orientation": orientation.to_dict()
                }
            }
        }

        await self._client.publish(topic, message)

    # ===== Velocity Control =====

    async def publish_velocity(
        self,
        linear_x: float = 0.0,
        linear_y: float = 0.0,
        linear_z: float = 0.0,
        angular_x: float = 0.0,
        angular_y: float = 0.0,
        angular_z: float = 0.0
    ) -> None:
        """
        Publish velocity command (cmd_vel).

        Args:
            linear_x: Forward/backward velocity (m/s)
            linear_y: Left/right velocity (m/s)
            linear_z: Up/down velocity (m/s)
            angular_x: Roll rate (rad/s)
            angular_y: Pitch rate (rad/s)
            angular_z: Yaw rate (rad/s)
        """
        topic = "/cmd_vel"
        await self._ensure_advertised(topic, "geometry_msgs/Twist")

        message = {
            "linear": {"x": linear_x, "y": linear_y, "z": linear_z},
            "angular": {"x": angular_x, "y": angular_y, "z": angular_z}
        }

        await self._client.publish(topic, message)

    # ===== Joint States =====

    async def publish_joint_states(
        self,
        joint_states: List[JointState]
    ) -> None:
        """
        Publish joint states for articulated robots (e.g., robot arms).

        Args:
            joint_states: List of joint states
        """
        topic = "/joint_states"
        await self._ensure_advertised(topic, "sensor_msgs/JointState")

        message = {
            "name": [js.name for js in joint_states],
            "position": [js.position for js in joint_states],
            "velocity": [js.velocity for js in joint_states],
            "effort": [js.effort for js in joint_states]
        }

        await self._client.publish(topic, message)

    # ===== Sensors =====

    async def publish_lidar(
        self,
        ranges: List[float],
        angle_min: float = 0.0,
        angle_max: float = 6.28,  # 2*pi
        angle_increment: float = 0.017  # ~1 degree
    ) -> None:
        """
        Publish LIDAR scan data.

        Args:
            ranges: Distance measurements (meters)
            angle_min: Start angle (radians)
            angle_max: End angle (radians)
            angle_increment: Angular distance between measurements (radians)
        """
        topic = "/scan"
        await self._ensure_advertised(topic, "sensor_msgs/LaserScan")

        message = {
            "ranges": ranges,
            "angle_min": angle_min,
            "angle_max": angle_max,
            "angle_increment": angle_increment
        }

        await self._client.publish(topic, message)

    async def publish_imu(
        self,
        imu_data: IMUData
    ) -> None:
        """
        Publish IMU sensor data.

        Args:
            imu_data: IMU measurements
        """
        topic = "/imu"
        await self._ensure_advertised(topic, "sensor_msgs/Imu")

        await self._client.publish(topic, imu_data.to_dict())

    async def publish_gps(
        self,
        latitude: float,
        longitude: float,
        altitude: float = 0.0
    ) -> None:
        """
        Publish GPS position.

        Args:
            latitude: Latitude (degrees)
            longitude: Longitude (degrees)
            altitude: Altitude (meters)
        """
        topic = "/gps"
        await self._ensure_advertised(topic, "sensor_msgs/NavSatFix")

        message = {
            "latitude": latitude,
            "longitude": longitude,
            "altitude": altitude
        }

        await self._client.publish(topic, message)

    # ===== Custom Topics =====

    async def publish_custom(
        self,
        topic: str,
        message: Dict[str, Any],
        message_type: str = "std_msgs/String"
    ) -> None:
        """
        Publish to a custom ROS topic.

        Args:
            topic: Custom topic name
            message: Message payload
            message_type: ROS message type
        """
        await self._ensure_advertised(topic, message_type)
        await self._client.publish(topic, message, message_type)

    async def subscribe(
        self,
        topic: str,
        callback,
        message_type: Optional[str] = None
    ) -> None:
        """
        Subscribe to a ROS topic.

        Args:
            topic: Topic name
            callback: Async callback function(topic, message)
            message_type: ROS message type
        """
        await self._client.subscribe(topic, callback, message_type)

    # ===== Context Manager =====

    async def __aenter__(self):
        """Context manager entry."""
        await self.connect()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        await self.disconnect()

    @property
    def is_connected(self) -> bool:
        """Check if robot is connected."""
        return self._client.is_connected
