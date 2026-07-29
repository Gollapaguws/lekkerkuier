const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { stmts } = require('./db');
const { signToken, requireAuth, requireRole } = require('./auth');

const app = express();
const PORT = process.env.AUTH_PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── Health ────────────────────────────────────────────
app.get('/api/auth/health', (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// ─── Register (public — creates listener account) ──────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'email, password, and full_name required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = stmts.findByEmail.get(email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const id = crypto.randomUUID();
    const hash = await bcrypt.hash(password, 12);
    stmts.insert.run(id, email.toLowerCase().trim(), hash, full_name.trim(), 'listener');

    const user = stmts.findById.get(id);
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('[register]', err.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ─── Login ────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' });
    }

    const row = stmts.findByEmail.get(email.toLowerCase().trim());
    if (!row) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, row.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = stmts.findById.get(row.id);
    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error('[login]', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ─── Me (validate token, return user) ─────────────────
app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = stmts.findById.get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

// ─── Promote / Demote (owner only) ────────────────────
app.post('/api/auth/promote', requireAuth, requireRole('owner'), (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!userId || !role) {
      return res.status(400).json({ error: 'userId and role required' });
    }
    if (!['listener', 'dj', 'manager', 'owner'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const target = stmts.findById.get(userId);
    if (!target) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (target.role === 'owner' && role !== 'owner') {
      return res.status(403).json({ error: 'Cannot demote the only owner' });
    }

    stmts.updateRole.run(role, userId);
    res.json({ ok: true, userId, role });
  } catch (err) {
    console.error('[promote]', err.message);
    res.status(500).json({ error: 'Promotion failed' });
  }
});

// ─── List users (owner + manager) ─────────────────────
app.get('/api/auth/users', requireAuth, requireRole('owner', 'manager'), (_req, res) => {
  try {
    const users = stmts.listAll.all();
    res.json({ users });
  } catch (err) {
    console.error('[users]', err.message);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

// ─── Site Settings (owner read/write, public read) ─────
let siteSettings = {
  stationName: 'Lekker Kuier',
  tagline: 'PsyTech Fusion Radio',
  description: 'Transcend the vibration. Plug into Mzansi\'s 24/7 stream.',
};

app.get('/api/site/settings', (_req, res) => {
  res.json(siteSettings);
});

app.put('/api/site/settings', requireAuth, requireRole('owner'), (req, res) => {
  const { stationName, tagline, description } = req.body;
  if (stationName) siteSettings.stationName = stationName;
  if (tagline) siteSettings.tagline = tagline;
  if (description) siteSettings.description = description;
  res.json({ ok: true, settings: siteSettings });
});

// ─── Disconnect DJ (manager+ only) ───────────────────
app.post('/api/auth/disconnect-dj', requireAuth, requireRole('manager', 'owner'), async (_req, res) => {
  try {
    const API_KEY = process.env.DISCONNECT_API_KEY || '';
    const https = require('https');
    const options = {
      hostname: '127.0.0.1',
      port: 8443,
      path: '/api/station/1/backend/disconnect',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Host': 'lekkerkuier.com',
      },
      rejectUnauthorized: false,
    };

    const proxyReq = https.request(options, (proxyRes) => {
      let body = '';
      proxyRes.on('data', (chunk) => { body += chunk; });
      proxyRes.on('end', () => {
        if (proxyRes.statusCode === 200 || proxyRes.statusCode === 204) {
          res.json({ ok: true, message: 'DJ disconnected successfully' });
        } else {
          res.status(502).json({ ok: false, message: `Upstream error: ${proxyRes.statusCode}` });
        }
      });
    });

    proxyReq.on('error', (err) => {
      console.error('[disconnect]', err.message);
      res.status(502).json({ ok: false, message: 'Could not reach stream server' });
    });

    proxyReq.end();
  } catch (err) {
    console.error('[disconnect]', err.message);
    res.status(500).json({ ok: false, message: 'Disconnect failed' });
  }
});

// ─── Start ────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`[auth] Lekkerkuier auth server running on http://127.0.0.1:${PORT}`);
  });
}

module.exports = app;
module.exports.stmts = stmts;
