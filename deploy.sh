#!/bin/bash

# URFMP Deployment Script
# This script deploys the complete URFMP stack with all services

set -e

echo "🚀 URFMP Complete Stack Deployment"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose >/dev/null 2>&1; then
    print_error "Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

print_status "Docker and Docker Compose are available"

# Check for environment file
if [ ! -f ".env.production" ]; then
    print_warning ".env.production file not found"
    print_status "Creating .env.production from template..."

    if [ -f ".env.production.template" ]; then
        cp .env.production.template .env.production
        print_warning "Please edit .env.production with your secure passwords and configuration"
        print_warning "The deployment will continue with default values, but you should update them for production use"
    else
        print_error ".env.production.template not found. Cannot create environment file."
        exit 1
    fi
fi

# Load environment variables
if [ -f ".env.production" ]; then
    print_status "Loading environment variables from .env.production"
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Deployment mode selection
echo ""
echo "Select deployment mode:"
echo "1) Full stack (All services: PostgreSQL, Redis, RabbitMQ, ClickHouse, Kafka)"
echo "2) Core stack (Essential services: PostgreSQL, Redis, RabbitMQ, API, Web)"
echo "3) Minimal stack (Basic services: PostgreSQL, API, Web)"

read -p "Enter your choice (1-3): " DEPLOY_MODE

case $DEPLOY_MODE in
    1)
        COMPOSE_FILE="docker-compose.deploy.yml"
        SERVICES=""
        print_status "Deploying FULL stack with all services"
        ;;
    2)
        COMPOSE_FILE="docker-compose.deploy.yml"
        SERVICES="postgres redis rabbitmq api web adminer"
        print_status "Deploying CORE stack with essential services"
        ;;
    3)
        COMPOSE_FILE="docker-compose.deploy.yml"
        SERVICES="postgres api web"
        print_status "Deploying MINIMAL stack with basic services"
        ;;
    *)
        print_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

# Build and deploy
print_status "Building and starting services..."

if [ -n "$SERVICES" ]; then
    docker-compose -f $COMPOSE_FILE up -d --build $SERVICES
else
    docker-compose -f $COMPOSE_FILE up -d --build
fi

# Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# Health checks
print_status "Performing health checks..."

# Check API health
print_status "Checking API health..."
if curl -f http://localhost:3000/health >/dev/null 2>&1; then
    print_success "✅ API is healthy"
else
    print_warning "⚠️  API health check failed - may still be starting"
fi

# Check Web health
print_status "Checking Web frontend health..."
if curl -f http://localhost/health >/dev/null 2>&1; then
    print_success "✅ Web frontend is healthy"
else
    print_warning "⚠️  Web frontend health check failed - may still be starting"
fi

# Show running services
print_status "Running services:"
docker-compose -f $COMPOSE_FILE ps

echo ""
print_success "🎉 URFMP Deployment Complete!"
echo ""
echo "📊 Access your URFMP installation:"
echo "   • Web Interface: http://localhost"
echo "   • API Health: http://localhost:3000/health"
echo "   • Database Admin: http://localhost:8080 (if enabled)"
echo ""
echo "🔧 To manage your deployment:"
echo "   • View logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "   • Stop services: docker-compose -f $COMPOSE_FILE down"
echo "   • Update services: docker-compose -f $COMPOSE_FILE up -d --build"
echo ""
echo "📚 Next steps:"
echo "   1. Update .env.production with secure passwords"
echo "   2. Configure your domain/SSL for production use"
echo "   3. Set up monitoring and backups"
echo ""
print_success "Happy robot fleet managing! 🤖"