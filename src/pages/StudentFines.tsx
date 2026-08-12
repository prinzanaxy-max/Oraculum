import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { getStudentFines } from '../api/student';
import { BookmarkCheck, CalendarCheck, BookOpen, GraduationCap } from 'lucide-react';

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));

export const StudentFines: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const memberId = user?.id || '';

  const {
    data: fines = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['student-fines', memberId],
    queryFn: () => getStudentFines(memberId, 'pending'),
    enabled: Boolean(memberId),
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-gold">
            <GraduationCap className="h-4 w-4" />
            <span>Library Fines</span>
          </div>
          <h1 className="mt-1 font-serif text-2xl font-normal text-app-text sm:text-3xl">
            My Outstanding Fines
          </h1>
          <p className="text-xs text-gray-500">
            View your pending fines from the shared library system. Librarians manage payments and
            waivers.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-500">Pending fine count</p>
            <p className="mt-1 text-3xl font-bold text-app-text">{fines.length}</p>
          </div>
          <div className="rounded-2xl bg-red-500/10 px-4 py-3 text-red-700">
            <span className="text-sm font-semibold">
              Only librarians can resolve or waive fines.
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Unable to load fines. Please refresh the page.
        </div>
      )}

      <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-gray-400">
            Loading your outstanding fines...
          </div>
        ) : fines.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-app-border p-12 text-center">
            <BookmarkCheck className="mx-auto h-10 w-10 text-gray-400" />
            <h3 className="mt-3 text-base font-semibold text-app-text">No pending fines</h3>
            <p className="mt-1 text-xs text-gray-500">
              Your record is clean. Keep borrowing responsibly!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {fines.map((fine) => (
              <div
                key={fine.id}
                className="rounded-2xl border border-app-border bg-app-surface-muted p-4 shadow-sm sm:flex sm:items-center sm:justify-between"
              >
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-app-text">{fine.bookTitle}</div>
                  <p className="text-xs text-gray-500">Member: {fine.memberName}</p>
                  <p className="text-[11px] text-gray-400">Due: {formatDate(fine.dueDate)}</p>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4 sm:mt-0 sm:flex-col sm:items-end">
                  <div className="text-right">
                    <p className="text-base font-semibold text-app-text">
                      ${fine.amount.toFixed(2)}
                    </p>
                    <p className="text-[11px] uppercase tracking-[0.15em] text-red-600">
                      {fine.status}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-red-700"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Awaiting Librarian
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
