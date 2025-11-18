#!/bin/bash

# HomePlatform Development Environment Script

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════╗"
echo "║   HomePlatform Development Setup      ║"
echo "╔═══════════════════════════════════════╗"
echo -e "${NC}"

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_success "Docker and Docker Compose are installed"

# Navigate to project root
cd "$(dirname "$0")/.."

# Function to start services
start_services() {
    print_info "Starting development environment..."

    # Start infrastructure services
    docker-compose up -d

    print_success "Infrastructure services started"
    print_info "Waiting for databases to be ready..."

    # Wait for PostgreSQL
    until docker exec homeplatform-postgres pg_isready -U homeplatform > /dev/null 2>&1; do
        echo -n "."
        sleep 1
    done

    print_success "PostgreSQL is ready"

    # Check if we need to run migrations
    if [ ! -d "src/backend/prisma/migrations" ]; then
        print_warning "No migrations found. Running initial migration..."
        cd src/backend
        npm run migrate
        cd ../..
    fi

    print_success "Development environment is ready!"
    echo ""
    print_info "Services running:"
    echo "  • PostgreSQL:    http://localhost:5432"
    echo "  • Redis:         http://localhost:6379"
    echo "  • TimescaleDB:   http://localhost:5433"
    echo "  • RabbitMQ UI:   http://localhost:15672"
    echo "  • MinIO Console: http://localhost:9001"
    echo ""
    print_info "To start the backend API:"
    echo "  cd src/backend && npm run dev"
    echo ""
    print_info "To view logs:"
    echo "  docker-compose logs -f"
}

# Function to stop services
stop_services() {
    print_info "Stopping development environment..."
    docker-compose down
    print_success "Development environment stopped"
}

# Function to restart services
restart_services() {
    print_info "Restarting development environment..."
    docker-compose restart
    print_success "Development environment restarted"
}

# Function to show logs
show_logs() {
    docker-compose logs -f
}

# Function to clean everything
clean_all() {
    print_warning "This will remove all containers, volumes, and data. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_info "Cleaning development environment..."
        docker-compose down -v
        print_success "Development environment cleaned"
    else
        print_info "Clean cancelled"
    fi
}

# Function to show status
show_status() {
    print_info "Service status:"
    docker-compose ps
}

# Main menu
case "${1}" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    clean)
        clean_all
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|status|clean}"
        echo ""
        echo "Commands:"
        echo "  start    - Start development environment"
        echo "  stop     - Stop development environment"
        echo "  restart  - Restart development environment"
        echo "  logs     - Show and follow logs"
        echo "  status   - Show service status"
        echo "  clean    - Remove all containers and volumes"
        exit 1
        ;;
esac
