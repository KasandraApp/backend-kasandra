import { Hono } from 'hono';
import { alertController } from '../controllers/alert.controller';
import { authMiddleware } from '../middleware/auth.middleware';
const alertRoute = new Hono();
alertRoute.get('/', authMiddleware, (c) => alertController.list(c));
alertRoute.get('/:id', authMiddleware, (c) => alertController.getById(c));
alertRoute.patch('/:id/read', authMiddleware, (c) => alertController.markRead(c));
alertRoute.patch('/:id/resolve', authMiddleware, (c) => alertController.markResolved(c));
export default alertRoute;
