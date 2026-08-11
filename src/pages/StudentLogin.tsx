import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { studentLogin, toAuthUser } from '../api/auth';
import { OraculumLogo } from '../components/OraculumLogo';
import {
  GraduationCap,
  User,
  CreditCard,
  ArrowRight,
  AlertCircle,
  Sun,
  Moon,
  ShieldCheck,
} from 'lucide-react';

export const StudentLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { appliedTheme, toggleTheme } = useThemeStore();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fromLocation = (location.state as any)?.from?.pathname || '/student/dashboard';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!usernameOrEmail.trim()) {
      setError('Please enter your Username or Email address.');
      return;
    }

    if (!studentId.trim()) {
      setError('Please enter your Student ID (e.g. STF-1024).');
      return;
    }

    setIsLoading(true);

    try {
      const response = await studentLogin({
        usernameOrEmail: usernameOrEmail.trim(),
        studentId: studentId.trim(),
      });

      const token = response.token || response.accessToken;
      if (!token || !response.user) {
        throw new Error('Authentication response did not return a valid session token.');
      }

      setAuth(token, toAuthUser(response.user), response.refreshToken);
      navigate(fromLocation, { replace: true });
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Unable to sign in with the provided details. Please verify your Student ID and name.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-app-bg font-sans text-app-text">
      {/* Navbar */}
      <header className="flex items-center justify-between border-b border-app-border bg-app-surface px-6 py-4">
        <div className="cursor-pointer" onClick={() => navigate('/')}>
          <OraculumLogo wordmarkClassName="text-xl" />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-app-border bg-app-surface-muted text-app-text transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={`Switch to ${appliedTheme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {appliedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-app-border px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-app-surface-muted dark:text-gray-300"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-amber-gold" />
            <span>Librarian Sign In</span>
          </button>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="rounded-2xl border border-app-border bg-app-surface p-8 shadow-xl">
            {/* Header / Badge */}
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-gold/15 text-amber-gold">
                <GraduationCap className="h-7 w-7 stroke-[1.75]" />
              </div>
              <h1 className="mt-4 font-serif text-2xl font-normal text-app-text sm:text-3xl">
                Student Portal
              </h1>
              <p className="mt-1.5 text-xs text-gray-500">
                Sign in with your Name/Email and Student ID to access your loans & books.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 dark:border-red-950 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 stroke-[2] text-red-600" />
                <div className="flex-1 font-medium">{error}</div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Full Name or Email Address
                </label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="e.g. Sarah Jenkins or sarah@oraculum.edu.gh"
                    className="w-full rounded-xl border border-app-border bg-app-surface-muted py-3 pl-10 pr-4 text-sm text-app-text outline-none transition-colors focus:border-amber-gold focus:ring-1 focus:ring-amber-gold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Student ID
                </label>
                <div className="relative mt-1.5">
                  <CreditCard className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. STF-1024"
                    className="w-full rounded-xl border border-app-border bg-app-surface-muted py-3 pl-10 pr-4 text-sm text-app-text outline-none transition-colors focus:border-amber-gold focus:ring-1 focus:ring-amber-gold"
                    required
                  />
                </div>
                <p className="mt-1 text-[11px] text-gray-400">Format: STF-XXXX (as registered in library records)</p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-gold py-3.5 text-sm font-semibold text-white shadow-md shadow-amber-gold/20 transition-all hover:bg-amber-gold-dark hover:shadow-lg disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Access Student Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-center text-xs text-gray-500">
            Need library staff access?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-semibold text-amber-gold hover:underline"
            >
              Sign in as Librarian
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
