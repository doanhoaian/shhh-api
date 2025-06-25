class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Dùng để phân biệt lỗi chủ động (AppError) vs lỗi hệ thống
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;  