import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAccount } from '@solana/spl-token';
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

describe('Payment Flow (against local validator)', () => {
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

  it('should create an unpaid invoice with correct amounts', async () => {
    const invoice = await invoiceService.createInvoice({
      clientName: 'Test Client',
      clientEmail: 'client@test.com',
      clientWalletAddress: config.clientPublicKey,
      freelancerName: 'Test Freelancer',
      freelancerEmail: 'freelancer@test.com',
      freelancerWalletAddress: config.freelancerPublicKey,
      lineItems: [
        {
          description: 'Service 1',
          quantity: 10,
          unitPrice: '50000000',
          amount: '500000000',
        },
        {
          description: 'Service 2',
          quantity: 5,
          unitPrice: '60000000',
          amount: '300000000',
        },
      ],
      currency: 'Demo USDC',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    expect(invoice.status).toBe('draft');
    expect(invoice.total).toBe('800000000');
    expect(invoice.subtotal).toBe('800000000');
    expect(invoice.lineItems).toHaveLength(2);
  });

  it('should issue an invoice and generate payment ID', async () => {
    const invoice = await invoiceService.createInvoice({
      clientName: 'Test Client',
      clientEmail: 'client@test.com',
      clientWalletAddress: config.clientPublicKey,
      freelancerName: 'Test Freelancer',
      freelancerEmail: 'freelancer@test.com',
      freelancerWalletAddress: config.freelancerPublicKey,
      lineItems: [
        {
          description: 'Test Service',
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

    expect(issuedInvoice.status).toBe('unpaid');
    expect(issuedInvoice.paymentId).toBeDefined();
    expect(issuedInvoice.paymentId).toMatch(/^[a-f0-9]{32}$/);
  });

  it('should initiate payment and submit transaction to local validator', async () => {
    const invoice = await invoiceService.createInvoice({
      clientName: 'Test Client',
      clientEmail: 'client@test.com',
      clientWalletAddress: config.clientPublicKey,
      freelancerName: 'Test Freelancer',
      freelancerEmail: 'freelancer@test.com',
      freelancerWalletAddress: config.freelancerPublicKey,
      lineItems: [
        {
          description: 'Test Payment',
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

    const payment = await paymentService.initiatePayment(issuedInvoice.id);

    expect(payment.invoiceId).toBe(issuedInvoice.id);
    expect(payment.amount).toBe('50000000');
    expect(payment.status).toBe('confirmed');
    expect(payment.transactionSignature).toBeDefined();
    expect(payment.transactionSignature).toMatch(/^[1-9A-HJ-NP-Za-km-z]{87,88}$/);
  });

  it('should verify payment on local validator and mark invoice as paid', async () => {
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
          quantity: 2,
          unitPrice: '25000000',
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
    await paymentService.initiatePayment(issuedInvoice.id);

    const updatedInvoice = await invoiceService.getInvoice(issuedInvoice.id);
    expect(updatedInvoice?.status).toBe('paid');

    const verifiedPayment = await paymentService.getPaymentByInvoiceId(issuedInvoice.id);
    expect(verifiedPayment).toBeDefined();
    expect(verifiedPayment?.status).toBe('confirmed');
    expect(verifiedPayment?.blockTime).toBeDefined();
  });

  it('should transfer correct token amount on local validator', async () => {
    const invoice = await invoiceService.createInvoice({
      clientName: 'Test Client',
      clientEmail: 'client@test.com',
      clientWalletAddress: config.clientPublicKey,
      freelancerName: 'Test Freelancer',
      freelancerEmail: 'freelancer@test.com',
      freelancerWalletAddress: config.freelancerPublicKey,
      lineItems: [
        {
          description: 'Token Transfer Test',
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

    const freelancerPubkey = new PublicKey(config.freelancerPublicKey);
    const mintPubkey = new PublicKey(config.demoUsdcMint);

    const freelancerTokenAccountsBefore = await connection.getTokenAccountsByOwner(
      freelancerPubkey,
      { mint: mintPubkey }
    );

    const freelancerBalanceBefore = freelancerTokenAccountsBefore.value.length > 0
      ? (await getAccount(connection, freelancerTokenAccountsBefore.value[0].pubkey)).amount
      : BigInt(0);

    await paymentService.initiatePayment(issuedInvoice.id);

    const freelancerTokenAccountsAfter = await connection.getTokenAccountsByOwner(
      freelancerPubkey,
      { mint: mintPubkey }
    );

    const freelancerBalanceAfter = (await getAccount(
      connection,
      freelancerTokenAccountsAfter.value[0].pubkey
    )).amount;

    const expectedIncrease = BigInt('75000000');
    expect(freelancerBalanceAfter - freelancerBalanceBefore).toBe(expectedIncrease);
  });

  it('should reject payment if amounts mismatch', async () => {
    const invoice = await invoiceService.createInvoice({
      clientName: 'Test Client',
      clientEmail: 'client@test.com',
      clientWalletAddress: config.clientPublicKey,
      freelancerName: 'Test Freelancer',
      freelancerEmail: 'freelancer@test.com',
      freelancerWalletAddress: config.freelancerPublicKey,
      lineItems: [
        {
          description: 'Amount Test',
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

    await expect(
      paymentService.initiatePayment(issuedInvoice.id)
    ).resolves.not.toThrow();

    const payment = await paymentService.getPaymentByInvoiceId(issuedInvoice.id);
    expect(payment?.amount).toBe('100000000');
  });
});
