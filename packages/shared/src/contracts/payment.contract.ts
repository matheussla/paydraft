import { z } from 'zod';

export const PaymentContract = {
  initiatePayment: {
    method: 'POST' as const,
    path: '/api/payments/initiate' as const,
    body: z.object({
      invoiceId: z.string().min(1, 'Invoice ID is required'),
    }),
    response: z.object({
      id: z.string(),
      invoiceId: z.string(),
      amount: z.string(),
      currency: z.string(),
      status: z.enum(['pending', 'confirmed', 'failed']),
      transactionSignature: z.string().optional(),
      fromWalletAddress: z.string(),
      toWalletAddress: z.string(),
      blockTime: z.number().optional(),
      confirmations: z.number().optional(),
      createdAt: z.date(),
      updatedAt: z.date(),
    }),
  },
  verifyPayment: {
    method: 'POST' as const,
    path: '/api/payments/verify' as const,
    body: z.object({
      signature: z.string().min(1, 'Transaction signature is required'),
    }),
    response: z.object({
      verified: z.boolean(),
      payment: z.object({
        id: z.string(),
        invoiceId: z.string(),
        amount: z.string(),
        status: z.string(),
      }).optional(),
    }),
  },
  getPaymentByInvoice: {
    method: 'GET' as const,
    path: '/api/payments/invoice/:invoiceId' as const,
    response: z.object({
      id: z.string(),
      invoiceId: z.string(),
      amount: z.string(),
      currency: z.string(),
      status: z.enum(['pending', 'confirmed', 'failed']),
      transactionSignature: z.string().optional(),
      fromWalletAddress: z.string(),
      toWalletAddress: z.string(),
      blockTime: z.number().optional(),
      confirmations: z.number().optional(),
      createdAt: z.date(),
      updatedAt: z.date(),
    }).nullable(),
  },
};
