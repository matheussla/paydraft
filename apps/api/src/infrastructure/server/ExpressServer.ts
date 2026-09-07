import express, { Express, Router } from 'express';
import cors from 'cors';

export class ExpressServer {
  private readonly app: Express;

  constructor() {
    this.app = express();
    this.setupMiddleware();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
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
