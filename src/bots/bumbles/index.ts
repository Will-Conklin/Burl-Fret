/**
 * Bumbles Discord Bot
 *
 * Main entry point for the Bumbles bot instance.
 * Uses discord.js v14 with TypeScript.
 */

import { Client, GatewayIntentBits, Collection, Message } from 'discord.js';
import { config } from 'dotenv';
import path from 'path';
import bumblesConfig from '../../config/bumbles.config';
import { createLogger } from '../../shared/utils/logger';
import { ErrorHandler } from '../../shared/utils/errorHandler';
import { CommandLoader } from '../../shared/utils/commandLoader';

// Load environment variables
config();

// Create logger instance for Bumbles
const logger = createLogger('bumbles');

// Create error handler
const errorHandler = new ErrorHandler(logger);

// Create command loader
const commandLoader = new CommandLoader(logger);

// Setup global error handlers
process.on('uncaughtException', (error: Error) => {
  errorHandler.handleProcessError(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  errorHandler.handleUnhandledRejection(reason, promise);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

// Extend the Client type to include commands
declare module 'discord.js' {
  export interface Client {
    commands: Collection<string, any>;
    config: any;
  }
}

/**
 * Initialize the Bumbles bot
 */
async function startBumbles(): Promise<void> {
  logger.info('🐝 Starting Bumbles bot...', {
    prefix: bumblesConfig.prefix,
    name: bumblesConfig.name
  });

  // Create Discord client with required intents
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,  // Required for prefix commands
      GatewayIntentBits.GuildMembers      // Required for nickname changes
    ]
  });

  // Attach configuration to client
  client.config = bumblesConfig;

  // Initialize commands collection
  client.commands = new Collection();

  // Load commands from shared directory
  try {
    const commandsPath = path.join(__dirname, '../../commands');
    client.commands = commandLoader.loadCommands(commandsPath);
    logger.info(`✅ Loaded ${client.commands.size} commands for Bumbles`);
  } catch (error) {
    logger.error('Failed to load commands:', error);
    process.exit(1);
  }

  // Ready event - bot is logged in and ready
  client.once('ready', () => {
    logger.info('🐝 Bumbles is online!', {
      tag: client.user?.tag,
      id: client.user?.id,
      guilds: client.guilds.cache.size
    });
  });

  // Message create event - handle prefix commands
  client.on('messageCreate', async (message: Message) => {
    // Ignore bot messages
    if (message.author.bot) return;

    // Check for prefix
    if (!message.content.startsWith(bumblesConfig.prefix)) return;

    // Parse command and arguments
    const args = message.content
      .slice(bumblesConfig.prefix.length)
      .trim()
      .split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    // Get command (including aliases)
    const command = client.commands.get(commandName);

    if (!command) return;

    // Execute command
    try {
      logger.info(`Executing command: ${commandName}`, {
        user: message.author.tag,
        guild: message.guild?.name
      });

      await command.execute(message, args);
    } catch (error) {
      logger.error(`Error executing command: ${commandName}`, error);

      // Send error message to user
      try {
        await message.reply({
          content: '❌ An error occurred while executing that command!'
        });
      } catch {
        // Ignore reply errors
      }
    }
  });

  // Error event
  client.on('error', (error) => {
    logger.error('Discord client error:', error);
  });

  // Warning event
  client.on('warn', (warning) => {
    logger.warn('Discord client warning:', warning);
  });

  // Disconnect event
  client.on('shardDisconnect', (event) => {
    logger.warn('Bot disconnected:', event);
  });

  // Reconnecting event
  client.on('shardReconnecting', () => {
    logger.info('Bot reconnecting...');
  });

  // Login to Discord
  try {
    await client.login(bumblesConfig.token);
  } catch (error) {
    logger.error('Failed to login to Discord:', error);
    process.exit(1);
  }
}

// Start the bot
startBumbles().catch((error) => {
  logger.error('Fatal error starting Bumbles:', error);
  process.exit(1);
});
