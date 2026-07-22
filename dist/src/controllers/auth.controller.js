import { env } from '../config/env.js';
import { authService } from '../services/auth.service.js';
import { oauthService } from '../services/oauth.service.js';
export const authController = {
    register: async (c) => {
        const payload = await c.req.json().catch(() => ({}));
        const result = await authService.register(payload);
        if (result.success) {
            return c.json(result, 201);
        }
        return c.json(result, 400);
    },
    login: async (c) => {
        const payload = await c.req.json().catch(() => ({}));
        const result = await authService.login(payload);
        if (result.success) {
            return c.json(result, 200);
        }
        return c.json(result, 401);
    },
    logout: async (c) => {
        return c.json({ success: true, message: 'Logout berhasil' });
    },
    me: async (c) => {
        const auth = c.get('auth');
        const result = await authService.me(auth.userId, auth.businessProfileId);
        if (result.success) {
            return c.json(result.data, 200);
        }
        return c.json(result, 404);
    },
    updateProfile: async (c) => {
        const auth = c.get('auth');
        const payload = await c.req.json().catch(() => ({}));
        const result = await authService.updateProfile(auth.userId, auth.businessProfileId, payload);
        if (result.success) {
            return c.json(result.data, 200);
        }
        return c.json(result, 400);
    },
    forgotPassword: async (c) => {
        const payload = await c.req.json().catch(() => ({}));
        const result = await authService.forgotPassword(payload);
        if (result.success) {
            return c.json(result, 200);
        }
        return c.json(result, 400);
    },
    verifyOtp: async (c) => {
        const payload = await c.req.json().catch(() => ({}));
        const result = await authService.verifyOtp(payload);
        if (result.success) {
            return c.json(result, 200);
        }
        return c.json(result, 400);
    },
    resetPassword: async (c) => {
        const payload = await c.req.json().catch(() => ({}));
        const result = await authService.resetPassword(payload);
        if (result.success) {
            return c.json(result, 200);
        }
        return c.json(result, 400);
    },
    google: async (c) => {
        const intent = c.req.query('intent') === 'register' ? 'register' : 'login';
        const redirectUri = env.googleRedirectUri || `${c.req.header('x-forwarded-proto') ?? 'http'}://${c.req.header('host') ?? 'localhost'}/api/v1/auth/google/callback`;
        const url = oauthService.buildAuthUrl(redirectUri, env.googleClientId, intent);
        return c.redirect(url);
    },
    googleCallback: async (c) => {
        const code = c.req.query('code');
        const state = c.req.query('state');
        const intent = state === 'register' ? 'register' : 'login';
        if (!code) {
            return c.json({ success: false, message: 'Missing Google OAuth code' }, 400);
        }
        if (!env.googleClientId || !env.googleClientSecret) {
            return c.json({ success: false, message: 'Google OAuth is not configured' }, 500);
        }
        try {
            const redirectUri = env.googleRedirectUri || `${c.req.header('x-forwarded-proto') ?? 'http'}://${c.req.header('host') ?? 'localhost'}/api/v1/auth/google/callback`;
            const tokenPayload = await oauthService.exchangeCode(code, redirectUri);
            const accessToken = tokenPayload.access_token;
            if (!accessToken) {
                return c.json({ success: false, message: 'Failed to exchange Google code' }, 400);
            }
            const userInfo = await oauthService.fetchUserInfo(accessToken);
            const email = userInfo.email;
            const googleId = userInfo.id;
            const fullName = userInfo.name ?? email ?? 'Google User';
            if (!email || !googleId) {
                return c.json({ success: false, message: 'Unable to read Google profile' }, 400);
            }
            const result = await authService.googleLogin({
                fullName,
                email,
                googleId,
                businessName: `${fullName}'s Business`,
            }, { intent });
            const responseData = result.data;
            if (result.success && responseData?.access_token) {
                const redirectPath = intent === 'register' && responseData.requires_business_setup ? '/oauth/google/setup' : '/';
                return c.redirect(`${env.frontendUrl}${redirectPath}?token=${responseData.access_token}&mode=${intent}`);
            }
            return c.json(result, result.success ? 200 : 400);
        }
        catch {
            return c.json({ success: false, message: 'Google OAuth failed' }, 500);
        }
    },
};
