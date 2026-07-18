import { describe, expect, it } from 'vitest';
import app from '../src/app';
describe('health endpoint', () => {
    it('returns a healthy response', async () => {
        const res = await app.request('http://localhost/health');
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toEqual(expect.objectContaining({
            success: true,
            message: 'Kasandra API is healthy',
        }));
    });
});
