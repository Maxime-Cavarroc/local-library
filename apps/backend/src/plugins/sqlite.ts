import fp from 'fastify-plugin';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

export default fp(async (app) => {
  const sqlite = new Database('my-database.db'); // Creates SQLite database
  const db = drizzle(sqlite); // Initializes Drizzle with better-sqlite3
  app.decorate('db', db);
});