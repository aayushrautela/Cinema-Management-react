export interface User {
  id: string;
  email: string;
  name: string;
  surname: string;
  phoneNumber: string | null;
  isAdmin: boolean;
  lockVersion: string | null;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

export interface Cinema {
  id: number;
  name: string;
  rows: number;
  seatsPerRow: number;
  totalSeats: number;
}

export interface Screening {
  id: number;
  filmTitle: string;
  cinemaId: number;
  cinemaName: string;
  startDateTime: string;
  rows: number;
  seatsPerRow: number;
  reservationCount: number;
}

export interface SeatStatus {
  row: number;
  seat: number;
  isReserved: boolean;
  isOwnedByCurrentUser: boolean;
}

export interface ScreeningDetail {
  id: number;
  filmTitle: string;
  cinemaId: number;
  cinemaName: string;
  startDateTime: string;
  rows: number;
  seatsPerRow: number;
  seats: SeatStatus[];
}

export interface Reservation {
  id: number;
  screeningId: number;
  filmTitle: string;
  cinemaName: string;
  startDateTime: string;
  rowNumber: number;
  seatNumber: number;
  reservedAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  surname: string;
  phoneNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface UserUpdateRequest {
  name: string;
  surname: string;
  phoneNumber?: string;
  lockVersion?: string | null;
}

export interface CreateScreeningRequest {
  cinemaId: number;
  filmTitle: string;
  startDateTime: string;
}

export interface CreateReservationRequest {
  screeningId: number;
  rowNumber: number;
  seatNumber: number;
}

export interface ReleaseReservationRequest {
  screeningId: number;
  rowNumber: number;
  seatNumber: number;
}
