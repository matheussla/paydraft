export type InvoiceStatus = 'draft' | 'unpaid' | 'pending' | 'paid' | 'overdue';

export interface ILineItem {
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
}

export interface IInvoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  clientName: string;
  clientEmail: string;
  clientWalletAddress?: string;
  freelancerName: string;
  freelancerEmail: string;
  freelancerWalletAddress: string;
  lineItems: ILineItem[];
  subtotal: string;
  total: string;
  currency: string;
  dueDate: string;
  issuedDate: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateInvoiceRequest {
  clientName: string;
  clientEmail: string;
  clientWalletAddress?: string;
  freelancerName: string;
  freelancerEmail: string;
  freelancerWalletAddress: string;
  lineItems: ILineItem[];
  currency: string;
  dueDate: string;
  notes?: string;
}

export interface IUpdateInvoiceRequest {
  clientName?: string;
  clientEmail?: string;
  clientWalletAddress?: string;
  lineItems?: ILineItem[];
  dueDate?: string;
  notes?: string;
  status?: InvoiceStatus;
}
