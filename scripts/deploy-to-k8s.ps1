# Deploy to Kubernetes Script
# Usage: .\scripts\deploy-to-k8s.ps1

param(
    [string]$DockerUsername = "hoanit",
    [switch]$SkipBuild,
    [switch]$SkipPush,
    [switch]$SkipInfra,
    [switch]$SkipServices
)

Write-Host "🚀 Starting Kubernetes Deployment..." -ForegroundColor Green

# Check if kubectl is available
try {
    kubectl version --client | Out-Null
    Write-Host "✅ kubectl is available" -ForegroundColor Green
} catch {
    Write-Host "❌ kubectl is not available. Please install kubectl first." -ForegroundColor Red
    exit 1
}

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check cluster status
Write-Host "🔍 Checking cluster status..." -ForegroundColor Blue
try {
    kubectl cluster-info | Out-Null
    Write-Host "✅ Cluster is accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Cannot connect to cluster. Please start minikube or configure kubectl." -ForegroundColor Red
    Write-Host "💡 Run: minikube start" -ForegroundColor Yellow
    exit 1
}

# Build Docker images
if (-not $SkipBuild) {
    Write-Host "🔨 Building Docker images..." -ForegroundColor Blue
    
    $services = @(
        "api-gateway",
        "user-service", 
        "lesson-service",
        "progress-service",
        "media-service",
        "notification-service",
        "vocabulary-service",
        "quiz-service",
        "analytics-service"
    )
    
    foreach ($service in $services) {
        Write-Host "Building $service..." -ForegroundColor Yellow
        docker build -f "apps/$service/Dockerfile" -t "$service:latest" .
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to build $service" -ForegroundColor Red
            exit 1
        }
    }
    
    Write-Host "✅ All images built successfully" -ForegroundColor Green
}

# Push images to Docker Hub
if (-not $SkipPush) {
    Write-Host "📤 Pushing images to Docker Hub..." -ForegroundColor Blue
    
    $services = @(
        "api-gateway",
        "user-service", 
        "lesson-service",
        "progress-service",
        "media-service",
        "notification-service",
        "vocabulary-service",
        "quiz-service",
        "analytics-service"
    )
    
    foreach ($service in $services) {
        Write-Host "Pushing $service..." -ForegroundColor Yellow
        docker tag "$service:latest" "$DockerUsername/$service:latest"
        docker push "$DockerUsername/$service:latest"
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to push $service" -ForegroundColor Red
            exit 1
        }
    }
    
    Write-Host "✅ All images pushed successfully" -ForegroundColor Green
}

# Deploy infrastructure
if (-not $SkipInfra) {
    Write-Host "🏗️ Deploying infrastructure..." -ForegroundColor Blue
    
    Write-Host "Deploying Kafka, Zookeeper, and databases..." -ForegroundColor Yellow
    kubectl apply -f k8s/puchi-infra.yaml
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to deploy infrastructure" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Creating Kafka topics..." -ForegroundColor Yellow
    kubectl apply -f k8s/create-kafka-topics.yaml
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create Kafka topics" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "⏳ Waiting for infrastructure to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 60
    
    Write-Host "✅ Infrastructure deployed successfully" -ForegroundColor Green
}

# Deploy services
if (-not $SkipServices) {
    Write-Host "🚀 Deploying services..." -ForegroundColor Blue
    
    kubectl apply -f k8s/puchi-services.yaml
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to deploy services" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    Write-Host "✅ Services deployed successfully" -ForegroundColor Green
}

# Check deployment status
Write-Host "📊 Checking deployment status..." -ForegroundColor Blue

Write-Host "`n📋 Pod Status:" -ForegroundColor Cyan
kubectl get pods

Write-Host "`n🌐 Services:" -ForegroundColor Cyan
kubectl get svc

Write-Host "`n🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "`n🔗 To access API Gateway:" -ForegroundColor Yellow
Write-Host "   kubectl port-forward service/api-gateway 8000:8000" -ForegroundColor White
Write-Host "   Then open: http://localhost:8000/api" -ForegroundColor White

Write-Host "`n📝 Useful commands:" -ForegroundColor Yellow
Write-Host "   kubectl get pods" -ForegroundColor White
Write-Host "   kubectl logs <pod-name>" -ForegroundColor White
Write-Host "   kubectl describe pod <pod-name>" -ForegroundColor White
Write-Host "   kubectl delete pod <pod-name>  # Restart pod" -ForegroundColor White 