import { api } from './axios';
import type { Book } from '../types';

export interface BookPayload {
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  category: string;
  copies: number;
  shelfLocation: string;
  description?: string;
}

export interface BooksQuery {
  query?: string;
  fields?: string[];
}

interface BookResponse {
  book?: Book;
  data?: Book;
}

interface BooksResponse {
  books?: Book[];
  data?: Book[];
}

const normalizeBook = (payload: Book | BookResponse): Book => {
  if ('id' in payload) {
    return payload;
  }

  return payload.book ?? payload.data ?? ({} as Book);
};

const normalizeBooks = (payload: Book[] | BooksResponse): Book[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.books ?? payload.data ?? [];
};

export type { Book };

export const getBooks = async ({ query, fields }: BooksQuery = {}): Promise<Book[]> => {
  const response = await api.get<Book[] | BooksResponse>('/books', {
    params: {
      ...(query ? { query } : {}),
      ...(fields?.length ? { fields: fields.join(',') } : {}),
    },
  });

  return normalizeBooks(response.data);
};

export const getAllBooks = getBooks;

export const getBookById = async (id: string): Promise<Book | null> => {
  try {
    const response = await api.get<Book | BookResponse>(`/books/${id}`);
    return normalizeBook(response.data);
  } catch {
    const books = await getBooks();
    return books.find((b) => b.id === id) || null;
  }
};

export const createBook = async (payload: BookPayload): Promise<Book> => {
  const response = await api.post<Book | BookResponse>('/books', payload);
  return normalizeBook(response.data);
};

export const updateBook = async (id: string, payload: BookPayload): Promise<Book> => {
  const response = await api.put<Book | BookResponse>(`/books/${id}`, payload);
  return normalizeBook(response.data);
};

export const deleteBook = async (id: string): Promise<void> => {
  await api.delete(`/books/${id}`);
};
