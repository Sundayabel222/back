import { describe, expect, it } from 'vitest';
import { getFleetResponseSchema } from './schemas.js';

describe('fleet response schemas', () => {
  const fleet = {
    id: '00000000-0000-4000-8000-000000000000',
    chainFleetId: '1',
    ownerAddress: 'G'.repeat(128),
    treasuryAddress: 'G'.repeat(56),
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    drivers: [],
    totalActiveDrivers: 0,
  };

  it('accepts owner addresses up to the maximum length', () => {
    expect(getFleetResponseSchema.safeParse({ data: fleet }).success).toBe(true);
  });

  it('rejects owner addresses longer than the maximum length', () => {
    expect(
      getFleetResponseSchema.safeParse({
        data: { ...fleet, ownerAddress: 'G'.repeat(129) },
      }).success,
    ).toBe(false);
  });
});
