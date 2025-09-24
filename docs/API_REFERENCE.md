# URFMP API Reference

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://api.urfmp.com` (when deployed)

## Authentication

### Development Mode

When `NODE_ENV=development` and `DEV_MOCK_ROBOTS=true`, authentication is bypassed for easier development.

### Production Mode

Requires JWT Bearer token in Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Current Endpoints

### Health Check

#### `GET /health`

System health check endpoint.

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "checks": [
      {
        "name": "database",
        "status": "healthy",
        "responseTime": 11,
        "details": {
          "timestamp": "2025-09-18T22:59:28.702Z",
          "version": "PostgreSQL 15.13...",
          "totalConnections": 1,
          "idleConnections": 1,
          "waitingConnections": 0
        }
      },
      {
        "name": "redis",
        "status": "healthy",
        "responseTime": 2,
        "details": {
          "connected": true
        }
      },
      {
        "name": "rabbitmq",
        "status": "healthy",
        "details": {
          "connected": true,
          "exchanges": ["urfmp_events"],
          "queues": ["robot_telemetry", "robot_commands"]
        }
      }
    ],
    "timestamp": "2025-09-18T22:59:28.712Z",
    "version": "0.1.0",
    "uptime": 8
  }
}
```

#### `GET /health/live`

Simple liveness probe for Kubernetes.

**Response:**

```json
{
  "status": "alive",
  "timestamp": "2025-09-18T22:59:28.712Z"
}
```

#### `GET /health/ready`

Readiness probe - checks if service can handle requests.

**Response:**

```json
{
  "status": "ready",
  "timestamp": "2025-09-18T22:59:28.712Z"
}
```

### Authentication

#### `POST /api/v1/auth/login`

User login endpoint.

**Status**: Mock implementation

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Login endpoint - implementation pending",
    "tokens": {
      "accessToken": "mock-jwt-token",
      "refreshToken": "mock-refresh-token",
      "tokenType": "Bearer",
      "expiresIn": 3600,
      "scope": ["read:robots", "write:telemetry"]
    }
  }
}
```

#### `POST /api/v1/auth/logout`

User logout endpoint.

**Status**: Mock implementation

### Robots

#### `GET /api/v1/robots`

List all robots in the organization.

**Permissions Required**: `robot.view`

**Query Parameters:**

- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `status` (optional): Filter by robot status
- `vendor` (optional): Filter by robot vendor

**Response:**

