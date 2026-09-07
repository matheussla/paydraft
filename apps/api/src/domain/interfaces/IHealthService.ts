import { IHealthResponse } from '@paydraft/shared';

export interface IHealthService {
  getHealthStatus(): IHealthResponse;
}
