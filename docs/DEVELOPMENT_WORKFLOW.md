# URFMP Development Workflow

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd urfmp

# Install dependencies
npm install

# Start development environment
docker-compose up -d

# Wait for services to be ready (especially RabbitMQ)
# Then restart API if needed
docker restart urfmp-api
```

### Verify Setup

- Web app: http://localhost:3001
- API health: http://localhost:3000/health
- Database admin: http://localhost:8080
- RabbitMQ management: http://localhost:15672

## Development Commands

### Common Tasks

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker logs urfmp-api --tail 50
docker logs urfmp-web --tail 50

# Restart specific service
docker restart urfmp-api
docker restart urfmp-web

# Build packages
npm run build
npm run build --workspace=@urfmp/types
npm run build --workspace=@urfmp/sdk

# Type checking
npm run typecheck
npm run typecheck --workspace=@urfmp/web

# Linting
npm run lint
```

### Working with Types

```bash
# When adding new types
1. Edit packages/types/src/*.ts
2. Add exports to packages/types/src/index.ts
3. Rebuild: npm run build --workspace=@urfmp/types
4. Restart containers if needed
```

## Feature Development Process

### 1. Planning Phase

- Review ROADMAP.md for priorities
- Check CLAUDE.md for current status
- Review existing code patterns
- Plan API endpoints and data flow

### 2. API Development

```bash
# API endpoint development
services/api/src/routes/
├── endpoint.routes.ts     # Route definitions
├── middleware/           # Custom middleware
└── services/            # Business logic

# Follow patterns:
- Use asyncHandler for async routes
- Implement proper error handling
- Add permission checks
- Include input validation
- Return standardized responses
```

### 3. Frontend Development

```bash
# Frontend development
web/src/
├── pages/               # Page components
├── components/          # Reusable components
├── hooks/              # Custom hooks
└── contexts/           # State management

# Follow patterns:
- Use TypeScript for all components
- Follow existing component structure
- Use shared types from packages/types
- Implement proper error handling
- Add loading states
```

### 4. Testing Process

```bash
# Manual testing checklist
1. Verify API endpoints work
   curl http://localhost:3000/api/v1/endpoint

2. Test frontend functionality
   - Navigation works
   - Data displays correctly
   - Error states handled
   - Loading states shown

3. Test real-time features
   - WebSocket connections
   - Live updates
   - Connection recovery

4. Test across themes
   - Light mode works
   - Dark mode works
   - System preference works
```

## Working with Specific Features

### Authentication System

```bash
# Current status: Development bypass active
# Location: services/api/src/middleware/auth.middleware.ts

# To implement:
1. Create proper JWT generation
2. Add password hashing
3. Implement refresh tokens
4. Add user registration
5. Remove development bypass for production
```

### Robot Management

```bash
# Current status: Mock data only
# API: services/api/src/routes/robot.routes.ts
# Frontend: web/src/pages/Robots.tsx

# To implement:
1. Database CRUD operations
2. Real-time status updates
3. Command execution
4. Vendor adapter integration
```

### WebSocket System

```bash
# Current status: Basic structure
# Location: services/api/src/services/websocket.service.ts

# To implement:
1. Authentication for WebSocket
2. Real-time robot updates
3. Telemetry streaming
4. Error handling and reconnection
```

## Database Development

### Working with Schema

```bash
# Schema location: docs/DATABASE_SCHEMA.md
# Migrations: services/api/src/migrations/

# Process:
1. Plan schema changes
2. Create migration file
3. Test migration locally
4. Update documentation
```

### Database Access

```bash
# Connect to database
docker exec -it urfmp-postgres psql -U urfmp -d urfmp

# Common queries
\dt                    # List tables
\d table_name         # Describe table
SELECT * FROM robots; # Query data
```

## Code Standards

### TypeScript

```typescript
// Use interfaces for object shapes
interface ComponentProps {
  id: string
  name: string
  optional?: boolean
}

// Use proper error handling
try {
  const result = await apiCall()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw error
}

// Use proper typing for API responses
const response: ApiResponse<Robot[]> = await api.getRobots()
```

### React Components

```tsx
// Use functional components with TypeScript
interface ComponentProps {
  data: Robot[]
  onSelect: (robot: Robot) => void
}

export function Component({ data, onSelect }: ComponentProps) {
  return (
    <div>
      {data.map((robot) => (
        <div key={robot.id} onClick={() => onSelect(robot)}>
          {robot.name}
        </div>
      ))}
    </div>
  )
}
```

### API Routes

```typescript
// Use consistent patterns
router.get(
  '/',
  requirePermission(Permission.ROBOT_VIEW),
  asyncHandler(async (req, res) => {
    const robots = await robotService.getAll(req.user.organizationId)

    const response: ApiResponse<Robot[]> = {
      success: true,
      data: { robots },
      metadata: {
        requestId: req.traceId,
        timestamp: new Date(),
        version: '1.0.0',
      },
    }

    res.json(response)
  })
)
```

## Debugging Tips

### Common Issues

```bash
# Container won't start
docker-compose down && docker-compose up -d --build

# API connection errors
# Wait for RabbitMQ to fully start, then restart API
docker logs urfmp-rabbitmq --tail 10
docker restart urfmp-api

# Type errors
# Rebuild types package
npm run build --workspace=@urfmp/types

# WebSocket not connecting
# Check API logs and ensure WebSocket service is running
docker logs urfmp-api | grep -i websocket
```

### Debugging Tools

```bash
# Browser DevTools
- React DevTools extension
- Network tab for API calls
- Console for errors
- Application tab for localStorage

# API Debugging
- Swagger docs: http://localhost:3000/docs
- Health check: http://localhost:3000/health
- Direct API calls with curl

# Database Debugging
- Adminer: http://localhost:8080
- Direct psql connection
- Query logs in PostgreSQL
```

## Deployment Checklist

### Pre-deployment

- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] No console errors in development
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Database migrations ready

### Production Considerations

- [ ] Remove development auth bypass
- [ ] Configure production JWT secrets
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies

## Git Workflow

### Branch Strategy

```bash
# Feature development
git checkout -b feature/robot-management
# Work on feature
git add .
git commit -m "Add robot CRUD operations"
git push origin feature/robot-management
# Create pull request
```

### Commit Messages

```bash
# Good commit messages
git commit -m "Add robot status update endpoint"
git commit -m "Fix WebSocket connection handling"
git commit -m "Update robot list UI with real-time updates"

# Include relevant details
git commit -m "Add authentication middleware

- Implement JWT token validation
- Add role-based permissions
- Include development bypass for testing"
```

## Performance Guidelines

### Frontend Performance

- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Lazy load pages and components
- Optimize bundle size with code splitting

### API Performance

- Implement database indexing
- Use connection pooling
- Add response caching where appropriate
- Optimize database queries

### Real-time Performance

- Throttle high-frequency updates
- Use compression for WebSocket messages
- Implement client-side buffering
- Add connection recovery logic

## Documentation Updates

### When to Update Docs

- Adding new API endpoints → API_REFERENCE.md
- Changing database schema → DATABASE_SCHEMA.md
- Adding new components → COMPONENTS.md
- Changing architecture → ARCHITECTURE.md
- Development process changes → This file

### Documentation Locations

- `/docs/` - Technical documentation
- `/CLAUDE.md` - Development reference for AI
- `/README.md` - Project overview
- Code comments - Inline documentation

---

_Follow this workflow for consistent, efficient development_
