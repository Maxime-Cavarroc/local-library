import { db } from '../index';
import { eq, and } from 'drizzle-orm';
import { progress } from "../schema";

// Progress Service
export const ProgressService = {
  /**
   * Update reading progress for a book
   * @param userId - User ID
   * @param book - Book string
   * @param percentage - Progress percentage (0 to 1)
   * @returns The updated progress record
   */
  updateProgress: (userId: number, book: string, percentage: number) => {
    return db.insert(progress).values({
      userId: userId, // Use the correct column name from the schema
      book: book,
      percentage: percentage,
    }).onConflictDoUpdate({
      target: [progress.userId, progress.book],
      set: { percentage: percentage }, // Update percentage if conflict exists
    }).returning().get();
  },

  /**
   * Get reading progress for a book
   * @param userId - User ID
   * @param book - Book string
   * @returns Progress percentage for the book
   */
  getProgress: (userId: number, book: string) => {
    return db.select({ percentage: progress.percentage }).from(progress)
      .where(and(eq(progress.userId, userId), eq(progress.book, book)))
      .get();
  },

  /**
   * Get all books with progress for a user
   * @param userId - User ID
   * @returns List of books with their progress percentages
   */
  getProgressByUser: (userId: number) => {
    return db.select({ book: progress.book, percentage: progress.percentage }).from(progress)
      .where(eq(progress.userId, userId)).all();
  },
};
