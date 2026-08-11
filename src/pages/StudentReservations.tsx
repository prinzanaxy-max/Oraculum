import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { getStudentReservations } from '../api/student';
import {
  CalendarCheck,
  BookOpen,
  BookMarked,
  GraduationCap,
} from 'lucide-react';

export const StudentReservations: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const memberId = user?.id || '';

  const reservationsQuery = useQuery({
    queryKey: ['student-reservations-page', memberId],
    queryFn: () => getStudentReservations(memberId),
  });

  const reservations = reservationsQuery.data || [];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-gold">
            <GraduationCap className="h-4 w-4" />
            <span>Student Reservation Queue</span>
          </div>
          <h1 className="mt-1 font-serif text-2xl font-normal text-app-text sm:text-3xl">
            My Reservations
          </h1>
          <p className="text-xs text-gray-500">
            View queue position and pickup notifications for requested physical books.
          </p>
        </div>
      </div>

      {/* Reservations List */}
      {reservationsQuery.isLoading ? (
        <div className="py-12 text-center text-xs text-gray-400">Loading reservation queue...</div>
      ) : reservations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-app-border p-12 text-center">
          <CalendarCheck className="mx-auto h-10 w-10 text-gray-400" />
          <h3 className="mt-3 text-base font-semibold text-app-text">No active reservations</h3>
          <p className="mt-1 text-xs text-gray-500">You currently have no pending book reservations.</p>
          <button
            type="button"
            onClick={() => navigate('/student/books')}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-gold px-4 py-2 text-xs font-semibold text-white"
          >
            <span>Browse Catalog</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => {
            const reservedDate = new Date(res.reservedAt).toLocaleDateString();

            return (
              <div
                key={res.id}
                className="flex flex-col gap-4 rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-gold/15 text-amber-gold">
                    <BookOpen className="h-6 w-6 stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-app-text">{res.book?.title || 'Reserved Book'}</h3>
                    <p className="text-xs text-gray-500">Author: {res.book?.author || 'N/A'}</p>
                    <p className="mt-1 text-[11px] text-gray-400">Category: {res.book?.category || 'General'}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:items-end">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-gold/15 px-3 py-1 text-xs font-bold text-amber-gold">
                      Queue #{res.queuePosition || 1}
                    </span>
                    <span className="rounded-full bg-app-surface-muted px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                      {res.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400">Reserved on: {reservedDate}</p>

                  <button
                    type="button"
                    onClick={() => navigate(`/student/reader/${res.bookId}`)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-gold hover:underline mt-1"
                  >
                    <BookMarked className="h-3.5 w-3.5" />
                    <span>Read Digitally Now</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
