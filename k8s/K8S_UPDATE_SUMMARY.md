# 📋 Tóm tắt Cập nhật Kubernetes cho Polyglot Persistence

## 🎯 Tổng quan

Các file Kubernetes đã được cập nhật để hỗ trợ kiến trúc **Polyglot Persistence** với:

- **PostgreSQL 17**: Cho các service cần ACID transactions
- **MongoDB 8**: Cho các service cần flexible schema
- **Bitnami Kafka KRaft mode**: Loại bỏ Zookeeper dependency

## 🔄 Các file đã được cập nhật

### **1. `k8s/puchi-infra.yaml`**

✅ **Đã cập nhật:**

- **Loại bỏ Zookeeper**: Không còn cần thiết với KRaft mode
- **Cập nhật Kafka**: Chuyển từ Confluent Kafka sang Bitnami Kafka với KRaft mode
- **PostgreSQL 17**: Cập nhật image cho 5 services (User, Lesson, Progress, Notification, Vocabulary)
- **MongoDB 8**: Thêm 3 services MongoDB (Analytics, Media, Quiz)
- **Kafka UI**: Thêm deployment và service cho Kafka UI
- **MongoDB Express**: Thêm deployment và service cho MongoDB Express

### **2. `k8s/puchi-services.yaml`**

✅ **Đã cập nhật:**

- **Environment variables**: Tất cả services đều dùng `DATABASE_URL` (Prisma hỗ trợ cả PostgreSQL và MongoDB)
- **Service keys**: Giữ nguyên format `*_DATABASE_URL` cho tất cả services

### **3. `k8s/secrets.template.yaml`**

✅ **Đã cập nhật:**

- **Thêm MongoDB secret**: Cho MongoDB credentials
- **Database URLs**: Giữ nguyên format `DATABASE_URL` cho cả PostgreSQL và MongoDB
- **Comments**: Cập nhật để phản ánh kiến trúc mới

### **4. `k8s/secrets.yaml`**

✅ **Đã cập nhật:**

- **MongoDB URLs**: Cập nhật Analytics, Media, Quiz services sang MongoDB URLs
- **MongoDB secret**: Thêm credentials cho MongoDB
- **Base64 encoding**: Đã encode đúng MongoDB connection strings

### **5. `k8s/ingress.yaml`**

✅ **Đã cập nhật:**

- **Kafka UI Ingress**: Thêm route cho Kafka UI (`kafka.puchi.local`)
- **MongoDB Express Ingress**: Thêm route cho MongoDB Express (`mongo.puchi.local`)

### **6. `k8s/storage.yaml`**

✅ **Đã cập nhật:**

- **Loại bỏ Zookeeper PV**: Không còn cần thiết
- **Giữ nguyên**: Tất cả database PVs và Kafka PV

### **7. `k8s/README.md`**

✅ **Đã cập nhật:**

- **Infrastructure**: Cập nhật mô tả về Kafka KRaft mode và Polyglot Persistence
- **Database connections**: Tách riêng PostgreSQL và MongoDB services
- **Kafka configuration**: Cập nhật để phản ánh KRaft mode
- **Management UIs**: Thêm thông tin về Kafka UI và MongoDB Express

## 🏗️ Kiến trúc Infrastructure

### **🟢 PostgreSQL 17 Services**

| Service      | Database                | Port | PV Path                 |
| ------------ | ----------------------- | ---- | ----------------------- |
| User         | `puchi_user_db`         | 5432 | `/data/user-db`         |
| Lesson       | `puchi_lesson_db`       | 5432 | `/data/lesson-db`       |
| Progress     | `puchi_progress_db`     | 5432 | `/data/progress-db`     |
| Notification | `puchi_notification_db` | 5432 | `/data/notification-db` |
| Vocabulary   | `puchi_vocabulary_db`   | 5432 | `/data/vocabulary-db`   |

### **🔵 MongoDB 8 Services**

| Service   | Database             | Port  | PV Path              |
| --------- | -------------------- | ----- | -------------------- |
| Analytics | `puchi_analytics_db` | 27017 | `/data/analytics-db` |
| Media     | `puchi_media_db`     | 27017 | `/data/media-db`     |
| Quiz      | `puchi_quiz_db`      | 27017 | `/data/quiz-db`      |

