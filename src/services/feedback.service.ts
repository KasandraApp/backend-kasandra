import { env } from '../config/env.js';
import { JWT } from 'google-auth-library';

interface FeedbackPayload {
  nama: string;
  email: string;
  masukan: string;
}

/**
 * Append a row to the feedback spreadsheet using Google Sheets API v4.
 * Columns: Timestamp, Nama, Email, Masukan
 */
async function appendToSheet(jwtClient: JWT, data: FeedbackPayload): Promise<void> {
  const spreadsheetId = env.feedbackSpreadsheetId;
  const range = 'Sheet1!A:D';

  const timestamp = new Date().toISOString();
  const body = {
    values: [[timestamp, data.nama, data.email, data.masukan]],
  };

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${jwtClient.credentials.access_token}`,
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
   * Uses google-auth-library for reliable JWT assertion with RS256 signing.
   */
  submitFeedback: async (payload: FeedbackPayload): Promise<void> => {
    const sa = env.googleServiceAccount;

    if (!sa || !env.feedbackSpreadsheetId) {
      throw new Error(
        'Google Sheets feedback is not configured. Set GOOGLE_SERVICE_ACCOUNT_JSON and FEEDBACK_SPREADSHEET_ID environment variables.',
      );
    }

    // Create JWT client with the service account credentials from the JSON file
    const jwtClient = new JWT({
      email: sa.client_email,
      key: sa.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // This performs the token exchange and gives us an access_token
    await jwtClient.authorize();

    await appendToSheet(jwtClient, payload);
  },
};

