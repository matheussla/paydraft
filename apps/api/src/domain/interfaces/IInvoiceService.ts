import { IInvoice, ICreateInvoiceRequest, IUpdateInvoiceRequest } from '@paydraft/shared';

export interface IInvoiceService {
  createInvoice(data: ICreateInvoiceRequest): Promise<IInvoice>;
  getInvoice(id: string): Promise<IInvoice | null>;
  listInvoices(): Promise<IInvoice[]>;
  updateInvoice(id: string, data: IUpdateInvoiceRequest): Promise<IInvoice | null>;
  deleteInvoice(id: string): Promise<boolean>;
  issueInvoice(id: string): Promise<IInvoice | null>;
}
