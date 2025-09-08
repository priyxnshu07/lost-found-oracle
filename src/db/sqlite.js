import Database from 'better-sqlite3';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.SQLITE_FILE
  ? path.resolve(process.env.SQLITE_FILE)
  : path.resolve('./data.sqlite');

const db = new Database(dbPath);

// Auto-migrate tables similar to Oracle schema
db.exec(`
CREATE TABLE IF NOT EXISTS LOST_ITEMS (
  lost_id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  lost_location TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Pending'
);
CREATE TABLE IF NOT EXISTS FOUND_ITEMS (
  found_id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  found_location TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Pending'
);
CREATE TABLE IF NOT EXISTS MATCHES (
  match_id INTEGER PRIMARY KEY AUTOINCREMENT,
  lost_id INTEGER NOT NULL,
  found_id INTEGER NOT NULL,
  match_date TEXT DEFAULT (datetime('now')),
  status TEXT,
  FOREIGN KEY (lost_id) REFERENCES LOST_ITEMS(lost_id),
  FOREIGN KEY (found_id) REFERENCES FOUND_ITEMS(found_id)
);
`);

export async function withConnection(run) {
  return await run(db);
}


