import { db } from './index';
import { users } from './schema';

export function setupDatabase() {
  // Sync the schema
  db.run(users.getSQL());

  console.log('Database setup complete.');
}