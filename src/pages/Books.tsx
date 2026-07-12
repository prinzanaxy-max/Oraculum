import { useState } from 'react';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { BookOpen, CheckCircle } from 'lucide-react';
import { createBook } from '../api/books';
import type { BookPayload } from '../api/books';

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

export const Books = () => {
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (payload: BookPayload) => createBook(payload),
    onSuccess: (book) => {
      setForm(emptyForm);
      setFormError(null);
      setSuccessMessage(`${book.title || 'Book'} was added to the catalog.`);
    },
    onError: (error) => {
      setSuccessMessage(null);
      setFormError(getErrorMessage(error, 'Unable to add this book. Please try again.'));
    },
  });

  const updateField = (field: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const publishedYear = Number(form.publishedYear);
    const copies = Number(form.copies);

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

    createMutation.mutate({
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
    <div className="mx-auto max-w-[1100px] space-y-6 pb-8 font-sans">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[30px] font-bold tracking-tight text-charcoal">Add Books</h1>
          <p className="mt-1 text-[14px] text-gray-500">
            Create a new catalog record and set its available inventory.
          </p>
        </div>
      </div>

      {formError && (
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

      <div className="rounded-2xl border border-gray-50 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-gold/10 text-amber-gold">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-[20px] font-bold text-charcoal">Book Details</h2>
            <p className="text-[13px] text-gray-500">Fill in the required catalog information.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                Title
              </label>
              <input
                required
                name="title"
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-charcoal outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
                placeholder="The Design of Everyday Things"
              />
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                Author
              </label>
              <input
                required
                name="author"
                value={form.author}
                onChange={(event) => updateField('author', event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-charcoal outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
                placeholder="Don Norman"
              />
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                ISBN
              </label>
              <input
                required
                name="isbn"
                value={form.isbn}
                onChange={(event) => updateField('isbn', event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-charcoal outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
                placeholder="9780465050659"
              />
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                Category
              </label>
              <input
                required
                name="category"
                value={form.category}
                onChange={(event) => updateField('category', event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-charcoal outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
                placeholder="Design"
              />
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                Published Year
              </label>
              <input
                required
                name="publishedYear"
                type="number"
                min="1000"
                max={currentYear + 1}
                value={form.publishedYear}
                onChange={(event) => updateField('publishedYear', event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-charcoal outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
                placeholder="2013"
              />
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                Copies
              </label>
              <input
                required
                name="copies"
                type="number"
                min="1"
                value={form.copies}
                onChange={(event) => updateField('copies', event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-charcoal outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
                placeholder="1"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                Shelf Location
              </label>
              <input
                required
                name="shelfLocation"
                value={form.shelfLocation}
                onChange={(event) => updateField('shelfLocation', event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-charcoal outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
                placeholder="Aisle 4, Shelf B"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-charcoal outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
                placeholder="Optional notes about this title or edition."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-50 pt-5">
            <button
              type="button"
              onClick={() => {
                setForm(emptyForm);
                setFormError(null);
                setSuccessMessage(null);
              }}
              className="rounded-full border border-gray-200 px-5 py-2.5 text-[14px] font-semibold text-gray-500 transition-colors hover:text-charcoal"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex min-w-28 items-center justify-center rounded-full bg-amber-gold px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-amber-gold/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {createMutation.isPending ? 'Adding...' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
