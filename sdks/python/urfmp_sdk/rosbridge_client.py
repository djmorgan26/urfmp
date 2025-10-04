"""ROSBridge WebSocket client for URFMP"""

import asyncio
import json
import logging
from typing import Optional, Callable, Dict, Any
import websockets
from websockets.client import WebSocketClientProtocol

from .types import ROSMessage

logger = logging.getLogger(__name__)


class ROSBridgeClient:
    """
    WebSocket client for ROSBridge protocol.

    Handles connection to URFMP ROSBridge server and provides
    methods for publishing/subscribing to ROS topics.
    """

    def __init__(
        self,
        url: str = "ws://localhost:3000/rosbridge",
        robot_id: str = "robot-1",
        auto_reconnect: bool = True
    ):
        """
        Initialize ROSBridge client.

        Args:
            url: WebSocket URL of ROSBridge server
            robot_id: Unique identifier for this robot
            auto_reconnect: Automatically reconnect on connection loss
        """
        self.url = url
        self.robot_id = robot_id
        self.auto_reconnect = auto_reconnect

        self._ws: Optional[WebSocketClientProtocol] = None
        self._connected = False
        self._running = False
        self._message_id = 0
        self._subscribers: Dict[str, Callable] = {}
        self._loop: Optional[asyncio.AbstractEventLoop] = None

    async def connect(self) -> None:
        """
        Connect to ROSBridge server.

        Raises:
            ConnectionError: If connection fails
        """
        try:
            self._ws = await websockets.connect(self.url)
            self._connected = True
            self._running = True

            logger.info(f"Connected to ROSBridge server: {self.url}")

            # Start message listener
            asyncio.create_task(self._listen())

        except Exception as e:
            logger.error(f"Failed to connect to ROSBridge: {e}")
            raise ConnectionError(f"Could not connect to {self.url}: {e}")

    async def disconnect(self) -> None:
        """Disconnect from ROSBridge server."""
        self._running = False
        self._connected = False

        if self._ws:
            await self._ws.close()
            self._ws = None

        logger.info("Disconnected from ROSBridge server")

    async def _listen(self) -> None:
        """Listen for incoming messages from ROSBridge."""
        if not self._ws:
            return

        try:
            async for message in self._ws:
                try:
                    data = json.loads(message)
                    await self._handle_message(data)
                except json.JSONDecodeError:
                    logger.warning(f"Failed to parse message: {message}")
                except Exception as e:
                    logger.error(f"Error handling message: {e}")

        except websockets.exceptions.ConnectionClosed:
            logger.warning("Connection closed")
            self._connected = False

            if self.auto_reconnect and self._running:
                logger.info("Attempting to reconnect...")
                await asyncio.sleep(5)
                await self.connect()

    async def _handle_message(self, data: Dict[str, Any]) -> None:
        """Handle incoming ROSBridge message."""
        op = data.get("op")
        topic = data.get("topic")

        if op == "publish" and topic in self._subscribers:
            # Call subscriber callback
            callback = self._subscribers[topic]
            msg = data.get("msg", {})
            await callback(topic, msg)

        elif op == "service_response":
            logger.debug(f"Service response: {data}")

        else:
            logger.debug(f"Unhandled message: {op}")

    async def advertise(self, topic: str, message_type: str) -> None:
        """
        Advertise a topic for publishing.

        Args:
            topic: ROS topic name
            message_type: ROS message type (e.g., 'geometry_msgs/Twist')
        """
        if not self._connected or not self._ws:
            raise ConnectionError("Not connected to ROSBridge")

        message = ROSMessage(
            op="advertise",
            topic=topic,
            type=message_type
        )

        await self._ws.send(json.dumps(message.to_dict()))
        logger.debug(f"Advertised topic: {topic}")

    async def publish(
        self,
        topic: str,
        message: Dict[str, Any],
        message_type: Optional[str] = None
    ) -> None:
        """
        Publish a message to a ROS topic.

        Args:
            topic: ROS topic name
            message: Message payload
            message_type: ROS message type (optional if already advertised)
        """
        if not self._connected or not self._ws:
            raise ConnectionError("Not connected to ROSBridge")

        ros_msg = ROSMessage(
            op="publish",
            topic=topic,
            msg=message
        )

        if message_type:
            ros_msg.type = message_type

        await self._ws.send(json.dumps(ros_msg.to_dict()))
        logger.debug(f"Published to {topic}: {message}")

    async def subscribe(
        self,
        topic: str,
        callback: Callable,
        message_type: Optional[str] = None
    ) -> None:
        """
        Subscribe to a ROS topic.

        Args:
            topic: ROS topic name
            callback: Async function to call when message received
            message_type: ROS message type
        """
        if not self._connected or not self._ws:
            raise ConnectionError("Not connected to ROSBridge")

        self._subscribers[topic] = callback

        message = ROSMessage(
            op="subscribe",
            topic=topic,
            type=message_type,
            id=self._generate_id()
        )

        await self._ws.send(json.dumps(message.to_dict()))
        logger.debug(f"Subscribed to topic: {topic}")

    async def unsubscribe(self, topic: str) -> None:
        """
        Unsubscribe from a ROS topic.

        Args:
            topic: ROS topic name
        """
        if not self._connected or not self._ws:
            return

        if topic in self._subscribers:
            del self._subscribers[topic]

        message = ROSMessage(
            op="unsubscribe",
            topic=topic
        )

        await self._ws.send(json.dumps(message.to_dict()))
        logger.debug(f"Unsubscribed from topic: {topic}")

    async def call_service(
        self,
        service: str,
        args: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Call a ROS service.

        Args:
            service: ROS service name
            args: Service arguments
        """
        if not self._connected or not self._ws:
            raise ConnectionError("Not connected to ROSBridge")

        message = ROSMessage(
            op="call_service",
            service=service,
            args=args or {},
            id=self._generate_id()
        )

        await self._ws.send(json.dumps(message.to_dict()))
        logger.debug(f"Called service: {service}")

    def _generate_id(self) -> str:
        """Generate unique message ID."""
        self._message_id += 1
        return f"{self.robot_id}-{self._message_id}"

    @property
    def is_connected(self) -> bool:
        """Check if client is connected."""
        return self._connected

    async def __aenter__(self):
        """Context manager entry."""
        await self.connect()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        await self.disconnect()
