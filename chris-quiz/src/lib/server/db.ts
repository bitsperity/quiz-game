import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

const DB_PATH = 'data/quiz.db';

// Ensure data directory exists
mkdirSync(dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Initialize Schema
db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        points INTEGER NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS game_state (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    );
`);

export default db;
