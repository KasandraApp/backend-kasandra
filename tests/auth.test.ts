import { describe, expect, it } from 'vitest';
import app from '../src/app';
import { authService } from '../src/services/auth.service';

describe('auth endpoints', () => {
  it('registers a new user and returns a token', async () => {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const email = `test-${uniqueSuffix}@example.com`;

    const res = await app.request('http://localhost/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email,
        password: 'secret123',
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          user: expect.objectContaining({ email }),
        }),
      }),
    );
  });

  it('logs in an existing user', async () => {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const email = `test-${uniqueSuffix}@example.com`;

    await app.request('http://localhost/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email,
        password: 'secret123',
      }),
    });

    const res = await app.request('http://localhost/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password: 'secret123',
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          access_token: expect.any(String),
        }),
      }),
    );
  });

  it('upserts a Google user by google id without creating duplicates', async () => {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const email = `google-upsert-${uniqueSuffix}@example.com`;
    const googleId = `google-upsert-${uniqueSuffix}`;

    const first = await authService.googleLogin({
      fullName: 'Google User',
      email,
      googleId,
      businessName: 'Google Business',
    });

    expect(first.success).toBe(true);
    expect(first.data).toEqual(
      expect.objectContaining({
        is_new_user: true,
        user: expect.objectContaining({ email }),
      }),
    );

    const second = await authService.googleLogin({
      fullName: 'Google User',
      email,
      googleId,
      businessName: 'Google Business',
    });

    expect(second.success).toBe(true);
    expect(second.data).toEqual(
      expect.objectContaining({
        is_new_user: false,
        user: expect.objectContaining({ email }),
      }),
    );
    expect((second.data as { user: { id: string } }).user.id).toBe((first.data as { user: { id: string } }).user.id);
  });
});
