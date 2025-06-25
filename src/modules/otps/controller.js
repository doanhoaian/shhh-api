const sendResponse = require('../../utils/sendResponse');
const { sendOtp, verifyOtp } = require('./service');

/**
 * Gửi OTP qua email
 */
exports.sendOtp = async (req, res, next) => {
  const { email, type } = req.body;

  try {
    await sendOtp({ email, type });
    return sendResponse(res, 201, 'OTP sent successfully', { email });
  } catch (err) {
    next(err);
  }
};

/**
 * Xác thực OTP
 */
exports.verifyOtp = async (req, res, next) => {
  const { email, otp, type } = req.body;

  try {
    const result = await verifyOtp({ email, otp, type });
    return sendResponse(res, 200, 'OTP verified successfully', { verified: result });
  } catch (err) {
    next(err);
  }
};