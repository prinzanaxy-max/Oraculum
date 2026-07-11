import { api } from './axios';
import type { Member } from '../types';

export interface MemberPayload {
  name: string;
  studentId: string;
  email: string;
  phone: string;
  department: string;
}

interface MembersResponse {
  members?: Member[];
  data?: Member[];
}

const normalizeMembers = (payload: Member[] | MembersResponse): Member[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.members ?? payload.data ?? [];
};

export const getMembers = async (query?: string): Promise<Member[]> => {
  const response = await api.get<Member[] | MembersResponse>('/members', {
    params: query ? { query } : undefined,
  });

  return normalizeMembers(response.data);
};

export const createMember = async (payload: MemberPayload): Promise<Member> => {
  const response = await api.post<Member>('/members', payload);
  return response.data;
};

export const updateMember = async (id: string, payload: MemberPayload): Promise<Member> => {
  const response = await api.put<Member>(`/members/${id}`, payload);
  return response.data;
};

export const deleteMember = async (id: string): Promise<void> => {
  await api.delete(`/members/${id}`);
};
