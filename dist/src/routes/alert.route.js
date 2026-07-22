import { Hono } from 'hono';
import { alertController } from '../controllers/alert.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
const alertRoute = new Hono();
alertRoute.get('/', authMiddleware, (c) => alertController.list(c));
alertRoute.get('/:id', authMiddleware, (c) => alertController.getById(c));
alertRoute.patch('/:id/read', authMiddleware, (c) => alertController.markRead(c));
alertRoute.patch('/:id/resolve', authMiddleware, (c) => alertController.markResolved(c));
export default alertRoute;
