import { createInventoryItemSchema, updateInventoryItemSchema } from '../schemas/inventory.schema';
import { ok, fail, created } from '../utils/response';
import { createId, nowIso, store } from '../utils/in-memory-store';
import { forecastService } from './forecast.service';
import { inventoryRepository } from '../repositories/inventory.repository';
function buildItemResponse(item) {
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
const normalizeItem = (item) => ({
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
    list: async (businessProfileId) => {
        try {
            const items = await inventoryRepository.findAllItems(businessProfileId);
            return ok({ items: items.map((item) => buildItemResponse(normalizeItem(item))), total: items.length });
        }
        catch (error) {
            return fail('Database unavailable while loading inventory items', [{ field: 'database', message: error instanceof Error ? error.message : 'Unknown database error' }]);
        }
    },
    create: async (businessProfileId, input) => {
        const parsed = createInventoryItemSchema.safeParse(input);
        if (!parsed.success) {
            return fail('Invalid inventory payload', parsed.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })));
        }
        const item = {
            id: createId(),
            businessProfileId,
            itemName: parsed.data.namaBarang,
            currentStock: parsed.data.jumlahStok,
            averageSalesPerDay: parsed.data.rataRataTerjualPerHari,
            unit: parsed.data.satuan,
            minimumThreshold: 0,
            createdAt: nowIso(),
            updatedAt: nowIso(),
        };
        try {
            const persisted = await inventoryRepository.createItem({
                businessProfileId,
                itemName: parsed.data.namaBarang,
                currentStock: String(parsed.data.jumlahStok),
                averageSalesPerDay: String(parsed.data.rataRataTerjualPerHari),
                unit: parsed.data.satuan,
                minimumThreshold: '0',
            });
            const normalized = normalizeItem(persisted);
            store.inventoryItems.push(normalized);
            await forecastService.recalculate(businessProfileId);
            return created(buildItemResponse(normalized), 'Stok berhasil ditambahkan');
        }
        catch (error) {
            return fail('Database unavailable while creating the inventory item', [{ field: 'database', message: error instanceof Error ? error.message : 'Unknown database error' }]);
        }
    },
    update: async (businessProfileId, id, input) => {
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
            const normalized = normalizeItem(updated);
            await forecastService.recalculate(businessProfileId);
            return ok(buildItemResponse(normalized), 'Stok berhasil diperbarui');
        }
        catch (error) {
            return fail('Database unavailable while updating the inventory item', [{ field: 'database', message: error instanceof Error ? error.message : 'Unknown database error' }]);
        }
    },
    delete: async (businessProfileId, id) => {
        try {
            const deleted = await inventoryRepository.deleteItem(id, businessProfileId);
            if (!deleted) {
                return fail('Item not found');
            }
            await forecastService.recalculate(businessProfileId);
            return ok({}, 'Stok berhasil dihapus');
        }
        catch (error) {
            return fail('Database unavailable while deleting the inventory item', [{ field: 'database', message: error instanceof Error ? error.message : 'Unknown database error' }]);
        }
    },
};
