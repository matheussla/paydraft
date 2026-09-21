export interface IReconciliationService {
  reconcilePendingPayments(): Promise<void>;
  startReconciliation(intervalMs: number): void;
  stopReconciliation(): void;
}
