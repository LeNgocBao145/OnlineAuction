FROM node:20-alpine
WORKDIR /app

# Tạo user
RUN addgroup -S onlineauction && adduser -S onlineauction -G onlineauction

# Copy package files và cài dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Chuyển quyền sở hữu source code cho user
RUN chown -R onlineauction:onlineauction /app

# Chuyển sang user
USER onlineauction

EXPOSE 5555
CMD ["npm", "run", "dev"]
