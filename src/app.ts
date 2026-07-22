import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui';
import { loggerMiddleware } from './middleware/logger.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { API_PREFIX } from './config/constants.js';
import healthRoute from './routes/health.route.js';
import authRoute from './routes/auth/index.js';
import cashRoute from './routes/cash.route.js';
import inventoryRoute from './routes/inventory.route.js';
import forecastRoute from './routes/forecast.route.js';
import whatIfRoute from './routes/whatif.route.js';
import alertRoute from './routes/alert.route.js';
import { openApiSpec } from './openapi.js';
import { env } from './config/env.js';

// Avoid eager DB initialization during tests and local bootstrapping.
void import('./db').catch(() => undefined);

const app = new Hono();

// Helper to check if an origin is allowed for CORS
const isOriginAllowed = (origin: string): boolean => {
  // Always allow the configured frontend URL
  if (origin === env.frontendUrl) return true;
  
  // Allow Vercel preview deployments (kasandra-frontend.vercel.app)
  if (origin.endsWith('.vercel.app')) return true;
  
  // Allow localhost in development
  if (env.nodeEnv === 'development' && /^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  
  return false;
};

app.options('*', (c) => {
  const origin = c.req.header('origin') ?? '';
  const allowedOrigin = isOriginAllowed(origin) ? origin : env.frontendUrl;
  return c.text('OK', {
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
});

app.use('*', async (c, next) => {
  await next();
  const origin = c.req.header('origin') ?? '';
  if (origin && isOriginAllowed(origin)) {
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
