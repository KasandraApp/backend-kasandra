import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { inventoryItems, inventoryMovements } from '../db/schema';

export const inventoryRepository = {
  findAllItems: async (businessProfileId: string) => {
    return db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.businessProfileId, businessProfileId))
      .orderBy(desc(inventoryItems.updatedAt));
  },

  findItemById: async (id: string, businessProfileId: string) => {
    const [item] = await db
      .select()
      .from(inventoryItems)
      .where(
        and(eq(inventoryItems.id, id), eq(inventoryItems.businessProfileId, businessProfileId)),
      )
      .limit(1);
    return item ?? null;
  },

  createItem: async (input: {
    businessProfileId: string;
    itemName: string;
    currentStock: string;
    averageSalesPerDay: string;
    unit: 'kg' | 'liter' | 'pcs' | 'pack';
    minimumThreshold?: string;
  }) => {
    const [item] = await db.insert(inventoryItems).values([input] as any).returning();
    return item;
  },

  updateItem: async (
    id: string,
    businessProfileId: string,
    input: Partial<{
      itemName: string;
      currentStock: string;
      averageSalesPerDay: string;
      unit: 'kg' | 'liter' | 'pcs' | 'pack';
      minimumThreshold: string;
    }>,
  ) => {
    const [item] = await db
      .update(inventoryItems)
      .set({ ...input, updatedAt: new Date() })
      .where(
        and(eq(inventoryItems.id, id), eq(inventoryItems.businessProfileId, businessProfileId)),
      )
      .returning();
    return item ?? null;
  },

  deleteItem: async (id: string, businessProfileId: string) => {
    const [item] = await db
      .delete(inventoryItems)
      .where(
        and(eq(inventoryItems.id, id), eq(inventoryItems.businessProfileId, businessProfileId)),
      )
      .returning();
    return item ?? null;
  },

  findMovements: async (inventoryItemId: string) => {
    return db
      .select()
      .from(inventoryMovements)
      .where(eq(inventoryMovements.inventoryItemId, inventoryItemId))
      .orderBy(desc(inventoryMovements.movementDate));
  },

  createMovement: async (input: {
    inventoryItemId: string;
    movementDate: string;
    movementType: 'in' | 'out' | 'adjustment';
    quantity: string;
    note?: string;
  }) => {
    const [movement] = await db.insert(inventoryMovements).values([input] as any).returning();
    return movement;
  },
};
