import { z } from 'zod';

export const createBusinessProfileSchema = z.object({
  business_name: z.string().min(1).max(255),
  business_type: z.string().min(1).max(100).optional(),
  currency_code: z.string().length(3).optional(),
});

export const updateBusinessProfileSchema = createBusinessProfileSchema.partial();
