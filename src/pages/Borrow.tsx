import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import clsx from 'clsx';
import {
  checkoutBorrowRecord,
  getBorrowRecords,
  renewBorrowRecord,
  returnBorrowRecord,
} from '../api/borrow';
import { createReservation } from '../api/reservations';
import { useDebounce } from '../hooks/useDebounce';
import type { AdminOutletContext } from '../layouts/AdminLayout';
import type { BorrowRecord } from '../types';
import { calculateFine } from '../utils/formatters';

const statusStyles: Record<BorrowRecord['status'], string> = {
  available: 'bg-green-50 text-green-600',
  borrowed: 'bg-red-50 text-red-500',
  renewed: 'bg-gray-100 text-gray-500',
  reserved: 'bg-violet-50 text-violet-500',
};

const statusLabels: Record<BorrowRecord['status'], string> = {
  available: 'Available',
  borrowed: 'Borrowed',
  renewed: 'Renewed',
  reserved: 'Reserved',
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

const formatDate = (date: string | null) => {
  if (!date) return '-';

  return new Intl.DateTimeFormat('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
};

const matchesBorrowSearch = (record: BorrowRecord, query: string) => {
  if (!query) return false;
  const normalizedQuery = query.toLowerCase();
  return [record.isbn ?? '', record.memberId, record.memberName, record.title, record.author].some(
    (value) => value.toLowerCase().includes(normalizedQuery)
  );
};

const Highlight = ({ value, query }: { value: string; query: string }) => {
  if (!query) return <>{value}</>;

  const index = value.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return <>{value}</>;

  return (
    <>
      {value.slice(0, index)}
      <mark className="rounded bg-amber-gold/20 px-0.5 text-charcoal">
        {value.slice(index, index + query.length)}
      </mark>
      {value.slice(index + query.length)}
    </>
  );
};

export const Borrow = () => {
  const queryClient = useQueryClient();
  const { checkoutSearchFields } = useOutletContext<AdminOutletContext>();
  const [search, setSearch] = useState('');
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [checkoutTarget, setCheckoutTarget] = useState<BorrowRecord | null>(null);
  const [checkoutMemberId, setCheckoutMemberId] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search.trim(), 300);

  const queryKey = ['borrow-records', debouncedSearch, checkoutSearchFields];

  const {
    data: records = [],
    isLoading,
    isFetching,
    error: listError,
  } = useQuery({
    queryKey,
    queryFn: () =>
      getBorrowRecords({
        query: debouncedSearch,
        fields: checkoutSearchFields,
      }),
  });

  const updateCachedRecord = (recordId: string, update: Partial<BorrowRecord>) => {
    queryClient.setQueryData<BorrowRecord[]>(queryKey, (current) =>
      current?.map((record) =>
        record.id === recordId
          ? {
              ...record,
              ...update,
            }
          : record
      )
    );
  };

  const returnMutation = useMutation({
    mutationFn: async (record: BorrowRecord) => {
      const response = await returnBorrowRecord(record.id);
      return {
        id: record.id,
        fine: response.fine ?? calculateFine(record.dueDate, new Date().toISOString()),
      };
    },
    onSuccess: ({ id, fine }) => {
      updateCachedRecord(id, {
        status: 'available',
        returnedDate: new Date().toISOString(),
        fine,
      });
      queryClient.invalidateQueries({ queryKey: ['borrow-records'] });
      setActionError(null);
      setActionMessage(
        fine > 0 ? `Book returned. Overdue fine: $${fine.toFixed(2)}.` : 'Book returned.'
      );
    },
    onError: (error) => {
      setActionMessage(null);
      setActionError(getErrorMessage(error, 'Unable to return this book. Please try again.'));
    },
  });

  const renewMutation = useMutation({
    mutationFn: (record: BorrowRecord) => renewBorrowRecord(record.id),
    onSuccess: (updatedRecord) => {
      updateCachedRecord(updatedRecord.id, updatedRecord);
      queryClient.invalidateQueries({ queryKey: ['borrow-records'] });
      setActionError(null);
      setActionMessage('Loan renewed successfully.');
    },
    onError: (error) => {
      setActionMessage(null);
      setActionError(getErrorMessage(error, 'Unable to renew this loan. Please try again.'));
    },
  });

  const reserveMutation = useMutation({
    mutationFn: (record: BorrowRecord) =>
      createReservation({
        bookId: record.bookId,
        memberId: record.memberId,
      }).then(() => record),
    onSuccess: (record) => {
      updateCachedRecord(record.id, { status: 'reserved' });
      queryClient.invalidateQueries({ queryKey: ['borrow-records'] });
      setActionError(null);
      setActionMessage('Book reserved successfully.');
    },
    onError: (error) => {
      setActionMessage(null);
      setActionError(getErrorMessage(error, 'Unable to reserve this book. Please try again.'));
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: (record: BorrowRecord) =>
      checkoutBorrowRecord({
        bookId: record.bookId,
        memberId: checkoutMemberId.trim() || record.memberId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrow-records'] });
      setCheckoutTarget(null);
      setCheckoutMemberId('');
      setActionError(null);
      setActionMessage('Book checked out successfully.');
    },
    onError: (error) => {
      setActionMessage(null);
      setActionError(getErrorMessage(error, 'Unable to check out this book. Please try again.'));
    },
  });

  useEffect(() => {
    if (!actionMessage) return;

    const timeout = window.setTimeout(() => {
      setActionMessage(null);
    }, 4500);

    return () => window.clearTimeout(timeout);
  }, [actionMessage]);

  const listErrorMessage = listError
    ? getErrorMessage(listError, 'Unable to load check-out records. Please try again.')
    : null;

  const isActionPending =
    returnMutation.isPending ||
    renewMutation.isPending ||
    reserveMutation.isPending ||
    checkoutMutation.isPending;

  const renderActions = (record: BorrowRecord) => {
    if (record.status === 'borrowed') {
      return (
        <>
          <button
            type="button"
            disabled={isActionPending}
            onClick={(event) => {
              event.stopPropagation();
              returnMutation.mutate(record);
            }}
            className="rounded-md bg-red-400 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Return
          </button>
          <button
            type="button"
            disabled={isActionPending || record.hasPendingReservations}
            title={
              record.hasPendingReservations
                ? 'Disabled because this book has pending reservations.'
                : undefined
            }
            onClick={(event) => {
              event.stopPropagation();
              renewMutation.mutate(record);
            }}
            className="rounded-md bg-gray-500 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Renew
          </button>
          <button
            type="button"
            disabled={isActionPending}
            onClick={(event) => {
              event.stopPropagation();
              reserveMutation.mutate(record);
            }}
            className="rounded-md bg-charcoal px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reserve
          </button>
        </>
      );
    }

    if (record.status === 'available') {
      return (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setActionMessage(null);
            setActionError(null);
            setCheckoutTarget(record);
            setCheckoutMemberId(record.memberId);
          }}
          className="rounded-md bg-amber-gold px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-amber-gold/90"
        >
          Check Out
        </button>
      );
    }

    if (record.status === 'renewed') {
      return (
        <>
          <button
            type="button"
            disabled={isActionPending}
            onClick={(event) => {
              event.stopPropagation();
              returnMutation.mutate(record);
            }}
            className="rounded-md bg-red-400 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Return
          </button>
          <button
            type="button"
            disabled={isActionPending}
            onClick={(event) => {
              event.stopPropagation();
              reserveMutation.mutate(record);
            }}
            className="rounded-md bg-charcoal px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reserve
          </button>
        </>
      );
    }

    return (
      <button
        type="button"
        disabled={isActionPending}
        onClick={(event) => {
          event.stopPropagation();
          reserveMutation.mutate(record);
        }}
        className="rounded-md bg-charcoal px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Reserve
      </button>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-8 font-sans">
      <div className="flex justify-end">
        <div className="relative w-full max-w-sm">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search Ex. ISBN, Title, Author, Member, etc"
            className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-4 pr-11 text-[14px] text-charcoal outline-none transition-all placeholder:text-gray-400 focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
          />
          <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {listErrorMessage && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {listErrorMessage}
        </div>
      )}

      {actionError && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {actionError}
        </div>
      )}

      {actionMessage && (
        <div className="rounded-xl border border-amber-gold/20 bg-amber-gold/10 px-4 py-3 text-sm font-medium text-charcoal">
          {actionMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-50 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">ISBN</th>
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">Member ID</th>
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">Member</th>
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">Title</th>
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">Author</th>
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">Borrowed Date</th>
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">Returned Date</th>
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">Status</th>
                <th className="px-5 py-4 text-right text-[12px] font-bold text-charcoal">Action</th>
              </tr>
            </thead>

            <tbody>
              {isLoading &&
                Array.from({ length: 8 }).map((_, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-50 last:border-0">
                    {Array.from({ length: 9 }).map((__, cellIndex) => (
                      <td key={cellIndex} className="px-5 py-5">
                        <div className="h-3 w-24 animate-pulse rounded-full bg-gray-100" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading && records.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center">
                    <p className="text-[15px] font-semibold text-charcoal">
                      {debouncedSearch
                        ? 'No matching check-out records found'
                        : 'No check-out records yet'}
                    </p>
                    <p className="mt-1 text-[13px] text-gray-500">
                      {debouncedSearch
                        ? `Try another ISBN, title, author, or member for "${debouncedSearch}"`
                        : 'Check-out records will appear here.'}
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                records.map((record) => {
                  const isSelected = selectedRowId === record.id;
                  const isSearchMatch = matchesBorrowSearch(record, debouncedSearch);

                  return (
                    <tr
                      key={record.id}
                      onClick={() => setSelectedRowId(record.id)}
                      className={clsx(
                        'group cursor-pointer border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/80',
                        isSelected && 'bg-gray-50/80',
                        isSearchMatch && 'bg-amber-gold/5'
                      )}
                    >
                      <td className="px-5 py-4 text-[13px] text-gray-600">
                        <Highlight value={record.isbn ?? 'N/A'} query={debouncedSearch} />
                      </td>
                      <td className="px-5 py-4 text-[13px] text-gray-600">
                        <Highlight value={record.memberId} query={debouncedSearch} />
                      </td>
                      <td className="px-5 py-4 text-[13px] font-medium text-gray-700">
                        <Highlight value={record.memberName} query={debouncedSearch} />
                      </td>
                      <td className="px-5 py-4 text-[13px] text-gray-600">
                        <Highlight value={record.title} query={debouncedSearch} />
                      </td>
                      <td className="px-5 py-4 text-[13px] text-gray-600">
                        <Highlight value={record.author} query={debouncedSearch} />
                      </td>
                      <td className="px-5 py-4 text-[13px] text-gray-600">
                        {formatDate(record.borrowedDate)}
                      </td>
                      <td className="px-5 py-4 text-[13px] text-gray-600">
                        {formatDate(record.returnedDate)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={clsx(
                            'inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold',
                            statusStyles[record.status]
                          )}
                        >
                          {statusLabels[record.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div
                          className={clsx(
                            'flex justify-end gap-2 transition-opacity',
                            isSelected
                              ? 'opacity-100'
                              : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
                          )}
                        >
                          {renderActions(record)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {isFetching && !isLoading && (
          <div className="border-t border-gray-50 px-5 py-3 text-[12px] font-medium text-gray-400">
            Refreshing check-out records...
          </div>
        )}
      </div>

      {checkoutTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-charcoal/40 px-4 py-8 backdrop-blur-sm">
          <div className="w-[min(100%,32rem)] rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-[20px] font-bold text-charcoal">Check Out Book</h2>
                <p className="mt-1 text-[13px] text-gray-500">
                  Confirm the member receiving this book.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutTarget(null)}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-charcoal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-[15px] font-semibold text-charcoal">{checkoutTarget.title}</p>
              <p className="mt-1 text-[13px] text-gray-500">
                {checkoutTarget.author} · ISBN {checkoutTarget.isbn ?? 'N/A'}
              </p>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                checkoutMutation.mutate(checkoutTarget);
              }}
              className="mt-5 space-y-5"
            >
              <label className="block">
                <span className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                  Member ID
                </span>
                <input
                  required
                  value={checkoutMemberId}
                  onChange={(event) => setCheckoutMemberId(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-charcoal outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
                  placeholder="Enter member ID"
                />
              </label>

              <div className="flex justify-end gap-3 border-t border-gray-50 pt-5">
                <button
                  type="button"
                  onClick={() => setCheckoutTarget(null)}
                  className="rounded-full border border-gray-200 px-5 py-2.5 text-[14px] font-semibold text-gray-500 transition-colors hover:text-charcoal"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={checkoutMutation.isPending}
                  className="inline-flex min-w-28 items-center justify-center rounded-full bg-amber-gold px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-amber-gold/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {checkoutMutation.isPending ? 'Checking out...' : 'Check Out'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
