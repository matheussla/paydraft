import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { randomBytes } from 'crypto';

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://paydraft:paydraft_dev_password@127.0.0.1:27017/paydraft?authSource=admin';
const SOLANA_CONFIG_PATH = resolve(process.cwd(), '.solana', 'config.json');

interface SolanaConfig {
  demoUsdcMint: string;
  freelancerPublicKey: string;
  clientPublicKey: string;
  cluster: string;
  lastInitTimestamp: number;
}

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  status: { type: String, required: true },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  clientWalletAddress: { type: String },
  freelancerName: { type: String, required: true },
  freelancerEmail: { type: String, required: true },
  freelancerWalletAddress: { type: String, required: true },
  lineItems: [
    {
      description: { type: String, required: true },
      quantity: { type: Number, required: true },
      unitPrice: { type: String, required: true },
      amount: { type: String, required: true },
    },
  ],
  subtotal: { type: String, required: true },
  total: { type: String, required: true },
  currency: { type: String, required: true },
  dueDate: { type: String, required: true },
  issuedDate: { type: String, required: true },
  notes: { type: String },
  paymentId: { type: String, unique: true, sparse: true },
}, {
  timestamps: true,
});

const Invoice = mongoose.model('Invoice', InvoiceSchema);

function generatePaymentId(): string {
  return randomBytes(16).toString('hex');
}

function loadSolanaConfig(): SolanaConfig {
  try {
    return JSON.parse(readFileSync(SOLANA_CONFIG_PATH, 'utf-8'));
  } catch (error) {
    console.error('❌ Failed to load Solana config. Run: pnpm solana:init');
    process.exit(1);
  }
}

async function seedDatabase(): Promise<void> {
  console.log('🌱 Seeding database with sample data...\n');

  try {
    await mongoose.connect(MONGODB_URL);
    console.log('✅ Connected to MongoDB\n');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    console.error('   Make sure MongoDB is running: docker compose up -d\n');
    process.exit(1);
  }

  const config = loadSolanaConfig();

  const existingInvoices = await Invoice.countDocuments({ status: 'unpaid' });
  
  if (existingInvoices > 0) {
    console.log(`⚠️  Found ${existingInvoices} existing unpaid invoice(s)`);
    console.log('   Run `pnpm reset` to clear the database first\n');
    await mongoose.disconnect();
    process.exit(0);
  }

  const invoiceNumber = `INV-${Date.now().toString().substring(5)}`;
  const paymentId = generatePaymentId();
  const issuedDate = new Date().toISOString();
  const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  const lineItems = [
    {
      description: 'Backend API Development',
      quantity: 20,
      unitPrice: '30000000',
      amount: '600000000',
    },
    {
      description: 'Frontend React Development',
      quantity: 10,
      unitPrice: '20000000',
      amount: '200000000',
    },
  ];

  const subtotal = '800000000';
  const total = '800000000';

  const invoice = new Invoice({
    invoiceNumber,
    status: 'unpaid',
    clientName: 'Acme Corporation',
    clientEmail: 'client@acme.example.com',
    clientWalletAddress: config.clientPublicKey,
    freelancerName: 'Freelance Developer',
    freelancerEmail: 'freelancer@example.com',
    freelancerWalletAddress: config.freelancerPublicKey,
    lineItems,
    subtotal,
    total,
    currency: 'Demo USDC',
    dueDate,
    issuedDate,
    notes: 'Sample invoice for local development and testing. Demo USDC tokens have no monetary value.',
    paymentId,
  });

  try {
    await invoice.save();
    console.log('✅ Created sample unpaid invoice:\n');
    console.log(`   Invoice Number: ${invoiceNumber}`);
    console.log(`   Total Amount: 800 Demo USDC (800000000 integer units)`);
    console.log(`   Status: unpaid`);
    console.log(`   Payment ID: ${paymentId}`);
    console.log(`   Payment URL: http://localhost:5173/pay/${paymentId}\n`);
    console.log('🎉 Database seeding completed successfully!\n');
    console.log('Next steps:');
    console.log('  1. Start API: pnpm dev:api');
    console.log('  2. Start web: pnpm dev:web');
    console.log(`  3. Open payment page: http://localhost:5173/pay/${paymentId}\n`);
  } catch (error) {
    console.error('❌ Failed to create invoice:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase().catch((error) => {
  console.error('Fatal error during seeding:', error);
  process.exit(1);
});
