import fp from 'fastify-plugin';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { FastifyInstance } from 'fastify';

/**
 * SQLite plugin for Fastify
 * Sets up the SQLite database with Drizzle ORM and decorates the Fastify instance with `db`.
 */
export default fp(async (app: FastifyInstance) => {
  try {
    // Initialize SQLite database
    const sqlite = new Database(process.env.DATABASE_NAME || 'local-library', { verbose: console.log });
    const db = drizzle(sqlite); // Initialize Drizzle ORM with better-sqlite3

    // Decorate Fastify instance with the database
    app.decorate('db', db);

    console.log('SQLite database connected successfully.');
  } catch (error) {
    console.error('Error connecting to SQLite database:', error);
    throw error; // Propagate the error to prevent app startup
  }
});
