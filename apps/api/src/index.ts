import { ExpressServer } from './infrastructure/server/index.js';
import { config } from './infrastructure/config/environment.js';
import { HealthService } from './application/services/index.js';
import { HealthController } from './interfaces/controllers/HealthController.js';
import { createHealthRoutes } from './interfaces/routes/index.js';

const healthService = new HealthService();
const healthController = new HealthController(healthService);

const healthRoutes = createHealthRoutes(healthController);

const server = new ExpressServer();
server.registerRoutes([healthRoutes]);
server.start(config.api.port, config.api.host);
