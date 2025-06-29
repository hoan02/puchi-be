# ⚡ Kubernetes Quick Start

## 🚀 Deploy Nhanh trong 5 phút

### 1. Khởi động cluster

```bash
minikube start
kubectl cluster-info
```

### 2. Build và push images (cho 2 service đầu tiên)

```bash
# Build
docker build -f apps/api-gateway/Dockerfile -t hoanit/api-gateway:latest .
docker build -f apps/user-service/Dockerfile -t hoanit/user-service:latest .

# Push
docker push hoanit/api-gateway:latest
docker push hoanit/user-service:latest
```

### 3. Deploy hạ tầng

```bash
kubectl apply -f k8s/puchi-infra.yaml
kubectl apply -f k8s/create-kafka-topics.yaml
```

### 4. Deploy services

```bash
kubectl apply -f k8s/puchi-services.yaml
```

### 5. Kiểm tra

```bash
kubectl get pods
kubectl port-forward service/api-gateway 8000:8000
```

---

## 📋 Checklist Nhanh

- [ ] `minikube start`
- [ ] Build 2 images đầu tiên
- [ ] Push lên Docker Hub
- [ ] `kubectl apply -f k8s/puchi-infra.yaml`
- [ ] `kubectl apply -f k8s/create-kafka-topics.yaml`
- [ ] `kubectl apply -f k8s/puchi-services.yaml`
- [ ] `kubectl get pods` (kiểm tra Running)
- [ ] `kubectl port-forward service/api-gateway 8000:8000`
- [ ] Test: `curl http://localhost:8000/api/health`

---

## 🔧 Lệnh Debug Nhanh

```bash
# Kiểm tra trạng thái
kubectl get pods
kubectl get svc

# Log lỗi
kubectl logs <pod-name>

# Chi tiết pod
kubectl describe pod <pod-name>

# Restart pod
kubectl delete pod <pod-name>

# Port-forward
kubectl port-forward service/api-gateway 8000:8000
```

---

## 🐛 Lỗi Thường Gặp

### ImagePullBackOff

```bash
# Push image lên registry
docker push <username>/<service>:latest
```

### Kafka Connection Error

```bash
# Tạo lại topics
kubectl apply -f k8s/create-kafka-topics.yaml
# Restart service
kubectl delete pod <pod-name>
```

---

**✅ Hoàn thành! API Gateway đã sẵn sàng tại http://localhost:8000/api**
