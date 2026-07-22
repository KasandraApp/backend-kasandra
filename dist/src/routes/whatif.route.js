import { Hono } from 'hono';
import { whatIfController } from '../controllers/whatif.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
const whatIfRoute = new Hono();
whatIfRoute.post('/simulate', authMiddleware, (c) => whatIfController.simulate(c));
whatIfRoute.get('/history', authMiddleware, (c) => whatIfController.history(c));
whatIfRoute.get('/:id', authMiddleware, (c) => whatIfController.getById(c));
whatIfRoute.delete('/:id', authMiddleware, (c) => whatIfController.delete(c));
export default whatIfRoute;
