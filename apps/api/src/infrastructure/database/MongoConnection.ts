import mongoose from 'mongoose';

export class MongoConnection {
  private static instance: MongoConnection;
  private isConnected: boolean = false;

  private constructor() {}

  static getInstance(): MongoConnection {
    if (!MongoConnection.instance) {
      MongoConnection.instance = new MongoConnection();
    }
    return MongoConnection.instance;
  }

  async connect(url: string): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      await mongoose.connect(url, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 5000,
        connectTimeoutMS: 5000
      });
      this.isConnected = true;
      console.log('MongoDB connected successfully');
    } catch (error) {
      this.isConnected = false;
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`MongoDB connection failed: ${message}`);
    }
  }

  async checkConnection(): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      await mongoose.connection.db?.admin().ping();
      return true;
    } catch {
      this.isConnected = false;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await mongoose.disconnect();
      this.isConnected = false;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}
