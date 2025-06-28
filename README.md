# Shhh API

Shhh API là một hệ thống backend dành cho nền tảng C.A.M.P.U.S

## Tính Năng

-   **Xác thực người dùng**: Hỗ trợ đăng ký và đăng nhập thông qua email hoặc các phương thức social (Google).
-   **Quản lý bài đăng**: Người dùng có thể tạo bài đăng, bao gồm cả nội dung văn bản và hình ảnh.
-   **Hệ thống Feed**: Cung cấp dòng thời gian (feed) các bài đăng, hỗ trợ tải thêm (pagination) dựa trên con trỏ (cursor-based).
-   **Phân loại chủ đề**: Tự động phân loại chủ đề của bài đăng bằng cách sử dụng Hugging Face API.
-   **Tải ảnh lên**: Tích hợp với Cloudinary để lưu trữ hình ảnh.
-   **Xác thực OTP**: Gửi mã OTP qua email để xác thực email, đăng nhập hai yếu tố và đặt lại mật khẩu.
-   **Bảo mật**: Áp dụng cơ chế giới hạn tần suất (rate limiting) để chống spam và tấn công brute-force.
-   **Quản lý danh tính**: Người dùng có thể chọn các định danh (alias) và liên kết tài khoản với trường học.

## Công Nghệ Sử Dụng

-   **Backend**: Node.js, Express.js
-   **Cơ sở dữ liệu**: PostgreSQL
-   **Caching & Rate Limiting**: Redis
-   **Xác thực**: Firebase Authentication
-   **Lưu trữ ảnh**: Cloudinary
-   **Gửi Email**: Amazon SES (Simple Email Service)
-   **AI (Phân loại văn bản)**: Hugging Face Inference API
-   **Validation**: Zod

## Cài Đặt và Chạy Dự Án

1.  **Clone repository:**
    ```bash
    git clone [https://github.com/doanhoaian/shhh-api.git](https://github.com/doanhoaian/shhh-api.git)
    cd shhh-api
    ```

2.  **Cài đặt dependencies:**
    ```bash
    npm install
    ```

3.  **Tạo file môi trường `.env`:**
    Tạo một file `.env` ở thư mục gốc của dự án và điền các biến môi trường cần thiết. Xem mục [Biến Môi Trường](#biến-môi-trường) để biết chi tiết.

4.  **Khởi động server:**
    ```bash
    npm start
    ```
    Server sẽ chạy trên cổng được định nghĩa trong biến `NODE_PORT` (mặc định là 3000).

## Biến Môi Trường

Các biến sau đây cần được định nghĩa trong file `.env`:

```env
# PostgreSQL Database
PGHOST=your_db_host
PGUSER=your_db_user
PGPASSWORD=your_db_password
PGDATABASE=your_db_name
PGPORT=5432

# Redis
REDIS_URL=your_redis_connection_url

# Firebase
FIREBASE_KEY_BASE64=your_firebase_service_account_key_in_base64
FIREBASE_AUTH_TOKEN=false # Đặt là true nếu muốn bỏ qua xác thực token khi test local

# AWS SES
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-southeast-1

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Hugging Face API
HUGGINGFACE_API_KEY=your_huggingface_api_key

# Application
NODE_PORT=3000
NODE_ENV=dev # dev hoặc production
