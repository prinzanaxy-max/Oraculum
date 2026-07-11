import { api } from './axios';
import type { Reservation } from '../types';

export interface ReservationPayload {
  bookId: string;
  memberId: string;
}

export const createReservation = async (payload: ReservationPayload): Promise<Reservation> => {
  const response = await api.post<Reservation>('/reservations', payload);
  return response.data;
};
