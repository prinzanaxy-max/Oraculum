export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  category?: string;
  copies?: number;
  availableCopies?: number;
  shelfLocation?: string;
  description?: string;
  status: 'available' | 'borrowed' | 'reserved' | 'maintenance';
}

export interface Member {
  id: string;
  memberId: string;
  registerId: string;
  name: string;
  email: string;
  studentId: string;
  phone?: string;
  department?: string;
  status?: 'active' | 'suspended';
}

export interface BorrowRecord {
  id: string;
  isbn?: string;
  bookId: string;
  memberId: string;
  memberName: string;
  title: string;
  author: string;
  borrowedDate: string;
  dueDate: string;
  returnedDate: string | null;
  status: 'available' | 'borrowed' | 'renewed' | 'reserved';
  hasPendingReservations?: boolean;
  fine?: number;
}

export interface Reservation {
  id: string;
  bookId: string;
  memberId: string;
  bookTitle?: string;
  memberName?: string;
  memberCode?: string;
  reservationDate: string;
  status: 'pending' | 'fulfilled' | 'cancelled';
}

export interface Fine {
  id: string;
  memberId: string;
  memberName: string;
  bookTitle: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'waived';
}
