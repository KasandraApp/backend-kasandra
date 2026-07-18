import type { Context } from 'hono';
import { alertService } from '../services/alert.service';

export const alertController = {
  list: async (c: Context) => {
    const auth = c.get('auth');
    const query = c.req.query();
    const result = await alertService.list(auth.businessProfileId, { status: query.status });
    return c.json(result, result.success ? 200 : 400);
  },

  getById: async (c: Context) => {
    const auth = c.get('auth');
    const id = c.req.param('id');
    if (!id) {
      return c.json({ success: false, message: 'Missing id' }, 400);
    }
    const result = await alertService.get(auth.businessProfileId, id);
    return c.json(result, result.success ? 200 : 404);
  },

  markRead: async (c: Context) => {
    const auth = c.get('auth');
    const id = c.req.param('id');
    if (!id) {
      return c.json({ success: false, message: 'Missing id' }, 400);
    }
    const result = await alertService.markRead(auth.businessProfileId, id);
    return c.json(result, result.success ? 200 : 400);
  },

  markResolved: async (c: Context) => {
    const auth = c.get('auth');
    const id = c.req.param('id');
    if (!id) {
      return c.json({ success: false, message: 'Missing id' }, 400);
    }
    const result = await alertService.markResolved(auth.businessProfileId, id);
    return c.json(result, result.success ? 200 : 400);
  },
};
