import { z } from 'zod';

export const userRegistrationSchema = z.object({
  email: z.email({ error: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { error: 'Password must be longer than 6 characters' })
    .max(64, { error: 'Password must be less than 64 characters' })
    .regex(/[a-z]/, { error: 'Password must contain at least 1 lowercase letter' })
    .regex(/[A-Z]/, { error: 'Password must contain at least 1 uppercase letter' })
    .regex(/[0-9]/, { error: 'Password must contain at least 1 number' }),
  fullName: z
    .string()
    .min(2, { error: 'Full name must be at least 2 characters long' })
    .max(100, { error: 'Full name must be at most 100 characters long' })
    .refine((val) => val.includes(' '), {
      error:
        'Full name must contain both first and last names separated by a space (e.g., Joe Dou)',
    }),
  phone: z.e164({
    error: 'Invalid phone number. Must be in E.164 format (e.g., +1234567890)',
  }),
});

export const userLoginSchema = z.object({
  email: z.email({ error: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { error: 'Password must be longer than 6 characters' })
    .max(64, { error: 'Password must be less than 64 characters' })
    .regex(/[a-z]/, { error: 'Password must contain at least 1 lowercase letter' })
    .regex(/[A-Z]/, { error: 'Password must contain at least 1 uppercase letter' })
    .regex(/[0-9]/, { error: 'Password must contain at least 1 number' }),
});

export const forgotPasswordSchema = z.object({
  email: z.email({ error: 'Invalid email address' }),
});

export const verifyOtpSchema = z.object({
  otp: z.string().length(6, { error: 'OTP code must contain 6 characters' }),
});

export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(6, { error: 'Password must be longer than 6 characters' })
    .max(64, { error: 'Password must be less than 64 characters' })
    .regex(/[a-z]/, { error: 'Password must contain at least 1 lowercase letter' })
    .regex(/[A-Z]/, { error: 'Password must contain at least 1 uppercase letter' })
    .regex(/[0-9]/, { error: 'Password must contain at least 1 number' }),
});
