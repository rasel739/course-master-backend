import { z } from 'zod';

const registerZodSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(50, 'Name cannot exceed 50 characters'),
    email: z.string({ error: 'Please provide a valid email' }).toLowerCase(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(16, 'Password less then 16'),
    registrationKey: z.string().optional(),
  }),
});

const loginZodSchema = z.object({
  body: z.object({
    email: z.string({ error: 'Please provide a valid email' }).toLowerCase(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(16, 'Password less then 16'),
  }),
});

const refreshTokenZodSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      error: 'Refresh Token is required',
    }),
  }),
});

export const AuthValidation = {
  registerZodSchema,
  loginZodSchema,
  refreshTokenZodSchema,
};
