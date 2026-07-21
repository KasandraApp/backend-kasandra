import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui';
import { loggerMiddleware } from './middleware/logger.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { API_PREFIX } from './config/constants';
import healthRoute from './routes/health.route';
import authRoute from './routes/auth';
import cashRoute from './routes/cash.route';
import inventoryRoute from './routes/inventory.route';
import forecastRoute from './routes/forecast.route';
import whatIfRoute from './routes/whatif.route';
import alertRoute from './routes/alert.route';
import { openApiSpec } from './openapi';
import { env } from './config/env';
// Avoid eager DB initialization during tests and local bootstrapping.
void import('./db').catch(() => undefined);
const app = new Hono();
app.options('*', (c) => c.text('OK', {
    headers: {
        'Access-Control-Allow-Origin': env.frontendUrl,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
    },
}));
app.use('*', async (c, next) => {
    await next();
    const origin = c.req.header('origin');
    if (origin && origin === env.frontendUrl) {
        c.header('Access-Control-Allow-Origin', origin);
        c.header('Access-Control-Allow-Credentials', 'true');
        c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    return c;
});
app.use('*', loggerMiddleware);
app.use('*', errorMiddleware);
app.get('/docs', swaggerUI({ url: '/openapi.json' }));
app.get('/docs{*}', swaggerUI({ url: '/openapi.json' }));
app.get('/openapi.json', (c) => c.json(openApiSpec));
app.route('/health', healthRoute);
app.route(`${API_PREFIX}/health`, healthRoute);
app.route(`${API_PREFIX}/auth`, authRoute);
app.route(`${API_PREFIX}/cash-transactions`, cashRoute);
app.route(`${API_PREFIX}/inventory-items`, inventoryRoute);
app.route(`${API_PREFIX}/forecast`, forecastRoute);
app.route(`${API_PREFIX}/what-if`, whatIfRoute);
app.route(`${API_PREFIX}/alerts`, alertRoute);
export default app;
