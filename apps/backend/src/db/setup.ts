import { db } from './index';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';


export async function setupDatabase() {
  try {
    await migrate(db, {
      migrationsFolder: path.resolve(__dirname, './migrations'),
    });
    console.log('Database setup complete.');
  } catch (error) {
    console.error('Error during database setup:', error);
  }
}
