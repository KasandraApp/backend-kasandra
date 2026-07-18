import type { Context } from 'hono';
import { env } from '../config/env';
import { authService } from '../services/auth.service';
import { oauthService } from '../services/oauth.service';

export const authController = {
  register: async (c: Context) => {
    const payload = await c.req.json().catch(() => ({}));
    const result = await authService.register(payload);
    return c.json(result, result.success ? 201 : 400);
  },

  login: async (c: Context) => {
    const payload = await c.req.json().catch(() => ({}));
    const result = await authService.login(payload);
    return c.json(result, result.success ? 200 : 401);
  },

  logout: async (c: Context) => {
    return c.json({ success: true, message: 'Logout berhasil' });
  },

  me: async (c: Context) => {
    const auth = c.get('auth');
    const result = await authService.me(auth.userId, auth.businessProfileId);
    return c.json(result, result.success ? 200 : 404);
  },

  google: async (c: Context) => {
    const redirectUri = env.googleRedirectUri || `${c.req.header('x-forwarded-proto') ?? 'http'}://${c.req.header('host') ?? 'localhost'}/api/v1/auth/google/callback`;
    const url = oauthService.buildAuthUrl(redirectUri, env.googleClientId);
    return c.redirect(url);
  },

  googleCallback: async (c: Context) => {
    const code = c.req.query('code');
    if (!code) {
      return c.json({ success: false, message: 'Missing Google OAuth code' }, 400);
    }

    if (!env.googleClientId || !env.googleClientSecret || !env.googleRedirectUri) {
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
      });

      return c.json(result, result.success ? 200 : 400);
    } catch {
      return c.json({ success: false, message: 'Google OAuth failed' }, 500);
    }
  },
};
