/**
 * DiscoCowboy Discord Bot
 *
 * Main entry point for the DiscoCowboy bot instance.
 * Uses discord.js v14 with TypeScript.
 */

import { Client, GatewayIntentBits, Collection, Message, PermissionFlagsBits } from 'discord.js';
import { config } from 'dotenv';
import path from 'path';
import discocowboyConfig from '../../config/discocowboy.config';
import { createLogger } from '../../shared/utils/logger';
import { ErrorHandler } from '../../shared/utils/errorHandler';
import { CommandLoader } from '../../shared/utils/commandLoader';

// Load environment variables
config();

// Create logger instance for DiscoCowboy
const logger = createLogger('discocowboy');

// Create error handler
const errorHandler = new ErrorHandler(logger);

// Create command loader
const commandLoader = new CommandLoader(logger);

// Cooldown tracking: Map<userId-commandName, timestamp>
const cooldowns = new Collection<string, number>();

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
 * Initialize the DiscoCowboy bot
 */
async function startDiscoCowboy(): Promise<void> {
  logger.info('🤠 Starting DiscoCowboy bot...', {
    prefix: discocowboyConfig.prefix,
    name: discocowboyConfig.name
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
  client.config = discocowboyConfig;

  // Initialize commands collection
  client.commands = new Collection();

  // Load commands from shared directory
  try {
    const commandsPath = path.join(__dirname, '../../commands');
    client.commands = commandLoader.loadCommands(commandsPath);
    logger.info(`✅ Loaded ${client.commands.size} commands for DiscoCowboy`);
  } catch (error) {
    logger.error('Failed to load commands:', error);
    process.exit(1);
  }

  // Ready event - bot is logged in and ready
  client.once('ready', () => {
    logger.info('🤠 DiscoCowboy is online!', {
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
    if (!message.content.startsWith(discocowboyConfig.prefix)) return;

    // Parse command and arguments
    const args = message.content
      .slice(discocowboyConfig.prefix.length)
      .trim()
      .split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    // Get command (including aliases)
    const command = client.commands.get(commandName);

    if (!command) return;

    // Check user permissions (if command requires them)
    if (command.permissions && command.permissions.length > 0) {
      if (!message.guild) {
        try {
          await message.reply('❌ This command can only be used in a server!');
        } catch {
          // Ignore reply errors
        }
        return;
      }

      const memberPermissions = message.member?.permissions;
      if (!memberPermissions) {
        logger.warn(`Could not get permissions for user ${message.author.tag}`);
        return;
      }

      const missingPermissions = command.permissions.filter((perm: string) => {
        // Convert permission string to PermissionFlagsBits flag
        const permFlag = PermissionFlagsBits[perm as keyof typeof PermissionFlagsBits];
        return permFlag && !memberPermissions.has(permFlag);
      });

      if (missingPermissions.length > 0) {
        try {
          await message.reply({
            content: `❌ You don't have permission to use this command!\n\nRequired permissions: ${missingPermissions.map((p: string) => `\`${p}\``).join(', ')}`
          });
        } catch {
          // Ignore reply errors
        }
        logger.warn(`User ${message.author.tag} attempted to use ${commandName} without permissions: ${missingPermissions.join(', ')}`);
        return;
      }
    }

    // Check cooldown
    if (command.cooldown) {
      const cooldownKey = `${message.author.id}-${command.name}`;
      const lastUsed = cooldowns.get(cooldownKey);
      const now = Date.now();

      if (lastUsed) {
        const expirationTime = lastUsed + (command.cooldown * 1000);

        if (now < expirationTime) {
          const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
          try {
            await message.reply({
              content: `⏱️ Please wait ${timeLeft} seconds before using \`${command.name}\` again.`
            });
          } catch {
            // Ignore reply errors
          }
          logger.debug(`User ${message.author.tag} hit cooldown for ${commandName} (${timeLeft}s remaining)`);
          return;
        }
      }

      // Set cooldown
      cooldowns.set(cooldownKey, now);

      // Clean up expired cooldowns periodically (every 10 commands)
      if (cooldowns.size > 100) {
        const keysToDelete: string[] = [];
        cooldowns.forEach((timestamp, key) => {
          if (now - timestamp > 300000) { // 5 minutes old
            keysToDelete.push(key);
          }
        });
        keysToDelete.forEach(key => cooldowns.delete(key));
        if (keysToDelete.length > 0) {
          logger.debug(`Cleaned up ${keysToDelete.length} expired cooldowns`);
        }
      }
    }

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
    await client.login(discocowboyConfig.token);
  } catch (error) {
    logger.error('Failed to login to Discord:', error);
    process.exit(1);
  }
}

// Start the bot
startDiscoCowboy().catch((error) => {
  logger.error('Fatal error starting DiscoCowboy:', error);
  process.exit(1);
});
