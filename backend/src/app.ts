import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { Server as SocketServer } from 'socket.io';
import http from 'http';

// Utilisation de chemins relatifs (pas d'alias @)
import { corsConfig } from './config/cors';
import { rateLimitConfig } from './config/rate-limit';
import { logger } from './config/logger';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';
import { loggingMiddleware } from './middlewares/logging.middleware';
import routes from './routes/index';
import { initializeSocket } from './sockets/socket.server';

class App {
  public app: express.Application;
  public server: http.Server;
  public io: SocketServer | null = null;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeSocketIO();
  }

  private initializeMiddlewares(): void {
    this.app.use(helmet());
    this.app.use(cors(corsConfig));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(compression());
    this.app.use(morgan('combined', { stream: { write: (message: string) => logger.info(message.trim()) } }));
    this.app.use(loggingMiddleware);
    this.app.use(rateLimitConfig);

    this.app.get('/health', (_req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      });
    });
  }

  private initializeRoutes(): void {
    this.app.use('/api', routes);
    this.app.use(notFoundMiddleware);
  }

  private initializeErrorHandling(): void {
    this.app.use(errorMiddleware);
  }

  private initializeSocketIO(): void {
    if (process.env.ENABLE_SOCKET === 'true') {
      this.io = initializeSocket(this.server);
      logger.info('🔌 Socket.IO initialized');
    }
  }

  public getServer(): http.Server {
    return this.server;
  }

  public getIO(): SocketServer | null {
    return this.io;
  }
}

export default App;