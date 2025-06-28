#!/bin/bash

echo "🚀 Setting up Kafka Infrastructure..."

# Step 1: Start Kafka infrastructure
echo "🔧 Starting Kafka infrastructure..."
docker-compose up -d zookeeper kafka kafka-ui

# Wait for Kafka to be ready
echo "⏳ Waiting for Kafka to be ready..."
sleep 30

# Step 2: Create Kafka topics
echo "📝 Creating Kafka topics..."
docker exec kafka kafka-topics --create --topic user-learning-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
docker exec kafka kafka-topics --create --topic lesson-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
docker exec kafka kafka-topics --create --topic progress-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
docker exec kafka kafka-topics --create --topic analytics-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
docker exec kafka kafka-topics --create --topic user-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
docker exec kafka kafka-topics --create --topic media-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
docker exec kafka kafka-topics --create --topic notification-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
docker exec kafka kafka-topics --create --topic vocabulary-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
docker exec kafka kafka-topics --create --topic quiz-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1

# Step 3: Build and start services
echo "🔨 Building services..."
npm run build

# Step 4: Start services in order
echo "🚀 Starting services..."
echo "Starting Analytics Service..."
npm run dev:analytics &
ANALYTICS_PID=$!

sleep 5

echo "Starting API Gateway..."
npm run dev:gateway &
GATEWAY_PID=$!

sleep 5

echo "Starting other services..."
npm run dev:core &
CORE_PID=$!

sleep 5

npm run dev:feature &
FEATURE_PID=$!

# Step 5: Health check
echo "🏥 Performing health checks..."
sleep 10

# Check if services are running
if curl -f http://localhost:8008/health > /dev/null 2>&1; then
    echo "✅ Analytics Service is healthy"
else
    echo "❌ Analytics Service health check failed"
fi

if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ API Gateway is healthy"
else
    echo "❌ API Gateway health check failed"
fi

echo "🎉 Kafka setup completed!"
echo "📊 Kafka UI available at: http://localhost:8080"

# Keep script running
echo "Press Ctrl+C to stop all services"
trap "echo 'Stopping services...'; kill $ANALYTICS_PID $GATEWAY_PID $CORE_PID $FEATURE_PID; exit" INT
wait 