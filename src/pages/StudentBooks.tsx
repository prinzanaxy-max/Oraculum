import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllBooks } from '../api/books';
import { createReservation } from '../api/reservations';
import { checkoutBorrowRecord } from '../api/borrow';
import { getStudentReservations } from '../api/student';
import { useAuthStore } from '../store/authStore';
import type { Book } from '../types';
import {
  Search,
  BookOpen,
  BookMarked,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';

export const StudentBooks: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const memberId = user?.id || '';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [actionMessage, setActionMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const booksQuery = useQuery<Book[]>({
    queryKey: ['student-books-list'],
    queryFn: () => getAllBooks(),
  });

  const reservationsQuery = useQuery({
    queryKey: ['student-reservations', memberId],
    queryFn: () => getStudentReservations(memberId),
    enabled: Boolean(memberId),
  });

  const borrowMutation = useMutation({
    mutationFn: (bookId: string) => checkoutBorrowRecord({ bookId, memberId }),
    onSuccess: () => {
      setActionMessage({
        type: 'success',
        text: 'Book borrow request was successful and is reflected in the shared library data.',
      });
      queryClient.invalidateQueries({ queryKey: ['student-books-list'] });
      queryClient.invalidateQueries({ queryKey: ['student-borrows', memberId] });
      queryClient.invalidateQueries({ queryKey: ['borrow-records'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: unknown) => {
      let message = 'Unable to borrow this book. Please try again.';
      if (error instanceof AxiosError) {
        message = error.response?.data?.message ?? message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setActionMessage({ type: 'error', text: message });
    },
  });

  const reserveMutation = useMutation({
    mutationFn: (bookId: string) => createReservation({ bookId, memberId }),
    onSuccess: () => {
      setActionMessage({
        type: 'success',
        text: 'Reservation created successfully and shared with librarian reservations.',
      });
      queryClient.invalidateQueries({ queryKey: ['student-books-list'] });
      queryClient.invalidateQueries({ queryKey: ['student-reservations', memberId] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
    onError: (error: unknown) => {
      let message = 'Unable to reserve this book. Please try again.';
      if (error instanceof AxiosError) {
        message = error.response?.data?.message ?? message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setActionMessage({ type: 'error', text: message });
    },
  });

  const books: Book[] = booksQuery.data || [];
  const reservations = reservationsQuery.data || [];

  const categories = useMemo(() => {
    const list = Array.from(new Set(books.map((b: Book) => b.category || 'General'))).filter(
      Boolean
    );
    return ['ALL', ...list];
  }, [books]);

  const reservedBookIds = useMemo(
    () => new Set((reservations || []).map((reservation) => reservation.bookId)),
    [reservations]
  );

  const filteredBooks = useMemo(() => {
    return books.filter((book: Book) => {
      const category = book.category || 'General';
      const matchesCategory = selectedCategory === 'ALL' || category === selectedCategory;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term) ||
        book.isbn.toLowerCase().includes(term) ||
        category.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [books, selectedCategory, searchTerm]);

  const handleBorrow = (bookId: string) => {
    setActionMessage(null);
    borrowMutation.mutate(bookId);
  };

  const handleReserve = (bookId: string) => {
    setActionMessage(null);
    reserveMutation.mutate(bookId);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-gold">
            <GraduationCap className="h-4 w-4" />
            <span>Academic Library Catalog</span>
          </div>
          <h1 className="mt-1 font-serif text-2xl font-normal text-app-text sm:text-3xl">
            Browse & Borrow Books
          </h1>
          <p className="text-xs text-gray-500">
            Explore available titles, request a borrow, or reserve unavailable books from the shared
            library system.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            actionMessage.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {actionMessage.text}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1fr_minmax(280px,380px)]">
        <div className="rounded-2xl border border-app-border bg-app-surface p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                Reservation queue
              </p>
              <p className="mt-2 text-3xl font-semibold text-app-text">{reservations.length}</p>
              <p className="mt-2 text-xs leading-5 text-gray-500">
                {reservations.length
                  ? 'Active book reservations in your account.'
                  : 'You have no active reservations yet.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/student/reservations')}
              className="rounded-xl bg-amber-gold px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-gold-dark"
            >
              View Reservations
            </button>
          </div>

          {reservationsQuery.isLoading ? (
            <div className="mt-6 py-8 text-center text-xs text-gray-400">
              Loading reservations...
            </div>
          ) : reservations.length > 0 ? (
            <div className="mt-6 space-y-3">
              {reservations.slice(0, 3).map((reservation) => (
                <div
                  key={reservation.id}
                  className="rounded-2xl border border-app-border bg-app-surface-muted p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-app-text">
                      {reservation.book?.title ?? 'Reserved Book'}
                    </p>
                    <span className="rounded-full bg-amber-gold/10 px-2 py-1 text-[11px] font-semibold text-amber-gold">
                      Queue #{reservation.queuePosition || 1}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500">
                    {reservation.status.replace(/_/g, ' ')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-app-border p-5 text-center text-xs text-gray-500">
              Reserve unavailable books from the catalog and they will appear here.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, author, category, or ISBN..."
                className="w-full rounded-xl border border-app-border bg-app-surface-muted py-2.5 pl-10 pr-4 text-sm text-app-text outline-none transition-colors focus:border-amber-gold focus:ring-1 focus:ring-amber-gold"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-app-border/50">
            <span className="flex items-center gap-1 text-xs font-medium text-gray-500 mr-1">
              <Filter className="h-3.5 w-3.5" />
              <span>Category:</span>
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-amber-gold text-white font-semibold'
                    : 'bg-app-surface-muted text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {booksQuery.isLoading ? (
        <div className="py-16 text-center text-sm text-gray-400">Loading catalog books...</div>
      ) : filteredBooks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-app-border p-12 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-gray-400" />
          <h3 className="mt-3 text-base font-semibold text-app-text">No books found</h3>
          <p className="mt-1 text-xs text-gray-500">
            Try adjusting your search keywords or category filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBooks.map((book: Book) => {
            const isAvailable = book.status?.toLowerCase() === 'available';
            const isReservedByMe = reservedBookIds.has(book.id);
            const canReserve = !isAvailable && !isReservedByMe;
            const copiesLabel =
              book.availableCopies !== undefined
                ? `${book.availableCopies} copies available`
                : 'Availability unknown';

            return (
              <div
                key={book.id}
                className="flex flex-col justify-between rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-amber-gold/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-gold">
                      {book.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        isAvailable
                          ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {isAvailable ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Available</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3" />
                          <span>{book.status}</span>
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="mt-3 font-serif text-lg font-normal text-app-text leading-snug">
                    {book.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-gray-500">by {book.author}</p>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-400">
                    {book.description || `${book.title} published in ${book.publishedYear}.`}
                  </p>

                  <div className="mt-4 flex items-center gap-4 text-[11px] text-gray-400 border-t border-app-border/40 pt-3">
                    <span>ISBN: {book.isbn}</span>
                    <span>{copiesLabel}</span>
                  </div>
                </div>

                <div className="mt-6 border-t border-app-border pt-4">
                  {isAvailable ? (
                    <button
                      type="button"
                      onClick={() => handleBorrow(book.id)}
                      disabled={borrowMutation.isPending}
                      className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-gold py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-amber-gold-dark disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <BookMarked className="h-4 w-4" />
                      <span>{borrowMutation.isPending ? 'Borrowing...' : 'Borrow Book'}</span>
                    </button>
                  ) : canReserve ? (
                    <button
                      type="button"
                      onClick={() => handleReserve(book.id)}
                      disabled={reserveMutation.isPending}
                      className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-gold py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-amber-gold-dark disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <BookMarked className="h-4 w-4" />
                      <span>{reserveMutation.isPending ? 'Reserving...' : 'Reserve Book'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-100 py-2.5 text-xs font-semibold text-gray-500"
                    >
                      <BookMarked className="h-4 w-4" />
                      <span>{isReservedByMe ? 'Already Reserved' : 'Unavailable'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate(`/student/reader/${book.id}`)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-app-border bg-app-surface-muted py-2.5 text-xs font-semibold text-amber-gold transition-all hover:bg-gray-100"
                  >
                    <span>Read Online Directly</span>
                    <ArrowRight className="h-3.5 w-3.5" />
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
