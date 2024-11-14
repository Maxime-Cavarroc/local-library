import { getAuthToken } from "./authenticationService";

const API_BASE_URL = 'http://localhost:3000/api';

export const EpubService = {
    async getCovers(): Promise<Array<{ title: string; cover: string }>> {
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
};
