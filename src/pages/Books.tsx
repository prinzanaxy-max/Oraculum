import { useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, CheckCircle, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import clsx from 'clsx';
import { createBook, deleteBook, getBooks, updateBook } from '../api/books';
import type { BookPayload } from '../api/books';
import { PaginationControls } from '../components/PaginationControls';
import { useClientPagination } from '../hooks/useClientPagination';
import { useDebounce } from '../hooks/useDebounce';
import type { Book } from '../types';

const currentYear = new Date().getFullYear();

const emptyForm = {
  title: '',
  author: '',
  isbn: '',
  publishedYear: '',
  category: '',
  copies: '1',
  shelfLocation: '',
  description: '',
};

const statusStyles: Record<Book['status'], string> = {
  available: 'bg-green-50 text-green-600',
  borrowed: 'bg-red-50 text-red-500',
  reserved: 'bg-violet-50 text-violet-500',
  maintenance: 'bg-gray-100 text-gray-500',
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

const toForm = (book: Book) => ({
  title: book.title,
  author: book.author,
  isbn: book.isbn,
  publishedYear: String(book.publishedYear),
  category: book.category ?? '',
  copies: String(book.copies ?? book.availableCopies ?? 1),
  shelfLocation: book.shelfLocation ?? '',
  description: book.description ?? '',
});

export const Books = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search.trim(), 300);

  const {
    data: books = [],
    isLoading,
    isFetching,
    error: listError,
  } = useQuery({
    queryKey: ['books', debouncedSearch],
    queryFn: () =>
      getBooks({
        query: debouncedSearch,
        fields: ['title', 'author', 'isbn', 'category'],
      }),
  });

  const listErrorMessage = listError
    ? getErrorMessage(listError, 'Unable to load books. Please try again.')
    : null;

  const sortedBooks = useMemo(
    () => [...books].sort((a, b) => a.title.localeCompare(b.title)),
    [books]
  );

  const { paginatedItems, ...pagination } = useClientPagination(sortedBooks);

  const saveMutation = useMutation({
    mutationFn: (payload: BookPayload) =>
      editingBook ? updateBook(editingBook.id, payload) : createBook(payload),
    onSuccess: (book) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setForm(emptyForm);
      setEditingBook(null);
      setIsFormOpen(false);
      setFormError(null);
      setSuccessMessage(`${book.title || 'Book'} was ${editingBook ? 'updated' : 'added'}.`);
    },
    onError: (error) => {
      setSuccessMessage(null);
      setFormError(getErrorMessage(error, 'Unable to save this book. Please try again.'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (book: Book) => deleteBook(book.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setSuccessMessage('Book removed from the catalog.');
      setDeleteTarget(null);
    },
    onError: (error) => {
      setSuccessMessage(null);
      setFormError(getErrorMessage(error, 'Unable to remove this book. Please try again.'));
      setDeleteTarget(null);
    },
  });

  const updateField = (field: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openAddForm = () => {
    setEditingBook(null);
    setForm(emptyForm);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (book: Book) => {
    setEditingBook(book);
    setForm(toForm(book));
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const publishedYear = Number(form.publishedYear);
    const copies = Number(form.copies);

    if (!form.title.trim() || !form.author.trim() || !form.isbn.trim()) {
      setFormError('Title, author, and ISBN are required.');
      return;
    }

    if (
      !Number.isInteger(publishedYear) ||
      publishedYear < 1000 ||
      publishedYear > currentYear + 1
    ) {
      setFormError(`Published year must be between 1000 and ${currentYear + 1}.`);
      return;
    }

    if (!Number.isInteger(copies) || copies < 1) {
      setFormError('Copies must be at least 1.');
      return;
    }

    saveMutation.mutate({
      title: form.title.trim(),
      author: form.author.trim(),
      isbn: form.isbn.trim(),
      publishedYear,
      category: form.category.trim(),
      copies,
      shelfLocation: form.shelfLocation.trim(),
      description: form.description.trim() || undefined,
    });
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-8 font-sans">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-charcoal">Books Management</h1>
          <p className="mt-1 text-[13px] text-gray-500">
            Add books, manage inventory, and keep the catalog searchable.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-[320px]">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, author, ISBN"
              className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-4 pr-11 text-[14px] text-charcoal outline-none transition-all placeholder:text-gray-400 focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
            />
            <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-gold px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm shadow-amber-gold/20 transition-colors hover:bg-amber-gold/90 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add Book
          </button>
        </div>
      </div>

      {listErrorMessage && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {listErrorMessage}
        </div>
      )}

      {formError && !isFormOpen && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {formError}
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-gold/20 bg-amber-gold/10 px-4 py-3 text-sm font-medium text-charcoal">
          <CheckCircle className="h-4 w-4 text-amber-gold" />
          {successMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-50 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">Title</th>
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">Author</th>
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">ISBN</th>
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">Category</th>
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">Copies</th>
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">Shelf</th>
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">Status</th>
                <th className="px-5 py-4 text-right text-[12px] font-bold text-charcoal">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 7 }).map((_, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-50 last:border-0">
                    {Array.from({ length: 8 }).map((__, cellIndex) => (
                      <td key={cellIndex} className="px-5 py-5">
                        <div className="h-3 w-24 animate-pulse rounded-full bg-gray-100" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading && sortedBooks.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <BookOpen className="mx-auto h-8 w-8 text-gray-300" />
                    <p className="mt-3 text-[15px] font-semibold text-charcoal">
                      {debouncedSearch ? 'No matching books found' : 'No books in the catalog yet'}
                    </p>
                    <p className="mt-1 text-[13px] text-gray-500">
                      {debouncedSearch
                        ? `Try another title, author, or ISBN for "${debouncedSearch}"`
                        : 'Add your first book to start building the catalog.'}
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                paginatedItems.map((book) => (
                  <tr
                    key={book.id}
                    className="group border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/80"
                  >
                    <td className="px-5 py-4 text-[13px] font-semibold text-charcoal">
                      {book.title}
                    </td>
                    <td className="px-5 py-4 text-[13px] text-gray-600">{book.author}</td>
                    <td className="px-5 py-4 text-[13px] text-gray-600">{book.isbn}</td>
                    <td className="px-5 py-4 text-[13px] text-gray-600">
                      {book.category ?? 'Uncategorized'}
                    </td>
                    <td className="px-5 py-4 text-[13px] text-gray-600">
                      {book.availableCopies ?? book.copies ?? 0}/{book.copies ?? 0}
                    </td>
                    <td className="px-5 py-4 text-[13px] text-gray-600">
                      {book.shelfLocation ?? 'N/A'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={clsx(
                          'inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold capitalize',
                          statusStyles[book.status]
                        )}
                      >
                        {book.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                        <button
                          type="button"
                          onClick={() => openEditForm(book)}
                          className="inline-flex items-center gap-1 rounded-md bg-gray-500 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-gray-600"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(book)}
                          className="inline-flex items-center gap-1 rounded-md bg-red-400 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {isFetching && !isLoading && (
          <div className="border-t border-gray-50 px-5 py-3 text-[12px] font-medium text-gray-400">
            Refreshing books...
          </div>
        )}
        <PaginationControls {...pagination} onPageChange={pagination.setPage} />
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-charcoal/40 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[calc(100dvh-4rem)] w-[min(100%,46rem)] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-[20px] font-bold text-charcoal">
                  {editingBook ? 'Edit Book' : 'Add Book'}
                </h2>
                <p className="mt-1 text-[13px] text-gray-500">
                  {editingBook
                    ? 'Update this catalog record.'
                    : 'Create a new catalog record and inventory count.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-charcoal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-2">
                {[
                  ['title', 'Title', 'The Design of Everyday Things'],
                  ['author', 'Author', 'Don Norman'],
                  ['isbn', 'ISBN', '9780465050659'],
                  ['category', 'Category', 'Design'],
                ].map(([field, label, placeholder]) => (
                  <label key={field} className="block">
                    <span className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                      {label}
                    </span>
                    <input
                      required
                      value={form[field as keyof typeof emptyForm]}
                      onChange={(event) =>
                        updateField(field as keyof typeof emptyForm, event.target.value)
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-charcoal outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
                      placeholder={placeholder}
                    />
                  </label>
                ))}

                <label className="block">
                  <span className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                    Published Year
                  </span>
                  <input
                    required
                    type="number"
                    min="1000"
                    max={currentYear + 1}
                    value={form.publishedYear}
                    onChange={(event) => updateField('publishedYear', event.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-charcoal outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
                    placeholder="2013"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                    Copies
                  </span>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.copies}
                    onChange={(event) => updateField('copies', event.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-charcoal outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
                    placeholder="1"
                  />
                </label>

                <label className="block lg:col-span-2">
                  <span className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                    Shelf Location
                  </span>
                  <input
                    required
                    value={form.shelfLocation}
                    onChange={(event) => updateField('shelfLocation', event.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-charcoal outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
                    placeholder="Aisle 4, Shelf B"
                  />
                </label>

                <label className="block lg:col-span-2">
                  <span className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                    Description
                  </span>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(event) => updateField('description', event.target.value)}
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-charcoal outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
                    placeholder="Optional notes about this title or edition."
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-50 pt-5">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-full border border-gray-200 px-5 py-2.5 text-[14px] font-semibold text-gray-500 transition-colors hover:text-charcoal"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="inline-flex min-w-28 items-center justify-center rounded-full bg-amber-gold px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-amber-gold/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saveMutation.isPending ? 'Saving...' : editingBook ? 'Save Changes' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-[18px] font-bold text-charcoal">Delete this book?</h2>
            <p className="mt-2 text-[14px] text-gray-500">
              This removes {deleteTarget.title} from the catalog.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-full border border-gray-200 px-5 py-2.5 text-[14px] font-semibold text-gray-500 transition-colors hover:text-charcoal"
              >
                Keep
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(deleteTarget)}
                disabled={deleteMutation.isPending}
                className="rounded-full bg-red-400 px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
