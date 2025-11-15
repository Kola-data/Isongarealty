import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import dotenv from 'dotenv';

dotenv.config();

const DB_PATH = process.env.DB_PATH || 'isonga_real_estate_db.db';

// Ensure we're using the local database file (absolute path)
const absoluteDbPath = DB_PATH.startsWith('/') ? DB_PATH : `${process.cwd()}/${DB_PATH}`;

export const db = await open({
  filename: absoluteDbPath,
  driver: sqlite3.Database
});

console.log(`[Database] Connected to LOCAL SQLite database at: ${absoluteDbPath}`);
