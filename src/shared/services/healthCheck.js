const express = require('express');
const { createLogger } = require('../utils/logger');

/**
 * Health check HTTP server for monitoring
 */
class HealthCheckServer {
  constructor(port = process.env.PORT || 3000) {
    this.port = port;
    this.app = express();
    this.logger = createLogger('healthcheck');
    this.botStatuses = new Map();
    this.server = null;
    this.startTime = Date.now();

    this.setupRoutes();
  }

  /**
   * Setup Express routes
   */
  setupRoutes() {
    // Basic middleware
    this.app.use(express.json());

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      const uptime = Math.floor((Date.now() - this.startTime) / 1000);
      const status = {
        status: 'healthy',
        uptime: uptime,
        timestamp: new Date().toISOString(),
        bots: this.getBotStatuses()
      };

      res.status(200).json(status);
      this.logger.debug('Health check requested', { uptime });
    });

    // Ready check endpoint
    this.app.get('/ready', (req, res) => {
      const allBotsReady = Array.from(this.botStatuses.values())
        .every(status => status.ready);

      if (allBotsReady && this.botStatuses.size > 0) {
        res.status(200).json({ status: 'ready', bots: this.getBotStatuses() });
      } else {
        res.status(503).json({ status: 'not ready', bots: this.getBotStatuses() });
      }
    });

    // Root endpoint
    this.app.get('/', (req, res) => {
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
    this.app.get('/status', (req, res) => {
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
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Not found' });
    });

    // Error handler
    this.app.use((err, req, res, next) => {
      this.logger.error('Express error:', {
        message: err.message,
        stack: err.stack
      });
      res.status(500).json({ error: 'Internal server error' });
    });
  }

  /**
   * Register a bot with the health check server
   * @param {string} botName - Name of the bot
   * @param {Client} client - Discord client instance
   */
  registerBot(botName, client) {
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
   * @returns {Object} Bot statuses
   */
  getBotStatuses() {
    const statuses = {};

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
   * @returns {Promise} Resolves when server is listening
   */
  start() {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.port, () => {
          this.logger.info(`Health check server listening on port ${this.port}`);
          resolve();
        });

        this.server.on('error', (error) => {
          this.logger.error('Server error:', {
            message: error.message,
            code: error.code
          });
          reject(error);
        });
      } catch (error) {
        this.logger.error('Failed to start health check server:', {
          message: error.message,
          stack: error.stack
        });
        reject(error);
      }
    });
  }

  /**
   * Stop the health check server
   * @returns {Promise} Resolves when server is closed
   */
  stop() {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.server.close((err) => {
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

module.exports = HealthCheckServer;