### **🟡 Kafka Infrastructure**

- **Image**: `bitnami/kafka:latest`
- **Mode**: KRaft (không cần Zookeeper)
- **Ports**: 9092, 29092, 9101 (JMX)
- **PV Path**: `/data/kafka`

### **🟣 Management UIs**

- **Kafka UI**: `provectuslabs/kafka-ui:latest` (port 8081)
- **MongoDB Express**: `mongo-express:latest` (port 8082)

## 🚀 Deployment Order

```bash
# 1. Namespace (nếu cần)
kubectl apply -f namespace.yaml

# 2. Storage
kubectl apply -f storage.yaml

# 3. Secrets
kubectl apply -f secrets.yaml

# 4. Infrastructure (Kafka, Databases)
kubectl apply -f puchi-infra.yaml

# 5. Services
kubectl apply -f puchi-services.yaml

# 6. Ingress (tùy chọn)
kubectl apply -f ingress.yaml
```

## 📊 URLs & Access

### **Development**

- **API Gateway**: http://localhost:8000
- **Kafka UI**: http://localhost:8081
- **MongoDB Express**: http://localhost:8082

### **Production (via Ingress)**

- **API Gateway**: http://api.puchi.local
- **Kafka UI**: http://kafka.puchi.local
- **MongoDB Express**: http://mongo.puchi.local

## 🔐 Secrets Management

### **PostgreSQL Secret**

```yaml
name: postgres-secret
data:
  username: cHVjaGlfdXNlcg== # puchi_user
  password: MTIzNDU2 # 123456
```

### **MongoDB Secret**

```yaml
name: mongodb-secret
data:
  username: cHVjaGlfdXNlcg== # puchi_user
  password: MTIzNDU2 # 123456
```

### **Database URLs Secret**

```yaml
name: database-urls-secret
data:
  # PostgreSQL URLs
  USER_SERVICE_DATABASE_URL: postgresql://puchi_user:123456@user-db:5432/puchi_user_db
  LESSON_SERVICE_DATABASE_URL: postgresql://puchi_user:123456@lesson-db:5432/puchi_lesson_db
  # ... other PostgreSQL services

  # MongoDB URLs
  ANALYTICS_SERVICE_DATABASE_URL: mongodb://puchi_user:123456@analytics-db:27017/puchi_analytics_db
  MEDIA_SERVICE_DATABASE_URL: mongodb://puchi_user:123456@media-db:27017/puchi_media_db
  QUIZ_SERVICE_DATABASE_URL: mongodb://puchi_user:123456@quiz-db:27017/puchi_quiz_db
```

## 🔍 Health Checks

### **Kafka Health Check**

```yaml
livenessProbe:
  exec:
    command:
      - /bin/sh
      - -c
      - kafka-topics.sh --bootstrap-server localhost:9092 --list
```

### **Database Health Checks**

- **PostgreSQL**: `pg_isready -U puchi_user`
- **MongoDB**: `mongosh --eval "db.runCommand('ping')"`

## 📈 Monitoring & Management

### **Kafka UI**

- **URL**: http://kafka-ui:8081
- **Features**: Topic management, message browsing, consumer groups
- **Access**: Via ingress `kafka.puchi.local`

### **MongoDB Express**

- **URL**: http://mongo-express:8082
- **Features**: Database management, collection browsing, document editing
- **Access**: Via ingress `mongo.puchi.local`
- **Auth**: admin/admin123

## 🚨 Production Considerations

1. **Storage**: Thay đổi StorageClass từ `hostPath` sang cloud storage
2. **Secrets**: Sử dụng external secret management
3. **Ingress**: Cấu hình SSL/TLS certificates
4. **Monitoring**: Thêm Prometheus và Grafana
5. **Backup**: Cấu hình database backup strategy
6. **Security**: Enable authentication cho Kafka và MongoDB
7. **Scaling**: Thêm HorizontalPodAutoscaler

---

**🎉 Kubernetes configuration đã được cập nhật thành công cho Polyglot Persistence!**

Tất cả các file đã được đồng bộ với kiến trúc mới, sẵn sàng cho deployment.
