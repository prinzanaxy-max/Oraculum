import { api } from './axios';
import type { BorrowRecord } from '../types';

export interface BorrowQuery {
  query?: string;
  fields?: string[];
}

interface BorrowRecordsResponse {
  records?: BorrowRecord[];
  borrows?: BorrowRecord[];
  data?: BorrowRecord[];
}

interface BorrowActionResponse {
  record?: BorrowRecord;
  borrow?: BorrowRecord;
  data?: BorrowRecord;
  fine?: number;
}

const normalizeRecords = (payload: BorrowRecord[] | BorrowRecordsResponse): BorrowRecord[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.records ?? payload.borrows ?? payload.data ?? [];
};

const normalizeActionRecord = (payload: BorrowRecord | BorrowActionResponse): BorrowRecord => {
  if ('id' in payload) {
    return payload;
  }

  return payload.record ?? payload.borrow ?? payload.data ?? ({} as BorrowRecord);
};

export const getBorrowRecords = async ({ query, fields }: BorrowQuery): Promise<BorrowRecord[]> => {
  const response = await api.get<BorrowRecord[] | BorrowRecordsResponse>('/borrow', {
    params: {
      ...(query ? { query } : {}),
      ...(fields?.length ? { fields: fields.join(',') } : {}),
    },
  });

  return normalizeRecords(response.data);
};

export const returnBorrowRecord = async (
  id: string
): Promise<{ record: BorrowRecord; fine?: number }> => {
  const response = await api.patch<BorrowRecord | BorrowActionResponse>(`/borrow/${id}/return`);
  const record = normalizeActionRecord(response.data);
  const fine = 'fine' in response.data ? response.data.fine : record.fine;

  return { record, fine };
};

export const renewBorrowRecord = async (id: string): Promise<BorrowRecord> => {
  const response = await api.patch<BorrowRecord | BorrowActionResponse>(`/borrow/${id}/renew`);
  return normalizeActionRecord(response.data);
};
