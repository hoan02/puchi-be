# Hệ thống Kubernetes cho Puchi Backend

## 1. Kiến trúc tổng quan

Hệ thống sử dụng mô hình **microservices** với các thành phần chính:

- **Cloudflared**: Tunnel bảo mật từ Internet vào cluster nội bộ.
- **Traefik**: Ingress Controller, route request đến đúng service.
- **Authelia**: Xác thực Single Sign-On, quản lý session/cookie.
- **API Gateway**: Nhận HTTP từ frontend, chuyển thành gRPC cho backend.
- **Các Microservice**: user, lesson, progress, notification, media, quiz, vocabulary, analytics (gRPC, mỗi service 1 DB riêng).
- **Kafka**: Message queue cho event-driven (sẵn sàng mở rộng).
- **Mongo Express, Kafka UI**: UI quản trị nội bộ.

### Sơ đồ kiến trúc

```mermaid
flowchart TD
    A[User/Browser] -->|HTTPS| B(Cloudflared Tunnel)
    B --> C(Traefik Ingress)
    C -->|/authelia| D[Authelia]
    C -->|/app| E[Frontend (Next.js)]
    E -->|HTTP| F[API Gateway]
    F -- gRPC --> G1[User Service]
    F -- gRPC --> G2[Lesson Service]
    F -- gRPC --> G3[...Other Services]
    G1 -- gRPC --> G2
    G2 -- gRPC --> G3
    subgraph Kafka
      KAFKA[(Kafka Cluster)]
    end
    G1 -- Pub/Sub --> KAFKA
    G2 -- Pub/Sub --> KAFKA
    D -- Session/Cookie --> E
```

## 2. Luồng hoạt động

1. **User** truy cập domain → Cloudflared tunnel → Traefik Ingress.
2. **Traefik** route request: nếu cần xác thực → Authelia; nếu không → frontend hoặc API Gateway.
3. **Authelia** xác thực, cấp session/cookie.
4. **Frontend** nhận session, gửi API HTTP đến API Gateway.
5. **API Gateway** chuyển HTTP thành gRPC, gọi các microservice backend.
6. **Các microservice** xử lý logic, truy cập DB riêng, có thể gọi nhau qua gRPC hoặc publish event lên Kafka.

## 3. Hướng dẫn triển khai

### 3.1. Khởi tạo Infra, Storage, DB, Kafka, Config

```bash
npm run k8s:infra:up
```

### 3.2. Deploy Secrets cho App

```bash
npm run k8s:secrets:up
```

### 3.3. Deploy các Service của App (Deployment, Service cho từng microservice, API Gateway)

```bash
npm run k8s:services:up
```

### 3.4. Deploy Middleware (Authelia, Traefik, Cloudflared...)

```bash
npm run k8s:middleware:up
```

### 3.5. Deploy UI quản trị (Kafka UI, Mongo Express...)

```bash
npm run k8s:ui:up
```

### 3.6. Deploy Ingress

```bash
npm run k8s:ingress:up
```

### 3.7. Kiểm tra trạng thái hệ thống

```bash
npm run k8s:infra:status
```

### 3.8. Xem log từng thành phần

```bash
kubectl logs -f deployment/<service-name> -n puchi
```

---

## 4. Xoá toàn bộ hệ thống (theo thứ tự ngược lại)

```bash
npm run k8s:ui:down
npm run k8s:middleware:down
npm run k8s:services:down
npm run k8s:secrets:down
npm run k8s:ingress:down
npm run k8s:infra:down
```

---

## 5. Lưu ý

- **Build & push image Docker** cho từng service lên registry trước khi apply manifest K8s.
- **ConfigMap/Secret**: Quản lý tập trung, có thể tách riêng cho từng môi trường.
- **CI/CD**: Tích hợp các lệnh npm script vào pipeline để tự động hoá deploy.
- **Bảo mật**: Không commit secret thật lên repo, chỉ dùng file example hoặc quản lý secret qua vault/ci.
- **Mở rộng**: Có thể bổ sung thêm microservice, event Kafka, UI quản trị... dễ dàng.

---

**Cấu trúc folder đã chuẩn hoá, dễ maintain, dễ mở rộng cho team và production.**

---

## 6. Tạo StorageClass

### 6.1. Tạo file `puchi-be/k8s/infra/storageclass.yaml`

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: puchi-storage
provisioner: k8s.io/minikube-hostpath
reclaimPolicy: Retain
volumeBindingMode: Immediate
```

### 6.2. Apply StorageClass

```sh
kubectl apply -f puchi-be/k8s/infra/storageclass.yaml
```

### 6.3. Kiểm tra lại PVC và pod

Sau khi có StorageClass, các PVC sẽ được provision, pod DB sẽ chuyển sang trạng thái Running.

---

**Tóm lại:**  
Bạn cần tạo StorageClass `puchi-storage` đúng tên, apply lại, mọi DB sẽ hoạt động bình thường!

Nếu muốn mình tạo file mẫu và bổ sung vào repo, chỉ cần xác nhận nhé!
