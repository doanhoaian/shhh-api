require('dotenv').config();
const createError = require('../utils/createError');
const redisClient = require('../configs/redis');

const rateLimit = ({ windowSec = 60, maxRequests = 10 } = {}) => {
    return async (req, res, next) => {
        try {
            const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
            const key = `rate-limit:${ip}`;

            const current = await redisClient.incr(key);

            if (current === 1) {
                await redisClient.expire(key, windowSec);
            }

            if (current > maxRequests) {
                return next(createError(429));
            }

            next();

        } catch (err) {
            if (process.env.NODE_ENV === 'dev') {
                // Nếu lỗi Redis không block request, chỉ log
                console.error('RateLimit middleware error:', err);
            }
            next();
        }
    };
};

module.exports = rateLimit;