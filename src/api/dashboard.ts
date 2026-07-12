import { api } from './axios';

export interface DashboardStat {
  value: number;
  changePercent: number;
  direction: 'up' | 'down' | 'neutral';
}

export interface DashboardStats {
  borrowRecords?: DashboardStat;
  borrowedBooks: DashboardStat;
  returnedBooks: DashboardStat;
  overdueBooks: DashboardStat;
  missingBooks: DashboardStat;
  totalBooks: DashboardStat;
  visitors: DashboardStat;
  newMembers: DashboardStat;
  pendingFees: DashboardStat;
}

export interface CheckoutStatsPoint {
  day: string;
  borrowed: number;
  returned: number;
}

export interface OverdueHistoryRecord {
  memberCode: string;
  title: string;
  isbn: string;
  dueDate: string;
  fineAmount: number;
}

export interface RecentCheckoutRecord {
  id: string;
  isbn: string;
  title: string;
  author: string;
  member: string;
  issuedDate: string;
  returnDate: string;
}

export interface DashboardBook {
  title: string;
  author: string;
  availableCopies: number;
  status: string;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<DashboardStats>('/dashboard/stats', {
    params: { range: 'last_6_months' },
  });
  return response.data;
};

export const getCheckoutStats = async (): Promise<CheckoutStatsPoint[]> => {
  const response = await api.get<{ series: CheckoutStatsPoint[] }>('/dashboard/checkout-stats', {
    params: { range: 'last_6_months' },
  });
  return response.data.series;
};

export const getOverdueHistory = async (): Promise<OverdueHistoryRecord[]> => {
  const response = await api.get<{ records: OverdueHistoryRecord[] }>(
    '/dashboard/overdue-history',
    {
      params: { limit: 10 },
    }
  );
  return response.data.records;
};

export const getRecentCheckouts = async (): Promise<RecentCheckoutRecord[]> => {
  const response = await api.get<{ records: RecentCheckoutRecord[] }>(
    '/dashboard/recent-checkouts',
    {
      params: { limit: 10 },
    }
  );
  return response.data.records;
};

export const getDashboardBooksPanel = async (tab: 'top' | 'new'): Promise<DashboardBook[]> => {
  const response = await api.get<{ tab: 'top' | 'new'; books: DashboardBook[] }>(
    '/dashboard/books-panel',
    {
      params: { tab, limit: 10 },
    }
  );
  return response.data.books;
};
