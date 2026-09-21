import { IReconciliationService } from '../../domain/interfaces/IReconciliationService.js';
import { IPaymentRepository } from '../../domain/interfaces/IPaymentRepository.js';
import { IInvoiceRepository } from '../../domain/interfaces/IInvoiceRepository.js';
import { SolanaPaymentService } from '../../infrastructure/blockchain/SolanaPaymentService.js';

export class ReconciliationService implements IReconciliationService {
  private intervalId: NodeJS.Timeout | null = null;
  private isReconciling = false;

  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly solanaPaymentService: SolanaPaymentService
  ) {}

  async reconcilePendingPayments(): Promise<void> {
    if (this.isReconciling) {
      console.log('Reconciliation already in progress, skipping...');
      return;
    }

    this.isReconciling = true;

    try {
      const pendingPayments = await this.paymentRepository.findPendingPayments();
      
      console.log(`Reconciling ${pendingPayments.length} pending payment(s)...`);

      for (const payment of pendingPayments) {
        try {
          if (!payment.transactionSignature) {
            console.log(`Payment ${payment.id} has no signature, skipping...`);
            continue;
          }

          const confirmationStatus = await this.solanaPaymentService.getConfirmationStatus(
            payment.transactionSignature
          );

          if (confirmationStatus.confirmed) {
            await this.paymentRepository.updateConfirmation(
              payment.id,
              Math.floor(Date.now() / 1000),
              confirmationStatus.confirmations
            );

            await this.invoiceRepository.update(payment.invoiceId, { status: 'paid' });

            console.log(`Payment ${payment.id} confirmed for invoice ${payment.invoiceId}`);
          } else {
            console.log(`Payment ${payment.id} still pending (${confirmationStatus.confirmations} confirmations)`);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Error reconciling payment ${payment.id}:`, message);
        }
      }

      console.log('Reconciliation complete');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error during reconciliation:', message);
    } finally {
      this.isReconciling = false;
    }
  }

  startReconciliation(intervalMs: number = 30000): void {
    if (this.intervalId) {
      console.log('Reconciliation worker already running');
      return;
    }

    console.log(`Starting reconciliation worker (interval: ${intervalMs}ms)`);
    
    this.reconcilePendingPayments();
    
    this.intervalId = setInterval(() => {
      this.reconcilePendingPayments();
    }, intervalMs);
  }

  stopReconciliation(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Reconciliation worker stopped');
    }
  }
}
