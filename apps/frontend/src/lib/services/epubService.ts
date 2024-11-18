import { getAuthToken } from "./authenticationService";

const API_BASE_URL = 'http://localhost:3000/api';

export const EpubService = {
    /**
     * Get all EPUB covers
     */
    async getCovers(): Promise<Array<{ fileName: string, title: string; cover: string }>> {
        const response = await fetch(`${API_BASE_URL}/epubs/covers`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${await getAuthToken()}` },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch EPUB covers');
        }

        return response.json();
    },

    /**
     * Get details of a specific EPUB by title
     * @param title - The title of the EPUB book
     */
    async getBookByTitle(title: string): Promise<{ title: string; author: string; description: string; cover: string | null }> {
        const response = await fetch(`${API_BASE_URL}/epubs/${encodeURIComponent(title)}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${await getAuthToken()}` },
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
