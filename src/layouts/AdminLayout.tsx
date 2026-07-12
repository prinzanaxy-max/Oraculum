import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ClipboardCheck, 
  Settings, 
  HelpCircle, 
  LogOut,
  Search,
  Calendar,
  ChevronDown,
  Library
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/members', label: 'Members', icon: Users },
  { to: '/books/add', label: 'Add Books', icon: BookOpen },
  { to: '/checkout', label: 'Check-out Books', icon: ClipboardCheck },
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
}

export const AdminLayout = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [checkoutSearchFields, setCheckoutSearchFields] = useState<string[]>(['title', 'author']);
  const isCheckoutPage = location.pathname === '/checkout';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleCheckoutFilter = (value: string) => {
    setCheckoutSearchFields((current) =>
      current.includes(value)
        ? current.filter((field) => field !== value)
        : [...current, value]
    );
  };

  return (
    <div className="flex h-screen w-full bg-[#F7F7F8] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-[250px] bg-white border-r border-gray-100 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-gold/10 flex items-center justify-center text-amber-gold">
            <Library className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-charcoal tracking-tight">Oraculum</h1>
        </div>
        
        <nav className="flex-1 py-4 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-amber-gold text-white font-medium shadow-sm shadow-amber-gold/20'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-charcoal'
                )
              }
            >
              <item.icon className="w-5 h-5 stroke-[1.5]" />
              <span className="text-[15px]">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mb-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 stroke-[1.5]" />
            <span className="text-[15px] font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-[72px] bg-white flex items-center justify-between gap-6 px-8 shrink-0">
          {/* Search */}
          <div
            className={clsx(
              'relative min-w-0',
              isCheckoutPage
                ? 'w-[420px] min-w-[320px] max-w-[48vw] flex-none'
                : 'flex-1 max-w-xl'
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
            ) : (
              <>
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 stroke-[1.5]" />
                <input 
                  type="text" 
                  placeholder="Search Ex. ISBN, Title, Author, Member, etc" 
                  className="w-full pl-11 pr-10 py-2.5 bg-gray-50 border-none rounded-full text-[14px] focus:ring-2 focus:ring-amber-gold/20 focus:bg-white transition-all outline-none text-charcoal placeholder:text-gray-400"
                />
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
              </>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex shrink-0 items-center gap-6">
            {/* Date Range */}
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors border border-gray-100">
              <Calendar className="w-4 h-4 text-gray-500 stroke-[1.5]" />
              <span className="text-[14px] text-charcoal font-medium">Last 6 months</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {/* Profile Chip */}
            <button className="flex items-center gap-3 pl-2 pr-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-full transition-colors">
              <img 
                src="https://i.pravatar.cc/150?u=allison" 
                alt="Allison" 
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-[14px] text-charcoal font-medium">Allison</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet context={{ checkoutSearchFields } satisfies AdminOutletContext} />
        </main>
      </div>
    </div>
  );
};
