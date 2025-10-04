"""
URFMP SDK - The Stripe of Robotics
Connect any robot in 7 lines of code.
"""

from .virtual_robot import VirtualRobot
from .rosbridge_client import ROSBridgeClient
from .types import (
    RobotPosition,
    RobotOrientation,
    TelemetryData,
    CommandType,
)

__version__ = "0.1.0"
__all__ = [
    "VirtualRobot",
    "ROSBridgeClient",
    "RobotPosition",
    "RobotOrientation",
    "TelemetryData",
    "CommandType",
]
