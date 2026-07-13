import { api } from './axios';

export interface LibraryPreferences {
  loanPeriodDays: number;
  finePerDay: number;
  maxReservationsPerMember: number;
  autoNotifyOverdue: boolean;
}

export interface UpdateLibraryPreferencesPayload {
  loanPeriodDays: number;
  finePerDay: number;
  maxReservationsPerMember: number;
}

export const defaultLibraryPreferences: LibraryPreferences = {
  loanPeriodDays: 14,
  finePerDay: 1,
  maxReservationsPerMember: 5,
  autoNotifyOverdue: true,
};

export const getLibraryPreferences = async (): Promise<LibraryPreferences> => {
  const response = await api.get<LibraryPreferences>('/settings/library');
  return response.data;
};

export const updateLibraryPreferences = async (
  payload: UpdateLibraryPreferencesPayload
): Promise<LibraryPreferences> => {
  const response = await api.put<LibraryPreferences>('/settings/library', payload);
  return response.data;
};
