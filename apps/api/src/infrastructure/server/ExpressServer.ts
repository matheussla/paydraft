import express, { Express, Router } from 'express';
import cors from 'cors';

export class ExpressServer {
  private readonly app: Express;

  constructor() {
    this.app = express();
    this.setupMiddleware();
  }

  private setupMiddleware(): void {
    this.app.use(cors({
      origin: ['http://localhost:5173', 'http://localhost:3001', 'http://127.0.0.1:5173', 'http://127.0.0.1:3001'],
      credentials: true,
    }));
    this.app.use(express.json());
  }

  registerRoutes(routes: Router[]): void {
    routes.forEach((router) => {
      this.app.use(router);
    });
  }

  start(port: number | string, host: string): void {
    this.app.listen(port, () => {
      console.log(`API server running at http://${host}:${port}`);
    });
  }
}
