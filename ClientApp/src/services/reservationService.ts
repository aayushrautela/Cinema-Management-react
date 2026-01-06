import api from './api';
import type { Reservation, CreateReservationRequest, ReleaseReservationRequest } from '../types';

export const reservationService = {
    async getMyReservations(): Promise<Reservation[]> {
        const response = await api.get<Reservation[]>('/reservations/my');
        return response.data;
    },

    async reserve(data: CreateReservationRequest): Promise<Reservation> {
        const response = await api.post<Reservation>('/reservations', data);
        return response.data;
    },

    async release(data: ReleaseReservationRequest): Promise<void> {
        await api.delete('/reservations', { data });
    },

    async cancelAllForScreening(screeningId: number): Promise<void> {
        await api.delete(`/reservations/screening/${screeningId}`);
    },
};
