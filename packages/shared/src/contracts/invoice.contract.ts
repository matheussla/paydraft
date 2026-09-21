import { z } from 'zod';
import { createInvoiceRequestSchema, updateInvoiceRequestSchema, invoiceSchema } from '../schemas/invoice.schema.js';

export const InvoiceContract = {
  createInvoice: {
    method: 'POST' as const,
    path: '/api/invoices' as const,
    body: createInvoiceRequestSchema,
    response: invoiceSchema,
  },
  getInvoice: {
    method: 'GET' as const,
    path: '/api/invoices/:id' as const,
    response: invoiceSchema,
  },
  listInvoices: {
    method: 'GET' as const,
    path: '/api/invoices' as const,
    response: z.array(invoiceSchema),
  },
  updateInvoice: {
    method: 'PATCH' as const,
    path: '/api/invoices/:id' as const,
    body: updateInvoiceRequestSchema,
    response: invoiceSchema,
  },
  issueInvoice: {
    method: 'POST' as const,
    path: '/api/invoices/:id/issue' as const,
    response: invoiceSchema,
  },
  deleteInvoice: {
    method: 'DELETE' as const,
    path: '/api/invoices/:id' as const,
    response: z.object({ success: z.boolean() }),
  },
};
