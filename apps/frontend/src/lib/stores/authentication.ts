import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { User } from '../types/authentication/user'; 
import { AuthenticationService } from '../services/authenticationService'; 

export const authToken: Writable<string | null> = writable(null);
export const currentUser: Writable<User | null> = writable(null);

export async function setAuthentication(token: string): Promise<void> {
    authToken.set(token);

    try {
        const user = await AuthenticationService.getCurrentUser(token);
        currentUser.set(user);
    } catch (error) {
        logout(); // Reset state if token is invalid
        throw error;
    }
}

export function logout(): void {
    authToken.set(null);
    currentUser.set(null);
    localStorage.removeItem('authToken');
}

export async function loadAuthenticationState(): Promise<void> {
    const token = localStorage.getItem('authToken');
    if (token) {
        try {
            await setAuthentication(token);
        } catch {
            logout(); // Clear invalid token
        }
    }
}
