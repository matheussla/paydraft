export interface IDashboardSummary {
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  totalRevenue: string;
  pendingRevenue: string;
  overdueRevenue: string;
  currency: string;
  recentInvoices: IDashboardInvoice[];
}

export interface IDashboardInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  total: string;
  status: string;
  dueDate: string;
  issuedDate: string;
}
