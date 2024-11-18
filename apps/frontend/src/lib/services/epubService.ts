// EpubService.ts
import type { Book } from "$lib/types/book/book";
import type { PaginatedBooks } from "$lib/types/book/paginatedBook";
import { getAuthToken } from "./authenticationService";

const API_BASE_URL = 'http://localhost:3000/api';

export const EpubService = {
    /**
     * Get paginated, sorted, and searched EPUB covers and full book details
     * @param page - The page number (1-based index)
     * @param limit - The number of items per page
     * @param sort - The field to sort by ('title', 'author', 'date', 'publisher', 'language')
     * @param order - The order of sorting ('asc' or 'desc')
     * @param search - The search term to filter EPUBs
     */
    async getPaginatedEpubs(
        page: number = 1,
        limit: number = 10,
        sort: 'fileName' | 'title' | 'author' | 'date' | 'publisher' | 'language' = 'fileName',
        order: 'asc' | 'desc' = 'asc',
        search: string = ''
    ): Promise<PaginatedBooks> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            sort,
            order,
        });

        if (search.trim() !== '') {
            params.append('search', search.trim());
        }

        const response = await fetch(`${API_BASE_URL}/epubs?${params.toString()}`, {
            method: 'GET',
            headers: { 
                Authorization: `Bearer ${await getAuthToken()}`,
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch EPUBs');
        }

        return response.json();
    },

    /**
     * Get details of a specific EPUB by title
     * @param title - The title of the EPUB book
     */
    async getBookByTitle(title: string): Promise<Book> {
        const response = await fetch(`${API_BASE_URL}/epubs/${encodeURIComponent(title)}`, {
            method: 'GET',
            headers: { 
                Authorization: `Bearer ${await getAuthToken()}`,
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch book details');
        }

        return response.json();
    },

    /**
     * Fetch a specific EPUB file by title for reading
     * @param title - The title of the EPUB book
     */
    async readBook(title: string): Promise<Blob> {
        const token = await getAuthToken();
        const response = await fetch(`${API_BASE_URL}/epubs/${encodeURIComponent(title)}/download`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch the book for reading');
        }

        return response.blob();
    },

    /**
     * Download a specific EPUB file by title
     * @param title - The title of the EPUB book
     */
    async downloadBook(title: string): Promise<void> {
        const token = await getAuthToken();
        const response = await fetch(`${API_BASE_URL}/epubs/${encodeURIComponent(title)}/download`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to download the book');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.epub`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    },
};
