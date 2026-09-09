import { z } from 'zod';

export const invoiceStatusSchema = z.enum(['draft', 'unpaid', 'pending', 'paid', 'overdue']);

export const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.string().regex(/^\d+$/, 'Quantity must be a positive integer'),
  unitPrice: z.string().regex(/^\d+$/, 'Unit price must be a non-negative integer'),
  amount: z.string().regex(/^\d+$/, 'Amount must be a non-negative integer'),
});

export const createInvoiceRequestSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  clientEmail: z.string().email('Invalid client email'),
  clientWalletAddress: z.string().optional(),
  freelancerName: z.string().min(1, 'Freelancer name is required'),
  freelancerEmail: z.string().email('Invalid freelancer email'),
  freelancerWalletAddress: z.string().min(1, 'Freelancer wallet address is required'),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  currency: z.string().min(1, 'Currency is required'),
  dueDate: z.string().datetime('Invalid due date format'),
  notes: z.string().optional(),
});

export const updateInvoiceRequestSchema = z.object({
  clientName: z.string().min(1).optional(),
  clientEmail: z.string().email().optional(),
  clientWalletAddress: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1).optional(),
  dueDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  status: invoiceStatusSchema.optional(),
});

export const invoiceSchema = z.object({
  id: z.string(),
  invoiceNumber: z.string(),
  status: invoiceStatusSchema,
  clientName: z.string(),
  clientEmail: z.string().email(),
  clientWalletAddress: z.string().optional(),
  freelancerName: z.string(),
  freelancerEmail: z.string().email(),
  freelancerWalletAddress: z.string(),
  lineItems: z.array(lineItemSchema),
  subtotal: z.string(),
  total: z.string(),
  currency: z.string(),
  dueDate: z.string(),
  issuedDate: z.string(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
