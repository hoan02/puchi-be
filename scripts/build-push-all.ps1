# Build and Push All Services Script (PowerShell)
# Usage: .\build-push-all.ps1 [version] [registry]

param(
    [string]$Version = "v1.0.0",
    [string]$Registry = "hoanit"
)

$ErrorActionPreference = "Stop"

# Services configuration
$services = @(
    @{Name="api-gateway"; Port=8000; GrpcPort=0},
    @{Name="user-service"; Port=8001; GrpcPort=50051},
    @{Name="lesson-service"; Port=8002; GrpcPort=50052},
    @{Name="progress-service"; Port=8003; GrpcPort=50053},
    @{Name="media-service"; Port=8004; GrpcPort=50055},
    @{Name="notification-service"; Port=8005; GrpcPort=50054},
    @{Name="vocabulary-service"; Port=8006; GrpcPort=50057},
    @{Name="quiz-service"; Port=8007; GrpcPort=50056},
    @{Name="analytics-service"; Port=8008; GrpcPort=50058}
)

Write-Host "🚀 Starting build and push process..." -ForegroundColor Green
Write-Host "Version: $Version" -ForegroundColor Yellow
Write-Host "Registry: $Registry" -ForegroundColor Yellow
Write-Host ""

# Check if Docker is running
try {
    docker version | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Build and push each service
foreach ($svc in $services) {
    $serviceName = $svc.Name
    $imageName = "$Registry/$serviceName"
    $imageTag = "$imageName`:$Version"
    $dockerfilePath = "apps/$serviceName/Dockerfile"
    
    Write-Host "🔨 Building $serviceName..." -ForegroundColor Cyan
    
    # Check if Dockerfile exists
    if (-not (Test-Path $dockerfilePath)) {
        Write-Host "⚠️  Dockerfile not found for $serviceName, skipping..." -ForegroundColor Yellow
        continue
    }
    
    try {
        # Build image from service context
        Write-Host "  📦 Building image: $imageTag"
        docker build -t $imageTag -f $dockerfilePath "apps/$serviceName"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Build successful" -ForegroundColor Green
            
            # Push image
            Write-Host "  📤 Pushing to registry..."
            docker push $imageTag
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Push successful" -ForegroundColor Green
            } else {
                Write-Host "  ❌ Push failed" -ForegroundColor Red
            }
        } else {
            Write-Host "  ❌ Build failed" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "🎉 Build and push process completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Yellow
Write-Host "  Registry: $Registry"
Write-Host "  Version: $Version"
Write-Host "  Services: $($services.Count)"
Write-Host ""
Write-Host "💡 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Update Kubernetes manifests with new version: $Version"
Write-Host "  2. Deploy to Kubernetes: kubectl apply -f k8s/"
Write-Host "  3. Check deployment status: kubectl get pods" 