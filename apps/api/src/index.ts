import { ExpressServer } from './infrastructure/server/index.js';
import { config } from './infrastructure/config/environment.js';
import { HealthService, InvoiceService } from './application/services/index.js';
import { HealthController } from './interfaces/controllers/HealthController.js';
import { InvoiceController } from './interfaces/controllers/InvoiceController.js';
import { createHealthRoutes, createInvoiceRoutes } from './interfaces/routes/index.js';
import { MongoConnection } from './infrastructure/database/MongoConnection.js';
import { MongoInvoiceRepository } from './infrastructure/repositories/index.js';

async function bootstrap() {
  try {
    const mongoConnection = MongoConnection.getInstance();
    await mongoConnection.connect(config.mongodb.url);

    const healthService = new HealthService();
    const healthController = new HealthController(healthService);

    const invoiceRepository = new MongoInvoiceRepository();
    const invoiceService = new InvoiceService(invoiceRepository);
    const invoiceController = new InvoiceController(invoiceService);

    const healthRoutes = createHealthRoutes(healthController);
    const invoiceRoutes = createInvoiceRoutes(invoiceController);

    const server = new ExpressServer();
    server.registerRoutes([healthRoutes, invoiceRoutes]);
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
