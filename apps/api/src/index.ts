import { ExpressServer } from './infrastructure/server/index.js';
import { config } from './infrastructure/config/environment.js';
import { HealthService, InvoiceService, PaymentService, ReconciliationService, ReceiptService } from './application/services/index.js';
import { HealthController } from './interfaces/controllers/HealthController.js';
import { InvoiceController } from './interfaces/controllers/InvoiceController.js';
import { PaymentController } from './interfaces/controllers/PaymentController.js';
import { ReceiptController } from './interfaces/controllers/ReceiptController.js';
import { createHealthRoutes, createInvoiceRoutes, createPaymentRoutes, createReceiptRoutes } from './interfaces/routes/index.js';
import { MongoConnection } from './infrastructure/database/MongoConnection.js';
import { MongoInvoiceRepository, MongoPaymentRepository } from './infrastructure/repositories/index.js';
import { SolanaPaymentService } from './infrastructure/blockchain/SolanaPaymentService.js';
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';

async function bootstrap() {
  try {
    const mongoConnection = MongoConnection.getInstance();
    await mongoConnection.connect(config.mongodb.url);

    const healthService = new HealthService();
    const healthController = new HealthController(healthService);

    const invoiceRepository = new MongoInvoiceRepository();
    const invoiceService = new InvoiceService(invoiceRepository);
    const invoiceController = new InvoiceController(invoiceService);

    const solanaConfigPath = resolve(process.cwd(), '.solana', 'config.json');
    let rpcUrl = 'http://127.0.0.1:8899';
    
    if (existsSync(solanaConfigPath)) {
      const solanaConfig = JSON.parse(readFileSync(solanaConfigPath, 'utf-8'));
      rpcUrl = solanaConfig.cluster || rpcUrl;
    }

    const paymentRepository = new MongoPaymentRepository();
    const solanaPaymentService = new SolanaPaymentService({
      rpcUrl,
      clientKeypairPath: resolve(process.cwd(), '.solana', 'keypairs', 'client.json'),
      solanaConfigPath,
    });
    const paymentService = new PaymentService(paymentRepository, invoiceRepository, solanaPaymentService);
    const paymentController = new PaymentController(paymentService);

    const receiptService = new ReceiptService(invoiceRepository, paymentRepository);
    const receiptController = new ReceiptController(receiptService);

    const reconciliationService = new ReconciliationService(
      paymentRepository,
      invoiceRepository,
      solanaPaymentService
    );
    const reconciliationIntervalMs = parseInt(process.env.RECONCILIATION_INTERVAL_MS || '30000', 10);
    reconciliationService.startReconciliation(reconciliationIntervalMs);

    const healthRoutes = createHealthRoutes(healthController);
    const invoiceRoutes = createInvoiceRoutes(invoiceController);
    const paymentRoutes = createPaymentRoutes(paymentController);
    const receiptRoutes = createReceiptRoutes(receiptController);

    const server = new ExpressServer();
    server.registerRoutes([healthRoutes, invoiceRoutes, paymentRoutes, receiptRoutes]);
    server.start(config.api.port, config.api.host);

    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully...');
      reconciliationService.stopReconciliation();
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully...');
      reconciliationService.stopReconciliation();
      process.exit(0);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to start application:', message);
    console.error('\nEnsure MongoDB is running:');
    console.error('  docker compose up -d');
    console.error('\nOr check MongoDB connection in .env file');
    process.exit(1);
  }
}

bootstrap();
