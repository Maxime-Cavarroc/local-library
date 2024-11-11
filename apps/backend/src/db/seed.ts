import { db } from './index';
import { users } from './schema';
import { eq } from 'drizzle-orm';
import { getUserByEmail } from './users'
import bcrypt from 'bcrypt';

export async function seedAdmin() {
  const email = 'admin@example.com';
  const password = 'Password123#';

  // Check if the admin user exists
  const adminExists = getUserByEmail(email).all()
  if (adminExists.length > 0) {
    console.log('Admin user already exists.');
    return;
  }

  // Create the admin user
  const hashedPassword = await bcrypt.hash(password, 10);
  db.insert(users).values({
    email,
    password: hashedPassword,
    role: 'admin',
    isActive: 1,
  }).run();

  console.log('Admin user seeded successfully.');
}
