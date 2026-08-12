import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { getStudentFines } from '../api/student';
import { payFine } from '../api/fines';
import { BookmarkCheck, GraduationCap } from 'lucide-react';

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));

export const StudentFines: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const memberId = user?.id || '';
  const queryClient = useQueryClient();
  const [alertMessage, setAlertMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [activeFineId, setActiveFineId] = useState<string | null>(null);

  const {
    data: fines = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['student-fines', memberId],
    queryFn: () => getStudentFines(memberId, 'pending'),
    enabled: Boolean(memberId),
  });

  const totalAmountDue = useMemo(
    () => fines.reduce((total, fine) => total + fine.amount, 0),
    [fines]
  );

  const payFineMutation = useMutation({
    mutationFn: (fineId: string) => payFine(fineId),
    onSuccess: () => {
      setAlertMessage({
        type: 'success',
        text: 'Your payment was processed. Pending fines have been updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['student-fines', memberId] });
      queryClient.invalidateQueries({ queryKey: ['student-borrows', memberId] });
      queryClient.invalidateQueries({ queryKey: ['student-reservations', memberId] });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Unable to complete payment. Please try again.';
      setAlertMessage({ type: 'error', text: message });
    },
    onSettled: () => {
      setActiveFineId(null);
    },
  });

  const payAllMutation = useMutation({
    mutationFn: async () => Promise.all(fines.map((fine) => payFine(fine.id))),
    onSuccess: () => {
      setAlertMessage({
        type: 'success',
        text: 'All pending fines were paid. Your balance is now clear.',
      });
      queryClient.invalidateQueries({ queryKey: ['student-fines', memberId] });
      queryClient.invalidateQueries({ queryKey: ['student-borrows', memberId] });
      queryClient.invalidateQueries({ queryKey: ['student-reservations', memberId] });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Unable to complete payment. Please try again.';
      setAlertMessage({ type: 'error', text: message });
    },
    onSettled: () => {
      setActiveFineId(null);
    },
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
            Clear Your Fines
          </h1>
          <p className="text-xs text-gray-500">
            Pay any pending library fines directly from your student portal with a simple checkout
            flow.
          </p>
        </div>
      </div>

      {alertMessage && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            alertMessage.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {alertMessage.text}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.5fr_minmax(260px,1fr)]">
        <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                Payment summary
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-app-text">
                ${totalAmountDue.toFixed(2)} total due
              </h2>
              <p className="mt-2 text-xs leading-6 text-gray-500">
                {fines.length} pending fine{fines.length === 1 ? '' : 's'} are ready to be cleared.
              </p>
            </div>

            <div className="rounded-3xl bg-app-surface-muted p-4 text-right">
              <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400">Next step</p>
              <p className="mt-2 text-sm font-semibold text-app-text">Choose a fine and pay now.</p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-app-border bg-app-surface-muted p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Payment method</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-app-text">Card ending in 8742</p>
                <p className="text-[11px] text-gray-400">Visa • Exp 11/27</p>
              </div>
              <p className="text-xs text-gray-500">
                This is a frontend payment flow for clearing fines. Funds are marked paid in the
                library system.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                Quick actions
              </p>
              <p className="mt-2 text-xs text-gray-500">Streamline your fine clearance process.</p>
            </div>
            <button
              type="button"
              onClick={() => payAllMutation.mutate()}
              disabled={payAllMutation.isPending || fines.length === 0}
              className="rounded-xl bg-amber-gold px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-gold-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {payAllMutation.isPending ? 'Processing...' : 'Pay All'}
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-3xl border border-app-border bg-app-surface-muted p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Fast checkout</p>
              <p className="mt-2 text-sm text-app-text">
                Pay fines one at a time or clear your entire balance with one click.
              </p>
            </div>
            <div className="rounded-3xl border border-app-border bg-app-surface-muted p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Record update</p>
              <p className="mt-2 text-sm text-app-text">
                The library record is updated immediately after payment clears.
              </p>
            </div>
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
              Your record is clean. Keep borrowing responsibly.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {fines.map((fine) => (
              <div
                key={fine.id}
                className="grid gap-4 rounded-2xl border border-app-border bg-app-surface-muted p-5 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-app-text">{fine.bookTitle}</p>
                      <p className="mt-1 text-xs text-gray-500">Member: {fine.memberName}</p>
                    </div>
                    <span className="rounded-full bg-red-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-600">
                      {fine.status}
                    </span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                        Due date
                      </p>
                      <p className="mt-1 text-sm text-app-text">{formatDate(fine.dueDate)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                        Amount
                      </p>
                      <p className="mt-1 text-sm font-semibold text-app-text">
                        ${fine.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFineId(fine.id);
                      payFineMutation.mutate(fine.id);
                    }}
                    disabled={activeFineId === fine.id && payFineMutation.isPending}
                    className="inline-flex items-center justify-center rounded-xl bg-amber-gold px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-gold-dark disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {activeFineId === fine.id && payFineMutation.isPending
                      ? 'Processing...'
                      : 'Pay Now'}
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
