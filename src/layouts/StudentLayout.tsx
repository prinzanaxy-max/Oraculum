import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { logoutSession } from '../api/auth';
import { OraculumLogo } from '../components/OraculumLogo';
import {
  LayoutDashboard,
  BookOpen,
  BookmarkCheck,
  CalendarCheck,
  CreditCard,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  User,
  GraduationCap,
} from 'lucide-react';
import clsx from 'clsx';

const studentNavItems = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/books', label: 'Book Catalog', icon: BookOpen },
  { to: '/student/borrowed', label: 'My Borrowed Books', icon: BookmarkCheck },
  { to: '/student/reservations', label: 'My Reservations', icon: CalendarCheck },
  { to: '/student/fines', label: 'My Fines', icon: CreditCard },
];

export const StudentLayout = () => {
  const { logout, user, refreshToken } = useAuthStore();
  const { appliedTheme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const studentName = user?.name || user?.fullName || 'Student';
  const studentId = user?.studentId || 'Student';
  const department = user?.department || 'Student Portal';
  const profileInitial = studentName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutSession(refreshToken);
    } catch {
      // Clear local state even if session logout fails
    } finally {
      logout();
      navigate('/student/login');
      setIsLoggingOut(false);
    }
  };

  const sidebarContent = (
    <>
      <div className="p-6">
        <OraculumLogo wordmarkClassName="text-[24px]" />
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-gold/10 px-3 py-1.5 text-xs font-semibold text-amber-gold">
          <GraduationCap className="h-4 w-4" />
          <span>Student Portal</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-2">
        {studentNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setIsMobileNavOpen(false)}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200',
                isActive
                  ? 'bg-amber-gold font-medium text-white shadow-sm shadow-amber-gold/20'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-charcoal'
              )
            }
          >
            <item.icon className="h-5 w-5 stroke-[1.5]" />
            <span className="text-[15px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Student Profile summary in sidebar footer */}
      <div className="border-t border-app-border p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-app-surface-muted p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-gold text-sm font-bold text-white">
            {profileInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-app-text">{studentName}</p>
            <p className="truncate text-[11px] text-gray-500">{studentId}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-red-500 transition-colors hover:bg-red-50 disabled:opacity-70"
        >
          <LogOut className="h-5 w-5 stroke-[1.5]" />
          <span className="text-[15px] font-medium">Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-app-bg font-sans text-app-text">
      {/* Mobile nav overlay */}
      {isMobileNavOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={() => setIsMobileNavOpen(false)}
          className="fixed inset-0 z-40 bg-charcoal/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden w-[260px] shrink-0 flex-col border-r border-app-border bg-app-surface lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-[min(82vw,280px)] flex-col border-r border-app-border bg-app-surface transition-transform duration-200 lg:hidden',
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between pr-4">
          <div className="p-6">
            <OraculumLogo wordmarkClassName="text-[24px]" />
          </div>
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(false)}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-50"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex min-h-[72px] shrink-0 items-center justify-between border-b border-app-border bg-app-surface px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="rounded-full border border-app-border bg-app-surface-muted p-2 text-charcoal lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-base font-semibold text-app-text">{studentName}</h2>
              <p className="text-xs text-gray-500">
                {department} &bull; ID: {studentId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-app-border bg-app-surface-muted text-charcoal transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label={`Switch to ${appliedTheme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${appliedTheme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {appliedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <div className="flex items-center gap-2.5 rounded-full border border-app-border bg-app-surface-muted py-1 pl-2 pr-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-gold text-xs font-bold text-white">
                <User className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-app-text">{studentId}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
