import { z } from 'zod';

const registerInputSchema = z
  .object({
    email: z.string().trim().email(),
    password: z.string().min(8).optional(),
    kataSandi: z.string().min(8).optional(),
    full_name: z.string().trim().min(2).optional(),
    fullName: z.string().trim().min(2).optional(),
    name: z.string().trim().min(2).optional(),
    namaLengkap: z.string().trim().min(2).optional(),
    business_name: z.string().trim().min(2).optional(),
    businessName: z.string().trim().min(2).optional(),
    namaUsaha: z.string().trim().min(2).optional(),
  })
  .superRefine((value, ctx) => {
    const fullName = value.full_name ?? value.fullName ?? value.name ?? value.namaLengkap;
    const businessName = value.business_name ?? value.businessName ?? value.namaUsaha ?? fullName;
    const password = value.password ?? value.kataSandi;

    if (!password) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['password'], message: 'password or kataSandi is required' });
    }

    if (!fullName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['full_name'], message: 'full_name or namaLengkap is required' });
    }

    if (!businessName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['business_name'], message: 'business_name or namaUsaha is required' });
    }
  });

export const registerSchema = registerInputSchema.transform((value) => ({
  full_name: value.full_name ?? value.fullName ?? value.name ?? value.namaLengkap ?? '',
  business_name: value.business_name ?? value.businessName ?? value.namaUsaha ?? (value.full_name ?? value.fullName ?? value.name ?? value.namaLengkap ?? ''),
  email: value.email,
  password: value.password ?? value.kataSandi ?? '',
}));

export const loginSchema = z
  .object({
    email: z.string().trim().email(),
    password: z.string().min(8).optional(),
    kataSandi: z.string().min(8).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.password && !value.kataSandi) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['password'], message: 'password or kataSandi is required' });
    }
  })
  .transform((value) => ({
    email: value.email,
    password: value.password ?? value.kataSandi ?? '',
  }));

export const updateProfileSchema = z.object({
  namaLengkap: z.string().trim().min(2).optional(),
  namaUsaha: z.string().trim().min(2).optional(),
  email: z.string().trim().email().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

export const verifyOtpSchema = z.object({
  email: z.string().trim().email(),
  otp: z.string().trim().regex(/^\d{6}$/),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().trim().email(),
    otp: z.string().trim().regex(/^\d{6}$/),
    password: z.string().min(8).optional(),
    kataSandi: z.string().min(8).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.password && !value.kataSandi) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['password'], message: 'password or kataSandi is required' });
    }
  })
  .transform((value) => ({
    email: value.email,
    otp: value.otp,
    password: value.password ?? value.kataSandi ?? '',
  }));
