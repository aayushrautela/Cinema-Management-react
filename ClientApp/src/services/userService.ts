import api from './api';
import type { User, UserUpdateRequest } from '../types';

export const userService = {
    async getAll(): Promise<User[]> {
        const response = await api.get<User[]>('/users');
        return response.data;
    },

    async getById(id: string): Promise<User> {
        const response = await api.get<User>(`/users/${id}`);
        return response.data;
    },

    async update(id: string, data: UserUpdateRequest): Promise<User> {
        const response = await api.put<User>(`/users/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/users/${id}`);
    },
};
