import { UserService } from './services/users'; // Importing UserService for reuse
import bcrypt from 'bcrypt';

export async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'Password123#';

  try {
    // Check if the admin user exists
    const adminExists = await UserService.getUserByEmail(email);

    if (adminExists) {
      console.log('Admin user already exists.');
      return;
    }

    // Create the admin user
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = {
      email,
      password: hashedPassword,
      role: 'administrator',
      isActive: 1,
      refreshToken: null,
    };

    await UserService.insertUser(adminUser);

    console.log('Admin user seeded successfully.');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
}
