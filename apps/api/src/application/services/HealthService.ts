import { IHealthResponse } from '@paydraft/shared';
import { IHealthService } from '../../domain/interfaces/IHealthService.js';

export class HealthService implements IHealthService {
  getHealthStatus(): IHealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }
}
