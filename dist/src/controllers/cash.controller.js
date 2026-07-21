import { cashService } from '../services/cash.service';
export const cashController = {
    list: async (c) => {
        const auth = c.get('auth');
        const query = c.req.query();
        const result = await cashService.list(auth.businessProfileId, {
            limit: query.limit ? Number(query.limit) : undefined,
            offset: query.offset ? Number(query.offset) : undefined,
            type: query.type,
            from_date: query.from_date,
            to_date: query.to_date,
        });
        if (result.success) {
            return c.json(result.data, 200);
        }
        return c.json(result, 400);
    },
    create: async (c) => {
        const auth = c.get('auth');
        const payload = await c.req.json().catch(() => ({}));
        const result = await cashService.create(auth.businessProfileId, payload);
        if (result.success) {
            return c.json(result.data, 201);
        }
        return c.json(result, 400);
    },
    getById: async (c) => {
        const auth = c.get('auth');
        const id = c.req.param('id');
        if (!id) {
            return c.json({ success: false, message: 'Missing id' }, 400);
        }
        const result = await cashService.get(auth.businessProfileId, id);
        if (result.success) {
            return c.json(result.data, 200);
        }
        return c.json(result, 404);
    },
    update: async (c) => {
        const auth = c.get('auth');
        const id = c.req.param('id');
        if (!id) {
            return c.json({ success: false, message: 'Missing id' }, 400);
        }
        const payload = await c.req.json().catch(() => ({}));
        const result = await cashService.update(auth.businessProfileId, id, payload);
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
        const result = await cashService.delete(auth.businessProfileId, id);
        if (result.success) {
            return c.json(result.data, 200);
        }
        return c.json(result, 404);
    },
};
