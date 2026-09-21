export interface IReceiptService {
  generateReceiptHTML(invoiceId: string): Promise<string>;
}
