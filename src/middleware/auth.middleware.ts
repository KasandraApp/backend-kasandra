import type { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export type AuthPayload = {
  userId: string;
  businessProfileId: string;
  email: string;
};

declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthPayload;
  }
}

export function signAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): AuthPayload {
  return jwt.verify(token, env.jwtSecret) as AuthPayload;
}

export const authMiddleware = async (c: Context, next: Next) => {
  const header = c.req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Unauthorized' }, 401);
  }

  try {
    const token = header.slice(7);
    const payload = verifyAccessToken(token);
    c.set('auth', payload);
    await next();
  } catch {
    return c.json({ success: false, message: 'Invalid or expired token' }, 401);
  }
};
