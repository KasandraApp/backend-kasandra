import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { inventoryItems, inventoryMovements } from '../db/schema.js';
export const inventoryRepository = {
    findAllItems: async (businessProfileId) => {
        return db
            .select()
            .from(inventoryItems)
            .where(eq(inventoryItems.businessProfileId, businessProfileId))
            .orderBy(desc(inventoryItems.updatedAt));
    },
    findItemById: async (id, businessProfileId) => {
        const [item] = await db
            .select()
            .from(inventoryItems)
            .where(and(eq(inventoryItems.id, id), eq(inventoryItems.businessProfileId, businessProfileId)))
            .limit(1);
        return item ?? null;
    },
    createItem: async (input) => {
        const [item] = await db.insert(inventoryItems).values([input]).returning();
        return item;
    },
    updateItem: async (id, businessProfileId, input) => {
        const [item] = await db
            .update(inventoryItems)
            .set({ ...input, updatedAt: new Date() })
            .where(and(eq(inventoryItems.id, id), eq(inventoryItems.businessProfileId, businessProfileId)))
            .returning();
        return item ?? null;
    },
    deleteItem: async (id, businessProfileId) => {
        const [item] = await db
            .delete(inventoryItems)
            .where(and(eq(inventoryItems.id, id), eq(inventoryItems.businessProfileId, businessProfileId)))
            .returning();
        return item ?? null;
    },
    findMovements: async (inventoryItemId) => {
        return db
            .select()
            .from(inventoryMovements)
            .where(eq(inventoryMovements.inventoryItemId, inventoryItemId))
            .orderBy(desc(inventoryMovements.movementDate));
    },
    createMovement: async (input) => {
        const [movement] = await db.insert(inventoryMovements).values([input]).returning();
        return movement;
    },
};
