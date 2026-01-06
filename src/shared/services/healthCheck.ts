import express, { Application, Request, Response, NextFunction } from 'express';
import { Client } from 'discord.js';
import { createLogger } from '../utils/logger';
import type { Logger } from 'winston';
import { Server } from 'http';

interface BotStatus {
  ready: boolean;
  client: Client;
}

interface BotStatusResponse {
  ready: boolean;
  online: boolean;
  guilds: number;
  users: number;
  ping: number | null;
}

/**
 * Health check HTTP server for monitoring
 */
export class HealthCheckServer {
  private port: number;
  private app: Application;
  private logger: Logger;
  private botStatuses: Map<string, BotStatus>;
  private server: Server | null;
  private startTime: number;

  constructor(port: number = parseInt(process.env.PORT || '3000', 10)) {
    this.port = port;
    this.app = express();
    this.logger = createLogger('healthcheck');
    this.botStatuses = new Map<string, BotStatus>();
    this.server = null;
    this.startTime = Date.now();

    this.setupRoutes();
  }

  /**
   * Setup Express routes
   */
  private setupRoutes(): void {
    // Basic middleware
    this.app.use(express.json());

    // Health check endpoint
    this.app.get('/health', (_req: Request, res: Response) => {
      const uptime = Math.floor((Date.now() - this.startTime) / 1000);
      const memoryUsed = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
      const memoryLimit = 450; // 450MB threshold (out of 512MB allocated)

      // Check if any bots are registered
      if (this.botStatuses.size === 0) {
        res.status(503).json({
          status: 'unhealthy',
          reason: 'No bots registered',
          uptime: uptime,
          timestamp: new Date().toISOString()
        });
        this.logger.warn('Health check failed: No bots registered');
        return;
      }

      // Check bot connection states
      const botStatuses = this.getBotStatuses();
      const allBotsHealthy = Object.entries(botStatuses).every(([_name, status]) => {
        return status.ready && status.online;
      });

      // Check memory usage
      const memoryHealthy = memoryUsed < memoryLimit;

      // Check WebSocket ping (high latency indicates issues)
      const allPingsHealthy = Object.values(botStatuses).every(status => {
        return status.ping === null || status.ping < 1000; // 1 second threshold
      });

      const isHealthy = allBotsHealthy && memoryHealthy && allPingsHealthy;

      const healthStatus = {
        status: isHealthy ? 'healthy' : 'unhealthy',
        uptime: uptime,
        timestamp: new Date().toISOString(),
        checks: {
          bots: allBotsHealthy ? 'pass' : 'fail',
          memory: memoryHealthy ? 'pass' : 'fail',
          latency: allPingsHealthy ? 'pass' : 'fail'
        },
        bots: botStatuses,
        memory: {
          used: memoryUsed,
          limit: memoryLimit,
          unit: 'MB'
        }
      };

      if (isHealthy) {
        res.status(200).json(healthStatus);
        this.logger.debug('Health check passed', { uptime });
      } else {
        res.status(503).json(healthStatus);
        this.logger.warn('Health check failed', {
          bots: allBotsHealthy,
          memory: memoryHealthy,
          latency: allPingsHealthy
        });
      }
    });

    // Ready check endpoint
    this.app.get('/ready', (_req: Request, res: Response) => {
      const allBotsReady = Array.from(this.botStatuses.values())
        .every(status => status.ready);

      if (allBotsReady && this.botStatuses.size > 0) {
        res.status(200).json({ status: 'ready', bots: this.getBotStatuses() });
      } else {
        res.status(503).json({ status: 'not ready', bots: this.getBotStatuses() });
      }
    });

    // Root endpoint
    this.app.get('/', (_req: Request, res: Response) => {
      res.status(200).json({
        service: 'Burl-Fret Discord Bots',
        bots: ['Bumbles', 'DiscoCowboy'],
        version: '2.0.0',
        endpoints: {
          health: '/health',
          ready: '/ready',
          status: '/status'
        }
      });
    });

    // Status endpoint with detailed information
    this.app.get('/status', (_req: Request, res: Response) => {
      const uptime = Math.floor((Date.now() - this.startTime) / 1000);
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = uptime % 60;

      res.status(200).json({
        service: 'Burl-Fret Discord Bots',
        version: '2.0.0',
        uptime: {
          seconds: uptime,
          formatted: `${hours}h ${minutes}m ${seconds}s`
        },
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB'
        },
        bots: this.getBotStatuses(),
        timestamp: new Date().toISOString()
      });
    });

    // 404 handler
    this.app.use((_req: Request, res: Response) => {
      res.status(404).json({ error: 'Not found' });
    });

    // Error handler
    this.app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      this.logger.error('Express error:', {
        message: err.message,
        stack: err.stack
      });
      res.status(500).json({ error: 'Internal server error' });
    });
  }

  /**
   * Register a bot with the health check server
   * @param botName - Name of the bot
   * @param client - Discord client instance
   */
  registerBot(botName: string, client: Client): void {
    this.botStatuses.set(botName, {
      ready: false,
      client: client
    });

    // Update status when bot is ready
    client.once('ready', () => {
      this.botStatuses.set(botName, {
        ready: true,
        client: client
      });
      this.logger.info(`Bot ${botName} registered as ready`);
    });

    this.logger.info(`Bot ${botName} registered with health check server`);
  }

  /**
   * Get status of all registered bots
   * @returns Bot statuses
   */
  private getBotStatuses(): Record<string, BotStatusResponse> {
    const statuses: Record<string, BotStatusResponse> = {};

    this.botStatuses.forEach((status, botName) => {
      statuses[botName] = {
        ready: status.ready,
        online: status.ready && status.client.ws.status === 0,
        guilds: status.ready ? status.client.guilds.cache.size : 0,
        users: status.ready ? status.client.users.cache.size : 0,
        ping: status.ready ? status.client.ws.ping : null
      };
    });

    return statuses;
  }

  /**
   * Start the health check server
   * @returns Resolves when server is listening
   */
  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.port, () => {
          this.logger.info(`Health check server listening on port ${this.port}`);
          resolve();
        });

        this.server.on('error', (error: Error) => {
          this.logger.error('Server error:', {
            message: error.message,
            code: (error as NodeJS.ErrnoException).code
          });
          reject(error);
        });
      } catch (error) {
        this.logger.error('Failed to start health check server:', {
          message: (error as Error).message,
          stack: (error as Error).stack
        });
        reject(error);
      }
    });
  }

  /**
   * Stop the health check server
   * @returns Resolves when server is closed
   */
  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.server.close((err?: Error) => {
        if (err) {
          this.logger.error('Error stopping health check server:', {
            message: err.message
          });
          reject(err);
        } else {
          this.logger.info('Health check server stopped');
          resolve();
        }
      });
    });
  }
}
