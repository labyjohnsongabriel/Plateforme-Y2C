// src/server.ts
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

import App from './app';
import { logger } from './config/logger';

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || '127.0.0.1';

async function startServer() {
  try {
    console.log('🔍 Environnement:', {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT,
      HOST,
      DATABASE_URL: process.env.DATABASE_URL ? '✅ Définie' : '❌ Non définie',
    });

    const app = new App();
    const server = app.getServer();

    server.listen(PORT, HOST, () => {
      logger.info(`🚀 Server running on http://${HOST}:${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📦 Database: ${process.env.DATABASE_URL ? '✅ Configurée' : '❌ Non configurée'}`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`🛑 Received ${signal}, shutting down...`);
      server.close(() => {
        logger.info('👋 Server closed');
        process.exit(0);
      });
      setTimeout(() => {
        logger.error('💥 Forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();