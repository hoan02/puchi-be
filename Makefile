.PHONY: help install dev build test lint clean docker-up docker-down db-setup db-seed

# Default target
help:
	@echo "Available commands:"
	@echo "  install     - Install dependencies"
	@echo "  dev         - Start development servers"
	@echo "  build       - Build all services"
	@echo "  test        - Run tests"
	@echo "  lint        - Run linting"
	@echo "  clean       - Clean cache and build files"
	@echo "  docker-up   - Start RabbitMQ"
	@echo "  docker-down - Stop RabbitMQ"
	@echo "  db-setup    - Setup database (generate, migrate, seed)"
	@echo "  db-seed     - Seed database with sample data"

# Install dependencies
install:
	npm install

# Start development servers
dev:
	npm run dev

# Build all services
build:
	npm run build

# Run tests
test:
	npm run test

# Run linting
lint:
	npm run lint

# Clean cache and build files
clean:
	npm run clean

# Start RabbitMQ
docker-up:
	npm run docker:up

# Stop RabbitMQ
docker-down:
	npm run docker:down

# Setup database
db-setup:
	npm run db:generate
	npm run db:migrate
	npm run db:seed

# Seed database
db-seed:
	npm run db:seed

# Quick start (install, docker, db-setup, dev)
quick-start: install docker-up db-setup dev 