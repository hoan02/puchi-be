#!/bin/bash

echo "🚀 Starting Kafka Infrastructure..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    echo "💡 On Windows, start Docker Desktop from the Start menu"
    exit 1
fi

echo "✅ Docker is running"

# Step 1: Start Kafka infrastructure
echo "🔧 Starting Kafka infrastructure..."
docker-compose up -d zookeeper kafka kafka-ui

# Wait for Kafka to be ready
echo "⏳ Waiting for Kafka to be ready..."
sleep 30

# Step 2: Create Kafka topics
echo "📝 Creating Kafka topics..."
docker exec kafka kafka-topics --create --topic user-learning-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 2>/dev/null || echo "Topic user-learning-events already exists"
docker exec kafka kafka-topics --create --topic lesson-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 2>/dev/null || echo "Topic lesson-events already exists"
docker exec kafka kafka-topics --create --topic progress-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 2>/dev/null || echo "Topic progress-events already exists"
docker exec kafka kafka-topics --create --topic analytics-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 2>/dev/null || echo "Topic analytics-events already exists"
docker exec kafka kafka-topics --create --topic user-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 2>/dev/null || echo "Topic user-events already exists"
docker exec kafka kafka-topics --create --topic media-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 2>/dev/null || echo "Topic media-events already exists"
docker exec kafka kafka-topics --create --topic notification-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 2>/dev/null || echo "Topic notification-events already exists"
docker exec kafka kafka-topics --create --topic vocabulary-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 2>/dev/null || echo "Topic vocabulary-events already exists"
docker exec kafka kafka-topics --create --topic quiz-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 2>/dev/null || echo "Topic quiz-events already exists"

echo "🎉 Kafka setup completed!"
echo "📊 Kafka UI available at: http://localhost:8080"
echo "🔍 List topics: npm run kafka:topics" 