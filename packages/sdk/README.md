# URFMP SDK

> **Monitor any robot in 7 lines of code** - The Stripe of Robotics

Transform your robot fleet into a connected, intelligent system with the Universal Robot Fleet Management Platform SDK. Get real-time monitoring, predictive maintenance, and fleet optimization for any robot vendor.

## 🚀 Quick Start - 7 Lines of Code

```javascript
const URFMP = require('@urfmp/sdk')

const urfmp = new URFMP({ apiKey: 'your-api-key' })
const { robot, monitor } = await urfmp.quickStart({
  name: 'Production Line Robot #1',
  vendor: 'universal_robots',
  model: 'UR10e',
  host: '192.168.1.100',
})
```

That's it! Your robot is now monitored with:

- ✅ Real-time status tracking
- ✅ Telemetry data collection
- ✅ Alert notifications
- ✅ Live dashboard access
- ✅ Predictive maintenance insights

## 🎯 Why URFMP?

**Before URFMP:**

```javascript
// Hundreds of lines of vendor-specific code
const urClient = new UniversalRobotsAPI(config)
const abcClient = new ABBClient(config)
const kukaClient = new KUKAInterface(config)

// Different APIs, different data formats
const urData = await urClient.getStatus()
const abbData = await abbClient.getRobotState()
const kukaData = await kukaClient.getCurrentStatus()

// Manual data normalization
const normalizedData = {
  position: urData.actual_TCP_pose || abbData.position || kukaData.tcp,
  // ... hundreds more lines
}

// Custom alerting logic
if (normalizedData.battery < 20) {
  sendAlert('Low battery')
}
// ... more custom code
```

**With URFMP:**

```javascript
// Works with any robot vendor
const urfmp = new URFMP({ apiKey: 'your-key' })
const { robot, monitor } = await urfmp.quickStart(robotConfig)
// Done! Everything else is automatic
```

## 📊 Features

### Real-time Monitoring

```javascript
// Get live status
const status = await monitor.getLatest()
console.log(status)
// { position: {x: 100, y: 200, z: 50}, status: 'running', battery: 85% }

// Stream telemetry
const stream = urfmp.createTelemetryStream(robot.id)
stream.addPosition(100, 200, 300)
stream.addTemperature(45.2)
stream.addJointAngles([0.1, 0.2, 0.3, 0.4, 0.5, 0.6])
```

### Smart Alerts

```javascript
// Built-in intelligent alerts
urfmp.on('robot:alert', (alert) => {
  if (alert.severity === 'critical') {
    sendSlackNotification(alert.message)
  }
})

// Custom alert rules
urfmp.addAlertRule({
  condition: (robot) => robot.temperature > 60,
  action: 'notify',
  message: 'Robot overheating detected',
})
```

### Fleet Management

```javascript
// Manage entire fleet
const fleet = await urfmp.getFleet()

// Get fleet overview
const overview = await urfmp.getFleetOverview()
console.log(`${overview.active}/${overview.total} robots active`)

// Batch operations
await urfmp.sendBatchCommand(
  fleet.map((r) => r.id),
  { type: 'PAUSE' }
)
```

### Predictive Maintenance

```javascript
// AI-powered maintenance predictions
urfmp.on('maintenance:prediction', (prediction) => {
  console.log(`${prediction.component} needs maintenance in ${prediction.days} days`)

  // Auto-schedule maintenance
  if (prediction.confidence > 0.8) {
    scheduleMaintenanceTask(prediction)
  }
})
```

## 🔧 Supported Robot Vendors

| Vendor           | Models                     | Status            |
| ---------------- | -------------------------- | ----------------- |
| Universal Robots | UR3, UR5, UR10, UR16, UR20 | ✅ Full Support   |
| ABB              | IRB Series, YuMi           | ✅ Full Support   |
| KUKA             | KR Series, LBR iiwa        | ✅ Full Support   |
| FANUC            | M-Series, LR Mate          | 🚧 Coming Soon    |
| Yaskawa          | Motoman Series             | 🚧 Coming Soon    |
| Doosan           | M-Series, H-Series         | 🚧 Coming Soon    |
| Custom/Other     | Any robot with API         | ✅ Custom Adapter |

