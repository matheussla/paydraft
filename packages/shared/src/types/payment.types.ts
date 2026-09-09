export type PaymentStatus = 'pending' | 'confirmed' | 'failed';

export interface IPayment {
  id: string;
  invoiceId: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  transactionSignature?: string;
  fromWalletAddress: string;
  toWalletAddress: string;
  blockTime?: number;
  confirmations?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreatePaymentRequest {
  invoiceId: string;
  amount: string;
  currency: string;
  fromWalletAddress: string;
  toWalletAddress: string;
}

export interface IVerifyPaymentRequest {
  invoiceId: string;
  transactionSignature: string;
}
