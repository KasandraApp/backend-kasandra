import { createMiddleware } from 'hono/factory';

export const rateLimitMiddleware = createMiddleware(async (c, next) => {
  await next();
});
