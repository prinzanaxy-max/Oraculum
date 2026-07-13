import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCurrentAdmin, toAuthUser } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export const useCurrentAdminProfile = () => {
  const token = useAuthStore((state) => state.token);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const setAuth = useAuthStore((state) => state.setAuth);

  const query = useQuery({
    queryKey: ['current-admin'],
    queryFn: getCurrentAdmin,
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!query.data || !token) return;

    setAuth(token, toAuthUser(query.data), refreshToken ?? undefined);
  }, [query.data, token, refreshToken, setAuth]);

  return query;
};
