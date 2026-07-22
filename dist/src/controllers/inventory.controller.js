import { inventoryService } from '../services/inventory.service.js';
export const inventoryController = {
    list: async (c) => {
        const auth = c.get('auth');
        const result = await inventoryService.list(auth.businessProfileId);
        if (result.success) {
            return c.json(result.data, 200);
        }
        return c.json(result, 400);
    },
    create: async (c) => {
        const auth = c.get('auth');
        const payload = await c.req.json().catch(() => ({}));
        const result = await inventoryService.create(auth.businessProfileId, payload);
        if (result.success) {
            return c.json(result.data, 201);
        }
        return c.json(result, 400);
    },
    update: async (c) => {
        const auth = c.get('auth');
        const id = c.req.param('id');
        if (!id) {
            return c.json({ success: false, message: 'Missing id' }, 400);
        }
        const payload = await c.req.json().catch(() => ({}));
        const result = await inventoryService.update(auth.businessProfileId, id, payload);
        if (result.success) {
            return c.json(result.data, 200);
        }
        return c.json(result, 400);
    },
    delete: async (c) => {
        const auth = c.get('auth');
        const id = c.req.param('id');
        if (!id) {
            return c.json({ success: false, message: 'Missing id' }, 400);
        }
        const result = await inventoryService.delete(auth.businessProfileId, id);
        if (result.success) {
            return c.json(result.data, 200);
        }
        return c.json(result, 404);
    },
};
