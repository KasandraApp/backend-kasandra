import jwt from 'jsonwebtoken';
import { env } from '../config/env';
export function signAccessToken(payload) {
    return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });
}
export function verifyAccessToken(token) {
    return jwt.verify(token, env.jwtSecret);
}
export const authMiddleware = async (c, next) => {
    const header = c.req.header('authorization');
    if (!header?.startsWith('Bearer ')) {
        return c.json({ success: false, message: 'Unauthorized' }, 401);
    }
    try {
        const token = header.slice(7);
        const payload = verifyAccessToken(token);
        c.set('auth', payload);
        await next();
    }
    catch {
        return c.json({ success: false, message: 'Invalid or expired token' }, 401);
    }
};
