import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import dotenv from 'dotenv';

dotenv.config();

const DB_PATH = process.env.DB_PATH || './isonga_real_estate_db.db';

export const db = await open({
  filename: DB_PATH,
  driver: sqlite3.Database
});

console.log(`Connected to SQLite at ${DB_PATH}`);
