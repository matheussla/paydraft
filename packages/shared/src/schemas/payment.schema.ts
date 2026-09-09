import { z } from 'zod';

export const paymentStatusSchema = z.enum(['pending', 'confirmed', 'failed']);

export const createPaymentRequestSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  amount: z.string().regex(/^\d+$/, 'Amount must be a non-negative integer'),
  currency: z.string().min(1, 'Currency is required'),
  fromWalletAddress: z.string().min(1, 'From wallet address is required'),
  toWalletAddress: z.string().min(1, 'To wallet address is required'),
});

export const verifyPaymentRequestSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  transactionSignature: z.string().min(1, 'Transaction signature is required'),
});

export const paymentSchema = z.object({
  id: z.string(),
  invoiceId: z.string(),
  amount: z.string(),
  currency: z.string(),
  status: paymentStatusSchema,
  transactionSignature: z.string().optional(),
  fromWalletAddress: z.string(),
  toWalletAddress: z.string(),
  blockTime: z.number().optional(),
  confirmations: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
