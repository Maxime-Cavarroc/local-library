import { getAuthToken } from "./authenticationService";

const API_BASE_URL = 'http://localhost:3000/api';

export const LlamaService = {
    /**
     * Send a prompt to the Llama model and get a response.
     * @param prompt - The input prompt to process
     */
    async sendPrompt(prompt: string): Promise<{ result: string }> {
        const token = await getAuthToken(); // Fetch the auth token if needed

        const response = await fetch(`${API_BASE_URL}/llama`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });

        console.log(response)

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch the response from Llama.');
        }

        return response.json();
    },
};
