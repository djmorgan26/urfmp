# CLAUDE Development Guide - URFMP

This file contains all essential information for Claude to efficiently work on the URFMP (Universal Robot Fleet Management Platform) codebase.

## 🚀 Quick Start Commands

### Development Commands
- `npm run dev` - Start development mode
- `npm run build` - Build all packages
- `npm run typecheck` - Run TypeScript checking
- `npm run lint` - Run ESLint
- `docker-compose up -d` - Start all services
- `docker-compose down` - Stop all services
- `docker logs urfmp-api --tail 50` - Check API logs
- `docker logs urfmp-web --tail 50` - Check web logs

### Testing API
- Health: `curl http://localhost:3000/health`
- Robots: `curl -H "X-API-Key: urfmp_dev_9f8e7d6c5b4a3910efabcdef12345678" http://localhost:3000/api/v1/robots`
- Telemetry: `curl -H "X-API-Key: urfmp_dev_9f8e7d6c5b4a3910efabcdef12345678" http://localhost:3000/api/v1/telemetry/ROBOT_ID/latest`
- Web App: `http://localhost:3001`

## 🏗️ Architecture Overview

### Monorepo Structure
```
urfmp/
├── packages/
│   ├── types/          # Shared TypeScript types
│   └── sdk/            # Client SDK for URFMP API
├── services/
│   └── api/            # Express.js REST API server
├── web/                # React frontend application
├── adapters/           # Robot vendor integrations
│   └── universal-robots/
└── infrastructure/     # Docker, DB, configs
```

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (TimescaleDB), Redis
- **Message Queue**: RabbitMQ
- **Analytics**: ClickHouse (optional)
- **Streaming**: Kafka (optional)
- **Container**: Docker, Docker Compose

## 🔧 Current Status

### ✅ Working Features
- Docker environment with all services
- React web application with routing
- Dark mode theme switching
- Health check endpoints
- Basic UI components and layout
- Production-ready authentication system (JWT + API keys)
- Complete robot management (CRUD operations)
- Real-time WebSocket system with live updates
- **Comprehensive telemetry data collection and visualization**
- Robot command execution with real-time broadcasting
- Tabbed robot detail pages with telemetry dashboard

### 🔨 In Development
- Advanced analytics and reporting
- Predictive maintenance features
- Geofencing and waypoint management

### 🌍 GPS Visualization System
- **Interactive 2D/3D robot mapping** - Real-time GPS positioning with SimpleRobotMap and RobotMap3D components
- **Fleet tracking dashboard** - Centralized GPS map view with robot selection and filtering
- **Real-time coordinate updates** - WebSocket-based GPS data streaming
- **Path visualization** - Robot trail rendering and historical position tracking

### 🏃‍♂️ Development Mode Settings
- `NODE_ENV=development`
- `DEV_MOCK_ROBOTS=true` (enables auth bypass)
- API runs on port 3000
- Web app runs on port 3001

## 📊 Key Environment Variables

### Required for Development
```bash
# Brand Configuration
VITE_COMPANY_NAME=URFMP
VITE_PRODUCT_NAME=URFMP
VITE_PRODUCT_FULL_NAME=Universal Robot Fleet Management Platform
VITE_TAGLINE=The Stripe of Robotics
VITE_DESCRIPTION=Monitor any robot in 7 lines of code

# Development Flags
NODE_ENV=development
DEV_MOCK_ROBOTS=false
DEV_ENABLE_SWAGGER=true
VITE_URFMP_API_KEY=urfmp_dev_9f8e7d6c5b4a3910efabcdef12345678

# Database
DATABASE_URL=postgresql://urfmp:urfmp-dev-2024@localhost:5432/urfmp

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
```

## 🗄️ Database Information

### Current Schema Status
- ✅ Complete database schema with migration system
- ✅ Users and organizations tables with authentication
- ✅ Robots table with full CRUD operations
- ✅ **Production-ready telemetry data collection** with normalized metrics storage
- ✅ Robot commands, telemetry, and alerts tables (fully implemented)
- ✅ TimescaleDB hypertables for time-series data
- ✅ Redis for caching and sessions
- ✅ RabbitMQ for real-time messaging

