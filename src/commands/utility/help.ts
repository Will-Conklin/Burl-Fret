import { Message, EmbedBuilder, Collection } from 'discord.js';
import { BotCommand } from '../../shared/utils/commandLoader';

/**
 * Help command - Displays list of available commands
 */
const helpCommand: BotCommand = {
  name: 'help',
  description: 'Display a list of all available commands or info about a specific command',
  aliases: ['commands', 'h'],
  cooldown: 5, // 5 second cooldown

  async execute(message: Message, args: string[]): Promise<void> {
    try {
      const commands = (message.client as any).commands as Collection<string, BotCommand> | undefined;
      if (!commands) {
        await message.reply('No commands are currently available.');
        return;
      }

      // If a specific command is requested
      if (args.length > 0) {
        const commandName = args[0].toLowerCase();
        const command = commands.get(commandName);

        if (!command) {
          await message.reply(`❌ Command \`${commandName}\` not found!`);
          return;
        }

        // Create detailed embed for specific command
        const embed = new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle(`📖 Command: ${command.name}`)
          .setDescription(command.description)
          .setTimestamp();

        if (command.aliases && command.aliases.length > 0) {
          embed.addFields({
            name: 'Aliases',
            value: command.aliases.map((alias: string) => `\`${alias}\``).join(', '),
            inline: false
          });
        }

        if (command.permissions && command.permissions.length > 0) {
          embed.addFields({
            name: 'Required Permissions',
            value: command.permissions.map((perm: string) => `\`${perm}\``).join(', '),
            inline: false
          });
        }

        if (command.cooldown) {
          embed.addFields({
            name: 'Cooldown',
            value: `${command.cooldown} seconds`,
            inline: true
          });
        }

        if (command.category) {
          embed.addFields({
            name: 'Category',
            value: command.category,
            inline: true
          });
        }

        await message.reply({ embeds: [embed] });
        return;
      }

      // Get all unique commands (exclude aliases)
      const uniqueCommands = new Map<string, BotCommand>();
      commands.forEach((command: BotCommand, key: string) => {
        if (command.name === key) {
          uniqueCommands.set(key, command);
        }
      });

      // Group commands by category
      const categories = new Map<string, BotCommand[]>();
      uniqueCommands.forEach((command) => {
        const category = command.category || 'Uncategorized';
        if (!categories.has(category)) {
          categories.set(category, []);
        }
        categories.get(category)?.push(command);
      });

      // Create help embed
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('📖 Command List')
        .setDescription(`Use \`help <command>\` for more info about a specific command.\n\u200b`)
        .setTimestamp();

      // Add fields for each category
      categories.forEach((cmds, categoryName) => {
        const commandList = cmds
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(cmd => {
            const aliasInfo = cmd.aliases && cmd.aliases.length > 0
              ? ` (${cmd.aliases.join(', ')})`
              : '';
            return `\`${cmd.name}\`${aliasInfo} - ${cmd.description}`;
          })
          .join('\n');

        embed.addFields({
          name: `${categoryName}`,
          value: commandList || 'No commands',
          inline: false
        });
      });

      // Add footer with stats
      const totalCommands = uniqueCommands.size;
      const totalAliases = commands.size - uniqueCommands.size;
      embed.setFooter({
        text: `Total: ${totalCommands} command${totalCommands !== 1 ? 's' : ''}, ${totalAliases} alias${totalAliases !== 1 ? 'es' : ''}`
      });

      await message.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Help command error:', error);
      await message.reply('❌ Failed to display help information!').catch(() => {
        // Ignore errors when sending error message
      });
    }
  }
};

export = helpCommand;
