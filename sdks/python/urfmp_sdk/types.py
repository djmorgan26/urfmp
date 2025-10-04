"""Type definitions for URFMP SDK"""

from typing import Dict, List, Optional, Union, Any
from dataclasses import dataclass
from enum import Enum


class CommandType(Enum):
    """Robot command types"""
    MOVE = "move"
    ROTATE = "rotate"
    JOINT_CONTROL = "joint_control"
    GRIPPER = "gripper"
    CUSTOM = "custom"


@dataclass
class RobotPosition:
    """3D position coordinates"""
    x: float
    y: float
    z: float

    def to_dict(self) -> Dict[str, float]:
        return {"x": self.x, "y": self.y, "z": self.z}


@dataclass
class RobotOrientation:
    """Quaternion orientation"""
    x: float
    y: float
    z: float
    w: float

    def to_dict(self) -> Dict[str, float]:
        return {"x": self.x, "y": self.y, "z": self.z, "w": self.w}


@dataclass
class Twist:
    """Velocity command (linear and angular)"""
    linear: RobotPosition
    angular: RobotPosition

    def to_dict(self) -> Dict[str, Any]:
        return {
            "linear": self.linear.to_dict(),
            "angular": self.angular.to_dict()
        }


@dataclass
class JointState:
    """Robot joint state"""
    name: str
    position: float
    velocity: float = 0.0
    effort: float = 0.0

    def to_dict(self) -> Dict[str, Union[str, float]]:
        return {
            "name": self.name,
            "position": self.position,
            "velocity": self.velocity,
            "effort": self.effort
        }


@dataclass
class LidarScan:
    """LIDAR scan data"""
    ranges: List[float]
    angle_min: float
    angle_max: float
    angle_increment: float
    range_min: float = 0.0
    range_max: float = 10.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "ranges": self.ranges,
            "angle_min": self.angle_min,
            "angle_max": self.angle_max,
            "angle_increment": self.angle_increment,
            "range_min": self.range_min,
            "range_max": self.range_max
        }


@dataclass
class IMUData:
    """IMU sensor data"""
    orientation: RobotOrientation
    angular_velocity: RobotPosition
    linear_acceleration: RobotPosition

    def to_dict(self) -> Dict[str, Any]:
        return {
            "orientation": self.orientation.to_dict(),
            "angular_velocity": self.angular_velocity.to_dict(),
            "linear_acceleration": self.linear_acceleration.to_dict()
        }


@dataclass
class GPSPosition:
    """GPS coordinates"""
    latitude: float
    longitude: float
    altitude: float

    def to_dict(self) -> Dict[str, float]:
        return {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "altitude": self.altitude
        }


@dataclass
class TelemetryData:
    """Complete robot telemetry data"""
    robot_id: str
    position: Optional[RobotPosition] = None
    orientation: Optional[RobotOrientation] = None
    velocity: Optional[Twist] = None
    joint_states: Optional[List[JointState]] = None
    lidar: Optional[LidarScan] = None
    imu: Optional[IMUData] = None
    gps: Optional[GPSPosition] = None
    custom_data: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        data = {"robot_id": self.robot_id}

        if self.position:
            data["position"] = self.position.to_dict()
        if self.orientation:
            data["orientation"] = self.orientation.to_dict()
        if self.velocity:
            data["velocity"] = self.velocity.to_dict()
        if self.joint_states:
            data["joint_states"] = [js.to_dict() for js in self.joint_states]
        if self.lidar:
            data["lidar"] = self.lidar.to_dict()
        if self.imu:
            data["imu"] = self.imu.to_dict()
        if self.gps:
            data["gps"] = self.gps.to_dict()
        if self.custom_data:
            data["custom_data"] = self.custom_data

        return data


@dataclass
class ROSMessage:
    """ROSBridge message format"""
    op: str
    topic: Optional[str] = None
    type: Optional[str] = None
    msg: Optional[Dict[str, Any]] = None
    service: Optional[str] = None
    args: Optional[Dict[str, Any]] = None
    id: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        data = {"op": self.op}

        if self.topic:
            data["topic"] = self.topic
        if self.type:
            data["type"] = self.type
        if self.msg is not None:
            data["msg"] = self.msg
        if self.service:
            data["service"] = self.service
        if self.args is not None:
            data["args"] = self.args
        if self.id:
            data["id"] = self.id

        return data
