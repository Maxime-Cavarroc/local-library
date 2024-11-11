import { db } from './index';
import { users } from './schema';
import { eq } from 'drizzle-orm';

export function getUserByEmail(email: string) {
  return db.select().from(users).where(eq(users.email, email));
}