### Database Migration System
```bash
# Run migrations manually
docker exec urfmp-api npx tsx services/api/src/migrations/cli.ts migrate

# Check migration status
docker exec urfmp-api npx tsx services/api/src/migrations/cli.ts status

# Rollback migrations
docker exec urfmp-api npx tsx services/api/src/migrations/cli.ts rollback
```

Migration files in `services/api/src/migrations/sql/`:
- `20250918-194300-initial-schema.up.sql` - Users, organizations, sessions
- `20250918-194400-robots-schema.up.sql` - Robot tables and triggers
- `20250918-194500-seed-data.up.sql` - Admin user and demo org

### Key Models (from types package)
- `Robot` - Core robot entity
- `User` - User accounts and authentication
- `RobotTelemetry` - Time-series robot data
- `MaintenanceTask` - Maintenance scheduling
- `Alert` - System alerts and notifications

## 🎯 Current Development Priorities

### Phase 1: Core Foundation (CRITICAL)
1. **Authentication System** - Currently using development bypass
2. **Robot Management** - Add/edit/delete robots, commands
3. **Real-time WebSocket** - Live updates and telemetry

### Next Items to Work On
1. ✅ Complete JWT authentication implementation
2. ✅ Build robot CRUD operations
3. ✅ Implement WebSocket real-time system
4. ✅ Add telemetry data collection and visualization
5. 🔄 **GPS 3D robot visualization** - CesiumJS integration for outdoor robot tracking
6. Advanced analytics and reporting dashboards
7. Predictive maintenance features

## 🔗 API Endpoints

### Current Status
```
✅ GET  /health               - System health check
✅ POST /api/v1/auth/login    - JWT authentication
✅ POST /api/v1/auth/logout   - Token invalidation
✅ POST /api/v1/auth/refresh  - Refresh access tokens
✅ GET  /api/v1/robots        - List robots with filtering/pagination
✅ GET  /api/v1/robots/:id    - Get robot by ID
✅ POST /api/v1/robots        - Create new robot
✅ PUT  /api/v1/robots/:id    - Update robot
✅ DELETE /api/v1/robots/:id  - Delete robot
✅ GET  /api/v1/robots/stats  - Robot statistics
✅ POST /api/v1/robots/:id/commands - Send commands to robots
✅ POST /api/v1/telemetry/:robotId    - Ingest telemetry data
✅ GET  /api/v1/telemetry/:robotId/latest - Get latest telemetry
✅ GET  /api/v1/telemetry/:robotId/history - Get telemetry history
✅ GET  /api/v1/telemetry/:robotId/metrics - Get available metrics
✅ GET  /api/v1/telemetry/aggregated - Get aggregated telemetry data
```

### Authentication System

#### Valid Test User
```
Email: admin@urfmp.com
Password: admin123
Organization: URFMP Demo (d8077863-d602-45fd-a253-78ee0d3d49a8)
User ID: 3885c041-ebf4-4fdd-a6ec-7d88216ded2d
Role: admin
Permissions: ['robot.view', 'robot.create', 'robot.update', 'robot.delete', 'telemetry.view', 'telemetry.write', 'maintenance.view', 'user.view', 'organization.view']
```

#### Getting Access Tokens
```bash
# Login to get JWT tokens
curl -X POST -H "Content-Type: application/json" \
  -d '{"email":"admin@urfmp.com","password":"admin123"}' \
  http://localhost:3000/api/v1/auth/login

# Response includes:
# - accessToken (1 hour expiry)
# - refreshToken (7 day expiry)
# - user info and organization details
```

#### Using API with Authentication
```bash
# JWT Bearer Token (from login endpoint)
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:3000/api/v1/robots

# OR API Key (for direct API access)
curl -H "X-API-Key: urfmp_dev_9f8e7d6c5b4a3910efabcdef12345678" \
  http://localhost:3000/api/v1/robots
```

#### API Key Authentication
```bash
# Development API Key (configured in database)
API_KEY=urfmp_dev_9f8e7d6c5b4a3910efabcdef12345678

# Test API key authentication
curl -H "X-API-Key: $API_KEY" http://localhost:3000/api/v1/robots

# API key has permissions: ['robot.view', 'robot.create', 'robot.update', 'robot.delete', 'telemetry.view', 'telemetry.write']
# Linked to admin user (3885c041-ebf4-4fdd-a6ec-7d88216ded2d) in URFMP Demo org
```

