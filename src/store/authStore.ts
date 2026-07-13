import { create } from 'zustand';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AdminUser | null;
  setAuth: (token: string, user?: AdminUser | null, refreshToken?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('oraculum_token'),
  refreshToken: localStorage.getItem('oraculum_refresh_token'),
  user: localStorage.getItem('oraculum_user')
    ? JSON.parse(localStorage.getItem('oraculum_user') as string)
    : null,
  setAuth: (token, user, refreshToken) => {
    localStorage.setItem('oraculum_token', token);

    if (refreshToken !== undefined) {
      if (refreshToken) {
        localStorage.setItem('oraculum_refresh_token', refreshToken);
      } else {
        localStorage.removeItem('oraculum_refresh_token');
      }
    }

    if (user !== undefined) {
      if (user) {
        localStorage.setItem('oraculum_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('oraculum_user');
      }
    }

    set((state) => ({
      token,
      user: user !== undefined ? user : state.user,
      refreshToken: refreshToken !== undefined ? refreshToken : state.refreshToken,
    }));
  },
  logout: () => {
    localStorage.removeItem('oraculum_token');
    localStorage.removeItem('oraculum_refresh_token');
    localStorage.removeItem('oraculum_user');
    set({ token: null, refreshToken: null, user: null });
  },
}));
