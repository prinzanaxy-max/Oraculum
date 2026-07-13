import { useState } from 'react';
import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { getFines, payFine, waiveFine } from '../api/fines';
import { PaginationControls } from '../components/PaginationControls';
import { useClientPagination } from '../hooks/useClientPagination';
import type { Fine } from '../types';

const statusFilterOptions: Array<{ value: Fine['status'] | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'waived', label: 'Waived' },
];

const statusStyles: Record<Fine['status'], string> = {
  pending: 'bg-red-50 text-red-500',
  paid: 'bg-green-50 text-green-600',
  waived: 'bg-gray-100 text-gray-500',
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

export const Fines = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<Fine['status'] | 'all'>('all');

  const {
    data: fines = [],
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['fines', statusFilter],
    queryFn: () => getFines(statusFilter === 'all' ? undefined : statusFilter),
  });

  const { paginatedItems, ...pagination } = useClientPagination(fines);

  const payMutation = useMutation({
    mutationFn: (fine: Fine) => payFine(fine.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fines'] }),
  });

  const waiveMutation = useMutation({
    mutationFn: (fine: Fine) => waiveFine(fine.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fines'] }),
  });

  const errorMessage = error
    ? getErrorMessage(error, 'Unable to load fines. Please try again.')
    : payMutation.error
      ? getErrorMessage(payMutation.error, 'Unable to mark this fine as paid.')
      : waiveMutation.error
        ? getErrorMessage(waiveMutation.error, 'Unable to waive this fine.')
        : null;

  const isActionPending = payMutation.isPending || waiveMutation.isPending;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-8 font-sans">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-charcoal">Fines Management</h1>
          <p className="mt-1 text-[13px] text-gray-500">
            Review overdue fines, mark payments, or waive balances.
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
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">Member</th>
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">Book</th>
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">Due Date</th>
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">Amount</th>
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">Status</th>
                <th className="px-5 py-4 text-right text-[12px] font-bold text-charcoal">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 6 }).map((_, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-50 last:border-0">
                    {Array.from({ length: 6 }).map((__, cellIndex) => (
                      <td key={cellIndex} className="px-5 py-5">
                        <div className="h-3 w-24 animate-pulse rounded-full bg-gray-100" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading && fines.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <p className="text-[15px] font-semibold text-charcoal">No fines yet</p>
                    <p className="mt-1 text-[13px] text-gray-500">
                      Pending and paid fines will appear here.
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                paginatedItems.map((fine) => (
                  <tr
                    key={fine.id}
                    className="group border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/80"
                  >
                    <td className="px-5 py-4 text-[13px] font-semibold text-charcoal">
                      {fine.memberName}
                    </td>
                    <td className="px-5 py-4 text-[13px] text-gray-600">{fine.bookTitle}</td>
                    <td className="px-5 py-4 text-[13px] text-gray-600">
                      {formatDate(fine.dueDate)}
                    </td>
                    <td className="px-5 py-4 text-[13px] font-semibold text-charcoal">
                      ${fine.amount.toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={clsx(
                          'inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold capitalize',
                          statusStyles[fine.status]
                        )}
                      >
                        {fine.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {fine.status === 'pending' ? (
                          <>
                            <button
                              type="button"
                              disabled={isActionPending}
                              onClick={() => payMutation.mutate(fine)}
                              className="rounded-md bg-amber-gold px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-amber-gold/90 disabled:opacity-60"
                            >
                              Mark Paid
                            </button>
                            <button
                              type="button"
                              disabled={isActionPending}
                              onClick={() => waiveMutation.mutate(fine)}
                              className="rounded-md bg-gray-500 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-gray-600 disabled:opacity-60"
                            >
                              Waive
                            </button>
                          </>
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
            Refreshing fines...
          </div>
        )}
        <PaginationControls {...pagination} onPageChange={pagination.setPage} />
      </div>
    </div>
  );
};
