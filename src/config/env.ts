import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: process.env.JWT_SECRET ?? '',
  redisUrl: process.env.REDIS_URL ?? '',
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI ?? '',
  frontendUrl: process.env.FRONTEND_URL ?? '',
  googleSheetsClientEmail: process.env.GOOGLE_CLIENT_EMAIL ?? '',
  googleSheetsPrivateKey: (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
  feedbackSpreadsheetId: process.env.GOOGLE_SHEET_ID ?? '',
};
