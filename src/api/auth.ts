import { api } from './axios';

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const getCurrentAdmin = async (): Promise<AdminProfile> => {
  const response = await api.get<AdminProfile>('/auth/me');
  return response.data;
};

export const updateCurrentAdmin = async (
  payload: Omit<AdminProfile, 'id'>
): Promise<AdminProfile> => {
  const response = await api.put<AdminProfile>('/auth/me', payload);
  return response.data;
};

export const changePassword = async (payload: ChangePasswordPayload): Promise<void> => {
  await api.put('/auth/change-password', payload);
};
