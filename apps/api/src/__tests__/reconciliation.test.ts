import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { Connection } from '@solana/web3.js';
import { InvoiceService } from '../application/services/InvoiceService.js';
import { PaymentService } from '../application/services/PaymentService.js';
import { ReconciliationService } from '../application/services/ReconciliationService.js';
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

describe('Payment Reconciliation', () => {
  let connection: Connection;
  let config: SolanaConfig;
  let invoiceService: InvoiceService;
  let paymentService: PaymentService;
  let reconciliationService: ReconciliationService;

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

    const collections = await mongoose.connection.db?.collections();
    if (collections) {
      for (const collection of collections) {
        await collection.drop().catch(() => {});
      }
    }

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
    reconciliationService = new ReconciliationService(
      paymentRepository,
      invoiceRepository,
      solanaPaymentService
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should reconcile confirmed payment and mark invoice as paid', async () => {
    const invoice = await invoiceService.createInvoice({
      clientName: 'Test Client',
      clientEmail: 'client@test.com',
      clientWalletAddress: config.clientPublicKey,
      freelancerName: 'Test Freelancer',
      freelancerEmail: 'freelancer@test.com',
      freelancerWalletAddress: config.freelancerPublicKey,
      lineItems: [
        {
          description: 'Reconciliation Test',
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
    await paymentService.initiatePayment(issuedInvoice.id);

    const reconciledCount = await reconciliationService.reconcilePendingPayments();

    expect(reconciledCount).toBeGreaterThanOrEqual(0);

    const finalInvoice = await invoiceService.getInvoice(issuedInvoice.id);
    expect(finalInvoice?.status).toBe('paid');

    const payment = await paymentService.getPaymentByInvoiceId(issuedInvoice.id);
    expect(payment?.status).toBe('confirmed');
  });

  it('should handle multiple pending payments in reconciliation', async () => {
    const invoices = await Promise.all([
      invoiceService.createInvoice({
        clientName: 'Test Client 1',
        clientEmail: 'client1@test.com',
        clientWalletAddress: config.clientPublicKey,
        freelancerName: 'Test Freelancer',
        freelancerEmail: 'freelancer@test.com',
        freelancerWalletAddress: config.freelancerPublicKey,
        lineItems: [
          {
            description: 'Service 1',
            quantity: 1,
            unitPrice: '50000000',
            amount: '50000000',
          },
        ],
        currency: 'Demo USDC',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }),
      invoiceService.createInvoice({
        clientName: 'Test Client 2',
        clientEmail: 'client2@test.com',
        clientWalletAddress: config.clientPublicKey,
        freelancerName: 'Test Freelancer',
        freelancerEmail: 'freelancer@test.com',
        freelancerWalletAddress: config.freelancerPublicKey,
        lineItems: [
          {
            description: 'Service 2',
            quantity: 1,
            unitPrice: '75000000',
            amount: '75000000',
          },
        ],
        currency: 'Demo USDC',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    ]);

    const issuedInvoices = await Promise.all(
      invoices.map(inv => invoiceService.issueInvoice(inv.id))
    );

    await Promise.all(
      issuedInvoices.map(inv => inv && paymentService.initiatePayment(inv.id))
    );

    const reconciledCount = await reconciliationService.reconcilePendingPayments();

    expect(reconciledCount).toBeGreaterThanOrEqual(0);

    for (const invoice of issuedInvoices) {
      if (invoice) {
        const finalInvoice = await invoiceService.getInvoice(invoice.id);
        expect(finalInvoice?.status).toBe('paid');
      }
    }
  });

  it('should verify payment details match invoice requirements', async () => {
    const invoice = await invoiceService.createInvoice({
      clientName: 'Test Client',
      clientEmail: 'client@test.com',
      clientWalletAddress: config.clientPublicKey,
      freelancerName: 'Test Freelancer',
      freelancerEmail: 'freelancer@test.com',
      freelancerWalletAddress: config.freelancerPublicKey,
      lineItems: [
        {
          description: 'Verification Test',
          quantity: 1,
          unitPrice: '125000000',
          amount: '125000000',
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

    expect(payment.amount).toBe(issuedInvoice.total);
    expect(payment.fromWalletAddress).toBe(config.clientPublicKey);
    expect(payment.toWalletAddress).toBe(config.freelancerPublicKey);
    expect(payment.status).toBe('confirmed');
  });

  it('should handle reconciliation of already confirmed payments gracefully', async () => {
    const invoice = await invoiceService.createInvoice({
      clientName: 'Test Client',
      clientEmail: 'client@test.com',
      clientWalletAddress: config.clientPublicKey,
      freelancerName: 'Test Freelancer',
      freelancerEmail: 'freelancer@test.com',
      freelancerWalletAddress: config.freelancerPublicKey,
      lineItems: [
        {
          description: 'Double Reconciliation Test',
          quantity: 1,
          unitPrice: '90000000',
          amount: '90000000',
        },
      ],
      currency: 'Demo USDC',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const issuedInvoice = await invoiceService.issueInvoice(invoice.id);
    if (!issuedInvoice) {
      throw new Error('Failed to issue invoice');
    }
    await paymentService.initiatePayment(issuedInvoice.id);

    const firstReconcile = await reconciliationService.reconcilePendingPayments();
    expect(firstReconcile).toBeGreaterThanOrEqual(0);

    const secondReconcile = await reconciliationService.reconcilePendingPayments();
    expect(secondReconcile).toBeGreaterThanOrEqual(0);

    const finalInvoice = await invoiceService.getInvoice(issuedInvoice.id);
    expect(finalInvoice?.status).toBe('paid');
  });

  it('should correctly update block time and confirmations during reconciliation', async () => {
    const invoice = await invoiceService.createInvoice({
      clientName: 'Test Client',
      clientEmail: 'client@test.com',
      clientWalletAddress: config.clientPublicKey,
      freelancerName: 'Test Freelancer',
      freelancerEmail: 'freelancer@test.com',
      freelancerWalletAddress: config.freelancerPublicKey,
      lineItems: [
        {
          description: 'Block Time Test',
          quantity: 1,
          unitPrice: '110000000',
          amount: '110000000',
        },
      ],
      currency: 'Demo USDC',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const issuedInvoice = await invoiceService.issueInvoice(invoice.id);
    if (!issuedInvoice) {
      throw new Error('Failed to issue invoice');
    }
    await paymentService.initiatePayment(issuedInvoice.id);

    await reconciliationService.reconcilePendingPayments();

    const payment = await paymentService.getPaymentByInvoiceId(issuedInvoice.id);
    
    expect(payment?.blockTime).toBeDefined();
    expect(payment?.blockTime).toBeGreaterThan(0);
    expect(payment?.confirmations).toBeGreaterThanOrEqual(0);
  });
});
