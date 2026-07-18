import { beforeEach, describe, expect, it, vi } from 'vitest';

const findAllMock = vi.fn();

vi.mock('../src/repositories/cash.repository', () => ({
  cashRepository: {
    findAll: findAllMock,
  },
}));

import { cashService } from '../src/services/cash.service';

describe('cash service db-first behavior', () => {
  beforeEach(() => {
    findAllMock.mockReset();
  });

  it('returns a database failure instead of falling back to the in-memory store', async () => {
    findAllMock.mockRejectedValue(new Error('database unavailable'));

    const result = await cashService.list('business-profile-id');

    expect(result.success).toBe(false);
    expect(result.message).toContain('Database unavailable');
  });
});
