import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardCheck,
  CalendarCheck,
  Receipt,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  ChevronDown,
  Library,
  Menu,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/members', label: 'Members', icon: Users },
  { to: '/books/add', label: 'Add Books', icon: BookOpen },
  { to: '/checkout', label: 'Check-out Books', icon: ClipboardCheck },
  { to: '/reservations', label: 'Reservations', icon: CalendarCheck },
  { to: '/fines', label: 'Fines', icon: Receipt },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/help', label: 'Help', icon: HelpCircle },
];

const checkoutFilterOptions = [
  { label: 'ISBN', value: 'isbn' },
  { label: 'Title', value: 'title' },
  { label: 'Author', value: 'author' },
  { label: 'Member', value: 'member' },
];

export interface AdminOutletContext {
  checkoutSearchFields: string[];
  globalSearch: string;
}

export const AdminLayout = () => {
  const { logout, user } = useAuthStore();
  const { appliedTheme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [checkoutSearchFields, setCheckoutSearchFields] = useState<string[]>(['title', 'author']);
  const [globalSearch, setGlobalSearch] = useState('');
  const isCheckoutPage = location.pathname === '/checkout';
  const isMembersPage = location.pathname === '/members';
  const profileName = user?.name ?? 'Admin';
  const profileAvatar = `https://i.pravatar.cc/150?u=${encodeURIComponent(user?.email ?? profileName)}`;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleCheckoutFilter = (value: string) => {
    setCheckoutSearchFields((current) =>
      current.includes(value) ? current.filter((field) => field !== value) : [...current, value]
    );
  };

  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 p-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-gold/10 text-amber-gold">
          <Library className="h-5 w-5" />
        </div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-charcoal">Oraculum</h1>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
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

      <div className="mb-4 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-red-500 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-5 w-5 stroke-[1.5]" />
          <span className="text-[15px] font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-app-bg font-sans text-app-text">
      {isMobileNavOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={() => setIsMobileNavOpen(false)}
          className="fixed inset-0 z-40 bg-charcoal/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside className="hidden w-[250px] shrink-0 flex-col border-r border-app-border bg-app-surface lg:flex">
        {sidebarContent}
      </aside>

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-[min(82vw,280px)] flex-col border-r border-app-border bg-app-surface transition-transform duration-200 lg:hidden',
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between pr-4">
          <div className="flex items-center gap-3 p-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-gold/10 text-amber-gold">
              <Library className="h-5 w-5" />
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-charcoal">Oraculum</h1>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(false)}
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-charcoal"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
          {navItems.map((item) => (
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

        <div className="mb-4 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-red-500 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-5 w-5 stroke-[1.5]" />
            <span className="text-[15px] font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/*
        Main Content
      */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex min-h-[72px] shrink-0 flex-col gap-3 border-b border-app-border bg-app-surface px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="rounded-full border border-app-border bg-app-surface-muted p-2 text-charcoal transition-colors hover:bg-gray-50"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-gold/10 text-amber-gold">
                <Library className="h-5 w-5" />
              </div>
              <span className="font-serif text-xl font-bold text-charcoal">Oraculum</span>
            </div>
          </div>
          {/* Search */}
          <div
            className={clsx(
              'relative min-w-0',
              isCheckoutPage
                ? 'w-full lg:w-[420px] lg:min-w-[320px] lg:max-w-[48vw] lg:flex-none'
                : 'w-full lg:flex-1 lg:max-w-xl'
            )}
          >
            {isCheckoutPage ? (
              <div className="relative">
                <div
                  className="flex h-[44px] w-full items-center gap-2 overflow-hidden rounded-full bg-gray-50 px-4 py-2 text-[14px] text-charcoal transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-gold/20"
                  onClick={() => setIsFilterMenuOpen(true)}
                >
                  <Search className="h-5 w-5 shrink-0 text-gray-400 stroke-[1.5]" />
                  <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {checkoutSearchFields.map((field) => {
                      const option = checkoutFilterOptions.find((item) => item.value === field);
                      return (
                        <span
                          key={field}
                          className="inline-flex shrink-0 items-center rounded-full bg-white px-2.5 py-1 text-[12px] font-medium leading-none text-charcoal shadow-sm"
                        >
                          {option?.label ?? field}
                        </span>
                      );
                    })}
                    <input
                      readOnly
                      onFocus={() => setIsFilterMenuOpen(true)}
                      placeholder={checkoutSearchFields.length ? '' : 'Select filters'}
                      className="w-20 shrink-0 border-none bg-transparent p-0 text-[14px] outline-none placeholder:text-gray-400"
                    />
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                </div>

                {isFilterMenuOpen && (
                  <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-40 overflow-hidden rounded-xl border border-gray-100 bg-white py-2 shadow-lg">
                    {checkoutFilterOptions.map((option) => {
                      const isSelected = checkoutSearchFields.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => toggleCheckoutFilter(option.value)}
                          className={`flex w-full items-center justify-between gap-4 px-4 py-2 text-left text-[13px] transition-colors ${
                            isSelected
                              ? 'bg-amber-gold/10 font-semibold text-charcoal'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {option.label}
                          {isSelected && <span className="h-2 w-2 rounded-full bg-amber-gold" />}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setIsFilterMenuOpen(false)}
                      className="mt-1 w-full border-t border-gray-50 px-4 py-2 text-left text-[12px] font-medium text-gray-400 hover:text-charcoal"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            ) : isMembersPage ? (
              <>
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 stroke-[1.5]" />
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(event) => setGlobalSearch(event.target.value)}
                  placeholder="Search member name, email, or ID"
                  className="w-full pl-11 pr-10 py-2.5 bg-gray-50 border-none rounded-full text-[14px] focus:ring-2 focus:ring-amber-gold/20 focus:bg-white transition-all outline-none text-charcoal placeholder:text-gray-400"
                />
              </>
            ) : (
              <div className="hidden lg:block" />
            )}
          </div>

          {/* Right Actions */}
          <div className="flex shrink-0 items-center justify-end gap-3 sm:gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-app-border bg-gray-50 text-charcoal transition-colors hover:bg-gray-100"
              aria-label={`Switch to ${appliedTheme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${appliedTheme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {appliedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {/* Profile Chip */}
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="flex min-w-0 items-center gap-2 rounded-full border border-gray-100 bg-gray-50 py-1.5 pl-2 pr-3 transition-colors hover:bg-gray-100 sm:gap-3"
            >
              <img
                src={profileAvatar}
                alt={profileName}
                className="h-8 w-8 shrink-0 rounded-full object-cover"
              />
              <span className="hidden max-w-32 truncate text-[14px] font-medium text-charcoal sm:inline">
                {profileName}
              </span>
              <ChevronDown className="hidden h-4 w-4 text-gray-500 sm:block" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet context={{ checkoutSearchFields, globalSearch } satisfies AdminOutletContext} />
        </main>
      </div>
    </div>
  );
};
