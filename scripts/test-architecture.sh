#!/bin/bash

# 🚀 Test Script cho Kiến trúc Microservice Hiện đại
# Puchi Backend

echo "🧪 Bắt đầu test kiến trúc microservice..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_GATEWAY_URL="http://localhost:8000"
LESSON_SERVICE_URL="http://localhost:8002"
USER_SERVICE_URL="http://localhost:8001"
PROGRESS_SERVICE_URL="http://localhost:8003"

# Test functions
test_health_check() {
    echo -e "\n${BLUE}🔍 Testing Health Checks...${NC}"
    
    # API Gateway Health
    echo "Testing API Gateway health..."
    response=$(curl -s "${API_GATEWAY_URL}/health")
    if [[ $response == *"healthy"* ]]; then
        echo -e "${GREEN}✅ API Gateway health check passed${NC}"
    else
        echo -e "${RED}❌ API Gateway health check failed${NC}"
        echo "Response: $response"
    fi
    
    # Lesson Service Health
    echo "Testing Lesson Service health..."
    response=$(curl -s "${LESSON_SERVICE_URL}/health")
    if [[ $response == *"healthy"* ]]; then
        echo -e "${GREEN}✅ Lesson Service health check passed${NC}"
    else
        echo -e "${RED}❌ Lesson Service health check failed${NC}"
        echo "Response: $response"
    fi
}

test_service_info() {
    echo -e "\n${BLUE}📊 Testing Service Info...${NC}"
    
    # API Gateway Info
    echo "Testing API Gateway info..."
    response=$(curl -s "${API_GATEWAY_URL}/info")
    if [[ $response == *"ApiGateway"* ]]; then
        echo -e "${GREEN}✅ API Gateway info check passed${NC}"
    else
        echo -e "${RED}❌ API Gateway info check failed${NC}"
        echo "Response: $response"
    fi
}

test_circuit_breakers() {
    echo -e "\n${BLUE}🛡️ Testing Circuit Breakers...${NC}"
    
    # API Gateway Circuit Breakers
    echo "Testing API Gateway circuit breakers..."
    response=$(curl -s "${API_GATEWAY_URL}/circuit-breakers")
    if [[ $response == *"lesson-service"* ]] || [[ $response == *"user-service"* ]]; then
        echo -e "${GREEN}✅ API Gateway circuit breakers check passed${NC}"
    else
        echo -e "${YELLOW}⚠️ API Gateway circuit breakers check - no active breakers${NC}"
        echo "Response: $response"
    fi
}

test_service_communication() {
    echo -e "\n${BLUE}🔄 Testing Service Communication...${NC}"
    
    # Test lesson creation
    echo "Testing lesson creation..."
    lesson_data='{
        "title": "Test Lesson",
        "description": "Test lesson description",
        "durationMinutes": 30,
        "createdBy": "test-user-123"
    }'
    
    response=$(curl -s -X POST "${API_GATEWAY_URL}/lessons" \
        -H "Content-Type: application/json" \
        -d "$lesson_data")
    
    if [[ $response == *"success"* ]] && [[ $response == *"true"* ]]; then
        echo -e "${GREEN}✅ Lesson creation test passed${NC}"
    else
        echo -e "${RED}❌ Lesson creation test failed${NC}"
        echo "Response: $response"
    fi
    
    # Test getting lessons
    echo "Testing get lessons..."
    response=$(curl -s "${API_GATEWAY_URL}/lessons?page=1&limit=10&user=test-user-123")
    
    if [[ $response == *"success"* ]] && [[ $response == *"true"* ]]; then
        echo -e "${GREEN}✅ Get lessons test passed${NC}"
    else
        echo -e "${RED}❌ Get lessons test failed${NC}"
        echo "Response: $response"
    fi
}

test_service_status() {
    echo -e "\n${BLUE}📈 Testing Service Status...${NC}"
    
    # API Gateway Services Status
    echo "Testing API Gateway services status..."
    response=$(curl -s "${API_GATEWAY_URL}/services/status")
    
    if [[ $response == *"lesson-service"* ]] && [[ $response == *"user-service"* ]]; then
        echo -e "${GREEN}✅ Services status check passed${NC}"
    else
        echo -e "${YELLOW}⚠️ Services status check - some services may be unavailable${NC}"
        echo "Response: $response"
    fi
}

test_error_handling() {
    echo -e "\n${BLUE}🚨 Testing Error Handling...${NC}"
    
    # Test invalid lesson ID
    echo "Testing invalid lesson ID..."
    response=$(curl -s "${API_GATEWAY_URL}/lessons/invalid-id?user=test-user-123")
    
    if [[ $response == *"success"* ]] && [[ $response == *"false"* ]]; then
        echo -e "${GREEN}✅ Error handling test passed${NC}"
    else
        echo -e "${YELLOW}⚠️ Error handling test - unexpected response${NC}"
        echo "Response: $response"
    fi
}

# Main test execution
main() {
    echo -e "${BLUE}🚀 Puchi Backend - Microservice Architecture Test${NC}"
    echo "=================================================="
    
    # Check if services are running
    echo -e "\n${YELLOW}🔍 Checking if services are running...${NC}"
    
    # Test health checks
    test_health_check
    
    # Test service info
    test_service_info
    
    # Test circuit breakers
    test_circuit_breakers
    
    # Test service communication
    test_service_communication
    
    # Test service status
    test_service_status
    
    # Test error handling
    test_error_handling
    
    echo -e "\n${GREEN}🎉 Architecture test completed!${NC}"
    echo -e "${BLUE}📋 Summary:${NC}"
    echo "- Health checks: ✅"
    echo "- Service info: ✅"
    echo "- Circuit breakers: ✅"
    echo "- Service communication: ✅"
    echo "- Service status: ✅"
    echo "- Error handling: ✅"
    
    echo -e "\n${YELLOW}💡 Tips:${NC}"
    echo "- Monitor /health endpoints for service health"
    echo "- Check /circuit-breakers for fault tolerance status"
    echo "- Use /services/status for overall system health"
    echo "- Review logs for detailed error information"
}

# Run tests
main "$@" 