# 🚀 Kubernetes Deployment Guide

## 📋 Tổng quan

Hướng dẫn chi tiết deploy hệ thống microservice Puchi Backend lên Kubernetes (Minikube hoặc cluster thật).

---

## 🛠️ Chuẩn bị

### 1. Cài đặt công cụ cần thiết

```bash
# Kubernetes CLI
kubectl

# Minikube (cho development local)
minikube

# Docker
docker
```

### 2. Khởi động cluster

```bash
# Với Minikube
minikube start

# Kiểm tra cluster
kubectl cluster-info
kubectl get nodes
```

---

## 🔨 Bước 1: Build Docker Images

### Build tất cả services

```bash
# Từ thư mục gốc dự án
docker build -f apps/api-gateway/Dockerfile -t api-gateway:latest .
docker build -f apps/user-service/Dockerfile -t user-service:latest .
docker build -f apps/lesson-service/Dockerfile -t lesson-service:latest .
docker build -f apps/progress-service/Dockerfile -t progress-service:latest .
docker build -f apps/media-service/Dockerfile -t media-service:latest .
docker build -f apps/notification-service/Dockerfile -t notification-service:latest .
docker build -f apps/vocabulary-service/Dockerfile -t vocabulary-service:latest .
docker build -f apps/quiz-service/Dockerfile -t quiz-service:latest .
docker build -f apps/analytics-service/Dockerfile -t analytics-service:latest .
```

### Push lên Docker Registry (cho production)

```bash
# Tag với username Docker Hub
docker tag api-gateway:latest <username>/api-gateway:latest
docker tag user-service:latest <username>/user-service:latest
# ... lặp lại cho các service khác

# Push lên Docker Hub
docker push <username>/api-gateway:latest
docker push <username>/user-service:latest
# ... lặp lại cho các service khác
```

---

## 🏗️ Bước 2: Deploy Hạ Tầng

### 1. Deploy Kafka, Zookeeper, Database

```bash
kubectl apply -f k8s/puchi-infra.yaml
```

**Kiểm tra:**

```bash
kubectl get pods
kubectl get svc
```

### 2. Tạo Kafka Topics

```bash
kubectl apply -f k8s/create-kafka-topics.yaml
```

**Kiểm tra:**

```bash
kubectl get jobs
kubectl logs create-kafka-topics-<pod-name>
```

---

## 🚀 Bước 3: Deploy Services

### 1. Deploy tất cả services

```bash
kubectl apply -f k8s/puchi-services.yaml
```

### 2. Kiểm tra trạng thái

```bash
kubectl get pods
kubectl get svc
```

### 3. Kiểm tra log nếu có lỗi

```bash
kubectl logs <pod-name>
kubectl describe pod <pod-name>
```

---

## 🔧 Bước 4: Cấu Hình và Test

### 1. Port-forward để truy cập API Gateway

```bash
kubectl port-forward service/api-gateway 8000:8000
```

### 2. Test API

```bash
# Health check
curl http://localhost:8000/api/health

# Service status
curl http://localhost:8000/api/services/status
```

### 3. Với Minikube

```bash
minikube service api-gateway
```

---

## 🐛 Troubleshooting

### 1. ImagePullBackOff

**Nguyên nhân:** Kubernetes không tìm thấy image.

**Giải pháp:**

- Với Minikube: Build image trong môi trường Minikube
- Với cluster thật: Push image lên registry và sửa manifest

### 2. Kafka Connection Error

**Nguyên nhân:** Topics chưa được tạo hoặc Kafka chưa sẵn sàng.

**Giải pháp:**

```bash
# Tạo lại topics
kubectl apply -f k8s/create-kafka-topics.yaml

# Restart service
kubectl delete pod <pod-name>
```

### 3. Database Connection Error

**Nguyên nhân:** Database chưa sẵn sàng hoặc thông tin kết nối sai.

**Giải pháp:**

```bash
# Kiểm tra database pod
kubectl get pods | grep db

# Kiểm tra log database
kubectl logs <db-pod-name>
```

---

## 📊 Monitoring và Logging

