"""
Robot Arm Example - URFMP SDK

Demonstrates controlling and monitoring a robotic arm (e.g., Universal Robots UR5).
Shows joint state publishing and manipulator-specific telemetry.
"""

import asyncio
import math
from urfmp_sdk import VirtualRobot, JointState, RobotPosition


async def main():
    """Robot arm telemetry and control example."""

    robot = VirtualRobot(
        robot_id="ur5-arm-1",
        urfmp_url="ws://localhost:3000/rosbridge"
    )

    await robot.connect()
    print("🦾 Robot arm connected to URFMP")

    # Define UR5 joint names
    joint_names = [
        "shoulder_pan_joint",
        "shoulder_lift_joint",
        "elbow_joint",
        "wrist_1_joint",
        "wrist_2_joint",
        "wrist_3_joint"
    ]

    try:
        # Simulate robot arm movement
        for i in range(100):
            # Calculate joint positions (sinusoidal motion)
            t = i * 0.1
            joint_states = [
                JointState(
                    name=joint_names[0],
                    position=math.sin(t) * 0.5,
                    velocity=math.cos(t) * 0.5,
                    effort=10.0
                ),
                JointState(
                    name=joint_names[1],
                    position=math.cos(t) * 0.3 - 1.57,
                    velocity=-math.sin(t) * 0.3,
                    effort=15.0
                ),
                JointState(
                    name=joint_names[2],
                    position=math.sin(t * 0.5) * 0.8,
                    velocity=math.cos(t * 0.5) * 0.4,
                    effort=8.0
                ),
                JointState(
                    name=joint_names[3],
                    position=0.0,
                    velocity=0.0,
                    effort=2.0
                ),
                JointState(
                    name=joint_names[4],
                    position=-1.57,
                    velocity=0.0,
                    effort=1.0
                ),
                JointState(
                    name=joint_names[5],
                    position=math.sin(t * 2) * 0.2,
                    velocity=math.cos(t * 2) * 0.4,
                    effort=1.0
                )
            ]

            # Publish joint states
            await robot.publish_joint_states(joint_states)

            # Publish end-effector position (forward kinematics would calculate this)
            ee_x = 0.5 + math.sin(t) * 0.3
            ee_y = 0.2 + math.cos(t) * 0.3
            ee_z = 0.4 + math.sin(t * 0.5) * 0.2

            await robot.publish_position(x=ee_x, y=ee_y, z=ee_z)

            # Publish custom gripper state
            gripper_data = {
                "position": abs(math.sin(t)) * 0.08,  # 0-80mm opening
                "force": 50.0,
                "is_gripping": abs(math.sin(t)) < 0.1
            }

            await robot.publish_custom(
                topic="/gripper_state",
                message=gripper_data,
                message_type="std_msgs/String"
            )

            print(f"🦾 Joint[0]: {joint_states[0].position:.3f} rad | "
                  f"EE: ({ee_x:.3f}, {ee_y:.3f}, {ee_z:.3f})")

            await asyncio.sleep(0.1)  # 10 Hz

    except KeyboardInterrupt:
        print("\n⏹️  Stopping robot arm...")

    finally:
        await robot.disconnect()
        print("👋 Robot arm disconnected")


if __name__ == "__main__":
    asyncio.run(main())
