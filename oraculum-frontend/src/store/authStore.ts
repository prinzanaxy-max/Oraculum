import { create } from 'zustand';

interface AdminUser {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: AdminUser | null;
  setAuth: (token: string, user: AdminUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('oraculum_token'),
  user: localStorage.getItem('oraculum_user') 
    ? JSON.parse(localStorage.getItem('oraculum_user') as string) 
    : null,
  setAuth: (token, user) => {
    localStorage.setItem('oraculum_token', token);
    localStorage.setItem('oraculum_user', JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('oraculum_token');
    localStorage.removeItem('oraculum_user');
    set({ token: null, user: null });
  },
}));