```json
{
  "success": true,
  "data": {
    "robots": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "organizationId": "org-123",
        "name": "Demo Robot 1",
        "model": "UR10e",
        "vendor": "universal_robots",
        "serialNumber": "UR10e-001",
        "firmwareVersion": "5.12.0",
        "status": "online",
        "location": {
          "facility": "Factory A",
          "area": "Assembly Line 1",
          "cell": "Cell 3"
        },
        "configuration": {
          "axes": 6,
          "payload": 12.5,
          "reach": 1300,
          "capabilities": ["welding", "assembly"]
        },
        "lastSeen": "2025-09-18T22:59:28.712Z",
        "createdAt": "2025-09-18T10:00:00.000Z",
        "updatedAt": "2025-09-18T22:59:28.712Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

## Planned Endpoints (To Be Implemented)

### Robots (Continued)

#### `POST /api/v1/robots`

Create a new robot.

**Permissions Required**: `robot.create`

#### `GET /api/v1/robots/:id`

Get specific robot details.

**Permissions Required**: `robot.view`

#### `PUT /api/v1/robots/:id`

Update robot configuration.

**Permissions Required**: `robot.update`

#### `DELETE /api/v1/robots/:id`

Remove robot from fleet.

**Permissions Required**: `robot.delete`

#### `POST /api/v1/robots/:id/commands`

Send command to robot.

**Permissions Required**: `robot.control`

**Request Body:**

```json
{
  "type": "start|stop|pause|resume|emergency_stop",
  "payload": {}
}
```

### Telemetry

#### `GET /api/v1/robots/:id/telemetry`

Get robot telemetry data.

**Permissions Required**: `telemetry.view`

#### `POST /api/v1/robots/:id/telemetry`

Submit telemetry data (typically used by adapters).

**Permissions Required**: `telemetry.write`

### Maintenance

#### `GET /api/v1/maintenance`

List maintenance tasks.

#### `POST /api/v1/maintenance`

Schedule maintenance task.

#### `GET /api/v1/maintenance/:id`

Get maintenance task details.

#### `PUT /api/v1/maintenance/:id`

Update maintenance task.

### Alerts

#### `GET /api/v1/alerts`

List system alerts.

#### `POST /api/v1/alerts`

Create new alert.

#### `PUT /api/v1/alerts/:id/acknowledge`

Acknowledge alert.

### Analytics

#### `GET /api/v1/analytics/performance`

Get performance analytics.

#### `GET /api/v1/analytics/usage`

Get usage statistics.

### Users & Organizations

#### `GET /api/v1/users`

List organization users.

#### `POST /api/v1/users`

Invite new user.

#### `GET /api/v1/organization`

Get organization details.

#### `PUT /api/v1/organization`

Update organization settings.

## Standard Response Format

All API responses follow this structure:

```json
{
  "success": boolean,
  "data": any,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {},
    "traceId": "uuid",
    "timestamp": "ISO 8601 date"
  },
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number,
    "hasNext": boolean,
    "hasPrev": boolean
  },
  "metadata": {
    "requestId": "uuid",
    "timestamp": "ISO 8601 date",
    "version": "string",
    "executionTime": number
  }
}
```

## Error Codes

### Authentication Errors

- `UNAUTHORIZED` - Missing or invalid token
- `FORBIDDEN` - Insufficient permissions
- `TOKEN_EXPIRED` - JWT token has expired

### Validation Errors

- `VALIDATION_ERROR` - Request validation failed
- `INVALID_INPUT` - Invalid input parameters

### Resource Errors

- `NOT_FOUND` - Resource not found
- `ALREADY_EXISTS` - Resource already exists
- `CONFLICT` - Resource conflict

### System Errors

- `INTERNAL_SERVER_ERROR` - Unexpected server error
- `SERVICE_UNAVAILABLE` - Service temporarily unavailable
- `RATE_LIMITED` - Too many requests

## Rate Limiting

### Development Mode

Rate limiting is relaxed for development.

### Production Limits

- **Authenticated requests**: 1000 requests per hour per user
- **Unauthenticated requests**: 100 requests per hour per IP
- **Telemetry endpoints**: 10,000 requests per hour per robot

Rate limit headers included in response:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## WebSocket API

### Connection

```javascript
const ws = new WebSocket('ws://localhost:3000/ws')
```

### Authentication

Send JWT token after connection:

```json
{
  "type": "auth",
  "token": "jwt_token_here"
}
```

### Subscription

Subscribe to robot events:

```json
{
  "type": "subscribe",
  "channels": ["robot:status", "robot:telemetry"],
  "robotId": "robot-id-optional"
}
```

### Event Messages

```json
{
  "id": "event-id",
  "type": "robot:status",
  "event": "status_changed",
  "data": {
    "robotId": "robot-id",
    "status": "online",
    "timestamp": "ISO 8601"
  },
  "timestamp": "ISO 8601"
}
```

## SDK Usage

### Installation

```bash
npm install @urfmp/sdk
```

### Basic Usage

```typescript
import { URFMP } from '@urfmp/sdk'

const client = new URFMP({
  apiUrl: 'http://localhost:3000',
  apiKey: 'your-api-key',
})

// List robots
const robots = await client.getRobots()

// Get specific robot
const robot = await client.getRobot('robot-id')

// Send command
await client.sendCommand('robot-id', {
  type: 'start',
  payload: {},
})

// Subscribe to events
client.on('robot:status', (data) => {
  console.log('Robot status changed:', data)
})
```

## Testing

### Using cURL

```bash
# Health check
curl http://localhost:3000/health

# List robots (development mode)
curl http://localhost:3000/api/v1/robots

# List robots (with auth)
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/v1/robots
```

### Using Postman

Import the Swagger documentation from `http://localhost:3000/docs` when available.

---

_This documentation will be updated as new endpoints are implemented_
