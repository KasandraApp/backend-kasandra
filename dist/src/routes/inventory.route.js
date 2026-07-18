import { Hono } from 'hono';
import { inventoryController } from '../controllers/inventory.controller';
import { authMiddleware } from '../middleware/auth.middleware';
const inventoryRoute = new Hono();
inventoryRoute.get('/', authMiddleware, (c) => inventoryController.list(c));
inventoryRoute.post('/', authMiddleware, (c) => inventoryController.create(c));
inventoryRoute.patch('/:id', authMiddleware, (c) => inventoryController.update(c));
inventoryRoute.delete('/:id', authMiddleware, (c) => inventoryController.delete(c));
export default inventoryRoute;
