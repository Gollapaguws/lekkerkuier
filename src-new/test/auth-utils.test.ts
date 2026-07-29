import { describe, it, expect } from 'vitest';
import { ROLE_RANK, roleAtLeast, type Role } from '../src/auth/AuthProvider';

describe('ROLE_RANK', () => {
  it('ranks roles in ascending order', () => {
    expect(ROLE_RANK.listener).toBe(0);
    expect(ROLE_RANK.dj).toBe(1);
    expect(ROLE_RANK.manager).toBe(2);
    expect(ROLE_RANK.owner).toBe(3);
  });
});

describe('roleAtLeast', () => {
  it('returns true when role meets minimum', () => {
    expect(roleAtLeast('owner', 'owner')).toBe(true);
    expect(roleAtLeast('manager', 'manager')).toBe(true);
    expect(roleAtLeast('owner', 'listener')).toBe(true);
    expect(roleAtLeast('dj', 'listener')).toBe(true);
    expect(roleAtLeast('owner', 'dj')).toBe(true);
  });

  it('returns false when role is below minimum', () => {
    expect(roleAtLeast('listener', 'dj')).toBe(false);
    expect(roleAtLeast('listener', 'manager')).toBe(false);
    expect(roleAtLeast('listener', 'owner')).toBe(false);
    expect(roleAtLeast('dj', 'manager')).toBe(false);
    expect(roleAtLeast('dj', 'owner')).toBe(false);
    expect(roleAtLeast('manager', 'owner')).toBe(false);
  });
});
