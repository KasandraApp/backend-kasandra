import dotenv from 'dotenv';
dotenv.config();
export const env = {
    port: Number(process.env.PORT ?? 3000),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    databaseUrl: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/kasandra',
    jwtSecret: process.env.JWT_SECRET ?? 'development-secret',
    redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
    googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI ?? '',
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
};
