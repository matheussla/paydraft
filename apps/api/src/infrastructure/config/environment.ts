import dotenv from 'dotenv';

dotenv.config();

export const config = {
  api: {
    port: process.env.API_PORT || 3001,
    host: process.env.API_HOST || 'localhost'
  },
  nodeEnv: process.env.NODE_ENV || 'development'
} as const;
