const { z } = require('zod');

const authUserSchema = z.object({
  id: z.string({ message: 'Invalid user ID format' }),
  email: z.string().email({ message: 'Invalid email format' }),
  password_hash: z.string().optional(),
  login_method: z.enum(['email', 'google'], { message: 'login_method is required' }),
  device_info: z.record(z.any()).optional(),
  platform: z.string().optional(),
});

const resetPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string({ message: 'Password is required' }),
  password_hash: z.string({ message: 'Password hash is required' }),
});

const updateUserAliasSchema = z.object({
  user_id: z.string({ message: 'Invalid user ID format' }),
  alias_id: z.string({ message: 'Invalid alias ID format' }),
});

const updateUserSchoolSchema = z.object({
  user_id: z.string({ message: 'Invalid user ID format' }),
  school_id: z.number({ message: 'Invalid school ID format' }),
});

module.exports = {
  authUserSchema,
  resetPasswordSchema,
  updateUserAliasSchema,
  updateUserSchoolSchema,
};