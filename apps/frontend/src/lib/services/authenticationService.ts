import type { LoginRequest } from '../types/authentication/loginRequest'; 
import type { SignupRequest } from '../types/authentication/signupRequest'; 
import type { User } from '../types/authentication/user';
import type { AuthResponse } from '../types/authentication/authenticationResponse';
import { setAuthentication } from '$lib/stores/authentication';

const API_BASE_URL = 'http://localhost:3000';

export const AuthenticationService = {
    async signup(data: SignupRequest): Promise<{ id: string; email: string }> {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Signup failed');
        }

        return response.json();
    },

    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }

        return response.json();
    },

    async getCurrentUser(token: string): Promise<User> {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch user info');
        }

        return response.json();
    },
};

export async function handleLogin(email: string, password: string): Promise<void> {
    const loginData: LoginRequest = { email, password };
    const { token } = await AuthenticationService.login(loginData);
    await setAuthentication(token);
    window.location.href = '/dashboard';
}
