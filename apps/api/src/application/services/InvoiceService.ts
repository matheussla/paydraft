import { IInvoice, ICreateInvoiceRequest, IUpdateInvoiceRequest } from '@paydraft/shared';
import { IInvoiceService } from '../../domain/interfaces/IInvoiceService.js';
import { IInvoiceRepository } from '../../domain/interfaces/IInvoiceRepository.js';

export class InvoiceService implements IInvoiceService {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}

  async createInvoice(data: ICreateInvoiceRequest): Promise<IInvoice> {
    return await this.invoiceRepository.create(data);
  }

  async getInvoice(id: string): Promise<IInvoice | null> {
    return await this.invoiceRepository.findById(id);
  }

  async listInvoices(): Promise<IInvoice[]> {
    return await this.invoiceRepository.findAll();
  }

  async updateInvoice(id: string, data: IUpdateInvoiceRequest): Promise<IInvoice | null> {
    return await this.invoiceRepository.update(id, data);
  }

  async deleteInvoice(id: string): Promise<boolean> {
    return await this.invoiceRepository.delete(id);
  }

  async issueInvoice(id: string): Promise<IInvoice | null> {
    return await this.invoiceRepository.issue(id);
  }
}