#### Authentication Status
- ✅ **Production-ready authentication** - No hardcoded bypasses
- ✅ **Dual authentication support** - JWT tokens AND API keys
- ✅ **Proper security validation** - Database lookup, expiry checks, permission validation
- ✅ **Frontend configured** - API key set in environment variables
- ⚠️ **DEV_MOCK_ROBOTS=false** - Authentication is REQUIRED for all API requests

## 📊 Telemetry System

### Comprehensive Telemetry Data Collection
URFMP provides a production-ready telemetry system with real-time data ingestion, storage, and visualization.

#### Telemetry Database Schema
```sql
-- Optimized for high-frequency telemetry data
CREATE TABLE robot_telemetry (
    time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    robot_id UUID NOT NULL,
    metric_name VARCHAR(100) NOT NULL,  -- e.g., 'temperature.ambient'
    value DOUBLE PRECISION,             -- Numeric metric value
    unit VARCHAR(20),                   -- e.g., '°C', 'V', 'A'
    metadata JSONB,                     -- Additional context
    CONSTRAINT fk_telemetry_robot FOREIGN KEY (robot_id) REFERENCES robots(id)
);
```

#### Supported Telemetry Data Types
- **Position data** (x, y, z coordinates with rotations)
- **GPS positioning** (latitude, longitude, altitude, heading, speed, accuracy)
- **Navigation data** (waypoints, path planning, geofencing)
- **Joint angles** (6-8 axis support with units)
- **Temperature monitoring** (ambient, controller, per-motor)
- **Power metrics** (voltage, current, power consumption)
- **Velocity and acceleration** (linear and angular)
- **Force and torque** (TCP forces with magnitude)
- **Safety status** (emergency stops, protective modes)
- **Custom metrics** (extensible for vendor-specific data)

#### Telemetry API Usage Examples
```bash
# Send comprehensive telemetry data
curl -X POST -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" \
-d '{
  "data": {
    "position": {"x": 125.5, "y": 245.8, "z": 300.2, "rx": 0.1, "ry": 0.0, "rz": 1.57},
    "temperature": {"ambient": 25.3, "controller": 35.7, "unit": "°C"},
    "voltage": {"supply": 48.2, "unit": "V"},
    "current": {"total": 2.15, "unit": "A"},
    "power": {"total": 103.5, "unit": "W"},
    "safety": {"emergencyStop": false, "protectiveStop": false, "reducedMode": false}
  }
}' \
http://localhost:3000/api/v1/telemetry/ROBOT_ID

# Get latest telemetry data
curl -H "X-API-Key: $API_KEY" \
  http://localhost:3000/api/v1/telemetry/ROBOT_ID/latest

# Get telemetry history with filtering
curl -H "X-API-Key: $API_KEY" \
  "http://localhost:3000/api/v1/telemetry/ROBOT_ID/history?from=2025-09-18T00:00:00Z&limit=1000"

# Get available metrics for a robot
curl -H "X-API-Key: $API_KEY" \
  http://localhost:3000/api/v1/telemetry/ROBOT_ID/metrics

# Get aggregated power consumption over last 24h
curl -H "X-API-Key: $API_KEY" \
  "http://localhost:3000/api/v1/telemetry/aggregated?metric=power.total&aggregation=avg&timeWindow=1h"

# Send GPS telemetry data with navigation
curl -X POST -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" \
-d '{
  "data": {
    "gpsPosition": {
      "latitude": 40.7589,
      "longitude": -73.9851,
      "altitude": 10.5,
      "heading": 135,
      "speed": 1.2,
      "accuracy": {"horizontal": 3.5, "vertical": 5.0},
      "timestamp": "2025-09-19T21:56:00.000Z",
      "satelliteCount": 8,
      "fix": "3d"
    },
    "navigation": {
      "currentWaypoint": {
        "id": "wp1",
        "coordinates": {"latitude": 40.7589, "longitude": -73.9851, "altitude": 10.5},
        "type": "pickup"
      },
      "pathPlanningStatus": "following_path"
    },
    "position": {"x": 15.2, "y": 8.5, "z": 0.1}
  }
}' \
http://localhost:3000/api/v1/telemetry/ROBOT_ID
```

