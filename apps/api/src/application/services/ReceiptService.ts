import { IReceiptService } from '../../domain/interfaces/IReceiptService.js';
import { IInvoiceRepository } from '../../domain/interfaces/IInvoiceRepository.js';
import { IPaymentRepository } from '../../domain/interfaces/IPaymentRepository.js';

export class ReceiptService implements IReceiptService {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly paymentRepository: IPaymentRepository
  ) {}

  async generateReceiptHTML(invoiceId: string): Promise<string> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status !== 'paid') {
      throw new Error('Invoice must be paid to generate receipt');
    }

    const payments = await this.paymentRepository.findByInvoiceId(invoiceId);
    const payment = payments.find(p => p.status === 'confirmed');

    if (!payment) {
      throw new Error('No confirmed payment found for invoice');
    }

    const paidDate = payment.blockTime 
      ? new Date(payment.blockTime * 1000).toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short'
        })
      : new Date(payment.updatedAt).toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short'
        });

    const amountInTokens = (BigInt(invoice.total) / BigInt(1_000_000)).toString();
    const decimals = (BigInt(invoice.total) % BigInt(1_000_000)).toString().padStart(6, '0');
    const formattedAmount = `${amountInTokens}.${decimals}`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt - ${invoice.invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      padding: 20px;
    }
    
    .demo-banner {
      background-color: #fef3c7;
      border: 2px solid #f59e0b;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
      text-align: center;
    }
    
    .demo-banner h2 {
      color: #92400e;
      font-size: 18px;
      margin-bottom: 8px;
    }
    
    .demo-banner p {
      color: #78350f;
      font-size: 14px;
    }
    
    .receipt-container {
      max-width: 800px;
      margin: 0 auto;
      background-color: white;
      padding: 48px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .receipt-header {
      text-align: center;
      margin-bottom: 48px;
      padding-bottom: 24px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .receipt-header h1 {
      font-size: 32px;
      color: #111827;
      margin-bottom: 8px;
    }
    
    .receipt-header .invoice-number {
      font-size: 16px;
      color: #6b7280;
    }
    
    .receipt-section {
      margin-bottom: 32px;
    }
    
    .receipt-section h2 {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6b7280;
      margin-bottom: 12px;
    }
    
    .receipt-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .receipt-row:last-child {
      border-bottom: none;
    }
    
    .receipt-label {
      font-weight: 500;
      color: #4b5563;
    }
    
    .receipt-value {
      color: #111827;
      text-align: right;
      max-width: 60%;
      word-break: break-all;
    }
    
    .receipt-total {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 2px solid #e5e7eb;
    }
    
    .receipt-total .receipt-row {
      border-bottom: none;
    }
    
    .receipt-total .receipt-label,
    .receipt-total .receipt-value {
      font-size: 24px;
      font-weight: 700;
      color: #059669;
    }
    
    .signature-section {
      background-color: #f9fafb;
      padding: 16px;
      border-radius: 6px;
      margin-top: 16px;
    }
    
    .signature-text {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      word-break: break-all;
      color: #374151;
    }
    
    .receipt-footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    
    @media print {
      body {
        background-color: white;
        padding: 0;
      }
      
      .demo-banner {
        display: none;
      }
      
      .receipt-container {
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="demo-banner">
    <h2>⚠️ LOCAL DEMO ENVIRONMENT</h2>
    <p>This receipt is for demonstration purposes only. Demo USDC tokens have no monetary value.</p>
    <p>Transaction processed on local Solana validator (http://127.0.0.1:8899)</p>
  </div>

  <div class="receipt-container">
    <div class="receipt-header">
      <h1>Payment Receipt</h1>
      <div class="invoice-number">Invoice ${invoice.invoiceNumber}</div>
    </div>

    <div class="receipt-section">
      <h2>Payment Details</h2>
      <div class="receipt-row">
        <span class="receipt-label">Date Paid</span>
        <span class="receipt-value">${paidDate}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Amount Paid</span>
        <span class="receipt-value">${formattedAmount} ${invoice.currency}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Payment Status</span>
        <span class="receipt-value">Confirmed</span>
      </div>
    </div>

    <div class="receipt-section">
      <h2>Recipient Information</h2>
      <div class="receipt-row">
        <span class="receipt-label">Name</span>
        <span class="receipt-value">${invoice.freelancerName}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Email</span>
        <span class="receipt-value">${invoice.freelancerEmail}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Wallet Address</span>
        <span class="receipt-value">${invoice.freelancerWalletAddress}</span>
      </div>
    </div>

    <div class="receipt-section">
      <h2>Payer Information</h2>
      <div class="receipt-row">
        <span class="receipt-label">Name</span>
        <span class="receipt-value">${invoice.clientName}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Email</span>
        <span class="receipt-value">${invoice.clientEmail}</span>
      </div>
      ${invoice.clientWalletAddress ? `
      <div class="receipt-row">
        <span class="receipt-label">Wallet Address</span>
        <span class="receipt-value">${invoice.clientWalletAddress}</span>
      </div>
      ` : ''}
    </div>

    ${payment.transactionSignature ? `
    <div class="receipt-section">
      <h2>Transaction Signature</h2>
      <div class="signature-section">
        <div class="signature-text">${payment.transactionSignature}</div>
      </div>
    </div>
    ` : ''}

    <div class="receipt-total">
      <div class="receipt-row">
        <span class="receipt-label">Total Paid</span>
        <span class="receipt-value">${formattedAmount} ${invoice.currency}</span>
      </div>
    </div>

    <div class="receipt-footer">
      <p>Thank you for your payment!</p>
      <p>Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
  </div>
</body>
</html>
    `;

    return html.trim();
  }
}
