# URFMP Python SDK

**Connect any robot in 7 lines of code.**

The official Python SDK for URFMP (Universal Robot Fleet Management Platform) - The Stripe of Robotics.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)

## 🚀 Quick Start

```python
import asyncio
from urfmp_sdk import VirtualRobot

async def main():
    robot = VirtualRobot(robot_id="my-robot-1")
    await robot.connect()
    await robot.publish_position(x=1.0, y=2.0, z=0.0)
    await robot.publish_velocity(linear_x=0.5, angular_z=0.3)
    await robot.disconnect()

asyncio.run(main())
```

That's it! Your robot is now streaming telemetry to URFMP cloud.

## 📦 Installation

```bash
pip install urfmp-sdk
```

### Optional Dependencies

```bash
# For ROS integration
pip install urfmp-sdk[ros]

# For development
pip install urfmp-sdk[dev]
```

## ✨ Features

- **Universal Robot Support** - Works with any robot: mobile robots, arms, drones, AMRs
- **ROS1/ROS2 Compatible** - Seamless integration with ROS ecosystems
- **Simulator Integration** - Connect Gazebo, Webots, Isaac Sim, and more
- **Real-time Streaming** - Low-latency telemetry via WebSocket
- **Type-Safe** - Full type hints and dataclass support
- **Async/Await** - Modern Python async programming
- **Cloud-Ready** - Built for cloud-native robotics

## 🎯 Supported Robots

| Robot Type    | Status | Example            |
| ------------- | ------ | ------------------ |
| Mobile Robots | ✅     | TurtleBot, Pioneer |
| Robot Arms    | ✅     | UR5, Franka, ABB   |
| Drones/UAVs   | ✅     | PX4, ArduPilot     |
| AMRs          | ✅     | MiR, Locus         |
| Custom        | ✅     | Any robot with ROS |

## 📚 Documentation

### Basic Usage

#### Connect to URFMP

```python
from urfmp_sdk import VirtualRobot

robot = VirtualRobot(
    robot_id="my-robot-1",
    urfmp_url="ws://localhost:3000/rosbridge",  # URFMP server
    auto_advertise=True  # Automatically advertise topics
)

await robot.connect()
```

#### Publish Position (Odometry)

```python
await robot.publish_position(x=1.0, y=2.0, z=0.0)
```

#### Publish Velocity Commands

```python
await robot.publish_velocity(
    linear_x=0.5,    # Forward velocity (m/s)
    angular_z=0.3    # Rotation velocity (rad/s)
)
```

#### Publish Full Pose (Position + Orientation)

```python
from urfmp_sdk import RobotPosition, RobotOrientation

position = RobotPosition(x=1.0, y=2.0, z=0.0)
orientation = RobotOrientation(x=0.0, y=0.0, z=0.0, w=1.0)  # Quaternion

await robot.publish_pose(position, orientation)
```

### Sensor Data

#### LIDAR

```python
ranges = [3.5] * 360  # 360-degree scan
await robot.publish_lidar(
    ranges=ranges,
    angle_min=0.0,
    angle_max=6.28,        # 2*pi radians
    angle_increment=0.017  # ~1 degree
)
```

#### IMU (Inertial Measurement Unit)

```python
from urfmp_sdk import IMUData, RobotPosition, RobotOrientation

imu_data = IMUData(
    orientation=RobotOrientation(x=0.0, y=0.0, z=0.0, w=1.0),
    angular_velocity=RobotPosition(x=0.1, y=0.05, z=0.02),
    linear_acceleration=RobotPosition(x=0.0, y=0.0, z=9.81)
)

await robot.publish_imu(imu_data)
```

#### GPS

```python
await robot.publish_gps(
    latitude=37.7749,
    longitude=-122.4194,
    altitude=10.0
)
```

### Robot Arms

#### Joint States

```python
from urfmp_sdk import JointState

joint_states = [
    JointState(name="shoulder_pan_joint", position=1.57, velocity=0.1, effort=10.0),
    JointState(name="shoulder_lift_joint", position=-1.57, velocity=0.0, effort=15.0),
    JointState(name="elbow_joint", position=0.785, velocity=0.05, effort=8.0),
]

await robot.publish_joint_states(joint_states)
```

