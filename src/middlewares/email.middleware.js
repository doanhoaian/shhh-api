require('dotenv').config();
const createError = require('../utils/createError');
const redisClient = require('../configs/redis');

module.exports = ({
  action = 'default', // 'send' hoặc 'verify' để tách key
  emailWindowSec = 600, // 10 phút
  emailMaxRequests = 5, // 5 yêu cầu mỗi email
  ipWindowSec = 600, // 10 phút (đồng bộ với email)
  ipMaxRequests = 50 // 50 yêu cầu mỗi IP
} = {}) => {
  return async (req, res, next) => {
    try {
      // Lấy email từ body
      const email = req.body.email?.toLowerCase();
      if (!email) {
        return next(createError(400, 'Email is required'));
      }

      // Lấy IP từ headers hoặc socket
      const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;

      // Key cho email và IP, tách biệt theo action
      const emailKey = `${action}-limit:${email}`;
      const ipKey = `${action}-ip-limit:${ip}`;

      // Kiểm tra giới hạn email
      const emailCurrent = await redisClient.incr(emailKey);
      if (emailCurrent === 1) {
        await redisClient.expire(emailKey, emailWindowSec);
      }
      if (emailCurrent > emailMaxRequests) {
        return next(createError(429, `Too many ${action} requests for this email. Please try again after ${emailWindowSec} seconds.`));
      }

      // Kiểm tra giới hạn IP
      const ipCurrent = await redisClient.incr(ipKey);
      if (ipCurrent === 1) {
        await redisClient.expire(ipKey, ipWindowSec);
      }
      if (ipCurrent > ipMaxRequests) {
        return next(createError(429, `Too many ${action} requests from this IP. Please try again after ${ipWindowSec} seconds.`));
      }

      // Lưu số lần yêu cầu vào req
      req.emailRequestCount = emailCurrent;
      req.ipRequestCount = ipCurrent;

      next();
    } catch (err) {
      if (process.env.NODE_ENV === 'dev') {
        console.error(`restrictEmailRequests (${action}) error:`, err.message);
      }
      next();
    }
  };
};