import { Link } from 'react-router-dom';

export const ForgotPassword = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline/10 text-center">
        <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-secondary">
          <span className="material-symbols-outlined text-[32px]">lock_reset</span>
        </div>
        <h1 className="font-headline-md text-headline-md text-primary mb-2">Reset Password</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-8">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
        
        <form className="space-y-6 text-left" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="email">
              Email Address
            </label>
            <input 
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline/20 rounded-lg font-body-md text-body-md form-input-focus transition-all outline-none" 
              id="email" 
              placeholder="scholar@oraculum.edu" 
              type="email"
              required
            />
          </div>
          
          <button 
            className="w-full bg-secondary text-white py-3 px-4 rounded-lg font-label-md text-label-md inner-shine hover:bg-on-secondary-fixed-variant active:scale-[0.98] transition-all duration-200 custom-shadow" 
            type="submit"
          >
            Send Reset Link
          </button>
        </form>
        
        <div className="mt-8">
          <Link to="/login" className="font-label-sm text-label-sm text-secondary hover:underline flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};
