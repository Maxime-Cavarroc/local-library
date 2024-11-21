import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('user'),
  isActive: integer('is_active').notNull().default(0),
  refreshToken: text('refresh_token'),
});

// Favorites table
export const favorites = sqliteTable('favorites', {
  userId: integer('user_id').notNull(),
  book: text('book').notNull(),
}, (table) => ({
  pk: primaryKey(table.userId, table.book), // Composite primary key
}));

// Progress table
export const progress = sqliteTable('progress', {
  userId: integer('user_id').notNull(),
  book: text('book').notNull(),
  percentage: real('percentage').notNull(), // Progress as a real number (0 to 1)
}, (table) => ({
  pk: primaryKey(table.userId, table.book), // Composite primary key
}));

// Downloaded table
export const downloaded = sqliteTable('downloaded', {
  userId: integer('user_id').notNull(),
  book: text('book').notNull(),
}, (table) => ({
  pk: primaryKey(table.userId, table.book), // Composite primary key
}));
