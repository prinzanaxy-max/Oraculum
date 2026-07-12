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

interface BookResponse {
  book?: Book;
  data?: Book;
}

const normalizeBook = (payload: Book | BookResponse): Book => {
  if ('id' in payload) {
    return payload;
  }

  return payload.book ?? payload.data ?? ({} as Book);
};

export const createBook = async (payload: BookPayload): Promise<Book> => {
  const response = await api.post<Book | BookResponse>('/books', payload);
  return normalizeBook(response.data);
};
