import { z } from 'zod';

const registerInputSchema = z
  .object({
    email: z.string().trim().email(),
    password: z.string().min(8),
    full_name: z.string().trim().min(2).optional(),
    fullName: z.string().trim().min(2).optional(),
    name: z.string().trim().min(2).optional(),
    business_name: z.string().trim().min(2).optional(),
    businessName: z.string().trim().min(2).optional(),
  })
  .superRefine((value, ctx) => {
    const fullName = value.full_name ?? value.fullName ?? value.name;
    const businessName = value.business_name ?? value.businessName ?? fullName;

    if (!fullName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['full_name'], message: 'full_name is required' });
    }

    if (!businessName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['business_name'], message: 'business_name is required' });
    }
  });

export const registerSchema = registerInputSchema.transform((value) => ({
  full_name: value.full_name ?? value.fullName ?? value.name ?? '',
  business_name: value.business_name ?? value.businessName ?? (value.full_name ?? value.fullName ?? value.name ?? ''),
  email: value.email,
  password: value.password,
}));

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});
