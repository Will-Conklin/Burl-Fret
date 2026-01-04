const { EmbedBuilder } = require('discord.js');

/**
 * Error handler utility for Discord bots
 */
class ErrorHandler {
  constructor(logger) {
    this.logger = logger;
  }

  /**
   * Handle general errors
   * @param {Error} error - The error to handle
   * @param {string} context - Context where error occurred
   */
  handleError(error, context = 'Unknown') {
    this.logger.error(`Error in ${context}:`, {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  }

  /**
   * Handle command errors and optionally reply to user
   * @param {Error} error - The error to handle
   * @param {Message} message - Discord message object
   * @param {string} commandName - Name of the command
   */
  async handleCommandError(error, message, commandName) {
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
        message: replyError.message
      });
    }
  }

  /**
   * Handle Discord API errors
   * @param {Error} error - Discord API error
   * @param {string} context - Context where error occurred
   */
  handleDiscordAPIError(error, context = 'Discord API') {
    const errorInfo = {
      message: error.message,
      code: error.code,
      method: error.method,
      path: error.path,
      httpStatus: error.httpStatus
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
   * @param {Object} rateLimitInfo - Rate limit information
   */
  handleRateLimit(rateLimitInfo) {
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
   * @param {string} title - Error title
   * @param {string} description - Error description
   * @returns {EmbedBuilder} Error embed
   */
  createErrorEmbed(title, description) {
    return new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle(`❌ ${title}`)
      .setDescription(description)
      .setTimestamp();
  }

  /**
   * Handle process-level errors
   * @param {Error} error - Process error
   */
  handleProcessError(error) {
    this.logger.error('Uncaught process error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  }

  /**
   * Handle unhandled promise rejections
   * @param {*} reason - Rejection reason
   * @param {Promise} promise - Rejected promise
   */
  handleUnhandledRejection(reason, promise) {
    this.logger.error('Unhandled promise rejection:', {
      reason: reason,
      promise: promise
    });
  }
}

module.exports = ErrorHandler;
