import api from './api';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';

export const authService = {
    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    async logout(): Promise<void> {
        await api.post('/auth/logout');
    },

    async getCurrentUser(): Promise<User | null> {
        try {
            const response = await api.get<AuthResponse>('/auth/check');
            if (response.data.success && response.data.user) {
                return response.data.user;
            }
            return null;
        } catch {
            return null;
        }
    },
};
