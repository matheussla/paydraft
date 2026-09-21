import type { IInvoice, ICreateInvoiceRequest, IUpdateInvoiceRequest } from '@paydraft/shared';
import { apiClient } from './client';

export const invoicesApi = {
  list: () => apiClient.get<IInvoice[]>('/api/invoices'),
  
  get: (id: string) => apiClient.get<IInvoice>(`/api/invoices/${id}`),
  
  create: (data: ICreateInvoiceRequest) =>
    apiClient.post<IInvoice>('/api/invoices', data),
  
  update: (id: string, data: IUpdateInvoiceRequest) =>
    apiClient.patch<IInvoice>(`/api/invoices/${id}`, data),
  
  issue: (id: string) =>
    apiClient.post<IInvoice>(`/api/invoices/${id}/issue`),
  
  delete: (id: string) =>
    apiClient.delete<{ success: boolean }>(`/api/invoices/${id}`),
};
