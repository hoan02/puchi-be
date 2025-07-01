#!/bin/bash

services=(
  api-gateway
  user-service
  lesson-service
  progress-service
  media-service
  notification-service
  vocabulary-service
  quiz-service
  analytics-service
)

for svc in "${services[@]}"; do
  echo "Building $svc..."
  docker build -t yourrepo/$svc:latest -f apps/$svc/Dockerfile apps/$svc
  docker push yourrepo/$svc:latest
done 