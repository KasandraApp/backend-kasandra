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
        return c.json(result, result.success ? 200 : 400);
    },
    create: async (c) => {
        const auth = c.get('auth');
        const payload = await c.req.json().catch(() => ({}));
        const result = await cashService.create(auth.businessProfileId, payload);
        return c.json(result, result.success ? 201 : 400);
    },
    getById: async (c) => {
        const auth = c.get('auth');
        const id = c.req.param('id');
        if (!id) {
            return c.json({ success: false, message: 'Missing id' }, 400);
        }
        const result = await cashService.get(auth.businessProfileId, id);
        return c.json(result, result.success ? 200 : 404);
    },
    update: async (c) => {
        const auth = c.get('auth');
        const id = c.req.param('id');
        if (!id) {
            return c.json({ success: false, message: 'Missing id' }, 400);
        }
        const payload = await c.req.json().catch(() => ({}));
        const result = await cashService.update(auth.businessProfileId, id, payload);
        return c.json(result, result.success ? 200 : 400);
    },
    delete: async (c) => {
        const auth = c.get('auth');
        const id = c.req.param('id');
        if (!id) {
            return c.json({ success: false, message: 'Missing id' }, 400);
        }
        const result = await cashService.delete(auth.businessProfileId, id);
        return c.json(result, result.success ? 200 : 404);
    },
};
