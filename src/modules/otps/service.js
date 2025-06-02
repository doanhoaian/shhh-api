const otpGenerator = require('otp-generator');
const redisClient = require('../../configs/redis');
const createError = require('../../utils/createError');
const sendEmail = require('../../utils/sendEmail');
const { validateEmail } = require('../../utils/validateEmail');

/**
 * Gửi OTP qua email
 * @param {Object} params - Thông tin gửi OTP
 * @param {string} params.email - Địa chỉ email
 * @param {string} params.type - Loại OTP (verify_email, 2fa_login, reset_password)
 * @throws {Error} Nếu email không hợp lệ, Redis hoặc gửi email thất bại
 */
async function sendOtp({ email, type }) {
  const validTypes = ['verify_email', '2fa_login', 'reset_password'];

  if (!validTypes.includes(type)) {
    throw createError(400, 'Invalid OTP type');
  }

  if (!(await validateEmail(email))) {
    throw createError(400, 'Invalid email address');
  }

  const otp = otpGenerator.generate(4, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const key = `otp:${email}:${type}`;
  try {
    // Kiểm tra kết nối Redis
    if (!redisClient.isOpen) {
      throw new Error('Redis connection is not established');
    }

    // Kiểm tra rate limit (1 OTP mỗi 60 giây)
    const lastSent = await redisClient.get(`otp_rate:${email}:${type}`);
    if (lastSent) {
      throw createError(429, 'Please wait before requesting another OTP');
    }

    // Lưu OTP vào Redis với TTL 5 phút
    await redisClient.setEx(key, 300, otp);

    // Thiết lập rate limit
    await redisClient.setEx(`otp_rate:${email}:${type}`, 60, 'true');

    // Gửi email
    try {
      await sendEmail.sendOtpEmail({ email, otp, type });
    } catch (emailErr) {
      // Xóa OTP nếu gửi email thất bại
      await redisClient.del(key);
      await redisClient.del(`otp_rate:${email}:${type}`);
      throw createError(500, 'Failed to send OTP email');
    }
  } catch (err) {
    throw err.statusCode ? err : createError(500, `Failed to send OTP: ${err.message}`);
  }
}

/**
 * Xác thực OTP
 * @param {Object} params - Thông tin xác thực OTP
 * @param {string} params.email - Địa chỉ email
 * @param {string} params.otp - Mã OTP
 * @param {string} params.type - Loại OTP (verify_email, 2fa_login, reset_password)
 * @returns {boolean} True nếu OTP hợp lệ
 * @throws {Error} Nếu OTP không đúng, đã hết hạn hoặc quá số lần thử
 */
async function verifyOtp({ email, otp, type }) {
  const validTypes = ['verify_email', '2fa_login', 'reset_password'];

  if (!validTypes.includes(type)) {
    throw createError(400, 'Invalid OTP type');
  }

  const key = `otp:${email}:${type}`;
  const attemptKey = `otp_attempts:${email}:${type}`;
  const verifiedKey = `otp_verified:${email}:${type}`;

  try {
    // Kiểm tra kết nối Redis
    if (!redisClient.isOpen) {
      throw new Error('Redis connection is not established');
    }

    // Kiểm tra số lần thử
    const attempts = await redisClient.get(attemptKey) || 0;
    if (parseInt(attempts) >= 5) {
      throw createError(429, 'Too many OTP attempts');
    }

    const savedOtp = await redisClient.get(key);
    if (!savedOtp) {
      throw createError(401, 'OTP has expired or does not exist');
    }

    if (savedOtp !== otp) {
      // Tăng số lần thử thất bại
      await redisClient.incr(attemptKey);
      await redisClient.expire(attemptKey, 300); // TTL 5 phút
      throw createError(400, 'Invalid OTP');
    }

    // Xóa OTP, số lần thử và thiết lập flag xác thực
    await redisClient.multi()
      .del(key)
      .del(attemptKey)
      .setEx(verifiedKey, 600, 'true')
      .exec();

    return true;
  } catch (err) {
    throw err.statusCode ? err : createError(500, `Failed to verify OTP: ${err.message}`);
  }
}

module.exports = {
  sendOtp,
  verifyOtp,
};