import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import { OraculumLogo } from '../components/OraculumLogo';
import {
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Search,
  BookMarked,
  Clock,
  ArrowRight,
  Sun,
  Moon,
  Sparkles,
  CheckCircle2,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { appliedTheme, toggleTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-app-bg font-sans text-app-text transition-colors duration-200">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 border-b border-app-border bg-app-surface/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <OraculumLogo wordmarkClassName="text-2xl" />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-app-border bg-app-surface-muted text-app-text transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label={`Switch to ${appliedTheme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${appliedTheme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {appliedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/student/login')}
                className="rounded-xl border border-amber-gold/30 bg-amber-gold/10 px-4 py-2 text-sm font-semibold text-amber-gold transition-colors hover:bg-amber-gold/20"
              >
                Student Sign In
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="rounded-xl bg-amber-gold px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-gold-dark hover:shadow"
              >
                Librarian Portal
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-70" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-gold/30 bg-amber-gold/10 px-4 py-1.5 text-xs font-semibold text-amber-gold shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Generation Academic Library Portal</span>
            </div>

            {/* Headline */}
            <h1 className="mt-6 font-serif text-4xl font-normal leading-tight text-app-text sm:text-5xl lg:text-6xl">
              Knowledge unlocked with <span className="italic text-amber-gold">precision</span> & clarity.
            </h1>

            {/* Subtext */}
            <p className="mt-6 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
              Oraculum seamlessly connects students and librarians through instant digital book reading, interactive catalog search, reservations management, and automated fine tracking.
            </p>

            {/* Dual Entry Point CTAs */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/student/login')}
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-amber-gold px-7 py-4 text-base font-semibold text-white shadow-lg shadow-amber-gold/25 transition-all hover:bg-amber-gold-dark hover:shadow-xl sm:w-auto"
              >
                <GraduationCap className="h-5 w-5 stroke-[2]" />
                <span>Student Sign In</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="group flex w-full items-center justify-center gap-3 rounded-xl border border-app-border bg-app-surface px-7 py-4 text-base font-semibold text-app-text shadow-sm transition-colors hover:bg-app-surface-muted sm:w-auto"
              >
                <ShieldCheck className="h-5 w-5 text-amber-gold stroke-[2]" />
                <span>Librarian Sign In</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {/* Trust points */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-gold" />
                <span>In-App Digital Reader</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-gold" />
                <span>Real-Time Reservations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-gold" />
                <span>Role-Protected Portals</span>
              </div>
            </div>
          </div>

          {/* Quick Preview Showcase Card */}
          <div className="mt-16 overflow-hidden rounded-2xl border border-app-border bg-app-surface p-2 shadow-2xl lg:mt-20">
            <div className="rounded-xl border border-app-border bg-app-surface-muted p-6 sm:p-10">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-app-border bg-app-surface p-5 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-gold/15 text-amber-gold">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-2xl font-bold text-app-text">32,345+</p>
                  <p className="text-xs font-medium text-gray-500">Catalog Titles</p>
                </div>

                <div className="rounded-xl border border-app-border bg-app-surface p-5 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-gold/15 text-amber-gold">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-2xl font-bold text-app-text">Active</p>
                  <p className="text-xs font-medium text-gray-500">Student Access</p>
                </div>

                <div className="rounded-xl border border-app-border bg-app-surface p-5 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-gold/15 text-amber-gold">
                    <BookMarked className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-2xl font-bold text-app-text">Instant</p>
                  <p className="text-xs font-medium text-gray-500">In-App Reader</p>
                </div>

                <div className="rounded-xl border border-app-border bg-app-surface p-5 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-gold/15 text-amber-gold">
                    <Clock className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-2xl font-bold text-app-text">24 / 7</p>
                  <p className="text-xs font-medium text-gray-500">Online Availability</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="border-t border-app-border bg-app-surface py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-normal text-app-text sm:text-4xl">
              Engineered for both <span className="italic text-amber-gold">students</span> and <span className="italic text-amber-gold">librarians</span>
            </h2>
            <p className="mt-4 text-base text-gray-600 dark:text-gray-400">
              Explore key capabilities built into the core of the Oraculum system.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="group rounded-2xl border border-app-border bg-app-bg p-6 transition-all hover:border-amber-gold/50 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-gold/15 text-amber-gold transition-colors group-hover:bg-amber-gold group-hover:text-white">
                <Search className="h-6 w-6 stroke-[1.5]" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-app-text">Catalog Browsing</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Filter and search through thousands of academic books by title, author, category, or ISBN with real-time status.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl border border-app-border bg-app-bg p-6 transition-all hover:border-amber-gold/50 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-gold/15 text-amber-gold transition-colors group-hover:bg-amber-gold group-hover:text-white">
                <BookOpen className="h-6 w-6 stroke-[1.5]" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-app-text">Digital Book Reader</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Read available books online with interactive chapter navigation, reading progress tracking, and custom themes.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl border border-app-border bg-app-bg p-6 transition-all hover:border-amber-gold/50 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-gold/15 text-amber-gold transition-colors group-hover:bg-amber-gold group-hover:text-white">
                <Layers className="h-6 w-6 stroke-[1.5]" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-app-text">Instant Reservations</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Reserve checked-out books with live queue tracking and pickup notifications directly on your dashboard.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-2xl border border-app-border bg-app-bg p-6 transition-all hover:border-amber-gold/50 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-gold/15 text-amber-gold transition-colors group-hover:bg-amber-gold group-hover:text-white">
                <Clock className="h-6 w-6 stroke-[1.5]" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-app-text">Due Date & Fine Tracking</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Clear visibility on loan durations, return countdowns, and pending fees to avoid surprises.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-app-border bg-app-surface py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
          <OraculumLogo wordmarkClassName="text-xl" />
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Oraculum Library Management System. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <button type="button" onClick={() => navigate('/terms')} className="hover:text-app-text">
              Terms of Service
            </button>
            <button type="button" onClick={() => navigate('/privacy')} className="hover:text-app-text">
              Privacy Policy
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
