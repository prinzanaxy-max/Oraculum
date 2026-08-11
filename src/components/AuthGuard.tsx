import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCurrentAdmin, toAuthUser } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const setAuth = useAuthStore((state) => state.setAuth);
  const location = useLocation();

  const sessionQuery = useQuery({
    queryKey: ['current-session'],
    queryFn: getCurrentAdmin,
    enabled: Boolean(token),
    retry: false,
  });

  React.useEffect(() => {
    if (sessionQuery.data && token) {
      setAuth(token, toAuthUser(sessionQuery.data));
    }
  }, [sessionQuery.data, token, setAuth]);

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (sessionQuery.isLoading && !user) {
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

export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const setAuth = useAuthStore((state) => state.setAuth);
  const location = useLocation();

  const sessionQuery = useQuery({
    queryKey: ['current-admin'],
    queryFn: getCurrentAdmin,
    enabled: Boolean(token),
    retry: false,
  });

  React.useEffect(() => {
    if (sessionQuery.data && token) {
      setAuth(token, toAuthUser(sessionQuery.data));
    }
  }, [sessionQuery.data, token, setAuth]);

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (sessionQuery.isLoading && !user) {
    return (
      <div className="flex h-dvh items-center justify-center bg-app-bg font-sans text-app-text">
        <div className="rounded-xl border border-app-border bg-app-surface px-5 py-4 text-sm text-gray-500">
          Verifying admin session...
        </div>
      </div>
    );
  }

  if (sessionQuery.isError) {
    logout();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const currentUser = user || (sessionQuery.data ? toAuthUser(sessionQuery.data) : null);
  if (currentUser?.role === 'student') {
    return <Navigate to="/student/dashboard" replace />;
  }

  return <>{children}</>;
};

export const StudentGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const setAuth = useAuthStore((state) => state.setAuth);
  const location = useLocation();

  const sessionQuery = useQuery({
    queryKey: ['current-student-session'],
    queryFn: getCurrentAdmin,
    enabled: Boolean(token),
    retry: false,
  });

  React.useEffect(() => {
    if (sessionQuery.data && token) {
      setAuth(token, toAuthUser(sessionQuery.data));
    }
  }, [sessionQuery.data, token, setAuth]);

  if (!token) {
    return <Navigate to="/student/login" state={{ from: location }} replace />;
  }

  if (sessionQuery.isLoading && !user) {
    return (
      <div className="flex h-dvh items-center justify-center bg-app-bg font-sans text-app-text">
        <div className="rounded-xl border border-app-border bg-app-surface px-5 py-4 text-sm text-gray-500">
          Verifying student session...
        </div>
      </div>
    );
  }

  if (sessionQuery.isError) {
    logout();
    return <Navigate to="/student/login" state={{ from: location }} replace />;
  }

  const currentUser = user || (sessionQuery.data ? toAuthUser(sessionQuery.data) : null);
  if (currentUser && currentUser.role !== 'student' && !currentUser.studentId) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
