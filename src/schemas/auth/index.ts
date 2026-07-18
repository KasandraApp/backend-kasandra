import { z } from 'zod';

export const registerSchema = z.object({
  full_name: z.string().min(1).max(255),
  business_name: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