### Custom Topics

```python
custom_data = {
    "battery_voltage": 12.6,
    "temperature": 45.3,
    "custom_metric": 123
}

await robot.publish_custom(
    topic="/custom_topic",
    message=custom_data,
    message_type="std_msgs/String"
)
```

### Subscribe to Commands

```python
async def command_handler(topic: str, message: dict):
    print(f"Received command on {topic}: {message}")
    # Handle command (e.g., move robot)

await robot.subscribe("/cmd_vel", command_handler)
```

### Context Manager

```python
async with VirtualRobot(robot_id="my-robot") as robot:
    await robot.publish_position(x=1.0, y=2.0, z=0.0)
    # Automatically disconnects on exit
```

## 🔌 Integration Examples

### Gazebo Simulation

```python
from urfmp_sdk import VirtualRobot

robot = VirtualRobot(
    robot_id="gazebo-turtlebot",
    urfmp_url="ws://localhost:9090"  # Gazebo rosbridge
)

await robot.connect()

# Stream Gazebo telemetry to URFMP
while True:
    await robot.publish_position(x=1.0, y=2.0, z=0.0)
    await asyncio.sleep(0.1)  # 10 Hz
```

See [examples/gazebo_integration.py](examples/gazebo_integration.py) for full example.

### ROS1/ROS2 Integration

Bridge existing ROS topics to URFMP:

```python
import rospy  # or rclpy for ROS2
from nav_msgs.msg import Odometry
from urfmp_sdk import VirtualRobot

robot = VirtualRobot(robot_id="ros-robot-1")
await robot.connect()

def odom_callback(msg):
    asyncio.run(robot.publish_position(
        x=msg.pose.pose.position.x,
        y=msg.pose.pose.position.y,
        z=msg.pose.pose.position.z
    ))

rospy.Subscriber('/odom', Odometry, odom_callback)
rospy.spin()
```

See [examples/ros_node_integration.py](examples/ros_node_integration.py) for full ROS1/ROS2 example.

### Webots Controller

```python
from controller import Robot as WebotsRobot
from urfmp_sdk import VirtualRobot

webots_robot = WebotsRobot()
urfmp_robot = VirtualRobot(robot_id="webots-pioneer")

await urfmp_robot.connect()

while webots_robot.step(timestep) != -1:
    # Get Webots sensor data
    gps_values = webots_robot.getDevice('gps').getValues()

    # Stream to URFMP
    await urfmp_robot.publish_position(
        x=gps_values[0],
        y=gps_values[1],
        z=gps_values[2]
    )
```

See [examples/webots_controller.py](examples/webots_controller.py) for full example.

## 🤖 Example Scripts

The SDK includes comprehensive examples:

- **[basic_robot.py](examples/basic_robot.py)** - Simple robot telemetry streaming
- **[gazebo_integration.py](examples/gazebo_integration.py)** - Gazebo simulator integration
- **[robot_arm.py](examples/robot_arm.py)** - Robot arm joint state publishing
- **[drone_simulation.py](examples/drone_simulation.py)** - UAV/drone with full sensor suite
- **[webots_controller.py](examples/webots_controller.py)** - Webots robot controller
- **[multi_robot_fleet.py](examples/multi_robot_fleet.py)** - Multi-robot fleet management
- **[ros_node_integration.py](examples/ros_node_integration.py)** - ROS1/ROS2 node bridge

Run any example:

```bash
python examples/basic_robot.py
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│           Your Robot Application             │
│  (Gazebo/Webots/ROS/Physical Robot)         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│            URFMP Python SDK                  │
│  ┌─────────────┐      ┌──────────────┐     │
│  │VirtualRobot │ ←──→ │ROSBridgeClient│     │
│  └─────────────┘      └──────────────┘     │
└─────────────────────────────────────────────┘
                    ↓ WebSocket
┌─────────────────────────────────────────────┐
│         URFMP Cloud Platform                 │
│  (Monitoring, Analytics, Fleet Management)   │
└─────────────────────────────────────────────┘
```

