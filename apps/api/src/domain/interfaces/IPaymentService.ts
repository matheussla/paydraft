import { IPayment } from '@paydraft/shared';

export interface IPaymentService {
  initiatePayment(invoiceId: string): Promise<IPayment>;
  verifyPayment(signature: string): Promise<IPayment | null>;
  getPaymentByInvoiceId(invoiceId: string): Promise<IPayment | null>;
}
