import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

const sqlite = new Database('local-library.db');

export const db = drizzle(sqlite);

export default db;