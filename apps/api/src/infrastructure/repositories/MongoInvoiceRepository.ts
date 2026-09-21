import { IInvoice, ICreateInvoiceRequest, IUpdateInvoiceRequest } from '@paydraft/shared';
import { IInvoiceRepository } from '../../domain/interfaces/IInvoiceRepository.js';
import { InvoiceModel } from '../database/models/index.js';
import { randomBytes } from 'crypto';

export class MongoInvoiceRepository implements IInvoiceRepository {
  private generateInvoiceNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = randomBytes(3).toString('hex').toUpperCase();
    return `INV-${timestamp}-${random}`;
  }

  private generatePaymentId(): string {
    return randomBytes(16).toString('hex');
  }

  private calculateSubtotalAndTotal(lineItems: Array<{ quantity: number; unitPrice: string }>): { subtotal: string; total: string } {
    const subtotal = lineItems.reduce((sum, item) => {
      return sum + BigInt(item.quantity) * BigInt(item.unitPrice);
    }, BigInt(0));
    
    return {
      subtotal: subtotal.toString(),
      total: subtotal.toString(),
    };
  }

  async create(data: ICreateInvoiceRequest): Promise<IInvoice> {
    const invoiceNumber = this.generateInvoiceNumber();
    const paymentId = this.generatePaymentId();
    const { subtotal, total } = this.calculateSubtotalAndTotal(data.lineItems);
    
    const invoice = new InvoiceModel({
      invoiceNumber,
      status: 'draft',
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientWalletAddress: data.clientWalletAddress,
      freelancerName: data.freelancerName,
      freelancerEmail: data.freelancerEmail,
      freelancerWalletAddress: data.freelancerWalletAddress,
      lineItems: data.lineItems,
      subtotal,
      total,
      currency: data.currency,
      dueDate: data.dueDate,
      issuedDate: new Date().toISOString(),
      notes: data.notes,
      paymentId,
    });

    await invoice.save();
    return invoice.toJSON() as unknown as IInvoice;
  }

  async findById(id: string): Promise<IInvoice | null> {
    const invoice = await InvoiceModel.findById(id);
    return invoice ? (invoice.toJSON() as unknown as IInvoice) : null;
  }

  async findAll(): Promise<IInvoice[]> {
    const invoices = await InvoiceModel.find().sort({ createdAt: -1 });
    return invoices.map(inv => inv.toJSON() as unknown as IInvoice);
  }

  async update(id: string, data: IUpdateInvoiceRequest): Promise<IInvoice | null> {
    const invoice = await InvoiceModel.findById(id);
    if (!invoice) {
      return null;
    }

    if (invoice.status === 'unpaid' || invoice.status === 'paid') {
      if (data.status !== undefined && Object.keys(data).length === 1) {
        invoice.status = data.status;
        await invoice.save();
        return invoice.toJSON() as unknown as IInvoice;
      }
      throw new Error('Cannot update an issued or paid invoice');
    }

    if (data.clientName !== undefined) invoice.clientName = data.clientName;
    if (data.clientEmail !== undefined) invoice.clientEmail = data.clientEmail;
    if (data.clientWalletAddress !== undefined) invoice.clientWalletAddress = data.clientWalletAddress;
    if (data.dueDate !== undefined) invoice.dueDate = data.dueDate;
    if (data.notes !== undefined) invoice.notes = data.notes;
    if (data.status !== undefined) invoice.status = data.status;

    if (data.lineItems) {
      invoice.lineItems = data.lineItems;
      const { subtotal, total } = this.calculateSubtotalAndTotal(data.lineItems);
      invoice.subtotal = subtotal;
      invoice.total = total;
    }

    await invoice.save();
    return invoice.toJSON() as unknown as IInvoice;
  }

  async delete(id: string): Promise<boolean> {
    const result = await InvoiceModel.findByIdAndDelete(id);
    return result !== null;
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<IInvoice | null> {
    const invoice = await InvoiceModel.findOne({ invoiceNumber });
    return invoice ? (invoice.toJSON() as unknown as IInvoice) : null;
  }

  async issue(id: string): Promise<IInvoice | null> {
    const invoice = await InvoiceModel.findById(id);
    if (!invoice) {
      return null;
    }

    if (invoice.status !== 'draft') {
      throw new Error('Only draft invoices can be issued');
    }

    invoice.status = 'unpaid';
    invoice.issuedDate = new Date().toISOString();

    await invoice.save();
    return invoice.toJSON() as unknown as IInvoice;
  }
}
