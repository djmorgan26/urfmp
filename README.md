# URFMP — Universal Robot Fleet Management Platform

> The Stripe of Robotics — a developer-first platform for monitoring and managing robot fleets across any vendor, any industry.

URFMP is a TypeScript monorepo: a real-time React dashboard, an Express API gateway with JWT auth, PostgreSQL + TimescaleDB telemetry storage, Redis and RabbitMQ for caching and messaging, a Python ML service for predictive maintenance, vendor adapters (Universal Robots, ABB, FANUC), and first-class TypeScript and Python SDKs.

## Quick start

### Option A — full stack with Docker (recommended)

Brings up the database, message broker, API, and dashboard together.

```bash
npm install
npm run docker:up      # Start Postgres + TimescaleDB, Redis, RabbitMQ, API, web
npm run migrate        # Create the schema and load the seed fleet + admin user
```

> The migrations include a seed dataset (admin user and a sample fleet), so a
> fresh `npm run migrate` leaves you with data to explore right away.

Once it's up:

- Dashboard: http://localhost:3001
- API: http://localhost:3000
- API health check: http://localhost:3000/health
- Database admin (Adminer): http://localhost:8080

Stop everything with `npm run docker:down`.

### Option B — dashboard only, no backend (demo mode)

The dashboard can run standalone against an in-memory simulated fleet — no
database, no API, no login, no environment variables. This is what the hosted
demo uses.

```bash
npm install
npm run dev --workspace=@urfmp/web   # http://localhost:3001
```

Then open the dashboard and click **View live demo**, or append `?demo` to the
URL. To make demo mode the default for a build, set `VITE_DEMO_MODE=true`.

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for hosting the static demo on
Vercel and for full-stack production deployment.

## Architecture

```
┌───────────────────────────────────────────────────────┐
│                    Web Dashboard                       │
│                 (React + Vite + WebSocket)             │
└────────────────────────┬──────────────────────────────┘
                         │
┌────────────────────────┴──────────────────────────────┐
│                    API Gateway                         │
│                 (Express + JWT auth)                   │
└────────────────────────┬──────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐ ┌───────▼──────┐ ┌────────▼──────┐
│  API / Core  │ │  ML Service  │ │   Adapters    │
│  (Node.js)   │ │   (Python)   │ │ (UR/ABB/FANUC)│
└───────┬──────┘ └───────┬──────┘ └───────────────┘
        │                │
┌───────▼────────────────▼──────────────────────────────┐
│  PostgreSQL + TimescaleDB  ·  Redis  ·  RabbitMQ       │
└────────────────────────────────────────────────────────┘
```

## Project structure

```
urfmp/
├── packages/
│   ├── sdk/            # TypeScript SDK
│   └── types/          # Shared TypeScript types
├── services/
│   └── api/            # Express API gateway (JWT, WebSocket)
├── web/                # React + Vite dashboard
├── adapters/           # Vendor adapters (Universal Robots, ABB, FANUC)
├── sdks/
│   └── python/         # Python SDK
├── scripts/            # Build, CI, and deploy helper scripts
└── docs/               # Documentation
```

## SDK usage

```ts
import { URFMP } from '@urfmp/sdk'

const urfmp = new URFMP({ apiKey: 'YOUR_API_KEY' })

// Monitor a robot and react to telemetry in real time
urfmp.on('robot:alert', (alert) => {
  console.log(`Robot ${alert.robotId} needs attention: ${alert.message}`)
})

await urfmp.connectWebSocket()
const robots = await urfmp.getRobots()
```

See the [SDK reference](./packages/sdk/README.md) for the full API.

## Development

```bash
npm run dev:web        # Dashboard only (Vite, port 3001)
npm run dev:api        # API only (requires the Docker services running)
npm test               # Run workspace tests
npm run lint           # Lint
npm run typecheck      # Type-check all workspaces
```

Database migrations:

```bash
npm run migrate        # Apply migrations (includes the seed dataset)
```

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [API reference](./docs/API_REFERENCE.md)
- [Database schema](./docs/DATABASE_SCHEMA.md)
- [Components](./docs/COMPONENTS.md)
- [Development workflow](./docs/DEVELOPMENT_WORKFLOW.md)
- [Deployment](./docs/DEPLOYMENT.md)
- [Security](./SECURITY.md)

## Security

URFMP uses JWT-based authentication with scoped permissions and per-org rate
limiting. To report a vulnerability, see [SECURITY.md](./SECURITY.md).

## License

See the repository for license details.
