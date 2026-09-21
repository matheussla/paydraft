import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { Connection } from '@solana/web3.js';
import { InvoiceService } from '../application/services/InvoiceService.js';
import { PaymentService } from '../application/services/PaymentService.js';
import { MongoInvoiceRepository } from '../infrastructure/repositories/MongoInvoiceRepository.js';
import { MongoPaymentRepository } from '../infrastructure/repositories/MongoPaymentRepository.js';
import { SolanaPaymentService } from '../infrastructure/blockchain/SolanaPaymentService.js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const MONGODB_URL = 'mongodb://paydraft:paydraft_dev_password@127.0.0.1:27017/paydraft-test?authSource=admin';
const SOLANA_RPC_URL = 'http://127.0.0.1:8899';
const SOLANA_CONFIG_PATH = resolve(process.cwd(), '.solana', 'config.json');

interface SolanaConfig {
  demoUsdcMint: string;
  freelancerPublicKey: string;
  clientPublicKey: string;
}

function loadSolanaConfig(): SolanaConfig {
  if (!existsSync(SOLANA_CONFIG_PATH)) {
    throw new Error('Solana config not found. Run: pnpm solana:init');
  }
  return JSON.parse(readFileSync(SOLANA_CONFIG_PATH, 'utf-8'));
}

