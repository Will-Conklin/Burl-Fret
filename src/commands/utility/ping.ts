import { Message, EmbedBuilder } from 'discord.js';
import { BotCommand } from '../../shared/utils/commandLoader';
import { createLogger } from '../../shared/utils/logger';

const logger = createLogger('commands');

/**
 * Ping command - Shows bot latency and API response time
 */
const pingCommand: BotCommand = {
  name: 'ping',
  description: 'Check the bot\'s latency and API response time',
  aliases: ['latency', 'pong'],
  cooldown: 3, // 3 second cooldown

  async execute(message: Message, _args: string[]): Promise<void> {
    try {
      // Send initial message to measure round-trip time
      const sent = await message.reply('🏓 Pinging...');

      // Calculate latencies
      const roundTripLatency = sent.createdTimestamp - message.createdTimestamp;
      const apiLatency = Math.round(message.client.ws.ping);

      // Determine latency quality
      const getLatencyQuality = (latency: number): string => {
        if (latency < 100) return '🟢 Excellent';
        if (latency < 200) return '🟡 Good';
        if (latency < 400) return '🟠 Fair';
        return '🔴 Poor';
      };

      // Create embed with latency information
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🏓 Pong!')
        .addFields(
          {
            name: 'Round Trip Latency',
            value: `${roundTripLatency}ms\n${getLatencyQuality(roundTripLatency)}`,
            inline: true
          },
          {
            name: 'WebSocket Latency',
            value: `${apiLatency}ms\n${getLatencyQuality(apiLatency)}`,
            inline: true
          }
        )
        .setFooter({ text: 'Lower is better' })
        .setTimestamp();

      // Edit the initial message with the latency information
      await sent.edit({
        content: '',
        embeds: [embed]
      });

    } catch (error) {
      logger.error('Ping command error:', {
        error: error,
        user: message.author.tag,
        guild: message.guild?.name
      });
      await message.reply('❌ Failed to calculate latency!').catch(() => {
        // Ignore errors when sending error message
      });
    }
  }
};

export = pingCommand;
