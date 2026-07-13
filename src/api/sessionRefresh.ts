import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const authBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface RefreshSessionResponse {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export const resolveAuthToken = (response: { accessToken?: string; token?: string }) =>
  response.accessToken ?? response.token ?? null;

export const refreshSession = async (): Promise<string> => {
  const refreshToken = useAuthStore.getState().refreshToken;

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const { data } = await axios.post<RefreshSessionResponse>(`${authBaseURL}/auth/refresh`, {
    refreshToken,
  });

  const token = resolveAuthToken(data);

  if (!token) {
    throw new Error('Refresh response did not include a token');
  }

  const currentUser = useAuthStore.getState().user;
  useAuthStore.getState().setAuth(
    token,
    data.user
      ? {
          ...currentUser,
          ...data.user,
          avatarUrl: data.user.avatarUrl ?? currentUser?.avatarUrl,
        }
      : currentUser,
    data.refreshToken
  );

  return token;
};
