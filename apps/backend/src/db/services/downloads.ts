import { db } from '../index';
import { eq, and } from 'drizzle-orm';
import { downloaded } from "../schema";

// Downloaded Service
export const DownloadedService = {
    /**
     * Mark a book as downloaded for a user
     * @param userId - User ID
     * @param book - Book string
     * @returns The inserted downloaded record
     */
    addDownloaded: (userId: number, book: string) => {
        return db.insert(downloaded).values({
            userId: userId, // Use the correct column name from the schema
            book: book,
        }).returning().get();
    },

    /**
     * Remove a downloaded book for a user
     * @param userId - User ID
     * @param book - Book string
     */
    removeDownloaded: (userId: number, book: string) => {
        return db.delete(downloaded)
            .where(and(eq(downloaded.userId, userId), eq(downloaded.book, book)))
            .run();
    },

    /**
     * Check if a book is downloaded by a user
     * @param userId - User ID
     * @param book - Book string
     * @returns The downloaded record if it exists
     */
    isDownloaded: (userId: number, book: string) => {
        return db.select().from(downloaded)
            .where(and(eq(downloaded.userId, userId), eq(downloaded.book, book)))
            .get();
    },

    /**
     * Get all downloaded books for a user
     * @param userId - User ID
     * @returns List of downloaded books for the user
     */
    getDownloadedByUser: (userId: number) => {
        return db.select({ book: downloaded.book }).from(downloaded)
            .where(eq(downloaded.userId, userId)).all();
    },
};
