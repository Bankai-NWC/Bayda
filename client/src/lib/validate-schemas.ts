import z from 'zod';

import { Gender } from '@/types/product';

export const RegisterSchema = z.object({
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

export const LoginSchema = z.object({
  email: z.email({ error: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { error: 'Password must be longer than 6 characters' })
    .max(64, { error: 'Password must be less than 64 characters' })
    .regex(/[a-z]/, { error: 'Password must contain at least 1 lowercase letter' })
    .regex(/[A-Z]/, { error: 'Password must contain at least 1 uppercase letter' })
    .regex(/[0-9]/, { error: 'Password must contain at least 1 number' }),
});

export const CreateProductSchema = z.object({
  // Product fields
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  categoryId: z.coerce.number().int().positive('Category is required'),
  collectionId: z.coerce.number().int().positive().optional(),
  gender: z.nativeEnum(Gender).default(Gender.UNISEX),
  // Variant fields
  sku: z.string().min(1, 'SKU is required'),
  price: z.coerce.number().positive('Price must be positive'),
  salePrice: z.coerce.number().positive().optional(),
  size: z.string().optional(),
  colorId: z.coerce.number().int().positive().optional(),
  stock: z.coerce.number().int().min(0).default(0),
});

export const VariantSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  price: z.coerce.number().positive('Price must be positive'),
  salePrice: z.coerce.number().positive().optional(),
  size: z.string().optional(),
  colorId: z.coerce.number().int().positive().optional(),
  stock: z.coerce.number().int().min(0).default(0),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
