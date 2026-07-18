import { inventoryService } from '../services/inventory.service';
export const inventoryController = {
    list: async (c) => {
        const auth = c.get('auth');
        const result = await inventoryService.list(auth.businessProfileId);
        return c.json(result, result.success ? 200 : 400);
    },
    create: async (c) => {
        const auth = c.get('auth');
        const payload = await c.req.json().catch(() => ({}));
        const result = await inventoryService.create(auth.businessProfileId, payload);
        return c.json(result, result.success ? 201 : 400);
    },
    update: async (c) => {
        const auth = c.get('auth');
        const id = c.req.param('id');
        if (!id) {
            return c.json({ success: false, message: 'Missing id' }, 400);
        }
        const payload = await c.req.json().catch(() => ({}));
        const result = await inventoryService.update(auth.businessProfileId, id, payload);
        return c.json(result, result.success ? 200 : 400);
    },
    delete: async (c) => {
        const auth = c.get('auth');
        const id = c.req.param('id');
        if (!id) {
            return c.json({ success: false, message: 'Missing id' }, 400);
        }
        const result = await inventoryService.delete(auth.businessProfileId, id);
        return c.json(result, result.success ? 200 : 404);
    },
};
