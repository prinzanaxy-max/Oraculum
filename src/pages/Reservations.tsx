import { useState } from 'react';
import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { cancelReservation, getReservations } from '../api/reservations';
import { PaginationControls } from '../components/PaginationControls';
import { useClientPagination } from '../hooks/useClientPagination';
import type { Reservation } from '../types';

const statusFilterOptions: Array<{ value: Reservation['status'] | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'cancelled', label: 'Cancelled' },
];

const statusStyles: Record<Reservation['status'], string> = {
  pending: 'bg-amber-gold/10 text-charcoal',
  fulfilled: 'bg-green-50 text-green-600',
  cancelled: 'bg-gray-100 text-gray-500',
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));

export const Reservations = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<Reservation['status'] | 'all'>('all');

  const {
    data: reservations = [],
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['reservations', statusFilter],
    queryFn: () => getReservations(statusFilter === 'all' ? undefined : statusFilter),
  });

  const { paginatedItems, ...pagination } = useClientPagination(reservations);

  const cancelMutation = useMutation({
    mutationFn: (reservation: Reservation) => cancelReservation(reservation.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reservations'] }),
  });

  const errorMessage = error
    ? getErrorMessage(error, 'Unable to load reservations. Please try again.')
    : cancelMutation.error
      ? getErrorMessage(cancelMutation.error, 'Unable to cancel reservation.')
      : null;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-8 font-sans">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-charcoal">Reservations</h1>
          <p className="mt-1 text-[13px] text-gray-500">
            Review pending reservations and cancel requests when needed.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {statusFilterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatusFilter(option.value)}
              className={clsx(
                'rounded-full px-4 py-2 text-[13px] font-semibold transition-colors',
                statusFilter === option.value
                  ? 'bg-charcoal text-white'
                  : 'border border-gray-200 text-gray-500 hover:text-charcoal'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {errorMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-50 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">Book</th>
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">Member</th>
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">Reserved Date</th>
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">Status</th>
                <th className="px-5 py-4 text-right text-[12px] font-bold text-charcoal">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 6 }).map((_, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-50 last:border-0">
                    {Array.from({ length: 5 }).map((__, cellIndex) => (
                      <td key={cellIndex} className="px-5 py-5">
                        <div className="h-3 w-24 animate-pulse rounded-full bg-gray-100" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading && reservations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <p className="text-[15px] font-semibold text-charcoal">No reservations yet</p>
                    <p className="mt-1 text-[13px] text-gray-500">
                      Reservation requests will appear here.
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                paginatedItems.map((reservation) => (
                  <tr
                    key={reservation.id}
                    className="group border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/80"
                  >
                    <td className="px-5 py-4 text-[13px] font-semibold text-charcoal">
                      {reservation.bookTitle ?? reservation.bookId}
                    </td>
                    <td className="px-5 py-4 text-[13px] text-gray-600">
                      {reservation.memberName ?? reservation.memberCode ?? reservation.memberId}
                    </td>
                    <td className="px-5 py-4 text-[13px] text-gray-600">
                      {formatDate(reservation.reservationDate)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={clsx(
                          'inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold capitalize',
                          statusStyles[reservation.status]
                        )}
                      >
                        {reservation.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        {reservation.status === 'pending' ? (
                          <button
                            type="button"
                            onClick={() => cancelMutation.mutate(reservation)}
                            disabled={cancelMutation.isPending}
                            className="rounded-md bg-red-400 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-60"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-[12px] text-gray-400">No action</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {isFetching && !isLoading && (
          <div className="border-t border-gray-50 px-5 py-3 text-[12px] font-medium text-gray-400">
            Refreshing reservations...
          </div>
        )}
        <PaginationControls {...pagination} onPageChange={pagination.setPage} />
      </div>
    </div>
  );
};
