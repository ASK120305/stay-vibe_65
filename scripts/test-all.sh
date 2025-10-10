#!/bin/bash

# StayVibe Test Runner Script
# This script runs all tests for both frontend and backend

set -e  # Exit on any error

echo "🧪 Running StayVibe Test Suite"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm ci

echo ""
echo "🔍 Running Frontend Tests..."
echo "----------------------------"

# Frontend linting
echo "Running ESLint..."
if npm run lint; then
    print_status "Frontend linting passed"
else
    print_error "Frontend linting failed"
    exit 1
fi

# Frontend TypeScript check
echo "Running TypeScript check..."
if npx tsc --noEmit; then
    print_status "TypeScript check passed"
else
    print_error "TypeScript check failed"
    exit 1
fi

# Frontend tests
echo "Running frontend tests..."
if npm run test:run; then
    print_status "Frontend tests passed"
else
    print_error "Frontend tests failed"
    exit 1
fi

# Frontend build
echo "Building frontend..."
if npm run build; then
    print_status "Frontend build successful"
else
    print_error "Frontend build failed"
    exit 1
fi

echo ""
echo "🔧 Running Backend Tests..."
echo "---------------------------"

# Backend linting
echo "Running backend ESLint..."
if cd backend && npm run lint; then
    print_status "Backend linting passed"
    cd ..
else
    print_error "Backend linting failed"
    exit 1
fi

# Backend tests
echo "Running backend tests..."
if cd backend && npm run test:coverage; then
    print_status "Backend tests passed"
    cd ..
else
    print_error "Backend tests failed"
    exit 1
fi

echo ""
echo "🎉 All tests passed successfully!"
echo "================================"
print_status "Frontend: Linting ✅ | TypeScript ✅ | Tests ✅ | Build ✅"
print_status "Backend: Linting ✅ | Tests ✅ | Coverage ✅"
echo ""
echo "🚀 Ready for deployment!"
