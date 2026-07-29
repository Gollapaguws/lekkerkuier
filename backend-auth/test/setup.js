import { beforeAll, afterAll, beforeEach } from 'vitest';

// ─── Override env for testing ───────────────────────────
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-do-not-use-in-production';
process.env.AUTH_PORT = '3099';
process.env.DISCONNECT_API_KEY = 'test-disconnect-key';

// ─── Import database after env is set ──────────────────
// This ensures :memory: DB is used
const { db, stmts } = await import('../db.js');

// ─── Reset DB schema before each test suite ─────────────
const RESET_SQL = `
  DROP TABLE IF EXISTS users;
  CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'listener'
      CHECK(role IN ('listener','dj','manager','owner')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

beforeEach(() => {
  db.exec(RESET_SQL);
});

afterAll(() => {
  db.close();
});

// ─── Make db/stmts available to all test files ──────────
// Tests can import { db, stmts } from '../db.js' after env is set,
// or use the globally-set ones here.
global.__db = db;
global.__stmts = stmts;
