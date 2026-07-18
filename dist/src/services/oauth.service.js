import { env } from '../config/env';
export const oauthService = {
    buildAuthUrl: (redirectUri, clientId) => {
        const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        url.searchParams.set('client_id', clientId);
        url.searchParams.set('redirect_uri', redirectUri);
        url.searchParams.set('response_type', 'code');
        url.searchParams.set('scope', 'openid email profile');
        url.searchParams.set('access_type', 'offline');
        return url.toString();
    },
    exchangeCode: async (code, redirectUri) => {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: env.googleClientId,
                client_secret: env.googleClientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });
        if (!response.ok) {
            throw new Error('Failed to exchange Google authorization code');
        }
        return response.json();
    },
    fetchUserInfo: async (accessToken) => {
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch Google user profile');
        }
        return response.json();
    },
};
