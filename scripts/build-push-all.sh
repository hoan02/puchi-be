#!/bin/bash

# Build and Push All Services Script (Bash)
# Usage: ./build-push-all.sh [version] [registry]

set -e

# Default values
VERSION=${1:-"v1.0.0"}
REGISTRY=${2:-"hoanit"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Services configuration
declare -A services=(
    ["api-gateway"]="8000:0"
    ["user-service"]="8001:50051"
    ["lesson-service"]="8002:50052"
    ["progress-service"]="8003:50053"
    ["media-service"]="8004:50055"
    ["notification-service"]="8005:50054"
    ["vocabulary-service"]="8006:50057"
    ["quiz-service"]="8007:50056"
    ["analytics-service"]="8008:50058"
)

echo -e "${GREEN}🚀 Starting build and push process...${NC}"
echo -e "${YELLOW}Version: $VERSION${NC}"
echo -e "${YELLOW}Registry: $REGISTRY${NC}"
echo ""

# Check if Docker is running
if ! docker version > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"

# Build and push each service
for service_name in "${!services[@]}"; do
    ports="${services[$service_name]}"
    http_port=$(echo $ports | cut -d: -f1)
    grpc_port=$(echo $ports | cut -d: -f2)
    
    image_name="$REGISTRY/$service_name"
    image_tag="$image_name:$VERSION"
    dockerfile_path="apps/$service_name/Dockerfile"
    context_path="apps/$service_name"
    
    echo -e "${CYAN}🔨 Building $service_name...${NC}"
    echo "  HTTP Port: $http_port"
    if [ "$grpc_port" != "0" ]; then
        echo "  gRPC Port: $grpc_port"
    fi
    
    # Check if Dockerfile exists
    if [ ! -f "$dockerfile_path" ]; then
        echo -e "${YELLOW}⚠️  Dockerfile not found for $service_name, skipping...${NC}"
        continue
    fi
    
    # Build image
    echo "  📦 Building image: $image_tag"
    if docker build -t "$image_tag" -f "$dockerfile_path" "$context_path"; then
        echo -e "  ${GREEN}✅ Build successful${NC}"
        
        # Push image
        echo "  📤 Pushing to registry..."
        if docker push "$image_tag"; then
            echo -e "  ${GREEN}✅ Push successful${NC}"
        else
            echo -e "  ${RED}❌ Push failed${NC}"
        fi
    else
        echo -e "  ${RED}❌ Build failed${NC}"
    fi
    
    echo ""
done

echo -e "${GREEN}🎉 Build and push process completed!${NC}"
echo ""
echo -e "${YELLOW}📋 Summary:${NC}"
echo "  Registry: $REGISTRY"
echo "  Version: $VERSION"
echo "  Services: ${#services[@]}"
echo ""
echo -e "${CYAN}💡 Next steps:${NC}"
echo "  1. Update Kubernetes manifests with new version: $VERSION"
echo "  2. Deploy to Kubernetes: kubectl apply -f k8s/"
echo "  3. Check deployment status: kubectl get pods" 