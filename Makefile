# HomePlatform Makefile

.PHONY: help dev dev-up dev-down dev-logs dev-clean build test lint format install migrate

# Default target
help:
	@echo "HomePlatform Development Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make install          - Install all dependencies"
	@echo "  make migrate          - Run database migrations"
	@echo ""
	@echo "Development:"
	@echo "  make dev              - Start full development environment"
	@echo "  make dev-up           - Start Docker services only"
	@echo "  make dev-down         - Stop Docker services"
	@echo "  make dev-logs         - Show Docker logs"
	@echo "  make dev-clean        - Clean Docker volumes and data"
	@echo ""
	@echo "Backend:"
	@echo "  make backend-dev      - Start backend in development mode"
	@echo "  make backend-build    - Build backend"
	@echo "  make backend-test     - Run backend tests"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint             - Lint all code"
	@echo "  make format           - Format all code"
	@echo "  make test             - Run all tests"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build     - Build Docker images"
	@echo "  make docker-up        - Start all services with Docker"
	@echo "  make docker-down      - Stop all Docker services"

# Installation
install:
	@echo "📦 Installing dependencies..."
	npm install
	cd src/backend && npm install

# Database migrations
migrate:
	@echo "🔄 Running database migrations..."
	cd src/backend && npm run migrate

# Development
dev: dev-up
	@echo "🚀 Starting development servers..."
	@echo "Backend will be available at http://localhost:3000"

dev-up:
	@echo "🐳 Starting Docker services..."
	docker-compose up -d
	@echo "⏳ Waiting for databases..."
	@sleep 5
	@echo "✅ Services ready!"

dev-down:
	@echo "🛑 Stopping Docker services..."
	docker-compose down

dev-logs:
	docker-compose logs -f

dev-clean:
	@echo "🧹 Cleaning Docker volumes..."
	docker-compose down -v
	@echo "✅ Cleanup complete!"

# Backend commands
backend-dev:
	@echo "🚀 Starting backend development server..."
	cd src/backend && npm run dev

backend-build:
	@echo "🏗️  Building backend..."
	cd src/backend && npm run build

backend-test:
	@echo "🧪 Running backend tests..."
	cd src/backend && npm run test

# Code quality
lint:
	@echo "🔍 Linting code..."
	npm run lint

format:
	@echo "✨ Formatting code..."
	npm run format

test:
	@echo "🧪 Running tests..."
	npm run test

# Docker commands
docker-build:
	@echo "🐳 Building Docker images..."
	docker-compose -f docker-compose.dev.yml build

docker-up:
	@echo "🐳 Starting all services with Docker..."
	docker-compose -f docker-compose.dev.yml up -d

docker-down:
	@echo "🛑 Stopping all Docker services..."
	docker-compose -f docker-compose.dev.yml down

# Database commands
db-studio:
	@echo "🎨 Opening Prisma Studio..."
	cd src/backend && npm run prisma:studio

db-reset:
	@echo "⚠️  Resetting database..."
	cd src/backend && npx prisma migrate reset

# Production build
build:
	@echo "🏗️  Building for production..."
	cd src/backend && npm run build