## 🔐 Authentication

### API Key (Recommended)

```python
robot = VirtualRobot(
    robot_id="my-robot",
    urfmp_url="wss://api.urfmp.com/rosbridge",
    api_key="urfmp_live_abc123..."  # Your API key
)
```

### Environment Variable

```bash
export URFMP_API_KEY="urfmp_live_abc123..."
```

```python
import os

robot = VirtualRobot(
    robot_id="my-robot",
    urfmp_url="wss://api.urfmp.com/rosbridge",
    api_key=os.getenv("URFMP_API_KEY")
)
```

## 📊 ROS Message Types

The SDK supports standard ROS message types:

| ROS Type                 | SDK Method                             | Description                  |
| ------------------------ | -------------------------------------- | ---------------------------- |
| `nav_msgs/Odometry`      | `publish_position()`, `publish_pose()` | Robot position & orientation |
| `geometry_msgs/Twist`    | `publish_velocity()`                   | Velocity commands            |
| `sensor_msgs/JointState` | `publish_joint_states()`               | Robot arm joints             |
| `sensor_msgs/LaserScan`  | `publish_lidar()`                      | LIDAR data                   |
| `sensor_msgs/Imu`        | `publish_imu()`                        | IMU sensor                   |
| `sensor_msgs/NavSatFix`  | `publish_gps()`                        | GPS position                 |
| Custom                   | `publish_custom()`                     | Any ROS message              |

## 🛠️ Development

### Setup Development Environment

```bash
git clone https://github.com/urfmp/urfmp.git
cd urfmp/sdks/python

# Install in editable mode with dev dependencies
pip install -e ".[dev]"
```

### Run Tests

```bash
pytest tests/
```

### Code Formatting

```bash
black urfmp_sdk/
flake8 urfmp_sdk/
```

## 🐛 Troubleshooting

### Connection Issues

**Problem:** `ConnectionError: Could not connect to ws://localhost:3000/rosbridge`

**Solution:**

1. Make sure URFMP server is running
2. Check firewall settings
3. Verify WebSocket URL is correct

### Import Errors

**Problem:** `ModuleNotFoundError: No module named 'urfmp_sdk'`

**Solution:**

```bash
pip install urfmp-sdk
```

### Async Issues

**Problem:** `RuntimeError: no running event loop`

**Solution:** Use `asyncio.run()`:

```python
import asyncio

async def main():
    # Your async code
    pass

asyncio.run(main())
```

## 📝 API Reference

### `VirtualRobot`

```python
class VirtualRobot:
    def __init__(
        self,
        robot_id: str,
        urfmp_url: str = "ws://localhost:3000/rosbridge",
        auto_advertise: bool = True
    )

    async def connect() -> None
    async def disconnect() -> None

    async def publish_position(x: float, y: float, z: float) -> None
    async def publish_pose(position: RobotPosition, orientation: RobotOrientation) -> None
    async def publish_velocity(linear_x: float, ..., angular_z: float) -> None
    async def publish_joint_states(joint_states: List[JointState]) -> None
    async def publish_lidar(ranges: List[float], ...) -> None
    async def publish_imu(imu_data: IMUData) -> None
    async def publish_gps(latitude: float, longitude: float, altitude: float) -> None
    async def publish_custom(topic: str, message: Dict, message_type: str) -> None
    async def subscribe(topic: str, callback: Callable, message_type: str = None) -> None

    @property
    def is_connected() -> bool
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.

## 🔗 Links

- **Documentation**: https://docs.urfmp.com
- **Dashboard**: https://app.urfmp.com
- **GitHub**: https://github.com/urfmp/urfmp
- **Discord**: https://discord.gg/urfmp

## 💬 Support

- **Email**: support@urfmp.com
- **Discord**: https://discord.gg/urfmp
- **GitHub Issues**: https://github.com/urfmp/urfmp/issues

---

**Built with ❤️ by the URFMP Team**

_The Stripe of Robotics - Connect any robot in 7 lines of code._
