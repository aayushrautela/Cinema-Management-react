import api from './api';
import type { Cinema, Screening, ScreeningDetail, CreateScreeningRequest } from '../types';

export const screeningService = {
    async getAll(): Promise<Screening[]> {
        const response = await api.get<Screening[]>('/screenings');
        return response.data;
    },

    async getById(id: number): Promise<ScreeningDetail> {
        const response = await api.get<ScreeningDetail>(`/screenings/${id}`);
        return response.data;
    },

    async create(data: CreateScreeningRequest): Promise<Screening> {
        const response = await api.post<Screening>('/screenings', data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/screenings/${id}`);
    },
};

export const cinemaService = {
    async getAll(): Promise<Cinema[]> {
        const response = await api.get<Cinema[]>('/cinemas');
        return response.data;
    },
};
