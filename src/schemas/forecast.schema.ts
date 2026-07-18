import { z } from 'zod';

export const forecastQuerySchema = z.object({
  horizon_days: z.coerce.number().int().positive().optional(),
});
