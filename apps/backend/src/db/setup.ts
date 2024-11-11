import { db } from './index';
import { users } from './schema';

export async function setupDatabase() {
  try {
    // Sync the schema
    const sqlStatements = users.getSQL();
    db.run(sqlStatements);

    console.log('Database setup complete.');
  } catch (error) {
    console.error('Error during database setup:', error);
  }
}
