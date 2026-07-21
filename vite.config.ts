import { defineConfig } from 'vite';
import vercel from '@hono/vite-build/vercel';

export default defineConfig({
  plugins: [
    vercel({
      entry: 'api/[[route]].ts',
    }),
  ],
});