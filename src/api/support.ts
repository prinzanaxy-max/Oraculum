import { api } from './axios';

export interface SupportContactPayload {
  subject: string;
  message: string;
}

export const sendSupportMessage = async (payload: SupportContactPayload): Promise<void> => {
  await api.post('/support/contact', payload);
};
