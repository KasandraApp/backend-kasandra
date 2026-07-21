import { z } from 'zod';

export const createCashTransactionSchema = z.object({
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  jenis: z.enum(['pemasukan', 'pengeluaran']),
  kategori: z.string().min(1).max(100),
  jumlah: z.number().positive(),
  catatan: z.string().max(500).optional(),
});

export const updateCashTransactionSchema = createCashTransactionSchema.partial().superRefine((value, ctx) => {
  if (Object.keys(value).length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [], message: 'At least one field must be provided' });
  }
});

export const cashQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
