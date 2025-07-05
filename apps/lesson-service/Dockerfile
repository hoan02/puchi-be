# Dockerfile for lesson-service
# Stage 1: Build app với Nx
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json, lockfile, nx.json, tsconfig.base.json từ root
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY eslint.config.mjs ./
COPY apps/lesson-service ./apps/lesson-service
COPY libs ./libs
COPY proto ./proto
# Copy .env if exists, otherwise copy env.example
RUN if [ -f apps/lesson-service/.env ]; then cp apps/lesson-service/.env ./.env; else cp apps/lesson-service/env.example ./.env; fi

# Cài dependencies
RUN npm install
RUN npx prisma generate --schema=prisma/schema.prisma

# Build chỉ project lesson-service
RUN npx nx build lesson-service

# Stage 2: Tạo image chạy thực tế
FROM node:20-alpine
WORKDIR /app

# Copy node_modules production từ builder
COPY --from=builder /app/node_modules ./node_modules

# Copy dist của lesson-service từ builder
COPY --from=builder /app/dist/apps/lesson-service ./dist

# Copy file proto nếu cần
COPY --from=builder /app/proto /proto

# Copy .env from builder
COPY --from=builder /app/.env ./.env

EXPOSE 50052
CMD ["node", "dist/main.js"] 