describe('Concurrency and Idempotency', () => {
  let connection: Connection;
  let config: SolanaConfig;
  let invoiceService: InvoiceService;
  let paymentService: PaymentService;

  beforeAll(async () => {
    try {
      config = loadSolanaConfig();
    } catch (error) {
      throw new Error('Failed to load Solana config. Ensure local validator is set up (pnpm solana:init)');
    }

    connection = new Connection(SOLANA_RPC_URL, 'confirmed');

    try {
      await connection.getVersion();
    } catch (error) {
      throw new Error('Local Solana validator not running. Start it with: solana-test-validator');
    }

    await mongoose.connect(MONGODB_URL);

    const invoiceRepository = new MongoInvoiceRepository();
    const paymentRepository = new MongoPaymentRepository();
    const solanaPaymentService = new SolanaPaymentService({
      rpcUrl: SOLANA_RPC_URL,
      clientKeypairPath: resolve(process.cwd(), '.solana', 'keypairs', 'client.json'),
      solanaConfigPath: SOLANA_CONFIG_PATH,
    });

    invoiceService = new InvoiceService(invoiceRepository);
    paymentService = new PaymentService(
      paymentRepository,
      invoiceRepository,
      solanaPaymentService
    );
  });

  beforeEach(async () => {
    const collections = await mongoose.connection.db?.collections();
    if (collections) {
      for (const collection of collections) {
        await collection.deleteMany({}).catch(() => {});
      }
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should prevent duplicate payment for same invoice (idempotency)', async () => {
    const invoice = await invoiceService.createInvoice({
      clientName: 'Test Client',
      clientEmail: 'client@test.com',
      clientWalletAddress: config.clientPublicKey,
      freelancerName: 'Test Freelancer',
      freelancerEmail: 'freelancer@test.com',
      freelancerWalletAddress: config.freelancerPublicKey,
      lineItems: [
        {
          description: 'Idempotency Test',
          quantity: 1,
          unitPrice: '100000000',
          amount: '100000000',
        },
      ],
      currency: 'Demo USDC',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const issuedInvoice = await invoiceService.issueInvoice(invoice.id);
    if (!issuedInvoice) {
      throw new Error('Failed to issue invoice');
    }

    const payment1 = await paymentService.initiatePayment(issuedInvoice.id);
    expect(payment1.status).toBe('confirmed');

    await expect(
      paymentService.initiatePayment(issuedInvoice.id)
    ).rejects.toThrow();

    const updatedInvoice = await invoiceService.getInvoice(issuedInvoice.id);
    expect(updatedInvoice?.status).toBe('paid');
  });

  it('should handle concurrent payment attempts safely', async () => {
    const invoice = await invoiceService.createInvoice({
      clientName: 'Test Client',
      clientEmail: 'client@test.com',
      clientWalletAddress: config.clientPublicKey,
      freelancerName: 'Test Freelancer',
      freelancerEmail: 'freelancer@test.com',
      freelancerWalletAddress: config.freelancerPublicKey,
      lineItems: [
        {
          description: 'Concurrency Test',
          quantity: 1,
          unitPrice: '50000000',
          amount: '50000000',
        },
      ],
      currency: 'Demo USDC',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const issuedInvoice = await invoiceService.issueInvoice(invoice.id);
    if (!issuedInvoice) {
      throw new Error('Failed to issue invoice');
    }

    const paymentPromises = Array.from({ length: 3 }, () =>
      paymentService.initiatePayment(issuedInvoice.id).catch(err => err)
    );

    const results = await Promise.all(paymentPromises);

    const successfulPayments = results.filter(r => r && r.status === 'confirmed');
    const failedPayments = results.filter(r => r instanceof Error);

    expect(successfulPayments.length).toBe(1);
    expect(failedPayments.length).toBe(2);

    const paymentsForInvoice = await paymentService.getPaymentByInvoiceId(issuedInvoice.id);
    expect(paymentsForInvoice).toBeDefined();
  });

  it('should maintain invoice status consistency under concurrent access', async () => {
    const invoice = await invoiceService.createInvoice({
      clientName: 'Test Client',
      clientEmail: 'client@test.com',
      clientWalletAddress: config.clientPublicKey,
      freelancerName: 'Test Freelancer',
      freelancerEmail: 'freelancer@test.com',
      freelancerWalletAddress: config.freelancerPublicKey,
      lineItems: [
        {
          description: 'Status Consistency Test',
          quantity: 1,
          unitPrice: '75000000',
          amount: '75000000',
        },
      ],
      currency: 'Demo USDC',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const issuedInvoice = await invoiceService.issueInvoice(invoice.id);
    if (!issuedInvoice) {
      throw new Error('Failed to issue invoice');
    }

    const readPromises = Array.from({ length: 5 }, () =>
      invoiceService.getInvoice(issuedInvoice.id)
    );

    const paymentPromise = paymentService.initiatePayment(issuedInvoice.id);

    const [readResults, _paymentResult] = await Promise.all([
      Promise.all(readPromises),
      paymentPromise,
    ]);

    readResults.forEach(inv => {
      expect(inv).toBeDefined();
      expect(['unpaid', 'pending', 'paid']).toContain(inv?.status);
    });

    const finalInvoice = await invoiceService.getInvoice(issuedInvoice.id);
    expect(finalInvoice?.status).toBe('paid');
  });

  it('should handle payment verification idempotently', async () => {
    const invoice = await invoiceService.createInvoice({
      clientName: 'Test Client',
      clientEmail: 'client@test.com',
      clientWalletAddress: config.clientPublicKey,
      freelancerName: 'Test Freelancer',
      freelancerEmail: 'freelancer@test.com',
      freelancerWalletAddress: config.freelancerPublicKey,
      lineItems: [
        {
          description: 'Verification Idempotency',
          quantity: 1,
          unitPrice: '60000000',
          amount: '60000000',
        },
      ],
      currency: 'Demo USDC',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const issuedInvoice = await invoiceService.issueInvoice(invoice.id);
    if (!issuedInvoice) {
      throw new Error('Failed to issue invoice');
    }
    const payment = await paymentService.initiatePayment(issuedInvoice.id);

    const verifyResults = await Promise.all([
      paymentService.getPaymentByInvoiceId(issuedInvoice.id),
      paymentService.getPaymentByInvoiceId(issuedInvoice.id),
      paymentService.getPaymentByInvoiceId(issuedInvoice.id),
    ]);

    verifyResults.forEach(result => {
      expect(result).toBeDefined();
      expect(result?.id).toBe(payment.id);
      expect(result?.status).toBe('confirmed');
    });
  });

  it('should prevent race condition when issuing same invoice multiple times', async () => {
    const invoice = await invoiceService.createInvoice({
      clientName: 'Test Client',
      clientEmail: 'client@test.com',
      clientWalletAddress: config.clientPublicKey,
      freelancerName: 'Test Freelancer',
      freelancerEmail: 'freelancer@test.com',
      freelancerWalletAddress: config.freelancerPublicKey,
      lineItems: [
        {
          description: 'Issue Race Test',
          quantity: 1,
          unitPrice: '40000000',
          amount: '40000000',
        },
      ],
      currency: 'Demo USDC',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const issuePromises = Array.from({ length: 3 }, () =>
      invoiceService.issueInvoice(invoice.id).catch(err => err)
    );

    const results = await Promise.all(issuePromises);

    const successfulIssues = results.filter(r => r && r.status === 'unpaid');

    expect(successfulIssues.length).toBeGreaterThanOrEqual(1);

    successfulIssues.forEach((issued, i) => {
      if (i > 0) {
        expect(issued.paymentId).toBe(successfulIssues[0].paymentId);
      }
    });
  });
});
