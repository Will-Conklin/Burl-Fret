import { EmbedBuilder, Message, DiscordAPIError } from 'discord.js';
import winston from 'winston';

interface RateLimitInfo {
  timeout: number;
  limit: number;
  method: string;
  path: string;
  route: string;
}

/**
 * Error handler utility for Discord bots
 */
export class ErrorHandler {
  private logger: winston.Logger;

  constructor(logger: winston.Logger) {
    this.logger = logger;
  }

  /**
   * Handle general errors
   * @param error - The error to handle
   * @param context - Context where error occurred
   */
  handleError(error: Error, context: string = 'Unknown'): void {
    this.logger.error(`Error in ${context}:`, {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  }

  /**
   * Handle command errors and optionally reply to user
   * @param error - The error to handle
   * @param message - Discord message object
   * @param commandName - Name of the command
   */
  async handleCommandError(error: Error, message: Message, commandName: string): Promise<void> {
    this.logger.error(`Error executing command ${commandName}:`, {
      message: error.message,
      stack: error.stack,
      userId: message.author.id,
      guildId: message.guild?.id
    });

    // Send user-friendly error message
    try {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('❌ Command Error')
        .setDescription(`An error occurred while executing the \`${commandName}\` command.`)
        .addFields({
          name: 'Error',
          value: error.message || 'Unknown error'
        })
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
    } catch (replyError) {
      this.logger.error('Failed to send error message to user:', {
        message: (replyError as Error).message
      });
    }
  }

  /**
   * Handle Discord API errors
   * @param error - Discord API error
   * @param context - Context where error occurred
   */
  handleDiscordAPIError(error: DiscordAPIError, context: string = 'Discord API'): void {
    const errorInfo = {
      message: error.message,
      code: error.code,
      method: error.method,
      url: error.url,
      httpStatus: error.status
    };

    this.logger.error(`Discord API error in ${context}:`, errorInfo);

    // Handle specific Discord errors
    switch (error.code) {
      case 10008: // Unknown Message
        this.logger.warn('Attempted to interact with unknown message');
        break;
      case 50001: // Missing Access
        this.logger.warn('Bot is missing access to perform this action');
        break;
      case 50013: // Missing Permissions
        this.logger.warn('Bot is missing required permissions');
        break;
      case 50035: // Invalid Form Body
        this.logger.warn('Invalid data sent to Discord API');
        break;
      default:
        this.logger.error('Unhandled Discord API error code:', error.code);
    }
  }

  /**
   * Handle rate limit errors
   * @param rateLimitInfo - Rate limit information
   */
  handleRateLimit(rateLimitInfo: RateLimitInfo): void {
    this.logger.warn('Rate limit hit:', {
      timeout: rateLimitInfo.timeout,
      limit: rateLimitInfo.limit,
      method: rateLimitInfo.method,
      path: rateLimitInfo.path,
      route: rateLimitInfo.route
    });
  }

  /**
   * Create error embed for user-facing errors
   * @param title - Error title
   * @param description - Error description
   * @returns Error embed
   */
  createErrorEmbed(title: string, description: string): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle(`❌ ${title}`)
      .setDescription(description)
      .setTimestamp();
  }

  /**
   * Handle process-level errors
   * @param error - Process error
   */
  handleProcessError(error: Error): void {
    this.logger.error('Uncaught process error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  }

  /**
   * Handle unhandled promise rejections
   * @param reason - Rejection reason
   * @param promise - Rejected promise
   */
  handleUnhandledRejection(reason: unknown, promise: Promise<unknown>): void {
    this.logger.error('Unhandled promise rejection:', {
      reason: reason,
      promise: promise
    });
  }
}
