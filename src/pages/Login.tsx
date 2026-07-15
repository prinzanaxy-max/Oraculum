import { useCallback, useEffect, useRef, useState } from 'react';
import { AxiosError } from 'axios';
import { useNavigate, Link, useLocation, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { login, register, signInWithGoogle } from '../api/auth';
import { Moon, Sun } from 'lucide-react';
import clsx from 'clsx';
import treeBackground from '../images/a_standalone_high_resolution_3d_sculpture_of_an_organic_tree_with_an_intricate.png';

// Schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z
  .object({
    fullName: z.string().min(2, 'Full name is required'),
    studentId: z.string().min(2, 'Student/Staff ID is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the terms',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type LoginForm = z.infer<typeof loginSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

interface GoogleCredentialResponse {
  credential?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme: 'outline' | 'filled_blue' | 'filled_black';
              size: 'large' | 'medium' | 'small';
              width?: number;
              text?: 'signin_with' | 'signup_with' | 'continue_with';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
            }
          ) => void;
        };
      };
    };
  }
}

const loadGoogleIdentityScript = () =>
  new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_SCRIPT_SRC}"]`
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Google script failed')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google script failed'));
    document.head.appendChild(script);
  });

const getAuthErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { error?: string; message?: string } | undefined;
    return data?.error ?? data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

