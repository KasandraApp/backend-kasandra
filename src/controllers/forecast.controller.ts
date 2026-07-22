import type { Context } from 'hono';
import { forecastService } from '../services/forecast.service.js';

export const forecastController = {
  getLatest: async (c: Context) => {
    const auth = c.get('auth');
    const result = await forecastService.getLatest(auth.businessProfileId);
    return c.json(result, result.success ? 200 : 404);
  },

  recalculate: async (c: Context) => {
    const auth = c.get('auth');
    const result = await forecastService.recalculate(auth.businessProfileId);
    return c.json(result, result.success ? 200 : 400);
  },

  history: async (c: Context) => {
    const auth = c.get('auth');
    const result = await forecastService.history(auth.businessProfileId);
    return c.json(result, result.success ? 200 : 400);
  },
};
