import { Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCurrentAdmin } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();

  const sessionQuery = useQuery({
    queryKey: ['current-admin'],
    queryFn: getCurrentAdmin,
    enabled: Boolean(token),
    retry: false,
  });

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (sessionQuery.isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-app-bg font-sans text-app-text">
        <div className="rounded-xl border border-app-border bg-app-surface px-5 py-4 text-sm text-gray-500">
          Verifying session...
        </div>
      </div>
    );
  }

  if (sessionQuery.isError) {
    logout();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
