import { createCashTransactionSchema, updateCashTransactionSchema } from '../schemas/cash.schema';
import { fail, ok, created } from '../utils/response';
import { forecastService } from './forecast.service';
import { cashRepository } from '../repositories/cash.repository';

const nowIso = () => new Date().toISOString();

const normalizeTransaction = (tx: Record<string, unknown>) => ({
  id: String(tx.id),
  transaction_date: typeof tx.transactionDate === 'string' ? tx.transactionDate : '',
  type: tx.type === 'expense' ? 'pengeluaran' : 'pemasukan',
  category: typeof tx.category === 'string' ? tx.category : '',
  amount: Number(tx.amount ?? 0),
  note: typeof tx.note === 'string' ? tx.note : undefined,
  created_at: typeof tx.createdAt === 'string' ? tx.createdAt : nowIso(),
  updated_at: typeof tx.updatedAt === 'string' ? tx.updatedAt : nowIso(),
});

export const cashService = {
  list: async (businessProfileId: string, query?: { limit?: number; offset?: number; type?: string; from_date?: string; to_date?: string }) => {
    const fromDate = query?.from_date;
    const toDate = query?.to_date;

    try {
      const rows = await cashRepository.findAll(businessProfileId, { from: fromDate, to: toDate });
      let transactions = rows.map((row) => normalizeTransaction(row as Record<string, unknown>));

      if (query?.type) {
        transactions = transactions.filter((tx) => tx.type === query.type);
      }

      const limit = query?.limit ?? 20;
      const offset = query?.offset ?? 0;
      const paged = transactions.slice(offset, offset + limit);

      return ok({ transactions: paged, total: transactions.length, limit, offset });
    } catch (error) {
      return fail('Database unavailable while loading cash transactions', [{ field: 'database', message: error instanceof Error ? error.message : 'Unknown database error' }]);
    }
  },

  get: async (businessProfileId: string, id: string) => {
    try {
      const transaction = await cashRepository.findById(id, businessProfileId);
      if (!transaction) {
        return fail('Transaction not found');
      }
      return ok(normalizeTransaction(transaction as Record<string, unknown>));
    } catch (error) {
      return fail('Database unavailable while loading the transaction', [{ field: 'database', message: error instanceof Error ? error.message : 'Unknown database error' }]);
    }
  },

  create: async (businessProfileId: string, input: unknown) => {
    const parsed = createCashTransactionSchema.safeParse(input);
    if (!parsed.success) {
      return fail('Invalid cash transaction payload', parsed.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })));
    }

    try {
      const persisted = await cashRepository.create({
        businessProfileId,
        transactionDate: parsed.data.tanggal,
        type: parsed.data.jenis === 'pengeluaran' ? 'expense' : 'income',
        amount: String(parsed.data.jumlah),
        category: parsed.data.kategori,
        note: parsed.data.catatan,
      });
      const normalized = normalizeTransaction(persisted as Record<string, unknown>);

      await forecastService.recalculate(businessProfileId);
      return created(normalized, 'Transaksi berhasil dibuat');
    } catch (error) {
      return fail('Database unavailable while creating the transaction', [{ field: 'database', message: error instanceof Error ? error.message : 'Unknown database error' }]);
    }
  },

  update: async (businessProfileId: string, id: string, input: unknown) => {
    const parsed = updateCashTransactionSchema.safeParse(input);
    if (!parsed.success) {
      return fail('Invalid cash transaction payload', parsed.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })));
    }

    try {
      const updated = await cashRepository.update(id, businessProfileId, {
        transactionDate: parsed.data.tanggal,
        type: parsed.data.jenis ? (parsed.data.jenis === 'pengeluaran' ? 'expense' : 'income') : undefined,
        amount: parsed.data.jumlah ? String(parsed.data.jumlah) : undefined,
        category: parsed.data.kategori,
        note: parsed.data.catatan,
      });
      if (!updated) {
        return fail('Transaction not found');
      }
      const transaction = normalizeTransaction(updated as Record<string, unknown>);
      await forecastService.recalculate(businessProfileId);
      return ok(transaction, 'Transaksi berhasil diperbarui');
    } catch (error) {
      return fail('Database unavailable while updating the transaction', [{ field: 'database', message: error instanceof Error ? error.message : 'Unknown database error' }]);
    }
  },

  delete: async (businessProfileId: string, id: string) => {
    try {
      const deleted = await cashRepository.delete(id, businessProfileId);
      if (!deleted) {
        return fail('Transaction not found');
      }
      await forecastService.recalculate(businessProfileId);
      return ok({}, 'Transaksi berhasil dihapus');
    } catch (error) {
      return fail('Database unavailable while deleting the transaction', [{ field: 'database', message: error instanceof Error ? error.message : 'Unknown database error' }]);
    }
  },
};