const resolveToken = (response: { token?: string; accessToken?: string }) =>
  response.accessToken ?? response.token;

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
  const { appliedTheme, toggleTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard';

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    mode: 'onBlur',
  });

  const onLoginSubmit = async (data: LoginForm) => {
    try {
      setLoginError(null);
      const response = await login(data);
      const token = resolveToken(response);

      if (!token) {
        setLoginError('Sign-in response did not include a token.');
        return;
      }

      setAuth(
        token,
        response.user ?? { id: data.email, name: data.email.split('@')[0], email: data.email },
        response.refreshToken
      );
      navigate(redirectTo, { replace: true });
    } catch (error: unknown) {
      setLoginError(getAuthErrorMessage(error, 'An error occurred during login.'));
    }
  };

  const onSignUpSubmit = async (data: SignUpForm) => {
    try {
      setLoginError(null);
      const response = await register({
        fullName: data.fullName,
        studentStaffId: data.studentId,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      const token = resolveToken(response);

      if (!token) {
        setLoginError('Sign-up response did not include a token.');
        return;
      }

      setAuth(
        token,
        response.user ?? { id: data.email, name: data.fullName, email: data.email },
        response.refreshToken
      );
      navigate(redirectTo, { replace: true });
    } catch (error: unknown) {
      setLoginError(getAuthErrorMessage(error, 'An error occurred during sign up.'));
    }
  };

  const handleGoogleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        setLoginError('Google did not return an ID token.');
        return;
      }

      try {
        setIsGoogleLoading(true);
        setLoginError(null);
        const authResponse = await signInWithGoogle(response.credential);
        const token = resolveToken(authResponse);

        if (!token) {
          setLoginError('Google sign-in response did not include token or accessToken.');
          return;
        }

        setAuth(token, authResponse.user ?? null, authResponse.refreshToken);
        navigate(redirectTo, { replace: true });
      } catch (error) {
        setLoginError(getAuthErrorMessage(error, 'Google sign-in failed.'));
      } finally {
        setIsGoogleLoading(false);
      }
    },
    [navigate, redirectTo, setAuth]
  );

  useEffect(() => {
    if (!googleButtonRef.current) return;

    googleButtonRef.current.innerHTML = '';

    if (!googleClientId) {
      return;
    }

    let isCancelled = false;

    loadGoogleIdentityScript()
      .then(() => {
        if (isCancelled || !googleButtonRef.current || !window.google?.accounts?.id) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredential,
        });

        const buttonWidth = Math.min(420, googleButtonRef.current.clientWidth || 420);

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: buttonWidth,
          text: activeTab === 'signin' ? 'signin_with' : 'signup_with',
          shape: 'rectangular',
        });
      })
      .catch(() => {
        if (!isCancelled) {
          setLoginError('Unable to load Google Sign-In. Please try again.');
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [activeTab, googleClientId, handleGoogleCredential]);

  if (token) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <main className="flex min-h-screen flex-col bg-background text-on-background selection:bg-secondary-container selection:text-on-secondary-container lg:flex-row">
      <button
        type="button"
        onClick={toggleTheme}
        className="fixed right-4 top-4 z-30 inline-flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-lowest text-primary transition-colors hover:bg-surface-container-low"
        aria-label={`Switch to ${appliedTheme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${appliedTheme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {appliedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      {/* Left Panel: Brand & Identity */}
      <section className="relative z-10 flex w-full flex-col justify-between overflow-hidden bg-primary-container p-6 sm:p-8 lg:fixed lg:h-screen lg:w-[45%] lg:p-12">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            alt=""
            aria-hidden="true"
            className="h-full w-full scale-105 object-cover object-[center_62%]"
            src={treeBackground}
          />
          <div className="absolute inset-0 bg-primary-container/70" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary-container/95 via-primary-container/35 to-primary-container/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-container/85 via-primary-container/20 to-transparent" />
        </div>

        {/* Branding Header */}
        <div className="relative z-10">
          <h1 className="font-display-lg text-[40px] sm:text-display-lg text-secondary-fixed italic tracking-[-0.02em] leading-tight">
            Oraculum
          </h1>
          <div className="w-12 h-px bg-secondary-fixed/40 mt-4"></div>
        </div>

        {/* Branding Footer */}
        <div className="relative z-10 hidden lg:block">
          <p className="font-label-sm text-label-sm text-primary-fixed-dim/60 tracking-widest uppercase">
            © {new Date().getFullYear()} ORACULUM SCRIPTORIUM
          </p>
        </div>
      </section>

      {/* Right Panel: Authentication */}
      <section className="relative flex min-h-screen w-full flex-col items-center justify-center bg-surface p-5 sm:p-6 lg:ml-[45%] lg:w-[55%] lg:p-12">
        <div className="w-full max-w-[420px]">
          {/* Toggle Tabs */}
          <div className="flex items-center space-x-8 mb-8 border-b border-outline-variant/30">
            <button
              onClick={() => {
                setActiveTab('signin');
                setLoginError(null);
              }}
              className={clsx(
                'pb-4 font-label-md text-label-md transition-all relative',
                activeTab === 'signin'
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-primary'
              )}
            >
              Sign In
              {activeTab === 'signin' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary"></div>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                setLoginError(null);
              }}
              className={clsx(
                'pb-4 font-label-md text-label-md transition-all relative',
                activeTab === 'signup'
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-primary'
              )}
            >
              Sign Up
              {activeTab === 'signup' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary"></div>
              )}
            </button>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="font-headline-md text-headline-md text-primary mb-2">
              {activeTab === 'signin' ? 'Welcome back' : 'Join the Scriptorium'}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {activeTab === 'signin'
                ? 'Please enter your credentials to access the scriptorium.'
                : 'Create an account to borrow books and manage your reading list.'}
            </p>
          </div>

          {/* Error Banner */}
          {loginError && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg font-body-md text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">error</span>
              {loginError}
            </div>
          )}

          {/* Sign In Form */}
          {activeTab === 'signin' && (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label
                  className="font-label-md text-label-md text-on-surface-variant ml-1"
                  htmlFor="signin-email"
                >
                  Email Address
                </label>
                <input
                  {...loginForm.register('email')}
                  className={clsx(
                    'w-full px-4 py-3 bg-surface-container-lowest border rounded-lg font-body-md text-body-md transition-all outline-none',
                    loginForm.formState.errors.email
                      ? 'border-error focus:ring-1 focus:ring-error'
                      : 'border-outline/20 form-input-focus'
                  )}
                  id="signin-email"
                  placeholder="scholar@oraculum.edu"
                  type="email"
                />
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-error ml-1">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label
                    className="font-label-md text-label-md text-on-surface-variant"
                    htmlFor="signin-password"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="font-label-sm text-label-sm text-secondary hover:underline transition-all"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    {...loginForm.register('password')}
                    className={clsx(
                      'w-full px-4 py-3 pr-12 bg-surface-container-lowest border rounded-lg font-body-md text-body-md transition-all outline-none',
                      loginForm.formState.errors.password
                        ? 'border-error focus:ring-1 focus:ring-error'
                        : 'border-outline/20 form-input-focus'
                    )}
                    id="signin-password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center h-full"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-error ml-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                className="w-full bg-secondary text-white py-3 px-4 rounded-lg font-label-md text-label-md inner-shine hover:bg-on-secondary-fixed-variant active:scale-[0.98] transition-all duration-200 custom-shadow flex items-center justify-center disabled:opacity-80 disabled:cursor-not-allowed mt-2"
                type="submit"
                disabled={loginForm.formState.isSubmitting}
              >
                {loginForm.formState.isSubmitting ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">
                    progress_activity
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          )}

          {/* Sign Up Form */}
          {activeTab === 'signup' && (
            <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label
                  className="font-label-md text-label-md text-on-surface-variant ml-1"
                  htmlFor="signup-fullname"
                >
                  Full Name
                </label>
                <input
                  {...signUpForm.register('fullName')}
                  className={clsx(
                    'w-full px-4 py-3 bg-surface-container-lowest border rounded-lg font-body-md text-body-md transition-all outline-none',
                    signUpForm.formState.errors.fullName
                      ? 'border-error focus:ring-1 focus:ring-error'
                      : 'border-outline/20 form-input-focus'
                  )}
                  id="signup-fullname"
                  placeholder="John Doe"
                  type="text"
                />
                {signUpForm.formState.errors.fullName && (
                  <p className="mt-1 text-xs text-error ml-1">
                    {signUpForm.formState.errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  className="font-label-md text-label-md text-on-surface-variant ml-1"
                  htmlFor="signup-studentid"
                >
                  Student/Staff ID
                </label>
                <input
                  {...signUpForm.register('studentId')}
                  className={clsx(
                    'w-full px-4 py-3 bg-surface-container-lowest border rounded-lg font-body-md text-body-md transition-all outline-none',
                    signUpForm.formState.errors.studentId
                      ? 'border-error focus:ring-1 focus:ring-error'
                      : 'border-outline/20 form-input-focus'
                  )}
                  id="signup-studentid"
                  placeholder="e.g. 12345678"
                  type="text"
                />
                {signUpForm.formState.errors.studentId && (
                  <p className="mt-1 text-xs text-error ml-1">
                    {signUpForm.formState.errors.studentId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  className="font-label-md text-label-md text-on-surface-variant ml-1"
                  htmlFor="signup-email"
                >
                  Email Address
                </label>
                <input
                  {...signUpForm.register('email')}
                  className={clsx(
                    'w-full px-4 py-3 bg-surface-container-lowest border rounded-lg font-body-md text-body-md transition-all outline-none',
                    signUpForm.formState.errors.email
                      ? 'border-error focus:ring-1 focus:ring-error'
                      : 'border-outline/20 form-input-focus'
                  )}
                  id="signup-email"
                  placeholder="scholar@oraculum.edu"
                  type="email"
                />
                {signUpForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-error ml-1">
                    {signUpForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  className="font-label-md text-label-md text-on-surface-variant ml-1"
                  htmlFor="signup-password"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    {...signUpForm.register('password')}
                    className={clsx(
                      'w-full px-4 py-3 pr-12 bg-surface-container-lowest border rounded-lg font-body-md text-body-md transition-all outline-none',
                      signUpForm.formState.errors.password
                        ? 'border-error focus:ring-1 focus:ring-error'
                        : 'border-outline/20 form-input-focus'
                    )}
                    id="signup-password"
                    placeholder="Min. 8 characters"
                    type={showPassword ? 'text' : 'password'}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center h-full"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {signUpForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-error ml-1">
                    {signUpForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  className="font-label-md text-label-md text-on-surface-variant ml-1"
                  htmlFor="signup-confirm-password"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    {...signUpForm.register('confirmPassword')}
                    className={clsx(
                      'w-full px-4 py-3 pr-12 bg-surface-container-lowest border rounded-lg font-body-md text-body-md transition-all outline-none',
                      signUpForm.formState.errors.confirmPassword
                        ? 'border-error focus:ring-1 focus:ring-error'
                        : 'border-outline/20 form-input-focus'
                    )}
                    id="signup-confirm-password"
                    placeholder="Repeat password"
                    type={showConfirmPassword ? 'text' : 'password'}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center h-full"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    type="button"
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {signUpForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-xs text-error ml-1">
                    {signUpForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="flex items-center h-5">
                    <input
                      {...signUpForm.register('terms')}
                      type="checkbox"
                      className="w-4 h-4 rounded border-outline/30 text-secondary focus:ring-secondary/30"
                    />
                  </div>
                  <span className="font-body-md text-sm text-on-surface-variant leading-tight">
                    I agree to the{' '}
                    <Link to="/terms" className="text-secondary hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-secondary hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {signUpForm.formState.errors.terms && (
                  <p className="mt-1 text-xs text-error ml-1">
                    {signUpForm.formState.errors.terms.message}
                  </p>
                )}
              </div>

              <button
                className="w-full bg-secondary text-white py-3 px-4 rounded-lg font-label-md text-label-md inner-shine hover:bg-on-secondary-fixed-variant active:scale-[0.98] transition-all duration-200 custom-shadow flex items-center justify-center disabled:opacity-80 disabled:cursor-not-allowed mt-4"
                type="submit"
                disabled={signUpForm.formState.isSubmitting}
              >
                {signUpForm.formState.isSubmitting ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">
                    progress_activity
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/30"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-surface font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                or continue with
              </span>
            </div>
          </div>

          {/* Google Identity Services Sign-In */}
          <div className="relative flex min-h-[44px] w-full items-center justify-center">
            {googleClientId ? (
              <>
                <div
                  ref={googleButtonRef}
                  className={clsx(
                    'flex w-full justify-center',
                    isGoogleLoading && 'pointer-events-none opacity-60'
                  )}
                />
                {isGoogleLoading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-surface/80">
                    <span className="material-symbols-outlined animate-spin text-[20px] text-secondary">
                      progress_activity
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full rounded-lg border border-error-container bg-error-container/40 px-4 py-3 text-center text-sm font-medium text-on-error-container">
                Google Sign-In needs VITE_GOOGLE_CLIENT_ID in .env.
              </div>
            )}
          </div>

          {/* Footer Link */}
          <p className="mt-8 text-center font-body-md text-body-md text-on-surface-variant">
            {activeTab === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setActiveTab(activeTab === 'signin' ? 'signup' : 'signin');
                setLoginError(null);
              }}
              className="text-secondary font-semibold hover:underline transition-all"
            >
              {activeTab === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        {/* Mobile Brand Footer */}
        <div className="mt-12 lg:hidden flex flex-col items-center">
          <p className="font-label-sm text-label-sm text-on-surface-variant/40 tracking-widest uppercase">
            © {new Date().getFullYear()} ORACULUM SCRIPTORIUM
          </p>
        </div>
      </section>
    </main>
  );
};
