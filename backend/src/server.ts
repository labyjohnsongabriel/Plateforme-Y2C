import dotenv from 'dotenv';
import path from 'path';

// Charger .env AVANT tout autre import
dotenv.config({ path: path.join(__dirname, '../.env') });

import App from './app';
import { logger } from './config/logger';

const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    console.log('🔍 Environnement:', {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      DATABASE_URL: process.env.DATABASE_URL ? '✅ Définie' : '❌ Non définie',
    });

    const app = new App();
    const server = app.getServer();

    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📦 Database: ${process.env.DATABASE_URL ? '✅ Connectée' : '❌ Non configurée'}`);
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