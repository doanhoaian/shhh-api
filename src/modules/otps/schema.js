const { z } = require('zod');

const sendOtpSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  type: z.enum(['verify_email', '2fa_login', 'reset_password'], {
    message: 'Invalid OTP type',
  }),
});

const verifyOtpSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  otp: z.string().length(4, { message: 'OTP must be 4 digits' }).regex(/^\d+$/, { message: 'OTP must contain only digits' }),
  type: z.enum(['verify_email', '2fa_login', 'reset_password'], {
    message: 'Invalid OTP type',
  }),
});

module.exports = {
  sendOtpSchema,
  verifyOtpSchema,
};