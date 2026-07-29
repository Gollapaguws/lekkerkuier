import { describe, it, expect } from 'vitest';
import { signToken, verifyToken, requireAuth, requireRole } from '../auth.js';

describe('signToken / verifyToken', () => {
  it('signs and verifies a token successfully', () => {
    const user = { id: 'abc-123', email: 'test@test.com', role: 'listener' };
    const token = signToken(user);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT format

    const decoded = verifyToken(token);
    expect(decoded.id).toBe('abc-123');
    expect(decoded.email).toBe('test@test.com');
    expect(decoded.role).toBe('listener');
  });

  it('throws on invalid token', () => {
    expect(() => verifyToken('bad-token')).toThrow();
  });

  it('throws on expired token', () => {
    const jwt = require('jsonwebtoken');
    const expired = jwt.sign(
      { id: 'x', email: 'x@x.com', role: 'listener' },
      process.env.JWT_SECRET || 'test-secret-do-not-use-in-production',
      { expiresIn: '-1h' }
    );
    expect(() => verifyToken(expired)).toThrow();
  });

  it('throws on tampered token', () => {
    const user = { id: 'abc', email: 'a@b.com', role: 'dj' };
    const token = signToken(user);
    const tampered = token.slice(0, -5) + 'xxxxx';
    expect(() => verifyToken(tampered)).toThrow();
  });
});

describe('requireAuth middleware', () => {
  // Express middleware calls methods on res, doesn't return a value.
  // We capture the status and body to assert against them.
  it('returns 401 when no Authorization header', () => {
    const req = { headers: {} };
    let capturedStatus = 0;
    let capturedBody = null;
    const res = {
      status(code) {
        capturedStatus = code;
        return { json(body) { capturedBody = body; } };
      }
    };
    requireAuth(req, res, () => {});
    expect(capturedStatus).toBe(401);
    expect(capturedBody.error).toContain('Missing');
  });

  it('returns 401 when Authorization is not Bearer', () => {
    const req = { headers: { authorization: 'Basic xyz' } };
    let capturedStatus = 0;
    let capturedBody = null;
    const res = {
      status(code) {
        capturedStatus = code;
        return { json(body) { capturedBody = body; } };
      }
    };
    requireAuth(req, res, () => {});
    expect(capturedStatus).toBe(401);
    expect(capturedBody.error).toContain('Missing');
  });

  it('returns 401 for invalid token', () => {
    const req = { headers: { authorization: 'Bearer bad-token' } };
    let capturedStatus = 0;
    let capturedBody = null;
    const res = {
      status(code) {
        capturedStatus = code;
        return { json(body) { capturedBody = body; } };
      }
    };
    requireAuth(req, res, () => {});
    expect(capturedStatus).toBe(401);
    expect(capturedBody.error).toContain('Token');
  });

  it('attaches user to req and calls next() for valid token', () => {
    const user = { id: 'u1', email: 'u@u.com', role: 'dj' };
    const token = signToken(user);

    const req = { headers: { authorization: `Bearer ${token}` } };
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    requireAuth(req, {}, next);
    expect(nextCalled).toBe(true);
    expect(req.user.id).toBe('u1');
    expect(req.user.role).toBe('dj');
  });
});

describe('requireRole middleware', () => {
  it('returns 401 when no user on request', () => {
    const req = {};
    let capturedStatus = 0;
    let capturedBody = null;
    const res = {
      status(code) {
        capturedStatus = code;
        return { json(body) { capturedBody = body; } };
      }
    };
    const middleware = requireRole('owner');
    middleware(req, res, () => {});
    expect(capturedStatus).toBe(401);
    expect(capturedBody.error).toContain('Not authenticated');
  });

  it('returns 403 when user role not in allowed list', () => {
    const req = { user: { id: '1', role: 'listener' } };
    let capturedStatus = 0;
    let capturedBody = null;
    const res = {
      status(code) {
        capturedStatus = code;
        return { json(body) { capturedBody = body; } };
      }
    };
    const middleware = requireRole('manager', 'owner');
    middleware(req, res, () => {});
    expect(capturedStatus).toBe(403);
    expect(capturedBody.error).toContain('Requires one of');
  });

  it('calls next() when user role matches', () => {
    const req = { user: { id: '2', role: 'manager' } };
    let nextCalled = false;
    const next = () => { nextCalled = true; };
    const middleware = requireRole('manager', 'owner');
    middleware(req, {}, next);
    expect(nextCalled).toBe(true);
  });

  it('works with single role', () => {
    const req = { user: { id: '3', role: 'owner' } };
    let nextCalled = false;
    const middleware = requireRole('owner');
    middleware(req, {}, () => { nextCalled = true; });
    expect(nextCalled).toBe(true);
  });
});
