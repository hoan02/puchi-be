Write-Host "🚀 Setting up Kafka Infrastructure..." -ForegroundColor Green

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

# Step 3: Build and start services
Write-Host "🔨 Building services..." -ForegroundColor Blue
npm run build

# Step 4: Start services in order
Write-Host "🚀 Starting services..." -ForegroundColor Blue

Write-Host "Starting Analytics Service..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run", "dev:analytics"

Start-Sleep -Seconds 5

Write-Host "Starting API Gateway..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run", "dev:gateway"

Start-Sleep -Seconds 5

Write-Host "Starting other services..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run", "dev:core"

Start-Sleep -Seconds 5

Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run", "dev:feature"

# Step 5: Health check
Write-Host "🏥 Performing health checks..." -ForegroundColor Blue
Start-Sleep -Seconds 10

# Check if services are running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8008/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Analytics Service is healthy" -ForegroundColor Green
} catch {
    Write-Host "❌ Analytics Service health check failed" -ForegroundColor Red
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ API Gateway is healthy" -ForegroundColor Green
} catch {
    Write-Host "❌ API Gateway health check failed" -ForegroundColor Red
}

Write-Host "🎉 Kafka setup completed!" -ForegroundColor Green
Write-Host "📊 Kafka UI available at: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow

# Keep script running
while ($true) {
    Start-Sleep -Seconds 1
} 