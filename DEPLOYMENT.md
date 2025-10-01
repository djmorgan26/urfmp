# 🚀 URFMP Complete Stack Deployment Guide

This guide shows you how to deploy the complete URFMP with ALL services using Docker.

## 🎯 What You Get

### 📊 **Core Services**

- **PostgreSQL** with TimescaleDB - Time-series database
- **Redis** - Caching and session management
- **RabbitMQ** - Message queuing for real-time communication
- **URFMP API** - Node.js/Express REST API with WebSocket support
- **URFMP Web** - React frontend with real-time dashboard

### ⚡ **Advanced Services (Optional)**

- **ClickHouse** - Analytics database for complex queries
- **Apache Kafka** - Event streaming for high-throughput scenarios

## 🚀 Quick Start

### 1. Configure Environment

```bash
cp .env.production.template .env.production
# Edit with your secure passwords
```

### 2. Deploy

```bash
chmod +x deploy.sh
./deploy.sh
```

### 3. Access Your Platform

- Web Interface: http://localhost
- API Health: http://localhost:3000/health
- Database Admin: http://localhost:8080

## 🌐 Recommended Platforms

1. **Fly.io** - Best for Docker Compose (Free tier: 3 VMs)
2. **DigitalOcean** - Enterprise-grade ($5-25/month)
3. **Self-hosted** - Full control

Happy robot fleet managing! 🤖
