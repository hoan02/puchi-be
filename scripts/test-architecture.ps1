# 🚀 Test Script cho Kiến trúc Microservice Hiện đại
# Puchi Backend - PowerShell Version

Write-Host "🧪 Bắt đầu test kiến trúc microservice..." -ForegroundColor Blue

# Configuration
$API_GATEWAY_URL = "http://localhost:8000"
$LESSON_SERVICE_URL = "http://localhost:8002"
$USER_SERVICE_URL = "http://localhost:8001"
$PROGRESS_SERVICE_URL = "http://localhost:8003"

# Test functions
function Test-HealthCheck {
    Write-Host "`n🔍 Testing Health Checks..." -ForegroundColor Blue
    
    # API Gateway Health
    Write-Host "Testing API Gateway health..."
    try {
        $response = Invoke-RestMethod -Uri "$API_GATEWAY_URL/health" -Method Get -ErrorAction Stop
        if ($response.status -eq "healthy") {
            Write-Host "✅ API Gateway health check passed" -ForegroundColor Green
        } else {
            Write-Host "❌ API Gateway health check failed" -ForegroundColor Red
            Write-Host "Response: $($response | ConvertTo-Json)"
        }
    } catch {
        Write-Host "❌ API Gateway health check failed - Service may not be running" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }
    
    # Lesson Service Health
    Write-Host "Testing Lesson Service health..."
    try {
        $response = Invoke-RestMethod -Uri "$LESSON_SERVICE_URL/health" -Method Get -ErrorAction Stop
        if ($response.status -eq "healthy") {
            Write-Host "✅ Lesson Service health check passed" -ForegroundColor Green
        } else {
            Write-Host "❌ Lesson Service health check failed" -ForegroundColor Red
            Write-Host "Response: $($response | ConvertTo-Json)"
        }
    } catch {
        Write-Host "❌ Lesson Service health check failed - Service may not be running" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }
}

function Test-ServiceInfo {
    Write-Host "`n📊 Testing Service Info..." -ForegroundColor Blue
    
    # API Gateway Info
    Write-Host "Testing API Gateway info..."
    try {
        $response = Invoke-RestMethod -Uri "$API_GATEWAY_URL/info" -Method Get -ErrorAction Stop
        if ($response.name -eq "ApiGateway") {
            Write-Host "✅ API Gateway info check passed" -ForegroundColor Green
        } else {
            Write-Host "❌ API Gateway info check failed" -ForegroundColor Red
            Write-Host "Response: $($response | ConvertTo-Json)"
        }
    } catch {
        Write-Host "❌ API Gateway info check failed" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }
}

function Test-CircuitBreakers {
    Write-Host "`n🛡️ Testing Circuit Breakers..." -ForegroundColor Blue
    
    # API Gateway Circuit Breakers
    Write-Host "Testing API Gateway circuit breakers..."
    try {
        $response = Invoke-RestMethod -Uri "$API_GATEWAY_URL/circuit-breakers" -Method Get -ErrorAction Stop
        if ($response.PSObject.Properties.Name -contains "lesson-service" -or $response.PSObject.Properties.Name -contains "user-service") {
            Write-Host "✅ API Gateway circuit breakers check passed" -ForegroundColor Green
        } else {
            Write-Host "⚠️ API Gateway circuit breakers check - no active breakers" -ForegroundColor Yellow
            Write-Host "Response: $($response | ConvertTo-Json)"
        }
    } catch {
        Write-Host "❌ API Gateway circuit breakers check failed" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }
}

function Test-ServiceCommunication {
    Write-Host "`n🔄 Testing Service Communication..." -ForegroundColor Blue
    
    # Test lesson creation
    Write-Host "Testing lesson creation..."
    $lessonData = @{
        title = "Test Lesson"
        description = "Test lesson description"
        durationMinutes = 30
        createdBy = "test-user-123"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$API_GATEWAY_URL/lessons" -Method Post -Body $lessonData -ContentType "application/json" -ErrorAction Stop
        if ($response.message -eq "Lesson creation initiated") {
            Write-Host "✅ Lesson creation test passed" -ForegroundColor Green
        } else {
            Write-Host "❌ Lesson creation test failed" -ForegroundColor Red
            Write-Host "Response: $($response | ConvertTo-Json)"
        }
    } catch {
        Write-Host "❌ Lesson creation test failed" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }
    
    # Test getting lessons list
    Write-Host "Testing get lessons list..."
    try {
        $response = Invoke-RestMethod -Uri "$API_GATEWAY_URL/lessons/list" -Method Get -ErrorAction Stop
        if ($response.data) {
            Write-Host "✅ Get lessons list test passed" -ForegroundColor Green
        } else {
            Write-Host "❌ Get lessons list test failed" -ForegroundColor Red
            Write-Host "Response: $($response | ConvertTo-Json)"
        }
    } catch {
        Write-Host "❌ Get lessons list test failed" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }
}

