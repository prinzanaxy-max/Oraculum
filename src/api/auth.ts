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

export interface GoogleSignInResponse {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: AdminProfile;
}

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: AdminProfile;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  studentStaffId: string;
  email: string;
  password: string;
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

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', payload);
  return response.data;
};

export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/signup', payload);
  return response.data;
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  await api.post('/auth/forgot-password', { email });
};

export const signInWithGoogle = async (idToken: string): Promise<GoogleSignInResponse> => {
  const response = await api.post<GoogleSignInResponse>('/auth/google', { idToken });
  return response.data;
};
