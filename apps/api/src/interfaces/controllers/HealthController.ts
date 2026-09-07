import { Request, Response } from 'express';
import { IHealthService } from '../../domain/interfaces/IHealthService.js';

export class HealthController {
  constructor(private readonly healthService: IHealthService) {}

  getHealth(_req: Request, res: Response): void {
    const healthStatus = this.healthService.getHealthStatus();
    res.json(healthStatus);
  }

  getPing(_req: Request, res: Response): void {
    res.json({ message: 'pong' });
  }
}
