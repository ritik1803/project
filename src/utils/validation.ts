import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

export const signupSchema = loginSchema.extend({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
});

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{9,11}$/, 'Invalid phone number')
    .optional(),
  address: z
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(200, 'Address cannot exceed 200 characters')
    .optional(),
});

export const orderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      quantity: z.number().min(1),
    })
  ),
  paymentMethod: z.enum(['upi', 'card', 'cod']),
  address: z.string().min(10, 'Delivery address is required'),
});