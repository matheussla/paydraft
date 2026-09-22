import { IInvoice, ICreateInvoiceRequest, IUpdateInvoiceRequest } from '@paydraft/shared';

export interface IInvoiceRepository {
  create(data: ICreateInvoiceRequest): Promise<IInvoice>;
  findById(id: string): Promise<IInvoice | null>;
  findAll(): Promise<IInvoice[]>;
  update(id: string, data: IUpdateInvoiceRequest): Promise<IInvoice | null>;
  delete(id: string): Promise<boolean>;
  findByInvoiceNumber(invoiceNumber: string): Promise<IInvoice | null>;
  issue(id: string): Promise<IInvoice | null>;
  updateStatusAtomic(id: string, fromStatus: string, toStatus: string): Promise<IInvoice | null>;
}
