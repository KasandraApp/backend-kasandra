// Vercel Serverless Function entry point for Kasandra Backend
// Uses Hono's built-in Vercel adapter
// https://hono.dev/docs/getting-started/vercel

import { handle } from 'hono/vercel';
import app from '../src/app';

// Vercel requires a named export for serverless functions
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