## 🏗️ Installation

```bash
npm install @urfmp/sdk
# or
yarn add @urfmp/sdk
```

## 🔑 Authentication

Get your API key from [URFMP Dashboard](https://app.urfmp.com/api-keys):

```javascript
const urfmp = new URFMP({
  apiKey: process.env.URFMP_API_KEY,
  baseUrl: 'https://api.urfmp.com', // optional
})
```

## 📖 Advanced Usage

### Custom Robot Adapter

```javascript
// For custom robots or unsupported vendors
const customRobot = await urfmp.createRobot({
  name: 'Custom Robot',
  vendor: 'custom',
  model: 'MyBot v1.0',
  adapter: {
    host: '192.168.1.100',
    protocol: 'http',
    endpoints: {
      status: '/api/status',
      telemetry: '/api/data',
      command: '/api/command',
    },
  },
})
```

### Integration with Existing Systems

```javascript
// Connect to your existing robot control system
const urfmp = new URFMP({ apiKey: 'your-key' })

// Mirror data to URFMP
yourRobotSystem.on('telemetry', async (data) => {
  await urfmp.sendTelemetry(robotId, {
    position: data.position,
    velocity: data.velocity,
    timestamp: new Date(),
  })
})

// Forward URFMP commands to your system
urfmp.on('robot:command', (command) => {
  yourRobotSystem.sendCommand(command.robotId, command.payload)
})
```

### React Integration

```javascript
import { URFMP } from '@urfmp/sdk'
import { useEffect, useState } from 'react'

function RobotDashboard() {
  const [robots, setRobots] = useState([])
  const urfmp = new URFMP({ apiKey: process.env.REACT_APP_URFMP_KEY })

  useEffect(() => {
    urfmp.getRobots().then(setRobots)

    urfmp.on('robot:status', (update) => {
      setRobots((prev) =>
        prev.map((robot) =>
          robot.id === update.robotId ? { ...robot, status: update.status } : robot
        )
      )
    })
  }, [])

  return (
    <div>
      {robots.map((robot) => (
        <RobotCard key={robot.id} robot={robot} />
      ))}
    </div>
  )
}
```

## 🎛️ Configuration Options

```javascript
const urfmp = new URFMP({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.urfmp.com', // API endpoint
  websocketUrl: 'wss://api.urfmp.com', // WebSocket endpoint
  timeout: 10000, // Request timeout (ms)
  retries: 3, // Retry attempts
  debug: true, // Enable debug logging
})
```

## 📊 Dashboard & Analytics

Every robot automatically gets:

- **Real-time Dashboard**: `https://app.urfmp.com/robots/{robotId}`
- **Performance Analytics**: Utilization, cycle times, error rates
- **Predictive Insights**: Maintenance forecasts, optimization suggestions
- **Alert Management**: Smart notifications and escalation rules
- **Fleet Overview**: Multi-robot coordination and planning

## 🔐 Security & Compliance

- **SOC 2 Type II** certified
- **End-to-end encryption** for all robot data
- **Zero-trust architecture** with API key scoping
- **GDPR compliant** data handling
- **99.9% uptime SLA** with global redundancy

## 🚀 Performance

- **Sub-200ms** API response times (p95)
- **10,000+ robots** per organization
- **Real-time streaming** with WebSocket connections
- **Global edge network** for low-latency access
- **Auto-scaling** infrastructure

## 💬 Support

- 📚 [Full Documentation](https://docs.urfmp.com)
- 💬 [Discord Community](https://discord.gg/urfmp)
- 🎫 [Support Portal](https://support.urfmp.com)
- 📧 Email: support@urfmp.com

## 🏢 Enterprise Features

- **Multi-tenant** architecture with data isolation
- **SSO integration** (SAML, OIDC)
- **Custom SLAs** and dedicated support
- **On-premises deployment** options
- **White-label** solutions available

---

**URFMP - Building the operating system for the $124 billion robotics industry**

[Get Started](https://urfmp.com/signup) | [View Demo](https://demo.urfmp.com) | [Enterprise](https://urfmp.com/enterprise)
