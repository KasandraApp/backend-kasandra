import { z } from 'zod';

export const alertQuerySchema = z.object({
  status: z.enum(['active', 'read', 'resolved']).optional(),
});
