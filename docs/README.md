# URFMP Documentation

Welcome to the URFMP (Universal Robot Fleet Management Platform) documentation. This directory contains comprehensive technical documentation for developers working on the platform.

## Documentation Overview

### 📋 Core Documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and component overview
- **[API_REFERENCE.md](./API_REFERENCE.md)** - Complete API endpoint documentation
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Database schema and data models
- **[COMPONENTS.md](./COMPONENTS.md)** - Frontend component library and patterns
- **[DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md)** - Development process and guidelines

### 🚀 Quick Start
For immediate development setup, see:
1. **[../CLAUDE.md](../CLAUDE.md)** - Essential development reference
2. **[DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md)** - Setup and workflow guide

## Documentation Structure

```
docs/
├── README.md                    # This file - documentation overview
├── ARCHITECTURE.md              # System architecture and design
├── API_REFERENCE.md             # API endpoints and usage
├── DATABASE_SCHEMA.md           # Database structure and relationships
├── COMPONENTS.md                # Frontend component documentation
└── DEVELOPMENT_WORKFLOW.md      # Development process and guidelines
```

## For Different Audiences

### 🔧 Developers (New to Project)
Start with these in order:
1. [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand the system
2. [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md) - Set up environment
3. [../CLAUDE.md](../CLAUDE.md) - Quick reference guide
4. [API_REFERENCE.md](./API_REFERENCE.md) - API details
5. [COMPONENTS.md](./COMPONENTS.md) - Frontend patterns

### 🎯 API Developers
Focus on:
- [API_REFERENCE.md](./API_REFERENCE.md) - Endpoint specifications
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Data structures
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Backend architecture

### 🎨 Frontend Developers
Focus on:
- [COMPONENTS.md](./COMPONENTS.md) - Component library
- [API_REFERENCE.md](./API_REFERENCE.md) - API integration
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Frontend architecture

### 🏗️ DevOps/Infrastructure
Focus on:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Deployment architecture
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database setup
- [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md) - Environment setup

## Current Project Status

### ✅ Completed Features
- Docker development environment
- Basic React frontend with routing
- Dark mode theme system
- Health check endpoints
- Development authentication bypass
- Core component structure

### 🔨 In Development
- Authentication system (JWT implementation)
- Robot management CRUD operations
- Real-time WebSocket connections
- Telemetry data collection

### 📋 Planned Features
See the full roadmap in [../CLAUDE.md](../CLAUDE.md) under "Development Priorities"

## Key Technologies

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **TypeScript** throughout
- **PostgreSQL** with TimescaleDB
- **Redis** for caching
- **RabbitMQ** for messaging

### Infrastructure
- **Docker** & Docker Compose
- **Monorepo** structure with npm workspaces

## Development Environment

### Quick Start
```bash
# Clone and setup
git clone <repo-url>
cd urfmp
npm install

# Start all services
docker-compose up -d

# Access applications
# Web app: http://localhost:3001
# API: http://localhost:3000
# Health: http://localhost:3000/health
```

### Key Services
- **Web App**: http://localhost:3001
- **API Server**: http://localhost:3000
- **Database Admin**: http://localhost:8080 (Adminer)
- **RabbitMQ Management**: http://localhost:15672

## Contributing

### Before Making Changes
1. Read relevant documentation sections
2. Check current roadmap priorities
3. Follow established patterns
4. Update documentation if needed

### Development Process
1. **Plan** - Review architecture and existing patterns
2. **Implement** - Follow coding standards
3. **Test** - Verify functionality works
4. **Document** - Update relevant docs

### Code Standards
- TypeScript for all new code
- Follow existing component patterns
- Use proper error handling
- Include proper types and interfaces
- Follow naming conventions

## Getting Help

### Common Issues
See [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md) for:
- Setup troubleshooting
- Common error solutions
- Debugging tips

### Documentation Updates
When you:
- Add new API endpoints → Update [API_REFERENCE.md](./API_REFERENCE.md)
- Change database schema → Update [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- Add new components → Update [COMPONENTS.md](./COMPONENTS.md)
- Change architecture → Update [ARCHITECTURE.md](./ARCHITECTURE.md)

### Questions and Clarifications
- Check existing documentation first
- Review code patterns in similar features
- Consult [../CLAUDE.md](../CLAUDE.md) for quick reference

## Documentation Maintenance

### When to Update
- After implementing new features
- When fixing architectural issues
- When development process changes
- When adding new tools or dependencies

### How to Update
1. Edit the relevant markdown file
2. Update any cross-references
3. Test code examples
4. Update this README if structure changes

---

*This documentation is actively maintained and should reflect the current state of the URFMP platform.*