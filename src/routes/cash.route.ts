import { Hono } from 'hono';
import { cashController } from '../controllers/cash.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const cashRoute = new Hono();

cashRoute.get('/', authMiddleware, (c) => cashController.list(c));
cashRoute.post('/', authMiddleware, (c) => cashController.create(c));
cashRoute.get('/:id', authMiddleware, (c) => cashController.getById(c));
cashRoute.put('/:id', authMiddleware, (c) => cashController.update(c));
cashRoute.patch('/:id', authMiddleware, (c) => cashController.update(c));
cashRoute.delete('/:id', authMiddleware, (c) => cashController.delete(c));

export default cashRoute;
