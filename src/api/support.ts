import { api } from './axios';

export interface SupportContactPayload {
  subject: string;
  message: string;
}

export interface SupportContactResponse {
  message: string;
}

export const sendSupportMessage = async (
  payload: SupportContactPayload
): Promise<SupportContactResponse> => {
  const { data } = await api.post<SupportContactResponse>('/support/contact', payload);
  return data;
};
