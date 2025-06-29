# 🚀 Start All Services Script
# Puchi Backend - PowerShell Version

Write-Host "🚀 Starting Puchi Backend Services..." -ForegroundColor Blue

# Configuration
$KAFKA_SCRIPT = ".\scripts\start-kafka.ps1"
$START_DEV_SCRIPT = "npm run start:dev"

# Colors
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Blue = "Blue"
$Cyan = "Cyan"

function Write-Status {
    param(
        [string]$Message,
        [string]$Status = "INFO"
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    switch ($Status) {
        "SUCCESS" { Write-Host "[$timestamp] ✅ $Message" -ForegroundColor $Green }
        "WARNING" { Write-Host "[$timestamp] ⚠️ $Message" -ForegroundColor $Yellow }
        "ERROR" { Write-Host "[$timestamp] ❌ $Message" -ForegroundColor $Red }
        "INFO" { Write-Host "[$timestamp] ℹ️ $Message" -ForegroundColor $Blue }
        "DEBUG" { Write-Host "[$timestamp] 🔍 $Message" -ForegroundColor $Cyan }
    }
}

function Test-Kafka {
    Write-Status "Testing Kafka connection..." "INFO"
    
    try {
        # Test if Kafka is running on default port
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect("localhost", 9092)
        $tcpClient.Close()
        Write-Status "Kafka is running on localhost:9092" "SUCCESS"
        return $true
    } catch {
        Write-Status "Kafka is not running on localhost:9092" "WARNING"
        return $false
    }
}

function Start-Kafka {
    Write-Status "Starting Kafka..." "INFO"
    
    if (Test-Path $KAFKA_SCRIPT) {
        try {
            & $KAFKA_SCRIPT
            Write-Status "Kafka started successfully" "SUCCESS"
            return $true
        } catch {
            Write-Status "Failed to start Kafka: $($_.Exception.Message)" "ERROR"
            return $false
        }
    } else {
        Write-Status "Kafka script not found: $KAFKA_SCRIPT" "ERROR"
        return $false
    }
}

function Test-NodeModules {
    Write-Status "Checking node_modules..." "INFO"
    
    if (Test-Path "node_modules") {
        Write-Status "node_modules found" "SUCCESS"
        return $true
    } else {
        Write-Status "node_modules not found, installing dependencies..." "WARNING"
        try {
            npm install
            Write-Status "Dependencies installed successfully" "SUCCESS"
            return $true
        } catch {
            Write-Status "Failed to install dependencies: $($_.Exception.Message)" "ERROR"
            return $false
        }
    }
}

function Test-Build {
    Write-Status "Checking if build is required..." "INFO"
    
    if (Test-Path "dist") {
        Write-Status "Build directory found" "SUCCESS"
        return $true
    } else {
        Write-Status "Build directory not found, building project..." "WARNING"
        try {
            npm run build
            Write-Status "Project built successfully" "SUCCESS"
            return $true
        } catch {
            Write-Status "Failed to build project: $($_.Exception.Message)" "ERROR"
            return $false
        }
    }
}

function Start-Services {
    Write-Status "Starting all services..." "INFO"
    
    try {
        # Start services in background
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; $START_DEV_SCRIPT" -WindowStyle Normal
        Write-Status "Services started in new window" "SUCCESS"
        return $true
    } catch {
        Write-Status "Failed to start services: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Show-ServiceInfo {
    Write-Host "`n📋 Service Information:" -ForegroundColor $Blue
    Write-Host "=====================" -ForegroundColor $Blue
    
    $services = @(
        @{ Name = "API Gateway"; Port = 8000; URL = "http://localhost:8000" },
        @{ Name = "User Service"; Port = 8001; URL = "http://localhost:8001" },
        @{ Name = "Lesson Service"; Port = 8002; URL = "http://localhost:8002" },
        @{ Name = "Progress Service"; Port = 8003; URL = "http://localhost:8003" },
        @{ Name = "Media Service"; Port = 8004; URL = "http://localhost:8004" },
        @{ Name = "Notification Service"; Port = 8005; URL = "http://localhost:8005" },
        @{ Name = "Vocabulary Service"; Port = 8006; URL = "http://localhost:8006" },
        @{ Name = "Quiz Service"; Port = 8007; URL = "http://localhost:8007" },
        @{ Name = "Analytics Service"; Port = 8008; URL = "http://localhost:8008" }
    )
    
    foreach ($service in $services) {
        Write-Host "🔹 $($service.Name): $($service.URL)" -ForegroundColor $Cyan
    }
    
    Write-Host "`n🔧 Useful Commands:" -ForegroundColor $Blue
    Write-Host "==================" -ForegroundColor $Blue
    Write-Host "🔍 Test Communication: .\scripts\test-microservice-communication.ps1" -ForegroundColor $Cyan
    Write-Host "📊 Health Check: curl http://localhost:8000/health" -ForegroundColor $Cyan
    Write-Host "👤 User Service: curl http://localhost:8000/users/public-info" -ForegroundColor $Cyan
    Write-Host "📚 Lesson Service: curl http://localhost:8000/lessons/public-list" -ForegroundColor $Cyan
    Write-Host "📈 Progress Service: curl http://localhost:8000/progress/public-stats" -ForegroundColor $Cyan
}

function Main {
    Write-Host "🚀 Puchi Backend - Service Startup" -ForegroundColor $Blue
    Write-Host "==================================" -ForegroundColor $Blue
    
    # Check prerequisites
    Write-Status "Checking prerequisites..." "INFO"
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Status "Node.js version: $nodeVersion" "SUCCESS"
    } catch {
        Write-Status "Node.js not found. Please install Node.js first." "ERROR"
        return
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Status "npm version: $npmVersion" "SUCCESS"
    } catch {
        Write-Status "npm not found. Please install npm first." "ERROR"
        return
    }
    
    # Check dependencies
    if (-not (Test-NodeModules)) {
        return
    }
    
    # Check build
    if (-not (Test-Build)) {
        return
    }
    
    # Check Kafka
    if (-not (Test-Kafka)) {
        Write-Status "Attempting to start Kafka..." "INFO"
        if (-not (Start-Kafka)) {
            Write-Status "Please start Kafka manually or check the Kafka script." "WARNING"
        }
    }
    
    # Start services
    if (Start-Services) {
        Write-Status "All services started successfully!" "SUCCESS"
        Show-ServiceInfo
        
        Write-Host "`n💡 Tips:" -ForegroundColor $Yellow
        Write-Host "- Services are running in a new PowerShell window" -ForegroundColor $Yellow
        Write-Host "- Check the new window for service logs" -ForegroundColor $Yellow
        Write-Host "- Use Ctrl+C in the service window to stop all services" -ForegroundColor $Yellow
        Write-Host "- Run the test script to verify communication" -ForegroundColor $Yellow
        
        Write-Host "`n🎉 Happy coding!" -ForegroundColor $Green
    } else {
        Write-Status "Failed to start services. Please check the logs." "ERROR"
    }
}

# Run main function
Main 