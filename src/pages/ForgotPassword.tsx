import { useState } from 'react';
import { AxiosError } from 'axios';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck } from 'lucide-react';
import { requestPasswordReset } from '../api/auth';

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

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await requestPasswordReset(email.trim());
      setSuccessMessage('If an admin account exists for this email, a reset link has been sent.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Unable to send reset instructions.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6 py-10 font-sans">
      <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white p-8 shadow-xl shadow-charcoal/5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-gold/10 text-amber-gold">
          <ShieldCheck className="h-7 w-7" />
        </div>

        <div className="mt-6 text-center">
          <h1 className="font-serif text-[28px] font-bold text-charcoal">Reset Password</h1>
          <p className="mt-2 text-[14px] leading-6 text-gray-500">
            Enter your admin email and we will send reset instructions if the account exists.
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
              Email Address
            </span>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 pl-11 text-[14px] text-charcoal outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
                placeholder="admin@oraculum.edu"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-amber-gold px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-amber-gold/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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
