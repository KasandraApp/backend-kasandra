import { Hono } from 'hono';
import { forecastController } from '../controllers/forecast.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
const forecastRoute = new Hono();
forecastRoute.get('/', authMiddleware, (c) => forecastController.getLatest(c));
forecastRoute.post('/recalculate', authMiddleware, (c) => forecastController.recalculate(c));
forecastRoute.get('/history', authMiddleware, (c) => forecastController.history(c));
export default forecastRoute;
