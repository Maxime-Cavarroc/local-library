import { db } from '../index';
import { users } from '../schema';
import { eq } from 'drizzle-orm';

// User service methods
export const UserService = {
  /**
   * Get a user by ID
   * @param id - The ID of the user to retrieve
   * @returns User record matching the ID
   */
  getUserById: (id: number) => {
    return db.select().from(users).where(eq(users.id, id)).get();
  },

  /**
   * Get a user by email
   * @param email - The email of the user to retrieve
   * @returns User record matching the email
   */
  getUserByEmail: (email: string) => {
    return db.select().from(users).where(eq(users.email, email)).get();
  },

  /**
   * Retrieve all users
   * @returns All user records
   */
  getAllUsers: () => {
    return db.select().from(users).all();
  },

  /**
   * Insert a new user
   * @param user - User object to insert
   * @returns The inserted user record
   */
  insertUser: (user: {
    email: string;
    password: string;
    role?: string;
    isActive?: number;
    refreshToken?: string | null;
  }) => {
    return db.insert(users).values({
      email: user.email,
      password: user.password,
      role: user.role || 'user',
      isActive: user.isActive ?? 0,
      refreshToken: user.refreshToken || null,
    }).returning().get();
  },
};