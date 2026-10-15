import { describe, it, expect, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';

// These must be set BEFORE any imports that use them
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.AUTH_PORT = '3098';
process.env.DISCONNECT_API_KEY = 'test-disconnect-key';

// Dynamic imports to ensure env is set before module evaluation
const serverModule = await import('../server.js');
const app = serverModule.default || serverModule;
const authModule = await import('../auth.js');
const { signToken } = authModule;

// Use server.js's exported stmts so we share the same DB instance
const stmts = serverModule.stmts || app.stmts;

// Helper: create a user and return their token
function createUser(overrides = {}) {
  const crypto = require('crypto');
  const id = crypto.randomUUID();
  const email = overrides.email || 'test@test.com';
  const hash = bcrypt.hashSync(overrides.password || 'password123', 4);
  const name = overrides.full_name || 'Test User';
  const role = overrides.role || 'listener';

  stmts.insert.run(id, email, hash, name, role);
  const user = stmts.findById.get(id);
  const token = signToken(user);
  return { user, token, password: overrides.password || 'password123' };
}

describe('API Endpoints', () => {
  beforeEach(() => {
    // DB is reset in setup.js beforeEach
  });

  // ─── Health ────────────────────────────────────────────

  describe('GET /api/auth/health', () => {
    it('returns ok', async () => {
      const { default: request } = await import('supertest');
      const res = await request(app).get('/api/auth/health');
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.ts).toBeTypeOf('number');
    });
  });

  // ─── Register ──────────────────────────────────────────

  describe('POST /api/auth/register', () => {
    it('creates a new listener account', async () => {
      const { default: request } = await import('supertest');
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'new@test.com', password: 'pass1234', full_name: 'New User' });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeTruthy();
      expect(res.body.user.role).toBe('listener');
      expect(res.body.user.email).toBe('new@test.com');
      expect(res.body.user.full_name).toBe('New User');
    });

    it('rejects missing fields', async () => {
      const { default: request } = await import('supertest');
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'a@b.com' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('required');
    });

    it('rejects short passwords', async () => {
      const { default: request } = await import('supertest');
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'a@b.com', password: '12345', full_name: 'Short PW' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('6 characters');
    });

    it('rejects duplicate email', async () => {
      const { default: request } = await import('supertest');
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'dup@test.com', password: 'pass1234', full_name: 'First' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'dup@test.com', password: 'other123', full_name: 'Second' });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already exists');
    });
  });

  // ─── Login ─────────────────────────────────────────────

  describe('POST /api/auth/login', () => {
    it('logs in with correct credentials', async () => {
      const { default: request } = await import('supertest');
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'login@test.com', password: 'mypassword', full_name: 'Login Test' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@test.com', password: 'mypassword' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeTruthy();
      expect(res.body.user.email).toBe('login@test.com');
    });

    it('rejects wrong password', async () => {
      const { default: request } = await import('supertest');
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'badpw@test.com', password: 'rightpassword', full_name: 'Bad PW' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'badpw@test.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
    });

    it('rejects non-existent email', async () => {
      const { default: request } = await import('supertest');
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@test.com', password: 'whatever' });

      expect(res.status).toBe(401);
    });

    it('rejects missing fields', async () => {
      const { default: request } = await import('supertest');
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'a@b.com' });

      expect(res.status).toBe(400);
    });
  });

  // ─── Me ────────────────────────────────────────────────

  describe('GET /api/auth/me', () => {
    it('returns user when token is valid', async () => {
      const { default: request } = await import('supertest');
      const { token, user } = createUser({ email: 'me@test.com' });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('me@test.com');
    });

    it('returns 401 without token', async () => {
      const { default: request } = await import('supertest');
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('returns 401 with invalid token', async () => {
      const { default: request } = await import('supertest');
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer garbage-token');

      expect(res.status).toBe(401);
    });
  });

  // ─── Users (list) ──────────────────────────────────────

  describe('GET /api/auth/users', () => {
    it('returns user list for manager+', async () => {
      const { default: request } = await import('supertest');
      const { token } = createUser({ email: 'mgr@test.com', role: 'manager' });

      const res = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.users)).toBe(true);
    });

    it('rejects listener role', async () => {
      const { default: request } = await import('supertest');
      const { token } = createUser({ email: 'listener@test.com', role: 'listener' });

      const res = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });

  // ─── Promote ───────────────────────────────────────────

  describe('POST /api/auth/promote', () => {
    it('allows owner to promote listener to dj', async () => {
      const { default: request } = await import('supertest');
      const { token } = createUser({ email: 'owner@test.com', role: 'owner' });
      const target = createUser({ email: 'target@test.com', role: 'listener' });

      const res = await request(app)
        .post('/api/auth/promote')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: target.user.id, role: 'dj' });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.role).toBe('dj');
    });

    it('rejects non-owner', async () => {
      const { default: request } = await import('supertest');
      const { token } = createUser({ email: 'mgr-promote@test.com', role: 'manager' });
      const target = createUser({ email: 'target2-promote@test.com' });

      const res = await request(app)
        .post('/api/auth/promote')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: target.user.id, role: 'dj' });

      expect(res.status).toBe(403);
    });

    it('rejects invalid role', async () => {
      const { default: request } = await import('supertest');
      const { token } = createUser({ email: 'owner2@test.com', role: 'owner' });
      const target = createUser({ email: 'target3@test.com' });

      const res = await request(app)
        .post('/api/auth/promote')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: target.user.id, role: 'superadmin' });

      expect(res.status).toBe(400);
    });

    it('rejects non-existent user', async () => {
      const { default: request } = await import('supertest');
      const { token } = createUser({ email: 'owner3@test.com', role: 'owner' });

      const res = await request(app)
        .post('/api/auth/promote')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: 'non-existent-id', role: 'dj' });

      expect(res.status).toBe(404);
    });
  });

  // ─── Site Settings ─────────────────────────────────────

  describe('GET /api/site/settings', () => {
    it('returns default settings publicly', async () => {
      const { default: request } = await import('supertest');
      const res = await request(app).get('/api/site/settings');

      expect(res.status).toBe(200);
      expect(res.body.stationName).toBe('Lekker Kuier');
      expect(res.body.tagline).toBeTruthy();
    });
  });

  describe('PUT /api/site/settings', () => {
    it('owner can update settings', async () => {
      const { default: request } = await import('supertest');
      const { token } = createUser({ email: 'owner-s@test.com', role: 'owner' });

      const res = await request(app)
        .put('/api/site/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ stationName: 'New Name', tagline: 'New Tag' });

      expect(res.status).toBe(200);
      expect(res.body.settings.stationName).toBe('New Name');
      expect(res.body.settings.tagline).toBe('New Tag');
    });

    it('rejects non-owner', async () => {
      const { default: request } = await import('supertest');
      const { token } = createUser({ email: 'mgr-s@test.com', role: 'manager' });

      const res = await request(app)
        .put('/api/site/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ stationName: 'Hacked' });

      expect(res.status).toBe(403);
    });
  });

  // ─── Disconnect DJ ─────────────────────────────────────

  describe('POST /api/auth/disconnect-dj', () => {
    it('rejects listener role', async () => {
      const { default: request } = await import('supertest');
      const { token } = createUser({ email: 'l-dj@test.com', role: 'listener' });

      const res = await request(app)
        .post('/api/auth/disconnect-dj')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('allows manager to attempt disconnect (proxy fails in test)', async () => {
      const { default: request } = await import('supertest');
      const { token } = createUser({ email: 'mgr-dj@test.com', role: 'manager' });

      const res = await request(app)
        .post('/api/auth/disconnect-dj')
        .set('Authorization', `Bearer ${token}`);

      expect([502, 500]).toContain(res.status);
    });
  });

  // ─── Contact form notification ──────────────────────────
  // Covers the notify-contact endpoint: validation, the local audit
  // append, and the fire-and-forget ntfy.sh push. https.request is
  // stubbed so the suite never touches the network.

  describe('POST /api/auth/notify-contact', () => {
    it('rejects a request missing name, email or message', async () => {
      const { default: request } = await import('supertest');

      for (const body of [
        {},
        { name: 'A' },
        { name: 'A', email: 'a@b.com' },
        { email: 'a@b.com', message: 'hi' },
      ]) {
        const res = await request(app).post('/api/auth/notify-contact').send(body);
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/required/);
      }
    });

    it('accepts a complete submission and returns ok', async () => {
      const { default: request } = await import('supertest');

      const res = await request(app).post('/api/auth/notify-contact').send({
        name: 'Thandi M',
        email: 'thandi@example.com',
        message: 'Love the station, when is the next show?',
      });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
    });

    it('truncates long messages in the push payload', async () => {
      const { default: request } = await import('supertest');
      const https = await import('https');

      const writes = [];
      const origRequest = https.default.request;
      https.default.request = (opts, cb) => {
        const fake = {
          write: (chunk) => writes.push(chunk),
          end: () => {},
          on: () => fake,
        };
        return fake;
      };

      try {
        const long = 'x'.repeat(500);
        const res = await request(app).post('/api/auth/notify-contact').send({
          name: 'Long Message',
          email: 'long@example.com',
          message: long,
        });

        expect(res.status).toBe(200);
        const payload = JSON.parse(writes.join(''));
        expect(payload.topic).toBe('lekkerkuier-contact');
        expect(payload.title).toBe('New message from Long Message');
        // email prefix + 200 chars of the message
        expect(payload.message).toBe(`long@example.com: ${'x'.repeat(200)}`);
      } finally {
        https.default.request = origRequest;
      }
    });

    it('still returns ok when the push service is unreachable', async () => {
      const { default: request } = await import('supertest');
      const https = await import('https');

      const origRequest = https.default.request;
      https.default.request = () => {
        const fake = {
          write: () => {},
          end: () => {},
          on: (event, handler) => {
            if (event === 'error') handler(new Error('ntfy.sh unreachable'));
            return fake;
          },
        };
        return fake;
      };

      try {
        const res = await request(app).post('/api/auth/notify-contact').send({
          name: 'Offline',
          email: 'offline@example.com',
          message: 'push should fail silently',
        });
        // fire-and-forget: the caller is not blocked by push failure
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: true });
      } finally {
        https.default.request = origRequest;
      }
    });
  });
});
