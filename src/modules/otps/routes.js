const express = require('express');
const router = express.Router();
const restrictEmailRequests = require('../../middlewares/email.middleware');
const validateMid = require('../../middlewares/validate.middleware');
const { sendOtpSchema, verifyOtpSchema } = require('./schema');
const { sendOtp, verifyOtp } = require('./controller');

/**
 * @route POST /send
 * @desc Gửi OTP qua email
 * @access Public
 */
router.post('/send', restrictEmailRequests({ action: 'send' }), validateMid(sendOtpSchema), sendOtp);

/**
 * @route POST /verify
 * @desc Xác thực OTP
 * @access Public
 */
router.post('/verify', restrictEmailRequests({ action: 'verify' }), validateMid(verifyOtpSchema), verifyOtp);

module.exports = router;