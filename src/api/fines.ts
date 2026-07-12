import { api } from './axios';
import type { Fine } from '../types';

interface FinesResponse {
  fines?: Fine[];
  data?: Fine[];
}

const normalizeFines = (payload: Fine[] | FinesResponse): Fine[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.fines ?? payload.data ?? [];
};

export const getFines = async (status?: Fine['status']): Promise<Fine[]> => {
  const response = await api.get<Fine[] | FinesResponse>('/fines', {
    params: status ? { status } : undefined,
  });

  return normalizeFines(response.data);
};

export const payFine = async (id: string): Promise<Fine> => {
  const response = await api.post<Fine>(`/fines/${id}/pay`);
  return response.data;
};

export const waiveFine = async (id: string): Promise<Fine> => {
  const response = await api.post<Fine>(`/fines/${id}/waive`);
  return response.data;
};
