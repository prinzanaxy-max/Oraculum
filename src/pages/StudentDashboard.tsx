import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { getStudentBorrows, getStudentReservations, getReadingProgressMap } from '../api/student';
import { getAllBooks } from '../api/books';
import type { Book } from '../types';
import {
  BookOpen,
  BookmarkCheck,
  CalendarCheck,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  BookMarked,
  GraduationCap,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const memberId = user?.id || '';
  const studentName = user?.name || user?.fullName || 'Student';

  // Queries
  const borrowsQuery = useQuery({
    queryKey: ['student-borrows', memberId],
    queryFn: () => getStudentBorrows(memberId),
  });

  const reservationsQuery = useQuery({
    queryKey: ['student-reservations', memberId],
    queryFn: () => getStudentReservations(memberId),
  });

  const booksQuery = useQuery<Book[]>({
    queryKey: ['student-all-books'],
    queryFn: () => getAllBooks(),
  });

  const readingProgressMap = getReadingProgressMap();

  const borrows = borrowsQuery.data || [];
  const reservations = reservationsQuery.data || [];
  const books: Book[] = booksQuery.data || [];

  const activeBorrows = borrows.filter((b) => b.status === 'BORROWED' || b.status === 'OVERDUE');
  const returnedBorrows = borrows.filter((b) => b.status === 'RETURNED');
  const activeReservations = reservations.filter((r) => r.status === 'PENDING' || r.status === 'READY_FOR_PICKUP');

  // Featured books for online reading preview
  const featuredReadingBooks = books.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-app-border bg-app-surface p-6 sm:p-8 shadow-sm">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 h-40 w-40 rounded-full bg-amber-gold/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-gold">
              <GraduationCap className="h-4 w-4" />
              <span>Student Learning Center</span>
            </div>
            <h1 className="mt-2 font-serif text-2xl font-normal text-app-text sm:text-3xl">
              Welcome back, <span className="italic font-normal text-amber-gold">{studentName}</span>
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Track your borrowed books, upcoming due dates, reservations, and online reading progress.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/student/books')}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-gold px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-gold-dark"
          >
            <BookOpen className="h-4 w-4" />
            <span>Browse Catalog & Read</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Active Borrowed</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-gold/15 text-amber-gold">
              <BookmarkCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-app-text">{activeBorrows.length}</p>
          <p className="mt-1 text-xs text-gray-400">Books in your possession</p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Reservations</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-gold/15 text-amber-gold">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-app-text">{activeReservations.length}</p>
          <p className="mt-1 text-xs text-gray-400">Queued for pickup</p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Books Returned</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/15 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-app-text">{returnedBorrows.length}</p>
          <p className="mt-1 text-xs text-gray-400">Completed loans</p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Digital Reading</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-gold/15 text-amber-gold">
              <BookMarked className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-app-text">{Object.keys(readingProgressMap).length}</p>
          <p className="mt-1 text-xs text-gray-400">Books read online</p>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Active Borrowed & Due Dates (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Active Borrowed Books Card */}
          <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-app-border pb-4">
              <div>
                <h2 className="font-serif text-xl font-normal text-app-text">Current Borrowed Books</h2>
                <p className="text-xs text-gray-500">Keep track of your active loans and due dates</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/student/borrowed')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-gold hover:underline"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {borrowsQuery.isLoading ? (
                <div className="py-8 text-center text-xs text-gray-400">Loading your loan records...</div>
              ) : activeBorrows.length === 0 ? (
                <div className="rounded-xl border border-dashed border-app-border p-8 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm font-semibold text-app-text">No active book loans</p>
                  <p className="mt-1 text-xs text-gray-500">You currently have no borrowed books from the library.</p>
                  <button
                    type="button"
                    onClick={() => navigate('/student/books')}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-gold px-4 py-2 text-xs font-semibold text-white"
                  >
                    <span>Explore Book Catalog</span>
                  </button>
                </div>
              ) : (
                activeBorrows.map((record) => {
                  const dueDateObj = new Date(record.dueDate);
                  const isOverdue = record.status === 'OVERDUE' || dueDateObj < new Date();
                  const formattedDue = dueDateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={record.id}
                      className="flex flex-col gap-4 rounded-xl border border-app-border bg-app-surface-muted p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-gold/15 text-amber-gold">
                          <BookOpen className="h-6 w-6 stroke-[1.5]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-app-text">{record.book?.title || 'Library Book'}</h3>
                          <p className="text-xs text-gray-500">{record.book?.author || 'Unknown Author'}</p>
                          <p className="mt-1 text-[11px] text-gray-400">ISBN: {record.book?.isbn || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                        <div
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                            isOverdue
                              ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                              : 'bg-amber-gold/15 text-amber-gold'
                          }`}
                        >
                          <Clock className="h-3.5 w-3.5" />
                          <span>{isOverdue ? 'Overdue' : `Due: ${formattedDue}`}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`/student/reader/${record.bookId}`)}
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-gold/40 bg-amber-gold/10 px-3 py-1.5 text-xs font-medium text-amber-gold hover:bg-amber-gold/20"
                        >
                          <BookMarked className="h-3.5 w-3.5" />
                          <span>Read Online</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Online Reader Launcher */}
          <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-app-border pb-4">
              <div>
                <h2 className="font-serif text-xl font-normal text-app-text">Digital Reading Room</h2>
                <p className="text-xs text-gray-500">Instant access to read available books online</p>
              </div>
              <Sparkles className="h-5 w-5 text-amber-gold" />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {featuredReadingBooks.map((book: Book) => (
                <div
                  key={book.id}
                  className="flex flex-col justify-between rounded-xl border border-app-border bg-app-surface-muted p-4 transition-all hover:border-amber-gold/40"
                >
                  <div>
                    <span className="inline-block rounded-full bg-amber-gold/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-gold">
                      {book.category}
                    </span>
                    <h3 className="mt-2 line-clamp-1 font-semibold text-app-text">{book.title}</h3>
                    <p className="line-clamp-1 text-xs text-gray-500">{book.author}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-app-border/50 pt-3">
                    <span className="text-[11px] text-gray-400">{book.publishedYear}</span>
                    <button
                      type="button"
                      onClick={() => navigate(`/student/reader/${book.id}`)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-amber-gold hover:underline"
                    >
                      <span>Open Reader</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Reservations Queue & Quick Access (1 col) */}
        <div className="space-y-6">
          {/* Active Reservations Card */}
          <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-app-border pb-4">
              <div>
                <h2 className="font-serif text-xl font-normal text-app-text">My Reservations</h2>
                <p className="text-xs text-gray-500">Live queue position</p>
              </div>
              <CalendarCheck className="h-5 w-5 text-amber-gold" />
            </div>

            <div className="mt-4 space-y-3">
              {reservationsQuery.isLoading ? (
                <div className="py-6 text-center text-xs text-gray-400">Loading reservations...</div>
              ) : activeReservations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-app-border p-6 text-center text-xs text-gray-500">
                  No pending reservations.
                </div>
              ) : (
                activeReservations.map((res) => (
                  <div key={res.id} className="rounded-xl border border-app-border bg-app-surface-muted p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-app-text">{res.book?.title || 'Reserved Book'}</span>
                      <span className="rounded-full bg-amber-gold/15 px-2 py-0.5 text-[10px] font-bold text-amber-gold">
                        Queue #{res.queuePosition || 1}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-gray-500">{res.book?.category || 'General'}</p>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>Status: {res.status.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Library Guidance Card */}
          <div className="rounded-2xl border border-amber-gold/30 bg-amber-gold/10 p-6 text-app-text">
            <div className="flex items-center gap-2 font-serif text-lg font-normal text-amber-gold">
              <GraduationCap className="h-5 w-5" />
              <span>Student Library Notice</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
              Standard loan duration is 14 days per book. You may read any available catalog title digitally 24/7 without checking out a physical copy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
