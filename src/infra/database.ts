import { Database } from "bun:sqlite";
import { mkdirSync, existsSync } from "node:fs";
import type { Memo } from "../shared/types";
import { SOLARIS_DIR, DB_PATH } from "../shared/constants";

let db: Database | null = null;

export function initDatabase(): Database {
  if (db) return db;

  if (!existsSync(SOLARIS_DIR)) {
    mkdirSync(SOLARIS_DIR, { recursive: true });
  }

  db = new Database(DB_PATH);

  db.run(`
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      content TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_entries_timestamp ON entries(timestamp DESC)
  `);

  return db;
}

export function saveMemo(content: string): Memo {
  const database = initDatabase();
  const stmt = database.query(`
    INSERT INTO entries (content)
    VALUES (?)
    RETURNING id, timestamp, content
  `);

  return stmt.get(content) as Memo;
}

export function readMemos(limit: number): Memo[] {
  const database = initDatabase();

  const stmt = database.query(`
    SELECT id, timestamp, content FROM entries
    ORDER BY timestamp DESC
    LIMIT ?
  `);
  return stmt.all(limit) as Memo[];
}
