import { z } from 'zod';

export const createInventoryItemSchema = z.object({
  item_name: z.string().min(1).max(255),
  current_stock: z.number().min(0),
  average_sales_per_day: z.number().min(0),
  unit: z.enum(['kg', 'liter', 'pcs', 'pack']),
  minimum_threshold: z.number().min(0).optional(),
});

export const updateInventoryItemSchema = createInventoryItemSchema.partial().superRefine((value, ctx) => {
  if (Object.keys(value).length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [], message: 'At least one field must be provided' });
  }
});

export const createInventoryMovementSchema = z.object({
  inventory_item_id: z.number().int().positive(),
  movement_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  movement_type: z.enum(['in', 'out', 'adjustment']),
  quantity: z.number().positive(),
  note: z.string().max(500).optional(),
});
