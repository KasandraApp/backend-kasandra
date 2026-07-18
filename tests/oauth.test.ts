import { describe, expect, it } from 'vitest';
import { oauthService } from '../src/services/oauth.service';

describe('google oauth helpers', () => {
  it('builds an authorization URL with the expected Google OAuth parameters', () => {
    const url = oauthService.buildAuthUrl('https://api.kasandra.app/api/v1/auth/google/callback', 'client-id-123');

    expect(url).toContain('https://accounts.google.com/o/oauth2/v2/auth');
    expect(url).toContain('client_id=client-id-123');
    expect(url).toContain('redirect_uri=https%3A%2F%2Fapi.kasandra.app%2Fapi%2Fv1%2Fauth%2Fgoogle%2Fcallback');
    expect(url).toContain('response_type=code');
    expect(url).toContain('scope=openid+email+profile');
  });
});
