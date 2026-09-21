import { IPayment } from '@paydraft/shared';
import { IPaymentService } from '../../domain/interfaces/IPaymentService.js';
import { IPaymentRepository } from '../../domain/interfaces/IPaymentRepository.js';
import { IInvoiceRepository } from '../../domain/interfaces/IInvoiceRepository.js';
import { SolanaPaymentService } from '../../infrastructure/blockchain/SolanaPaymentService.js';

export class PaymentService implements IPaymentService {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly solanaPaymentService: SolanaPaymentService
  ) {}

  async initiatePayment(invoiceId: string): Promise<IPayment> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status !== 'unpaid') {
      throw new Error('Invoice must be in unpaid status to accept payment');
    }

    const existingPayments = await this.paymentRepository.findByInvoiceId(invoiceId);
    const confirmedPayment = existingPayments.find(p => p.status === 'confirmed');
    
    if (confirmedPayment) {
      throw new Error('Invoice already paid');
    }

    const pendingPayment = existingPayments.find(p => p.status === 'pending');
    if (pendingPayment) {
      throw new Error('Payment already in flight');
    }

    const solanaConfigPath = process.env.SOLANA_CONFIG_PATH || '.solana/config.json';
    const fs = await import('fs');
    const solanaConfig = JSON.parse(fs.readFileSync(solanaConfigPath, 'utf-8'));

    const paymentResult = await this.solanaPaymentService.createPayment({
      recipientAddress: invoice.freelancerWalletAddress,
      amount: invoice.total,
      mintAddress: solanaConfig.mintAddress,
      reference: invoice.paymentId || invoiceId,
    });

    const payment = await this.paymentRepository.create({
      invoiceId,
      amount: invoice.total,
      currency: invoice.currency,
      fromWalletAddress: solanaConfig.clientPublicKey,
      toWalletAddress: invoice.freelancerWalletAddress,
    });

    const updatedPayment = await this.paymentRepository.updateWithSignature(
      payment.id,
      paymentResult.signature,
      paymentResult.blockTime,
      1
    );

    if (!updatedPayment) {
      throw new Error('Failed to update payment confirmation');
    }

    await this.invoiceRepository.update(invoiceId, { status: 'paid' });

    return updatedPayment;
  }

  async verifyPayment(signature: string): Promise<IPayment | null> {
    const existingPayment = await this.paymentRepository.findByTransactionSignature(signature);
    
    if (existingPayment) {
      if (existingPayment.status === 'confirmed') {
        return existingPayment;
      }
    }

    return null;
  }

  async getPaymentByInvoiceId(invoiceId: string): Promise<IPayment | null> {
    const payments = await this.paymentRepository.findByInvoiceId(invoiceId);
    const confirmedPayment = payments.find(p => p.status === 'confirmed');
    return confirmedPayment || null;
  }
}