#### Telemetry Dashboard Features
- **Real-time metric cards** with trend indicators and safety status
- **Interactive charts** (temperature, power consumption, voltage, current draw)
- **Time range selection** (1h, 6h, 24h, 7d, 30d)
- **Aggregation options** (average, min, max, sum, count)
- **Live updates** via WebSocket integration
- **Tabbed robot interface** with dedicated telemetry view

#### Real-time WebSocket Broadcasting
- **Instant telemetry updates** broadcasted to connected clients
- **Channel-based subscriptions** (`robot:{robotId}`)
- **Event-driven architecture** for live monitoring
- **Automatic reconnection** and error handling

#### SDK Integration
```typescript
// URFMP SDK telemetry methods
await urfmp.sendTelemetry(robotId, telemetryData)
await urfmp.getLatestTelemetry(robotId)
await urfmp.getTelemetryHistory(robotId, { from, to, limit })
await urfmp.getTelemetryMetrics(robotId)
await urfmp.getAggregatedTelemetry({ metric, aggregation, timeWindow })
```

## 🎨 Frontend Components

### Layout Structure
- `Layout.tsx` - Main layout with header, sidebar, content
- Header includes: Logo, search, connection status, notifications, theme toggle, user menu
- Sidebar includes: Navigation menu with Dashboard, Robots, Analytics, Maintenance, Settings

### Theme System
- Supports light/dark/system themes
- Theme context in `contexts/ThemeContext.tsx`
- Toggle in header and settings page
- CSS custom properties in `index.css`

### Key Pages
- `/` - Dashboard (analytics widgets)
- `/robots` - Robot list and management
- `/robots/:id` - Individual robot details with telemetry dashboard
  - **Overview tab** - Robot status, controls, specifications
  - **Telemetry tab** - Real-time metrics, charts, historical data
  - **Commands tab** - Command history and execution
  - **History tab** - Audit logs and events
- `/analytics` - Performance analytics
- `/maintenance` - Maintenance management
- `/settings` - System configuration

## 🛠️ Development Workflows

### Adding New Features
1. Check types package for required interfaces
2. Add API endpoint in `services/api/src/routes/`
3. Update frontend components in `web/src/`
4. Add to navigation if needed
5. Test with Docker environment

### Working with Types
- All shared types in `packages/types/src/`
- Export new types in `packages/types/src/index.ts`
- Rebuild types: `npm run build --workspace=@urfmp/types`

### Working with API
- Routes in `services/api/src/routes/`
- Middleware in `services/api/src/middleware/`
- Use `asyncHandler` for async routes
- Follow existing patterns for error handling

### Working with Frontend
- Components in `web/src/components/`
- Pages in `web/src/pages/`
- Hooks in `web/src/hooks/`
- Use Tailwind for styling
- Follow existing patterns for state management

## 🐛 Common Issues & Solutions

### Docker Issues
- If containers fail to start: `docker-compose down && docker-compose up -d --build`
- If API shows connection errors: Wait for RabbitMQ to fully start, then restart API
- Check logs: `docker logs urfmp-api --tail 50`

### TypeScript Issues
- If types not found: Rebuild types package
- Missing exports: Add to `packages/types/src/index.ts`
- SDK build issues: Clean and rebuild SDK

### Development Tips
- Use browser dev tools for React DevTools
- API documentation available at `http://localhost:3000/docs` (when enabled)
- Database admin at `http://localhost:8080` (Adminer)
- RabbitMQ management at `http://localhost:15672`

## 📝 Code Standards

### TypeScript
- Strict mode enabled
- Use interfaces for object shapes
- Export types from centralized location
- Use proper error handling

### React
- Functional components with hooks
- Use TypeScript for all components
- Follow naming conventions (PascalCase for components)
- Use custom hooks for logic

### API
- RESTful endpoints
- Consistent error responses
- Use middleware for common functionality
- Proper HTTP status codes

## 🔍 Debugging Tools

### Available Services
- API: http://localhost:3000
- Web: http://localhost:3001
- Adminer (DB): http://localhost:8080
- RabbitMQ: http://localhost:15672

### Useful Commands
```bash
# Check all containers
docker ps

# Restart specific service
docker restart urfmp-api

# View logs
docker logs urfmp-web --tail 50 -f

# Connect to database
docker exec -it urfmp-postgres psql -U urfmp -d urfmp

# Connect to Redis
docker exec -it urfmp-redis redis-cli
```

---

*Last Updated: $(date)*
*This file should be updated as the codebase evolves*