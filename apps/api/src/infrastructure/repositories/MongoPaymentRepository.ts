import { IPayment, ICreatePaymentRequest } from '@paydraft/shared';
import { IPaymentRepository } from '../../domain/interfaces/IPaymentRepository.js';
import { PaymentModel } from '../database/models/index.js';

export class MongoPaymentRepository implements IPaymentRepository {
  async create(data: ICreatePaymentRequest): Promise<IPayment> {
    const payment = new PaymentModel({
      invoiceId: data.invoiceId,
      amount: data.amount,
      currency: data.currency,
      status: 'pending',
      fromWalletAddress: data.fromWalletAddress,
      toWalletAddress: data.toWalletAddress,
    });

    await payment.save();
    return payment.toJSON() as unknown as IPayment;
  }

  async findById(id: string): Promise<IPayment | null> {
    const payment = await PaymentModel.findById(id);
    return payment ? (payment.toJSON() as unknown as IPayment) : null;
  }

  async findByInvoiceId(invoiceId: string): Promise<IPayment[]> {
    const payments = await PaymentModel.find({ invoiceId }).sort({ createdAt: -1 });
    return payments.map(p => p.toJSON() as unknown as IPayment);
  }

  async findByTransactionSignature(signature: string): Promise<IPayment | null> {
    const payment = await PaymentModel.findOne({ transactionSignature: signature });
    return payment ? (payment.toJSON() as unknown as IPayment) : null;
  }

  async updateStatus(id: string, status: 'pending' | 'confirmed' | 'failed'): Promise<IPayment | null> {
    const payment = await PaymentModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    return payment ? (payment.toJSON() as unknown as IPayment) : null;
  }

  async updateConfirmation(id: string, blockTime: number, confirmations: number): Promise<IPayment | null> {
    const payment = await PaymentModel.findByIdAndUpdate(
      id,
      { blockTime, confirmations, status: 'confirmed' },
      { new: true }
    );
    return payment ? (payment.toJSON() as unknown as IPayment) : null;
  }

  async findPendingPayments(): Promise<IPayment[]> {
    const payments = await PaymentModel.find({ status: 'pending' });
    return payments.map(p => p.toJSON() as unknown as IPayment);
  }
}
