import { Message, PermissionFlagsBits } from 'discord.js';
import { BotCommand } from '../../shared/utils/commandLoader';
import { createSuccessEmbed, createErrorEmbed } from '../../shared/utils/embedBuilder';
import { createLogger } from '../../shared/utils/logger';

const logger = createLogger('commands');

/**
 * Set command - Changes a user's nickname
 * Migrated from legacy code to discord.js v14
 */
const setCommand: BotCommand = {
  name: 'set',
  description: 'Change a user\'s nickname',
  aliases: ['setnick', 'nickname'],
  permissions: ['ManageNicknames'],

  async execute(message: Message, args: string[]): Promise<void> {
    try {
      // Check if command is used in a guild
      if (!message.guild) {
        await message.reply({
          embeds: [createErrorEmbed('This command can only be used in a server!')]
        });
        return;
      }

      // Check bot permissions
      const botMember = message.guild.members.me;
      if (!botMember || !botMember.permissions.has(PermissionFlagsBits.ManageNicknames)) {
        await message.reply({
          embeds: [createErrorEmbed('I don\'t have permission to manage nicknames!')]
        });
        return;
      }

      // Get mentioned user
      const target = message.mentions.members?.first();
      if (!target) {
        await message.reply({
          embeds: [createErrorEmbed('You need to mention a user!\n\nUsage: `set @user <new nickname>`')]
        });
        return;
      }

      // Get new nickname from remaining arguments
      const nickname = args.slice(1).join(' ');
      if (!nickname) {
        await message.reply({
          embeds: [createErrorEmbed('You need to provide a new nickname!\n\nUsage: `set @user <new nickname>`')]
        });
        return;
      }

      // Check if nickname is too long (Discord limit is 32 characters)
      if (nickname.length > 32) {
        await message.reply({
          embeds: [createErrorEmbed('Nickname must be 32 characters or less!')]
        });
        return;
      }

      // Check if the target is the server owner
      if (target.id === message.guild.ownerId) {
        await message.reply({
          embeds: [createErrorEmbed('I cannot change the server owner\'s nickname!')]
        });
        return;
      }

      // Check role hierarchy - bot's highest role must be higher than target's
      if (botMember.roles.highest.position <= target.roles.highest.position) {
        await message.reply({
          embeds: [createErrorEmbed('I cannot change the nickname of someone with a higher or equal role!')]
        });
        return;
      }

      // Attempt to change nickname
      await target.setNickname(nickname);

      // Send success message
      await message.reply({
        embeds: [createSuccessEmbed(`Successfully changed **${target.user.tag}**'s nickname to **${nickname}**`)]
      });

    } catch (error) {
      logger.error('Set command error:', {
        error: error,
        user: message.author.tag,
        guild: message.guild?.name
      });
      await message.reply({
        embeds: [createErrorEmbed('Failed to change nickname. Please make sure I have the proper permissions and the user\'s role is lower than mine!')]
      }).catch(() => {
        // Ignore errors when sending error message
      });
    }
  }
};

export = setCommand;
