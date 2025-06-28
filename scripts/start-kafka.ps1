Write-Host "🚀 Starting Kafka Infrastructure..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    Write-Host "💡 On Windows, start Docker Desktop from the Start menu" -ForegroundColor Yellow
    exit 1
}

# Step 1: Start Kafka infrastructure
Write-Host "🔧 Starting Kafka infrastructure..." -ForegroundColor Blue
docker-compose up -d zookeeper kafka kafka-ui

# Wait for Kafka to be ready
Write-Host "⏳ Waiting for Kafka to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Step 2: Create Kafka topics
Write-Host "📝 Creating Kafka topics..." -ForegroundColor Blue

$topics = @(
    "user-learning-events",
    "lesson-events", 
    "progress-events",
    "analytics-events",
    "user-events",
    "media-events",
    "notification-events",
    "vocabulary-events",
    "quiz-events"
)

foreach ($topic in $topics) {
    try {
        docker exec kafka kafka-topics --create --topic $topic --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 2>$null
        Write-Host "✅ Created topic: $topic" -ForegroundColor Green
    } catch {
        Write-Host "ℹ️  Topic $topic already exists" -ForegroundColor Cyan
    }
}

Write-Host "🎉 Kafka setup completed!" -ForegroundColor Green
Write-Host "📊 Kafka UI available at: http://localhost:8080" -ForegroundColor Cyan
Write-Host "🔍 List topics: npm run kafka:topics" -ForegroundColor Cyan 