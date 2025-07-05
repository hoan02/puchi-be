# Dockerfile for user-service
# Stage 1: Build app với Nx
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json, lockfile, nx.json, tsconfig.base.json từ root
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY eslint.config.mjs ./
COPY apps/user-service ./apps/user-service
COPY libs ./libs
COPY proto ./proto
# Copy .env if exists, otherwise copy env.example
RUN if [ -f apps/user-service/.env ]; then cp apps/user-service/.env ./.env; else cp apps/user-service/env.example ./.env; fi

# Cài dependencies
RUN npm install
RUN npx prisma generate --schema=apps/user-service/prisma/schema.prisma

# Build chỉ project user-service
RUN npx nx build user-service

# Stage 2: Tạo image chạy thực tế
FROM node:20-alpine
WORKDIR /app

# Copy node_modules production từ builder
COPY --from=builder /app/node_modules ./node_modules

# Copy dist của user-service từ builder
COPY --from=builder /app/dist/apps/user-service ./dist

# Copy file proto nếu cần
COPY --from=builder /app/proto /proto

# Copy .env from builder
COPY --from=builder /app/.env ./.env

EXPOSE 50051
CMD ["node", "dist/main.js"] 