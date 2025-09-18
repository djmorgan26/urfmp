# URFMP - Universal Robot Fleet Management Platform

> The Stripe of Robotics - Developer-first platform for managing robot fleets across any vendor, any industry.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development environment
npm run docker:up   # Start PostgreSQL, Redis, RabbitMQ
npm run db:migrate  # Setup database
npm run dev         # Start API and web dashboard
```

Your platform is now running:
- 🌐 Dashboard: http://localhost:3000
- 🔌 API: http://localhost:3001
- 📚 API Docs: http://localhost:3001/docs
- 🔴 WebSocket: ws://localhost:3001

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Web Dashboard                      │
│                 (React + WebSocket)                  │
└────────────────────────┬─────────────────────────────┘
                         │
┌────────────────────────┴─────────────────────────────┐
│                   API Gateway                        │
│                (Express + Auth)                      │
└────────────────────────┬─────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐ ┌───────▼──────┐ ┌──────▼───────┐
│ Core Service │ │  ML Service   │ │Alert Service │
│  (Node.js)   │ │   (Python)    │ │  (Node.js)   │
└───────┬──────┘ └───────┬──────┘ └──────┬───────┘
        │                │                │
┌───────▼────────────────▼────────────────▼───────┐
│         PostgreSQL + TimescaleDB                 │
└───────────────────────────────────────────────────┘
```

## 📦 Project Structure

```
urfmp/
├── packages/           # Shared packages
│   ├── sdk/           # TypeScript SDK
│   └── types/         # Shared types
├── services/          # Microservices
│   ├── api/          # Core API (Node.js)
│   ├── core/         # Core business logic
│   ├── alerts/       # Alert processing
│   └── ml/           # ML service (Python)
├── web/              # React dashboard
├── adapters/         # Vendor adapters
│   ├── universal-robots/
│   ├── abb/
│   └── fanuc/
├── infrastructure/   # Terraform/IaC
└── docs/            # Documentation
```

## 🔌 SDK Usage - 7 Lines to Production

```javascript
const URFMP = require('@urfmp/sdk');
const fleet = new URFMP.Fleet('YOUR_API_KEY');

// Connect and monitor a robot in 7 lines
fleet.on('robot.error', (robot) => {
  console.log(`Robot ${robot.id} needs attention`);
});

await fleet.monitor({
  vendor: 'universal-robots',
  ip: '192.168.1.100'
});
```

## 🚦 Development Workflow

### Adding a New Vendor Adapter

```bash
npm run create:adapter -- --vendor=kuka
# Implements IRobotVendorAdapter interface automatically
```

### Running Tests

```bash
npm test              # Run all tests
npm run test:unit     # Unit tests only
npm run test:e2e      # E2E tests
npm run test:adapters # Adapter integration tests
```

### Database Migrations

```bash
npm run db:migrate:create -- add_telemetry_table
npm run db:migrate       # Run migrations
npm run db:rollback      # Rollback last migration
```

## 📊 Key Metrics

- ⏱️ **Time to First Value**: < 5 minutes
- 🎯 **API Response Time**: < 200ms (p95)
- 📈 **Telemetry Ingestion**: 10K+ events/sec
- 🔒 **Uptime SLA**: 99.99%
- 🚀 **Deploy Frequency**: Daily

## 🔒 Security

- JWT-based authentication with scopes
- Zero-trust architecture
- End-to-end telemetry encryption (optional)
- SOC 2 Type II compliance ready
- Rate limiting per org/tier

## 🧪 Testing

```bash
# Run adapter tests against mock fixtures
npm run test:adapters

# Run chaos engineering tests
npm run test:chaos

# Performance benchmarks
npm run benchmark
```

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [SDK Reference](./packages/sdk/README.md)
- [Adapter Development](./docs/adapter-guide.md)
- [Security & Compliance](./docs/security.md)
- [Deployment Guide](./docs/deployment.md)

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## 📄 License

Proprietary - See [LICENSE](./LICENSE)

---

**Remember**: We're not building a monitoring tool. We're building the operating system for all deployed robots.
