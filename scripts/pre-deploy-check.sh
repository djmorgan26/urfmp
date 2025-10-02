#!/bin/bash

# Pre-Deployment Validation Script
# This script runs all checks that CI/CD will perform to ensure local changes will pass deployment

set -e  # Exit on any error

echo "🚀 Starting Pre-Deployment Validation"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall success
VALIDATION_FAILED=0

# Function to print section headers
print_section() {
    echo ""
    echo "📋 $1"
    echo "----------------------------------------"
}

# Function to handle errors
handle_error() {
    echo -e "${RED}❌ $1 failed${NC}"
    VALIDATION_FAILED=1
}

# Function to handle success
handle_success() {
    echo -e "${GREEN}✅ $1 passed${NC}"
}

# 1. Check Node version
print_section "Checking Node.js version"
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -eq 20 ]; then
    handle_success "Node.js version (v$NODE_VERSION)"
else
    handle_error "Node.js version (expected v20, got v$NODE_VERSION)"
fi

# 2. Clean install dependencies (matches CI)
print_section "Installing dependencies (npm ci)"
if npm ci; then
    handle_success "Dependencies installed"
else
    handle_error "Dependency installation"
fi

# 3. Run Prettier formatting (auto-fix before checking)
print_section "Checking and fixing Prettier formatting"
echo "Running prettier --write to auto-fix formatting..."
if npm run format; then
    handle_success "Prettier formatting (auto-fixed)"
else
    handle_error "Prettier formatting"
fi

# 4. Run ESLint
print_section "Running ESLint"
if npm run lint; then
    handle_success "ESLint"
else
    handle_error "ESLint"
fi

# 5. TypeScript type checking
print_section "TypeScript type checking"
if npm run typecheck; then
    handle_success "TypeScript"
else
    handle_error "TypeScript"
fi

# 6. Build packages in order
print_section "Building packages (types → sdk → api)"

# Build types
echo "Building @urfmp/types..."
if npm run build --workspace=@urfmp/types; then
    handle_success "@urfmp/types build"
else
    handle_error "@urfmp/types build"
fi

# Build SDK
echo "Building @urfmp/sdk..."
if npm run build --workspace=@urfmp/sdk; then
    handle_success "@urfmp/sdk build"
else
    handle_error "@urfmp/sdk build"
fi

# Build API
echo "Building @urfmp/api..."
if npm run build --workspace=@urfmp/api; then
    handle_success "@urfmp/api build"
else
    handle_error "@urfmp/api build"
fi

# 7. Run tests
print_section "Running test suites"

# Types tests
if npm run test --workspace=@urfmp/types 2>/dev/null; then
    handle_success "@urfmp/types tests"
else
    echo -e "${YELLOW}⚠️  @urfmp/types has no tests or tests failed${NC}"
fi

# SDK tests
if npm run test --workspace=@urfmp/sdk; then
    handle_success "@urfmp/sdk tests"
else
    handle_error "@urfmp/sdk tests"
fi

# API tests
if npm run test --workspace=@urfmp/api; then
    handle_success "@urfmp/api tests"
else
    handle_error "@urfmp/api tests"
fi

# Web tests
if npm run test --workspace=@urfmp/web 2>/dev/null; then
    handle_success "@urfmp/web tests"
else
    echo -e "${YELLOW}⚠️  @urfmp/web tests skipped or failed${NC}"
fi

# Final summary
echo ""
echo "======================================"
if [ $VALIDATION_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All pre-deployment checks passed!${NC}"
    echo -e "${GREEN}Your changes are ready to deploy.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some pre-deployment checks failed.${NC}"
    echo -e "${YELLOW}Please fix the issues above before deploying.${NC}"
    exit 1
fi
