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

export interface AvatarUploadUser {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  phone: string | null;
  avatarUrl: string;
}

export interface AvatarUploadResponse {
  avatarUrl: string;
  user: AvatarUploadUser;
}

export const toAdminProfile = (user: AvatarUploadUser): AdminProfile => ({
  id: user.id,
  name: user.name || user.fullName || user.email,
  email: user.email,
  phone: user.phone ?? undefined,
  avatarUrl: user.avatarUrl,
});

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

export const uploadProfilePicture = async (file: File): Promise<AvatarUploadResponse> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post<AvatarUploadResponse>('/auth/me/avatar', formData);
  return response.data;
};

export const changePassword = async (payload: ChangePasswordPayload): Promise<void> => {
  await api.put('/auth/change-password', {
    currentPassword: payload.currentPassword,
    newPassword: payload.newPassword,
    confirmNewPassword: payload.confirmPassword,
  });
};

export interface AuthSession {
  id: string;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  current: boolean;
  deviceLabel?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface SessionsResponse {
  sessions: AuthSession[];
}

export const getAuthSessions = async (refreshToken?: string | null): Promise<AuthSession[]> => {
  const headers: Record<string, string> = {};

  if (refreshToken) {
    headers['X-Refresh-Token'] = refreshToken;
  }

  const response = await api.get<SessionsResponse>('/auth/sessions', { headers });
  return response.data.sessions;
};

export const revokeAuthSession = async (sessionId: string): Promise<void> => {
  await api.delete(`/auth/sessions/${sessionId}`);
};

export const revokeOtherAuthSessions = async (
  refreshToken: string
): Promise<{ revokedCount: number }> => {
  const response = await api.delete<{ message: string; revokedCount: number }>('/auth/sessions', {
    data: { refreshToken },
  });

  return { revokedCount: response.data.revokedCount };
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

export interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

export const resetPassword = async (payload: ResetPasswordPayload): Promise<void> => {
  await api.post('/auth/reset-password', {
    token: payload.token,
    password: payload.password,
    confirmPassword: payload.confirmPassword,
  });
};

export const logoutSession = async (refreshToken?: string | null): Promise<void> => {
  await api.post('/auth/logout', refreshToken ? { refreshToken } : {});
};

export const signInWithGoogle = async (idToken: string): Promise<GoogleSignInResponse> => {
  const response = await api.post<GoogleSignInResponse>('/auth/google', { idToken });
  return response.data;
};
