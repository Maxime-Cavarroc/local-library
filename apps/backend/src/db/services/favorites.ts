import { db } from '../index';
import { eq, and } from 'drizzle-orm';
import { favorites } from "../schema";

// Favorite Service
export const FavoriteService = {
    /**
     * Add a book to the user's favorites
     * @param userId - User ID
     * @param book - Book string (e.g., file path or unique identifier)
     * @returns The inserted favorite record
     */
    addFavorite: (userId: number, book: string) => {
        return db.insert(favorites).values({
            userId: userId, // Use the correct column name from the schema
            book: book,
        }).returning().get();
    },

    /**
     * Remove a book from the user's favorites
     * @param userId - User ID
     * @param book - Book string
     */
    removeFavorite: (userId: number, book: string) => {
        return db.delete(favorites)
            .where(and(eq(favorites.userId, userId), eq(favorites.book, book)))
            .run();
    },

    /**
     * Check if a book is in the user's favorites
     * @param userId - User ID
     * @param book - Book string
     * @returns The favorited record if it exists
     */
    isFavorite: (userId: number, book: string) => {
        return db.select().from(favorites)
            .where(and(eq(favorites.userId, userId), eq(favorites.book, book)))
            .get();
    },

    /**
     * Get all favorite books for a user
     * @param userId - User ID
     * @returns List of books favorited by the user
     */
    getFavoritesByUser: (userId: number) => {
        return db.select({ book: favorites.book }).from(favorites)
            .where(eq(favorites.userId, userId)).all();
    },
};
