# 1. Môi trường
- Node.js >= 18 ()
  - Chạy câu lệnh ở terminal: `node -v`
- npm
- Tài khoản Neon

# 2. Database (Postgre SQL)
## 2.1 Schema.sql + Neon
- Tạo một project trên nền tảng `Neon`
- Vào Overview → Roles & Databases → Add database 
  - Thêm một database mới tên `OnlineAuction`
- Sau đó vào `schema.sql` và dán script lên SQL Editor ở `Neon`

## 2.2 Kết nối với backend
- Cần cung cấp PG_HOST, PG_PORT, PG_DATABASE, PG_USER, PG_PASSWORD, PG_SSL ở trong `.env` và sẽ tự kết nối với backend

# 3. Backend (NodeJS + Express)
- Mở terminal và truy cập vào thư mục backend
  - Chạy câu lệnh ở terminal: `cd backend`
- Tải các packages cần thiết
  - Chạy câu lệnh ở terminal: `npm install`
- Cung cấp các biến môi trường cần thiết trong: `backend/.sample.env`
- Chạy frontend
  - Chạy câu lệnh ở terminal: `npm run dev`

# 4. Frontend (React + Vite)
- Mở terminal và truy cập vào thư mục frontend
  - Chạy câu lệnh ở terminal:`cd frontend`
- Tải các packages cần thiết
  - Chạy câu lệnh ở terminal: `npm install`
- Cung cấp các biến môi trường cần thiết trong: `frontend/.sample.env`
- Chạy frontend
  - Chạy câu lệnh ở terminal: `npm run dev`