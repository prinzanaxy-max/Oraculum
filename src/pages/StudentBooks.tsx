import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAllBooks } from '../api/books';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const booksQuery = useQuery<Book[]>({
    queryKey: ['student-books-list'],
    queryFn: () => getAllBooks(),
  });

  const books: Book[] = booksQuery.data || [];

  // Extract unique categories
  const categories = useMemo(() => {
    const list = Array.from(new Set(books.map((b: Book) => b.category || 'General'))).filter(Boolean);
    return ['ALL', ...list];
  }, [books]);

  // Filtered books
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

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-gold">
            <GraduationCap className="h-4 w-4" />
            <span>Academic Library Catalog</span>
          </div>
          <h1 className="mt-1 font-serif text-2xl font-normal text-app-text sm:text-3xl">
            Browse & Read Online
          </h1>
          <p className="text-xs text-gray-500">
            Explore thousands of books available for digital reading and physical borrowing.
          </p>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col gap-4 rounded-2xl border border-app-border bg-app-surface p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {/* Search bar */}
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

        {/* Category Pills */}
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

      {/* Book Grid */}
      {booksQuery.isLoading ? (
        <div className="py-16 text-center text-sm text-gray-400">Loading catalog books...</div>
      ) : filteredBooks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-app-border p-12 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-gray-400" />
          <h3 className="mt-3 text-base font-semibold text-app-text">No books found</h3>
          <p className="mt-1 text-xs text-gray-500">Try adjusting your search keywords or category filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBooks.map((book: Book) => {
            const isAvailable = book.status?.toLowerCase() === 'available';

            return (
              <div
                key={book.id}
                className="flex flex-col justify-between rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div>
                  {/* Category Pill & Status Badge */}
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

                  {/* Title & Author */}
                  <h3 className="mt-3 font-serif text-lg font-normal text-app-text leading-snug">
                    {book.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-gray-500">by {book.author}</p>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-400">
                    {book.description || `${book.title} published in ${book.publishedYear}.`}
                  </p>

                  <div className="mt-4 flex items-center gap-4 text-[11px] text-gray-400 border-t border-app-border/40 pt-3">
                    <span>ISBN: {book.isbn}</span>
                    <span>Year: {book.publishedYear}</span>
                  </div>
                </div>

                {/* Reader CTA */}
                <div className="mt-6 border-t border-app-border pt-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/student/reader/${book.id}`)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-gold py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-amber-gold-dark"
                  >
                    <BookMarked className="h-4 w-4" />
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
