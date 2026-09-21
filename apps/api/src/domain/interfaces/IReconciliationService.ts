export interface IReconciliationService {
  reconcilePendingPayments(): Promise<number>;
  startReconciliation(intervalMs: number): void;
  stopReconciliation(): void;
}
