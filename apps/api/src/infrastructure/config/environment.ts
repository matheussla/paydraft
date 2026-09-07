import dotenv from 'dotenv';

dotenv.config();

export const config = {
  api: {
    port: process.env.API_PORT || 3001,
    host: process.env.API_HOST || 'localhost'
  },
  mongodb: {
    url: process.env.MONGODB_URL || 'mongodb://paydraft:paydraft_dev_password@127.0.0.1:27017/paydraft?authSource=admin'
  },
  nodeEnv: process.env.NODE_ENV || 'development'
} as const;