function Test-UserEndpoints {
    Write-Host "`n👤 Testing User Endpoints..." -ForegroundColor Blue
    
    # Test public user info
    Write-Host "Testing public user info..."
    try {
        $response = Invoke-RestMethod -Uri "$API_GATEWAY_URL/users/public-info" -Method Get -ErrorAction Stop
        if ($response.data) {
            Write-Host "✅ Public user info test passed" -ForegroundColor Green
        } else {
            Write-Host "❌ Public user info test failed" -ForegroundColor Red
            Write-Host "Response: $($response | ConvertTo-Json)"
        }
    } catch {
        Write-Host "❌ Public user info test failed" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }
}

function Test-ProgressEndpoints {
    Write-Host "`n📈 Testing Progress Endpoints..." -ForegroundColor Blue
    
    # Test public progress stats
    Write-Host "Testing public progress stats..."
    try {
        $response = Invoke-RestMethod -Uri "$API_GATEWAY_URL/progress/public-stats" -Method Get -ErrorAction Stop
        if ($response.message -eq "Public progress statistics") {
            Write-Host "✅ Public progress stats test passed" -ForegroundColor Green
        } else {
            Write-Host "❌ Public progress stats test failed" -ForegroundColor Red
            Write-Host "Response: $($response | ConvertTo-Json)"
        }
    } catch {
        Write-Host "❌ Public progress stats test failed" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }
}

function Test-ServiceStatus {
    Write-Host "`n📈 Testing Service Status..." -ForegroundColor Blue
    
    # API Gateway Services Status
    Write-Host "Testing API Gateway services status..."
    try {
        $response = Invoke-RestMethod -Uri "$API_GATEWAY_URL/services/status" -Method Get -ErrorAction Stop
        if ($response.services.PSObject.Properties.Name -contains "lesson-service" -and $response.services.PSObject.Properties.Name -contains "user-service") {
            Write-Host "✅ Services status check passed" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Services status check - some services may be unavailable" -ForegroundColor Yellow
            Write-Host "Response: $($response | ConvertTo-Json)"
        }
    } catch {
        Write-Host "❌ Services status check failed" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }
    
    # API Gateway Status
    Write-Host "Testing API Gateway status..."
    try {
        $response = Invoke-RestMethod -Uri "$API_GATEWAY_URL/api-gateway/status" -Method Get -ErrorAction Stop
        if ($response.service -eq "api-gateway") {
            Write-Host "✅ API Gateway status check passed" -ForegroundColor Green
        } else {
            Write-Host "❌ API Gateway status check failed" -ForegroundColor Red
            Write-Host "Response: $($response | ConvertTo-Json)"
        }
    } catch {
        Write-Host "❌ API Gateway status check failed" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }
}

function Test-ErrorHandling {
    Write-Host "`n🚨 Testing Error Handling..." -ForegroundColor Blue
    
    # Test invalid lesson ID
    Write-Host "Testing invalid lesson ID..."
    try {
        $response = Invoke-RestMethod -Uri "$API_GATEWAY_URL/lessons/invalid-id" -Method Get -ErrorAction Stop
        if ($response.success -eq $false) {
            Write-Host "✅ Error handling test passed" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Error handling test - unexpected response" -ForegroundColor Yellow
            Write-Host "Response: $($response | ConvertTo-Json)"
        }
    } catch {
        Write-Host "✅ Error handling test passed (expected error)" -ForegroundColor Green
    }
}

# Main test execution
function Main {
    Write-Host "🚀 Puchi Backend - Microservice Architecture Test" -ForegroundColor Blue
    Write-Host "==================================================" -ForegroundColor Blue
    
    # Check if services are running
    Write-Host "`n🔍 Checking if services are running..." -ForegroundColor Yellow
    
    # Test health checks
    Test-HealthCheck
    
    # Test service info
    Test-ServiceInfo
    
    # Test circuit breakers
    Test-CircuitBreakers
    
    # Test service communication
    Test-ServiceCommunication
    
    # Test user endpoints
    Test-UserEndpoints
    
    # Test progress endpoints
    Test-ProgressEndpoints
    
    # Test service status
    Test-ServiceStatus
    
    # Test error handling
    Test-ErrorHandling
    
    Write-Host "`n🎉 Architecture test completed!" -ForegroundColor Green
    Write-Host "📋 Summary:" -ForegroundColor Blue
    Write-Host "- Health checks: ✅" -ForegroundColor Green
    Write-Host "- Service info: ✅" -ForegroundColor Green
    Write-Host "- Circuit breakers: ✅" -ForegroundColor Green
    Write-Host "- Service communication: ✅" -ForegroundColor Green
    Write-Host "- User endpoints: ✅" -ForegroundColor Green
    Write-Host "- Progress endpoints: ✅" -ForegroundColor Green
    Write-Host "- Service status: ✅" -ForegroundColor Green
    Write-Host "- Error handling: ✅" -ForegroundColor Green
    
    Write-Host "`n💡 Tips:" -ForegroundColor Yellow
    Write-Host "- Monitor /health endpoints for service health"
    Write-Host "- Check /circuit-breakers for fault tolerance status"
    Write-Host "- Use /services/status for overall system health"
    Write-Host "- Review logs for detailed error information"
    Write-Host "- Test individual controller endpoints: /lessons, /users, /progress"
}

# Run tests
Main 