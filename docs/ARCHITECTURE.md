# URFMP Architecture Documentation

## System Overview

URFMP (Universal Robot Fleet Management Platform) is a modern web application for monitoring and managing industrial robot fleets. It provides real-time telemetry, maintenance scheduling, and analytics capabilities.

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │   API Server    │    │   Databases     │
│   (React SPA)   │◄──►│  (Express.js)   │◄──►│  PostgreSQL     │
│                 │    │                 │    │  Redis          │
│  - Vite/React   │    │  - REST API     │    │  ClickHouse     │
│  - TypeScript   │    │  - WebSocket    │    │                 │
│  - Tailwind     │    │  - Auth/JWT     │    └─────────────────┘
└─────────────────┘    └─────────────────┘
                                │                ┌─────────────────┐
                                └───────────────►│ Message Queue   │
                                                 │  RabbitMQ       │
                                                 │  Kafka          │
                                                 └─────────────────┘
                                                          │
┌─────────────────┐    ┌─────────────────┐              │
│ Robot Vendors   │    │    Adapters     │◄─────────────┘
│                 │◄──►│                 │
│ - Universal     │    │ - UR Adapter    │
│ - KUKA          │    │ - KUKA Adapter  │
│ - ABB           │    │ - ABB Adapter   │
│ - FANUC         │    │ - Custom        │
└─────────────────┘    └─────────────────┘
```

## Component Details

### Frontend (web/)

**Technology**: React 18, TypeScript, Tailwind CSS, Vite

**Structure**:

```
web/src/
├── components/           # Reusable UI components
│   ├── layout/          # Layout components (Header, Sidebar)
│   └── dashboard/       # Dashboard-specific components
├── pages/               # Page components (routed)
├── hooks/               # Custom React hooks
├── contexts/            # React contexts (Theme, etc.)
├── utils/               # Utility functions
└── assets/              # Static assets
```

**Key Features**:

- Theme system (light/dark/system)
- Real-time updates via WebSocket
- Responsive design
- Component-based architecture

### API Server (services/api/)

**Technology**: Node.js, Express.js, TypeScript

**Structure**:

```
services/api/src/
├── routes/              # API route handlers
├── middleware/          # Express middleware
├── config/              # Configuration (DB, Redis, etc.)
├── services/            # Business logic services
├── migrations/          # Database migrations
└── types/               # API-specific types
```

**Features**:

- RESTful API design
- JWT authentication
- WebSocket support
- Rate limiting
- Swagger documentation
- Error handling middleware

### Shared Packages

#### Types Package (packages/types/)

**Purpose**: Shared TypeScript interfaces and types

**Key Types**:

- `Robot` - Robot entity definition
- `User` - User and authentication types
- `RobotTelemetry` - Time-series data structures
- `ApiResponse` - Standardized API responses
- `WebSocketMessage` - Real-time message formats

#### SDK Package (packages/sdk/)

**Purpose**: Client SDK for API interaction

**Features**:

- Type-safe API client
- WebSocket connection management
- Authentication handling
- Error handling and retries

### Database Layer

#### PostgreSQL (Primary Database)

**Usage**:

- User accounts and authentication
- Robot configurations and metadata
- Maintenance schedules and history
- System configuration

**Extensions**:

- TimescaleDB for time-series telemetry data

#### Redis (Cache & Sessions)

**Usage**:

- Session storage
- API response caching
- Real-time data caching
- Rate limiting counters

#### ClickHouse (Analytics - Optional)

**Usage**:

- High-volume telemetry analytics
- Performance metrics aggregation
- Historical data analysis

### Message Queue System

#### RabbitMQ (Primary Queue)

**Usage**:

- Robot command dispatching
- Alert notifications
- Maintenance task scheduling
- Inter-service communication

**Exchanges & Queues**:

- `urfmp_events` - Main event exchange
- `robot_telemetry` - Telemetry data queue
- `robot_commands` - Command execution queue
- `notifications` - Alert notifications

#### Kafka (High-throughput Streaming - Optional)

**Usage**:

- High-volume telemetry streaming
- Event sourcing
- Analytics data pipeline

### Robot Adapters (adapters/)

#### Purpose

Vendor-specific integrations for different robot manufacturers.

#### Structure

```
adapters/
├── universal-robots/    # Universal Robots integration
├── kuka/               # KUKA robots
├── abb/                # ABB robots
└── base/               # Base adapter interface
```

#### Interface

All adapters implement the `IRobotVendorAdapter` interface:

- `connect()` - Establish connection to robot
- `disconnect()` - Close connection
- `sendCommand()` - Execute robot commands
- `getTelemetry()` - Retrieve telemetry data
- `subscribeToEvents()` - Real-time event subscription

## Data Flow

### Robot Telemetry Flow

1. Robot generates telemetry data
2. Vendor adapter collects and normalizes data
3. Data sent to RabbitMQ telemetry queue
4. API server processes and stores in TimescaleDB
5. WebSocket broadcasts to connected clients
6. Frontend updates real-time displays

### Command Execution Flow

1. User initiates command via frontend
2. Frontend sends API request to server
3. API validates and queues command in RabbitMQ
4. Appropriate vendor adapter picks up command
5. Adapter executes command on robot
6. Result returned through same path
7. Frontend displays command result

### Authentication Flow

1. User submits credentials
2. API validates against database
3. JWT token generated and returned
4. Frontend stores token for subsequent requests
5. API validates JWT on protected endpoints
6. Token refresh handled automatically

## Security Architecture

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (RBAC)
- API key authentication for external services
- Session management via Redis

### API Security

- Rate limiting per API key/user
- Input validation and sanitization
- CORS configuration
- Helmet.js security headers

### Data Security

- Encrypted database connections
- Environment-based configuration
- Secrets management
- Audit logging

## Deployment Architecture

### Development Environment

- Docker Compose orchestration
- Hot reload for development
- Mock data and auth bypass
- Local service mesh

### Production Considerations

- Container orchestration (Kubernetes)
- Load balancing
- Database clustering
- Message queue clustering
- Monitoring and logging
- Backup and disaster recovery

## Performance Considerations

### Frontend Optimization

- Code splitting and lazy loading
- Component memoization
- Virtual scrolling for large lists
- Image optimization

### Backend Optimization

- Database indexing strategy
- Connection pooling
- Caching layers
- Query optimization

### Real-time Performance

- WebSocket connection management
- Data compression
- Selective data streaming
- Client-side buffering

## Monitoring & Observability

### Metrics Collection

- Application performance metrics
- Database performance
- Message queue metrics
- Robot connectivity status

### Logging Strategy

- Structured logging (JSON)
- Centralized log aggregation
- Log levels and filtering
- Error tracking and alerting

### Health Checks

- Service health endpoints
- Database connectivity
- External service dependencies
- Robot adapter status

## Scalability Patterns

### Horizontal Scaling

- Stateless API servers
- Database read replicas
- Message queue clustering
- CDN for static assets

### Vertical Scaling

- Resource optimization
- Connection pooling
- Caching strategies
- Database optimization

### Data Partitioning

- Time-based telemetry partitioning
- Robot-based data sharding
- Geographic distribution

---

_This document should be updated as the architecture evolves_
