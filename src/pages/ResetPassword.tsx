import { useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { LockKeyhole, Moon, Sun } from 'lucide-react';
import { resetPassword } from '../api/auth';
import { useThemeStore } from '../store/themeStore';

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    return data?.message ?? data?.error ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const { appliedTheme, toggleTheme } = useThemeStore();
  const resetToken = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!resetToken) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords don't match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword({ token: resetToken, password, confirmPassword });
      setSuccessMessage('Password updated. You can sign in with your new password.');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        setErrorMessage('Password reset is not available yet. Please contact support.');
        return;
      }

      setErrorMessage(getErrorMessage(error, 'Unable to reset password.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-cream px-4 py-10 font-sans sm:px-6">
      <button
        type="button"
        onClick={toggleTheme}
        className="fixed right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-100 bg-white text-charcoal transition-colors hover:bg-gray-50"
        aria-label={`Switch to ${appliedTheme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${appliedTheme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {appliedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white p-6 shadow-xl shadow-charcoal/5 sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-gold/10 text-amber-gold">
          <LockKeyhole className="h-7 w-7" />
        </div>

        <div className="mt-6 text-center">
          <h1 className="font-serif text-[28px] font-bold text-charcoal">Choose a new password</h1>
          <p className="mt-2 text-[14px] leading-6 text-gray-500">
            Enter and confirm your new password to finish resetting your account.
          </p>
        </div>

        {errorMessage && (
          <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mt-6 rounded-xl border border-amber-gold/20 bg-amber-gold/10 px-4 py-3 text-sm font-medium text-charcoal">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <label className="block">
            <span className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
              New Password
            </span>
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-charcoal outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
              placeholder="At least 8 characters"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
              Confirm Password
            </span>
            <input
              required
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-charcoal outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
              placeholder="Re-enter your password"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-amber-gold px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-amber-gold/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <Link
          to="/login"
          className="mt-6 block text-center text-[13px] font-semibold text-amber-gold hover:text-amber-gold/80"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
};
