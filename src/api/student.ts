import { api } from './axios';
import type { Fine } from '../types';

export interface StudentBorrowRecord {
  id: string;
  bookId: string;
  memberId: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string | null;
  status: string;
  fineAmount: number;
  finePaid: boolean;
  fineStatus: string;
  book: {
    id: string;
    title: string;
    author: string;
    isbn: string;
    category: string;
    publishedYear: number;
    description?: string;
  };
}

export interface StudentReservation {
  id: string;
  bookId: string;
  memberId: string;
  status: string;
  queuePosition: number;
  reservedAt: string;
  book: {
    id: string;
    title: string;
    author: string;
    category: string;
    status: string;
  };
}

export interface ReadingProgress {
  bookId: string;
  currentChapter: number;
  totalChapters: number;
  scrollPercentage: number;
  lastReadAt: string;
}

export const getStudentBorrows = async (memberId: string): Promise<StudentBorrowRecord[]> => {
  try {
    const response = await api.get<any>('/borrow', {
      params: { memberId },
    });
    const raw = response.data?.data || response.data?.records || response.data || [];
    const records = Array.isArray(raw) ? raw : [];
    return records.filter((r: StudentBorrowRecord) => r.memberId === memberId || !memberId);
  } catch (error) {
    console.error('Failed to fetch student borrow records', error);
    return [];
  }
};

export const getStudentReservations = async (memberId: string): Promise<StudentReservation[]> => {
  try {
    const response = await api.get<any>('/reservations', {
      params: { memberId },
    });
    const raw = response.data?.data || response.data?.reservations || response.data || [];
    const items = Array.isArray(raw) ? raw : [];
    return items.filter((r: StudentReservation) => r.memberId === memberId || !memberId);
  } catch (error) {
    console.error('Failed to fetch student reservations', error);
    return [];
  }
};

export const getStudentFines = async (
  memberId: string,
  status?: Fine['status']
): Promise<Fine[]> => {
  try {
    const response = await api.get<any>('/fines', {
      params: {
        ...(status ? { status } : {}),
        memberId,
      },
    });
    const raw = response.data?.data || response.data?.fines || response.data || [];
    const items = Array.isArray(raw) ? raw : [];
    return items;
  } catch (error) {
    console.error('Failed to fetch student fines', error);
    return [];
  }
};

const READING_PROGRESS_KEY = 'oraculum_reading_progress';

export const getReadingProgressMap = (): Record<string, ReadingProgress> => {
  try {
    const stored = localStorage.getItem(READING_PROGRESS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const getBookReadingProgress = (bookId: string): ReadingProgress | null => {
  const map = getReadingProgressMap();
  return map[bookId] || null;
};

export const saveBookReadingProgress = (progress: ReadingProgress): void => {
  const map = getReadingProgressMap();
  map[progress.bookId] = progress;
  localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(map));
};
