import { ExpressServer } from './infrastructure/server/index.js';
import { config } from './infrastructure/config/environment.js';
import { HealthService, InvoiceService, PaymentService } from './application/services/index.js';
import { HealthController } from './interfaces/controllers/HealthController.js';
import { InvoiceController } from './interfaces/controllers/InvoiceController.js';
import { PaymentController } from './interfaces/controllers/PaymentController.js';
import { createHealthRoutes, createInvoiceRoutes, createPaymentRoutes } from './interfaces/routes/index.js';
import { MongoConnection } from './infrastructure/database/MongoConnection.js';
import { MongoInvoiceRepository, MongoPaymentRepository } from './infrastructure/repositories/index.js';
import { SolanaPaymentService } from './infrastructure/blockchain/SolanaPaymentService.js';
import { resolve } from 'path';

async function bootstrap() {
  try {
    const mongoConnection = MongoConnection.getInstance();
    await mongoConnection.connect(config.mongodb.url);

    const healthService = new HealthService();
    const healthController = new HealthController(healthService);

    const invoiceRepository = new MongoInvoiceRepository();
    const invoiceService = new InvoiceService(invoiceRepository);
    const invoiceController = new InvoiceController(invoiceService);

    const paymentRepository = new MongoPaymentRepository();
    const solanaPaymentService = new SolanaPaymentService({
      rpcUrl: process.env.SOLANA_RPC_URL || 'http://127.0.0.1:8899',
      clientKeypairPath: resolve(process.cwd(), '.solana', 'keypairs', 'client.json'),
      solanaConfigPath: resolve(process.cwd(), '.solana', 'config.json'),
    });
    const paymentService = new PaymentService(paymentRepository, invoiceRepository, solanaPaymentService);
    const paymentController = new PaymentController(paymentService);

    const healthRoutes = createHealthRoutes(healthController);
    const invoiceRoutes = createInvoiceRoutes(invoiceController);
    const paymentRoutes = createPaymentRoutes(paymentController);

    const server = new ExpressServer();
    server.registerRoutes([healthRoutes, invoiceRoutes, paymentRoutes]);
    server.start(config.api.port, config.api.host);
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
