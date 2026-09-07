import { IHealthResponse } from '@paydraft/shared';
import { IHealthService } from '../../domain/interfaces/IHealthService.js';
import { MongoConnection } from '../../infrastructure/database/MongoConnection.js';

export class HealthService implements IHealthService {
  async getHealthStatus(): Promise<IHealthResponse> {
    const mongoConnection = MongoConnection.getInstance();
    const isMongoConnected = mongoConnection.getConnectionStatus();

    if (!isMongoConnected) {
      throw new Error('MongoDB is unavailable. Ensure MongoDB is running via docker compose up.');
    }

    const canPing = await mongoConnection.checkConnection();
    if (!canPing) {
      throw new Error('MongoDB connection lost. Check MongoDB container status.');
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }
}
