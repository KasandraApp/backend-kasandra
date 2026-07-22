import type { Context } from 'hono';
import { whatIfService } from '../services/whatif.service.js';

export const whatIfController = {
  simulate: async (c: Context) => {
    const auth = c.get('auth');
    const payload = await c.req.json().catch(() => ({}));
    const result = await whatIfService.simulate(auth.businessProfileId, payload);
    return c.json(result, result.success ? 200 : 400);
  },

  history: async (c: Context) => {
    const auth = c.get('auth');
    const result = await whatIfService.history(auth.businessProfileId);
    return c.json(result, result.success ? 200 : 400);
  },

  getById: async (c: Context) => {
    const auth = c.get('auth');
    const id = c.req.param('id');
    if (!id) {
      return c.json({ success: false, message: 'Missing id' }, 400);
    }
    const result = await whatIfService.getById(auth.businessProfileId, id);
    return c.json(result, result.success ? 200 : 404);
  },

  delete: async (c: Context) => {
    const auth = c.get('auth');
    const id = c.req.param('id');
    if (!id) {
      return c.json({ success: false, message: 'Missing id' }, 400);
    }
    const result = await whatIfService.delete(auth.businessProfileId, id);
    return c.json(result, result.success ? 200 : 404);
  },
};
