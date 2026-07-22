import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { db } from '../db';
import { cashTransactions } from '../db/schema.js';

export const cashRepository = {
  findAll: async (
    businessProfileId: string,
    filters?: { from?: string; to?: string; limit?: number },
  ) => {
    const conditions = [eq(cashTransactions.businessProfileId, businessProfileId)];

    if (filters?.from) {
      conditions.push(gte(cashTransactions.transactionDate, filters.from));
    }
    if (filters?.to) {
      conditions.push(lte(cashTransactions.transactionDate, filters.to));
    }

    const query = db
      .select()
      .from(cashTransactions)
      .where(and(...conditions))
      .orderBy(desc(cashTransactions.transactionDate), desc(cashTransactions.id));

    if (filters?.limit) {
      return query.limit(filters.limit);
    }

    return query;
  },

  findById: async (id: string, businessProfileId: string) => {
    const [tx] = await db
      .select()
      .from(cashTransactions)
      .where(
        and(
          eq(cashTransactions.id, id),
          eq(cashTransactions.businessProfileId, businessProfileId),
        ),
      )
      .limit(1);
    return tx ?? null;
  },

  create: async (input: {
    businessProfileId: string;
    transactionDate: string;
    type: 'income' | 'expense';
    amount: string;
    category?: string;
    note?: string;
  }) => {
    const [tx] = await db.insert(cashTransactions).values([input] as any).returning();
    return tx;
  },

  update: async (
    id: string,
    businessProfileId: string,
    input: Partial<{
      transactionDate: string;
      type: 'income' | 'expense';
      amount: string;
      category: string;
      note: string;
    }>,
  ) => {
    const [tx] = await db
      .update(cashTransactions)
      .set({ ...input, updatedAt: new Date() })
      .where(
        and(
          eq(cashTransactions.id, id),
          eq(cashTransactions.businessProfileId, businessProfileId),
        ),
      )
      .returning();
    return tx ?? null;
  },

  delete: async (id: string, businessProfileId: string) => {
    const [tx] = await db
      .delete(cashTransactions)
      .where(
        and(
          eq(cashTransactions.id, id),
          eq(cashTransactions.businessProfileId, businessProfileId),
        ),
      )
      .returning();
    return tx ?? null;
  },
};
