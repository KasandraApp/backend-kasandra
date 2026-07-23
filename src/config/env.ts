import dotenv from 'dotenv';

dotenv.config();

interface GoogleServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}

function parseGoogleServiceAccount(raw: string | undefined): GoogleServiceAccount | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GoogleServiceAccount;
  } catch {
    return null;
  }
}

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
  googleServiceAccount: parseGoogleServiceAccount(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
  feedbackSpreadsheetId: process.env.FEEDBACK_SPREADSHEET_ID ?? '',
};

