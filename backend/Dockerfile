# Stage 1: Build bundle
FROM node:20-alpine AS builder
WORKDIR /app

# Cài dependencies cần thiết để build
COPY package*.json ./
RUN npm ci --production
RUN npm install -g @vercel/ncc

# Copy source code
COPY src ./src

# Build app với ncc
RUN ncc build src/index.js -o dist

# Stage 2: Production image
FROM node:20-alpine
WORKDIR /app

# Tạo user không phải root
RUN addgroup -S onlineauction && adduser -S onlineauction -G onlineauction

# Copy file bundle từ stage builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Chuyển sang user non-root
USER onlineauction

# Expose port backend
EXPOSE 5555

# Chạy production
CMD ["node", "dist/index.js"]
