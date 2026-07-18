import { Hono } from 'hono';
import { authController } from '../../controllers/auth.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const authRoute = new Hono();

authRoute.post('/register', (c) => authController.register(c));
authRoute.post('/login', (c) => authController.login(c));
authRoute.get('/google', (c) => authController.google(c));
authRoute.get('/google/callback', (c) => authController.googleCallback(c));
authRoute.post('/logout', authMiddleware, (c) => authController.logout(c));
authRoute.get('/me', authMiddleware, (c) => authController.me(c));

export default authRoute;
