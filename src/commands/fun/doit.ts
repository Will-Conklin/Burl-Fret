import { Message, EmbedBuilder } from 'discord.js';
import { BotCommand } from '../../shared/utils/commandLoader';
import { createLogger } from '../../shared/utils/logger';

const logger = createLogger('commands');

/**
 * Do it command - Sends the classic "Do it for Burl Fret" message
 * Migrated from legacy code to discord.js v14
 */
const doitCommand: BotCommand = {
  name: 'doit',
  description: 'Do it for Burl Fret!',
  aliases: ['doitforburl', 'burl'],
  cooldown: 5, // 5 second cooldown to prevent spam

  async execute(message: Message, _args: string[]): Promise<void> {
    try {
      // Create embed with the classic message
      const embed = new EmbedBuilder()
        .setColor('#57F287') // Discord green
        .setTitle('🎸 Do it for Burl Fret! 🎸')
        .setDescription('*Do it for her...*')
        .setImage('https://cdn.discordapp.com/attachments/764971562205184002/767324313987579914/video0.mov')
        .setFooter({ text: 'Remember why you started' })
        .setTimestamp();

      // Send the embed
      if (message.channel && 'send' in message.channel) {
        await message.channel.send({ embeds: [embed] });
      }

      // Optionally react to the original message
      try {
        await message.react('🎸');
      } catch {
        // Ignore reaction errors (missing permissions, etc.)
      }

    } catch (error) {
      logger.error('Doit command error:', {
        error: error,
        user: message.author.tag,
        guild: message.guild?.name
      });
      // Fallback to simple text message if embed fails
      if (message.channel && 'send' in message.channel) {
        await message.channel.send('Do it for Burl Fret! https://cdn.discordapp.com/attachments/764971562205184002/767324313987579914/video0.mov')
          .catch(() => {
            // Ignore errors when sending error message
          });
      }
    }
  }
};

export = doitCommand;
