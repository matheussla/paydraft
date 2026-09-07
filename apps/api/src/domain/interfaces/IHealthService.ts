import { IHealthResponse } from '@paydraft/shared';

export interface IHealthService {
  getHealthStatus(): Promise<IHealthResponse>;
}
