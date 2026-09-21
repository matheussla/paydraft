import type { IPayment } from '@paydraft/shared';
import { apiClient } from './client';

export const paymentsApi = {
  initiatePayment: (invoiceId: string) =>
    apiClient.post<IPayment>('/api/payments/initiate', { invoiceId }),

  verifyPayment: (signature: string) =>
    apiClient.post<{ verified: boolean; payment?: IPayment }>(
      '/api/payments/verify',
      { signature }
    ),

  getPaymentByInvoice: (invoiceId: string) =>
    apiClient.get<IPayment | null>(`/api/payments/invoice/${invoiceId}`),
};
