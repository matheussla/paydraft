import { Request, Response } from 'express';
import { IHealthService } from '../../domain/interfaces/IHealthService.js';

export class HealthController {
  constructor(private readonly healthService: IHealthService) {}

  async getHealth(_req: Request, res: Response): Promise<void> {
    try {
      const healthStatus = await this.healthService.getHealthStatus();
      res.json(healthStatus);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Health check failed';
      res.status(503).json({
        status: 'error',
        message,
        timestamp: new Date().toISOString()
      });
    }
  }

  getPing(_req: Request, res: Response): void {
    res.json({ message: 'pong' });
  }
}
