import { Hono } from 'hono';
import { healthController } from '../controllers/health.controller';
const healthRoute = new Hono();
healthRoute.get('/', (c) => c.json(healthController()));
export default healthRoute;
