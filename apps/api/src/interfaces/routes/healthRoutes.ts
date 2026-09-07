import { Router } from 'express';
import { HealthController } from '../controllers/HealthController.js';

export function createHealthRoutes(healthController: HealthController): Router {
  const router = Router();

  router.get('/health', (req, res) => healthController.getHealth(req, res));
  router.get('/api/ping', (req, res) => healthController.getPing(req, res));

  return router;
}
