import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { db } from '../db';
import { cashTransactions } from '../db/schema';
export const cashRepository = {
    findAll: async (businessProfileId, filters) => {
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
    findById: async (id, businessProfileId) => {
        const [tx] = await db
            .select()
            .from(cashTransactions)
            .where(and(eq(cashTransactions.id, id), eq(cashTransactions.businessProfileId, businessProfileId)))
            .limit(1);
        return tx ?? null;
    },
    create: async (input) => {
        const [tx] = await db.insert(cashTransactions).values([input]).returning();
        return tx;
    },
    update: async (id, businessProfileId, input) => {
        const [tx] = await db
            .update(cashTransactions)
            .set({ ...input, updatedAt: new Date() })
            .where(and(eq(cashTransactions.id, id), eq(cashTransactions.businessProfileId, businessProfileId)))
            .returning();
        return tx ?? null;
    },
    delete: async (id, businessProfileId) => {
        const [tx] = await db
            .delete(cashTransactions)
            .where(and(eq(cashTransactions.id, id), eq(cashTransactions.businessProfileId, businessProfileId)))
            .returning();
        return tx ?? null;
    },
};
