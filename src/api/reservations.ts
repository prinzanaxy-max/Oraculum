import { api } from './axios';
import type { Reservation } from '../types';

export interface ReservationPayload {
  bookId: string;
  memberId: string;
}

interface ReservationsResponse {
  reservations?: Reservation[];
  data?: Reservation[];
}

const normalizeReservations = (payload: Reservation[] | ReservationsResponse): Reservation[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.reservations ?? payload.data ?? [];
};

export const createReservation = async (payload: ReservationPayload): Promise<Reservation> => {
  const response = await api.post<Reservation>('/reservations', payload);
  return response.data;
};

export const getReservations = async (status?: Reservation['status']): Promise<Reservation[]> => {
  const response = await api.get<Reservation[] | ReservationsResponse>('/reservations', {
    params: status ? { status } : undefined,
  });
  return normalizeReservations(response.data);
};

export const cancelReservation = async (id: string): Promise<Reservation> => {
  const response = await api.patch<Reservation>(`/reservations/${id}/cancel`);
  return response.data;
};
