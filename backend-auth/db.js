const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const DB_PATH = process.env.NODE_ENV === 'test'
  ? (process.env.TEST_DB_PATH || ':memory:')
  : path.join(__dirname, 'lekkerkuier.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'listener'
      CHECK(role IN ('listener','dj','manager','owner')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Prepared statements
const stmts = {
  findById: db.prepare('SELECT id, email, full_name, role, created_at FROM users WHERE id = ?'),
  findByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  insert: db.prepare(
    'INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)'
  ),
  listAll: db.prepare('SELECT id, email, full_name, role, created_at FROM users ORDER BY created_at DESC'),
  updateRole: db.prepare('UPDATE users SET role = ? WHERE id = ?'),
  countByRole: db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?'),
  deleteUser: db.prepare('DELETE FROM users WHERE id = ?'),
};

// Create default owner if no owner exists
const ownerCount = stmts.countByRole.get('owner');
if (ownerCount.count === 0) {
  const id = crypto.randomUUID();
  const hash = bcrypt.hashSync('admin123', 12);
  stmts.insert.run(id, 'owner@lekkerkuier.com', hash, 'Station Owner', 'owner');
  console.log('[db] Created default owner account: owner@lekkerkuier.com / admin123');
  console.log('[db] CHANGE THE PASSWORD after first login!');
}

module.exports = { db, stmts };
