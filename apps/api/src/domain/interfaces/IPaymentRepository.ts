import { IPayment, ICreatePaymentRequest } from '@paydraft/shared';

export interface IPaymentRepository {
  create(data: ICreatePaymentRequest): Promise<IPayment>;
  findById(id: string): Promise<IPayment | null>;
  findByInvoiceId(invoiceId: string): Promise<IPayment[]>;
  findByTransactionSignature(signature: string): Promise<IPayment | null>;
  updateStatus(id: string, status: 'pending' | 'confirmed' | 'failed'): Promise<IPayment | null>;
  updateConfirmation(id: string, blockTime: number, confirmations: number): Promise<IPayment | null>;
  findPendingPayments(): Promise<IPayment[]>;
}
