import { env } from '../config/env.js';
import { createSign } from 'node:crypto';

interface FeedbackPayload {
  nama: string;
  email: string;
  masukan: string;
}

/**
 * Base64url-encode a Buffer.
 */
function base64Url(input: Buffer): string {
  return input
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Generate a Google Service Account JWT assertion signed with RS256 using native Node crypto.
 */
function generateJwtAssertion(): string {
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: env.googleSheetsClientEmail,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64Url(Buffer.from(JSON.stringify(header)));
  const encodedClaimSet = base64Url(Buffer.from(JSON.stringify(claimSet)));
  const signatureInput = `${encodedHeader}.${encodedClaimSet}`;

  const sign = createSign('RSA-SHA256');
  sign.update(signatureInput);
  sign.end();
  const signature = sign.sign(env.googleSheetsPrivateKey);
  const encodedSignature = base64Url(signature);

  return `${signatureInput}.${encodedSignature}`;
}

/**
 * Exchange the JWT assertion for an access token.
 */
async function getAccessToken(): Promise<string> {
  const assertion = generateJwtAssertion();
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to get Google Sheets access token: ${body}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

/**
 * Append a row to the feedback spreadsheet.
 * Columns: Timestamp, Nama, Email, Masukan
 */
async function appendToSheet(accessToken: string, data: FeedbackPayload): Promise<void> {
  const spreadsheetId = env.feedbackSpreadsheetId;
  const range = 'Sheet1!A:D'; // Columns: Timestamp, Nama, Email, Masukan

  const timestamp = new Date().toISOString();
  const body = {
    values: [[timestamp, data.nama, data.email, data.masukan]],
  };

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to append row to sheet: ${text}`);
  }
}

export const feedbackService = {
  /**
   * Submit feedback by appending a row to Google Sheets using a service account.
   */
  submitFeedback: async (payload: FeedbackPayload): Promise<void> => {
    if (!env.googleSheetsClientEmail || !env.googleSheetsPrivateKey || !env.feedbackSpreadsheetId) {
      throw new Error(
        'Google Sheets feedback is not configured. Set GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_SHEET_ID environment variables.',
      );
    }

    const accessToken = await getAccessToken();
    await appendToSheet(accessToken, payload);
  },
};

