import { EmbedBuilder, Client, EmbedAuthorOptions, EmbedFooterOptions, APIEmbedField } from 'discord.js';

interface EmbedOptions {
  fields?: APIEmbedField[];
  footer?: EmbedFooterOptions;
  thumbnail?: string;
  image?: string;
  author?: EmbedAuthorOptions;
}

interface Command {
  name: string;
  description: string;
  category?: string;
}

/**
 * Utility class for building consistent Discord embeds
 */
export class EmbedHelper {
  /**
   * Create a success embed
   * @param title - Embed title
   * @param description - Embed description
   * @param options - Additional embed options
   * @returns Success embed
   */
  static success(title: string, description: string, options: EmbedOptions = {}): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle(`✅ ${title}`)
      .setDescription(description)
      .setTimestamp();

    if (options.fields) {
      embed.addFields(options.fields);
    }

    if (options.footer) {
      embed.setFooter(options.footer);
    }

    if (options.thumbnail) {
      embed.setThumbnail(options.thumbnail);
    }

    if (options.image) {
      embed.setImage(options.image);
    }

    return embed;
  }

  /**
   * Create an error embed
   * @param title - Embed title
   * @param description - Embed description
   * @param options - Additional embed options
   * @returns Error embed
   */
  static error(title: string, description: string, options: EmbedOptions = {}): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle(`❌ ${title}`)
      .setDescription(description)
      .setTimestamp();

    if (options.fields) {
      embed.addFields(options.fields);
    }

    if (options.footer) {
      embed.setFooter(options.footer);
    }

    return embed;
  }

  /**
   * Create an info embed
   * @param title - Embed title
   * @param description - Embed description
   * @param options - Additional embed options
   * @returns Info embed
   */
  static info(title: string, description: string, options: EmbedOptions = {}): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle(`ℹ️ ${title}`)
      .setDescription(description)
      .setTimestamp();

    if (options.fields) {
      embed.addFields(options.fields);
    }

    if (options.footer) {
      embed.setFooter(options.footer);
    }

    if (options.thumbnail) {
      embed.setThumbnail(options.thumbnail);
    }

    if (options.image) {
      embed.setImage(options.image);
    }

    return embed;
  }

  /**
   * Create a warning embed
   * @param title - Embed title
   * @param description - Embed description
   * @param options - Additional embed options
   * @returns Warning embed
   */
  static warning(title: string, description: string, options: EmbedOptions = {}): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(0xFFFF00)
      .setTitle(`⚠️ ${title}`)
      .setDescription(description)
      .setTimestamp();

    if (options.fields) {
      embed.addFields(options.fields);
    }

    if (options.footer) {
      embed.setFooter(options.footer);
    }

    return embed;
  }

  /**
   * Create a custom embed with specified color
   * @param title - Embed title
   * @param description - Embed description
   * @param color - Hex color code
   * @param options - Additional embed options
   * @returns Custom embed
   */
  static custom(title: string, description: string, color: number, options: EmbedOptions = {}): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(title)
      .setDescription(description)
      .setTimestamp();

    if (options.fields) {
      embed.addFields(options.fields);
    }

    if (options.footer) {
      embed.setFooter(options.footer);
    }

    if (options.thumbnail) {
      embed.setThumbnail(options.thumbnail);
    }

    if (options.image) {
      embed.setImage(options.image);
    }

    if (options.author) {
      embed.setAuthor(options.author);
    }

    return embed;
  }

  /**
   * Create a help command embed
   * @param commands - Array of command objects
   * @param prefix - Bot command prefix
   * @returns Help embed
   */
  static help(commands: Command[], prefix: string): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('📚 Command List')
      .setDescription(`Use \`${prefix}\` before each command`)
      .setTimestamp();

    // Group commands by category
    const categories: Record<string, Command[]> = {};
    commands.forEach(cmd => {
      const category = cmd.category || 'General';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(cmd);
    });

    // Add fields for each category
    Object.keys(categories).forEach(category => {
      const commandList = categories[category]
        .map(cmd => `\`${prefix}${cmd.name}\` - ${cmd.description}`)
        .join('\n');

      embed.addFields({
        name: category,
        value: commandList || 'No commands',
        inline: false
      });
    });

    return embed;
  }

  /**
   * Create a bot status embed
   * @param client - Discord client
   * @param botName - Name of the bot
   * @returns Status embed
   */
  static status(client: Client, botName: string): EmbedBuilder {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    return new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle(`🤖 ${botName} Status`)
      .addFields(
        { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
        { name: 'Users', value: `${client.users.cache.size}`, inline: true },
        { name: 'Uptime', value: `${hours}h ${minutes}m ${seconds}s`, inline: true },
        { name: 'Ping', value: `${client.ws.ping}ms`, inline: true },
        { name: 'Node.js', value: process.version, inline: true }
      )
      .setTimestamp();
  }
}
