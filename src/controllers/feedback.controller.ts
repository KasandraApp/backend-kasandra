import type { Context } from 'hono';
import { feedbackService } from '../services/feedback.service.js';
import { ok, fail } from '../utils/response.js';

export const feedbackController = {
  submitFeedback: async (c: Context) => {
    try {
      const body = await c.req.json<{ nama?: string; email?: string; masukan?: string }>();

      if (!body.nama || !body.email || !body.masukan) {
        return c.json(fail('Nama, email, and masukan are required'), 400);
      }

      await feedbackService.submitFeedback({
        nama: body.nama,
        email: body.email,
        masukan: body.masukan,
      });

      return c.json(ok(null, 'Feedback submitted successfully'), 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      return c.json(fail(message), 500);
    }
  },
};

