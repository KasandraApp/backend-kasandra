import { createInventoryItemSchema, updateInventoryItemSchema } from '../schemas/inventory.schema.js';
import { ok, fail, created } from '../utils/response.js';
import { forecastService } from './forecast.service.js';
import { inventoryRepository } from '../repositories/inventory.repository.js';

const nowIso = () => new Date().toISOString();

function buildItemResponse(item: { id: string; itemName: string; currentStock: number; averageSalesPerDay: number; unit: string; minimumThreshold: number; createdAt: string; updatedAt: string }) {
  const daysRemaining = item.averageSalesPerDay > 0 ? item.currentStock / item.averageSalesPerDay : Infinity;
  const severity = daysRemaining <= 3 ? 'critical' : daysRemaining <= 7 ? 'warning' : 'info';

  return {
    id: item.id,
    item_name: item.itemName,
    current_stock: item.currentStock,
    average_sales_per_day: item.averageSalesPerDay,
    unit: item.unit,
    minimum_threshold: item.minimumThreshold,
    days_remaining: Number.isFinite(daysRemaining) ? Math.floor(daysRemaining) : Infinity,
    severity,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

const normalizeItem = (item: Record<string, unknown>) => ({
  id: String(item.id),
  itemName: typeof item.itemName === 'string' ? item.itemName : '',
  currentStock: Number(item.currentStock ?? 0),
  averageSalesPerDay: Number(item.averageSalesPerDay ?? 0),
  unit: typeof item.unit === 'string' ? item.unit : 'pcs',
  minimumThreshold: Number(item.minimumThreshold ?? 0),
  createdAt: typeof item.createdAt === 'string' ? item.createdAt : nowIso(),
  updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : nowIso(),
});

export const inventoryService = {
  list: async (businessProfileId: string) => {
    try {
      const items = await inventoryRepository.findAllItems(businessProfileId);
      return ok({ items: items.map((item) => buildItemResponse(normalizeItem(item as Record<string, unknown>))), total: items.length });
    } catch (error) {
      return fail('Database unavailable while loading inventory items', [{ field: 'database', message: error instanceof Error ? error.message : 'Unknown database error' }]);
    }
  },

  create: async (businessProfileId: string, input: unknown) => {
    const parsed = createInventoryItemSchema.safeParse(input);
    if (!parsed.success) {
      return fail('Invalid inventory payload', parsed.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })));
    }

    try {
      const persisted = await inventoryRepository.createItem({
        businessProfileId,
        itemName: parsed.data.namaBarang,
        currentStock: String(parsed.data.jumlahStok),
        averageSalesPerDay: String(parsed.data.rataRataTerjualPerHari),
        unit: parsed.data.satuan,
        minimumThreshold: '0',
      });
      const normalized = normalizeItem(persisted as Record<string, unknown>);
      await forecastService.recalculate(businessProfileId);
      return created(buildItemResponse(normalized), 'Stok berhasil ditambahkan');
    } catch (error) {
      return fail('Database unavailable while creating the inventory item', [{ field: 'database', message: error instanceof Error ? error.message : 'Unknown database error' }]);
    }
  },

  update: async (businessProfileId: string, id: string, input: unknown) => {
    const parsed = updateInventoryItemSchema.safeParse(input);
    if (!parsed.success) {
      return fail('Invalid inventory payload', parsed.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })));
    }

    try {
      const updated = await inventoryRepository.updateItem(id, businessProfileId, {
        itemName: parsed.data.namaBarang,
        currentStock: parsed.data.jumlahStok ? String(parsed.data.jumlahStok) : undefined,
        averageSalesPerDay: parsed.data.rataRataTerjualPerHari ? String(parsed.data.rataRataTerjualPerHari) : undefined,
        unit: parsed.data.satuan,
      });
      if (!updated) {
        return fail('Item not found');
      }
      const normalized = normalizeItem(updated as Record<string, unknown>);
      await forecastService.recalculate(businessProfileId);
      return ok(buildItemResponse(normalized), 'Stok berhasil diperbarui');
    } catch (error) {
      return fail('Database unavailable while updating the inventory item', [{ field: 'database', message: error instanceof Error ? error.message : 'Unknown database error' }]);
    }
  },

  delete: async (businessProfileId: string, id: string) => {
    try {
      const deleted = await inventoryRepository.deleteItem(id, businessProfileId);
      if (!deleted) {
        return fail('Item not found');
      }
      await forecastService.recalculate(businessProfileId);
      return ok({}, 'Stok berhasil dihapus');
    } catch (error) {
      return fail('Database unavailable while deleting the inventory item', [{ field: 'database', message: error instanceof Error ? error.message : 'Unknown database error' }]);
    }
  },
};