### 1. Kiểm tra trạng thái hệ thống

```bash
# Pods
kubectl get pods

# Services
kubectl get svc

# Events
kubectl get events

# Resource usage
kubectl top pods
```

### 2. Logs

```bash
# Log của pod cụ thể
kubectl logs <pod-name>

# Log với follow
kubectl logs -f <pod-name>

# Log của deployment
kubectl logs deployment/<deployment-name>
```

### 3. Debug

```bash
# Chi tiết pod
kubectl describe pod <pod-name>

# Exec vào container
kubectl exec -it <pod-name> -- /bin/bash

# Port-forward cho debug
kubectl port-forward <pod-name> <local-port>:<container-port>
```

---

## 🔄 CI/CD Pipeline

### 1. GitHub Actions (ví dụ)

```yaml
name: Deploy to Kubernetes

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Build and push images
        run: |
          docker build -f apps/api-gateway/Dockerfile -t ${{ secrets.DOCKER_USERNAME }}/api-gateway:${{ github.sha }} .
          docker push ${{ secrets.DOCKER_USERNAME }}/api-gateway:${{ github.sha }}

      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/api-gateway api-gateway=${{ secrets.DOCKER_USERNAME }}/api-gateway:${{ github.sha }}
```

### 2. Helm Charts (tùy chọn)

Tạo Helm charts để quản lý deployment dễ dàng hơn.

---

## 🚀 Production Deployment

### 1. Cluster Production

- **GKE (Google Kubernetes Engine)**
- **EKS (Amazon Elastic Kubernetes Service)**
- **AKS (Azure Kubernetes Service)**
- **Self-hosted cluster**

### 2. Cấu hình Production

```yaml
# Tăng replicas
replicas: 3

# Resource limits
resources:
  requests:
    memory: '256Mi'
    cpu: '250m'
  limits:
    memory: '512Mi'
    cpu: '500m'

# Health checks
livenessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 5
  periodSeconds: 5
```

### 3. Ingress và Load Balancer

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: puchi-ingress
spec:
  rules:
    - host: api.puchi.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-gateway
                port:
                  number: 8000
```

---

## 📝 Checklist Deployment

### ✅ Chuẩn bị

- [ ] Cài đặt kubectl, minikube/docker
- [ ] Khởi động cluster
- [ ] Kiểm tra kết nối cluster

### ✅ Build và Push Images

- [ ] Build tất cả Docker images
- [ ] Push lên registry (nếu cần)
- [ ] Kiểm tra images có sẵn

### ✅ Deploy Hạ Tầng

- [ ] Deploy Kafka, Zookeeper
- [ ] Deploy databases
- [ ] Tạo Kafka topics
- [ ] Kiểm tra hạ tầng hoạt động

### ✅ Deploy Services

- [ ] Deploy tất cả services
- [ ] Kiểm tra pods Running
- [ ] Kiểm tra services expose đúng port
- [ ] Test API endpoints

### ✅ Monitoring

- [ ] Setup logging
- [ ] Setup monitoring (Prometheus/Grafana)
- [ ] Setup alerting
- [ ] Test health checks

### ✅ Production

- [ ] Cấu hình resource limits
- [ ] Setup Ingress/Load Balancer
- [ ] Cấu hình SSL/TLS
- [ ] Setup backup strategy
- [ ] Test disaster recovery

---

## 🔗 Tài liệu tham khảo

- [Kubernetes Official Documentation](https://kubernetes.io/docs/)
- [Minikube Documentation](https://minikube.sigs.k8s.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [NestJS Documentation](https://docs.nestjs.com/)

---

## 📞 Hỗ trợ

Nếu gặp vấn đề trong quá trình deploy:

1. Kiểm tra log: `kubectl logs <pod-name>`
2. Kiểm tra events: `kubectl get events`
3. Kiểm tra trạng thái: `kubectl describe pod <pod-name>`
4. Tham khảo troubleshooting section ở trên

---

**🎉 Chúc mừng! Hệ thống microservice của bạn đã sẵn sàng chạy trên Kubernetes!**
