import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import clsx from 'clsx';

// Schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  studentId: z.string().min(2, 'Student/Staff ID is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;

export const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

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
      // In a real app, this would be:
      // const response = await api.post('/auth/login', data);
      // setAuth(response.data.token, response.data.user);
      
      // Mocking the API call for now
      await new Promise<{ token: string, user: { id: string, name: string, email: string } }>((resolve, reject) => {
        setTimeout(() => {
          if (data.email === 'admin@oraculum.edu' && data.password === 'password') {
            resolve({ token: 'mock-jwt-token', user: { id: '1', name: 'Super Admin', email: data.email } });
          } else {
            reject(new Error('Invalid credentials'));
          }
        }, 1500);
      }).then((res) => {
        setAuth(res.token, res.user);
        navigate('/dashboard');
      }).catch((err: Error) => {
        setLoginError(err.message);
      });
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        setLoginError(error.message);
      } else {
        setLoginError('An error occurred during login');
      }
    }
  };

  const onSignUpSubmit = async (data: SignUpForm) => {
    try {
      setLoginError(null);
      // Mocking the API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // In a real app, we would register then login or redirect to verify email
      setAuth('mock-jwt-token', { id: '2', name: data.fullName, email: data.email });
      navigate('/dashboard');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setLoginError(error.message);
      } else {
        setLoginError('An error occurred during sign up');
      }
    }
  };

  const handleGoogleSignIn = () => {
    setLoginError(null);
    setAuth('mock-google-jwt-token', {
      id: 'google-demo-admin',
      name: 'Google Admin',
      email: 'google.admin@oraculum.edu',
    });
    navigate('/dashboard');
  };

  return (
    <main className="flex min-h-screen bg-background text-on-background selection:bg-secondary-container selection:text-on-secondary-container flex-col lg:flex-row">
      {/* Left Panel: Brand & Identity */}
      <section className="w-full lg:w-[45%] lg:fixed lg:h-screen bg-primary-container relative overflow-hidden flex flex-col justify-between p-8 lg:p-12 z-10">
        {/* Decorative Background Overlay */}
        <div className="absolute inset-0 opacity-50 mix-blend-soft-light pointer-events-none">
          <img 
            alt="Oraculum Branding" 
            className="w-full h-full object-cover grayscale opacity-60" 
            src="https://lh3.googleusercontent.com/aida/AP1WRLv44hZ34qRskwEZi-QghrjxwO8Sm81wwMO471CR8rF0lSCXaLbofEdNsF7V5kG8VRO_JKDakVtPEokTeUmeG7RqN2b1MyIlhym3xDe8wI9cI2bqUWZxYkv8QHpnWugtstCRhDjXlCTJqsVNAxLtdf9bvYd_Uide2VbCYZN3fKG7RKv69hkhlcpF1C3Cu052qw0moKa6HybNOq_HBAAfSJ_IiTqUFaMtdL-9Cyif3N0f31MeK-CwWaTqxQ"
          />
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
            © 2024 ORACULUM SCRIPTORIUM
          </p>
        </div>
      </section>

      {/* Right Panel: Authentication */}
      <section className="w-full lg:w-[55%] lg:ml-[45%] flex flex-col items-center justify-center p-6 lg:p-12 bg-surface min-h-screen relative">
        <div className="w-full max-w-[420px]">
          {/* Toggle Tabs */}
          <div className="flex items-center space-x-8 mb-8 border-b border-outline-variant/30">
            <button 
              onClick={() => { setActiveTab('signin'); setLoginError(null); }}
              className={clsx(
                "pb-4 font-label-md text-label-md transition-all relative",
                activeTab === 'signin' ? "text-primary" : "text-on-surface-variant hover:text-primary"
              )}
            >
              Sign In
              {activeTab === 'signin' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary"></div>
              )}
            </button>
            <button 
              onClick={() => { setActiveTab('signup'); setLoginError(null); }}
              className={clsx(
                "pb-4 font-label-md text-label-md transition-all relative",
                activeTab === 'signup' ? "text-primary" : "text-on-surface-variant hover:text-primary"
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
                <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="signin-email">
                  Email Address
                </label>
                <input 
                  {...loginForm.register('email')}
                  className={clsx(
                    "w-full px-4 py-3 bg-surface-container-lowest border rounded-lg font-body-md text-body-md transition-all outline-none",
                    loginForm.formState.errors.email ? "border-error focus:ring-1 focus:ring-error" : "border-outline/20 form-input-focus"
                  )}
                  id="signin-email" 
                  placeholder="scholar@oraculum.edu" 
                  type="email"
                />
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-error ml-1">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="signin-password">
                    Password
                  </label>
                  <Link to="/forgot-password" className="font-label-sm text-label-sm text-secondary hover:underline transition-all">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input 
                    {...loginForm.register('password')}
                    className={clsx(
                      "w-full px-4 py-3 pr-12 bg-surface-container-lowest border rounded-lg font-body-md text-body-md transition-all outline-none",
                      loginForm.formState.errors.password ? "border-error focus:ring-1 focus:ring-error" : "border-outline/20 form-input-focus"
                    )}
                    id="signin-password" 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"}
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
                  <p className="mt-1 text-xs text-error ml-1">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <button 
                className="w-full bg-secondary text-white py-3 px-4 rounded-lg font-label-md text-label-md inner-shine hover:bg-on-secondary-fixed-variant active:scale-[0.98] transition-all duration-200 custom-shadow flex items-center justify-center disabled:opacity-80 disabled:cursor-not-allowed mt-2" 
                type="submit"
                disabled={loginForm.formState.isSubmitting}
              >
                {loginForm.formState.isSubmitting ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
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
                <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="signup-fullname">
                  Full Name
                </label>
                <input 
                  {...signUpForm.register('fullName')}
                  className={clsx(
                    "w-full px-4 py-3 bg-surface-container-lowest border rounded-lg font-body-md text-body-md transition-all outline-none",
                    signUpForm.formState.errors.fullName ? "border-error focus:ring-1 focus:ring-error" : "border-outline/20 form-input-focus"
                  )}
                  id="signup-fullname" 
                  placeholder="John Doe" 
                  type="text"
                />
                {signUpForm.formState.errors.fullName && (
                  <p className="mt-1 text-xs text-error ml-1">{signUpForm.formState.errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="signup-studentid">
                  Student/Staff ID
                </label>
                <input 
                  {...signUpForm.register('studentId')}
                  className={clsx(
                    "w-full px-4 py-3 bg-surface-container-lowest border rounded-lg font-body-md text-body-md transition-all outline-none",
                    signUpForm.formState.errors.studentId ? "border-error focus:ring-1 focus:ring-error" : "border-outline/20 form-input-focus"
                  )}
                  id="signup-studentid" 
                  placeholder="e.g. 12345678" 
                  type="text"
                />
                {signUpForm.formState.errors.studentId && (
                  <p className="mt-1 text-xs text-error ml-1">{signUpForm.formState.errors.studentId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="signup-email">
                  Email Address
                </label>
                <input 
                  {...signUpForm.register('email')}
                  className={clsx(
                    "w-full px-4 py-3 bg-surface-container-lowest border rounded-lg font-body-md text-body-md transition-all outline-none",
                    signUpForm.formState.errors.email ? "border-error focus:ring-1 focus:ring-error" : "border-outline/20 form-input-focus"
                  )}
                  id="signup-email" 
                  placeholder="scholar@oraculum.edu" 
                  type="email"
                />
                {signUpForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-error ml-1">{signUpForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="signup-password">
                  Password
                </label>
                <div className="relative">
                  <input 
                    {...signUpForm.register('password')}
                    className={clsx(
                      "w-full px-4 py-3 pr-12 bg-surface-container-lowest border rounded-lg font-body-md text-body-md transition-all outline-none",
                      signUpForm.formState.errors.password ? "border-error focus:ring-1 focus:ring-error" : "border-outline/20 form-input-focus"
                    )}
                    id="signup-password" 
                    placeholder="Min. 8 characters" 
                    type={showPassword ? "text" : "password"}
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
                  <p className="mt-1 text-xs text-error ml-1">{signUpForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="signup-confirm-password">
                  Confirm Password
                </label>
                <div className="relative">
                  <input 
                    {...signUpForm.register('confirmPassword')}
                    className={clsx(
                      "w-full px-4 py-3 pr-12 bg-surface-container-lowest border rounded-lg font-body-md text-body-md transition-all outline-none",
                      signUpForm.formState.errors.confirmPassword ? "border-error focus:ring-1 focus:ring-error" : "border-outline/20 form-input-focus"
                    )}
                    id="signup-confirm-password" 
                    placeholder="Repeat password" 
                    type={showConfirmPassword ? "text" : "password"}
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
                  <p className="mt-1 text-xs text-error ml-1">{signUpForm.formState.errors.confirmPassword.message}</p>
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
                    I agree to the <a href="#" className="text-secondary hover:underline">Terms of Service</a> and <a href="#" className="text-secondary hover:underline">Privacy Policy</a>
                  </span>
                </label>
                {signUpForm.formState.errors.terms && (
                  <p className="mt-1 text-xs text-error ml-1">{signUpForm.formState.errors.terms.message}</p>
                )}
              </div>

              <button 
                className="w-full bg-secondary text-white py-3 px-4 rounded-lg font-label-md text-label-md inner-shine hover:bg-on-secondary-fixed-variant active:scale-[0.98] transition-all duration-200 custom-shadow flex items-center justify-center disabled:opacity-80 disabled:cursor-not-allowed mt-4" 
                type="submit"
                disabled={signUpForm.formState.isSubmitting}
              >
                {signUpForm.formState.isSubmitting ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
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

          {/* Social Sign-In */}
          <button 
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center space-x-3 py-3 bg-surface-container-lowest border border-outline/20 rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-low active:scale-[0.98] transition-all custom-shadow"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            <span>Sign in with Google</span>
          </button>

          {/* Footer Link */}
          <p className="mt-8 text-center font-body-md text-body-md text-on-surface-variant">
            {activeTab === 'signin' ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => { setActiveTab(activeTab === 'signin' ? 'signup' : 'signin'); setLoginError(null); }}
              className="text-secondary font-semibold hover:underline transition-all"
            >
              {activeTab === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        {/* Mobile Brand Footer */}
        <div className="mt-12 lg:hidden flex flex-col items-center">
          <p className="font-label-sm text-label-sm text-on-surface-variant/40 tracking-widest uppercase">
            © 2024 ORACULUM SCRIPTORIUM
          </p>
        </div>
      </section>
    </main>
  );
};
