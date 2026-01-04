const { EmbedBuilder } = require('discord.js');

/**
 * Utility class for building consistent Discord embeds
 */
class EmbedHelper {
  /**
   * Create a success embed
   * @param {string} title - Embed title
   * @param {string} description - Embed description
   * @param {Object} options - Additional embed options
   * @returns {EmbedBuilder} Success embed
   */
  static success(title, description, options = {}) {
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
   * @param {string} title - Embed title
   * @param {string} description - Embed description
   * @param {Object} options - Additional embed options
   * @returns {EmbedBuilder} Error embed
   */
  static error(title, description, options = {}) {
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
   * @param {string} title - Embed title
   * @param {string} description - Embed description
   * @param {Object} options - Additional embed options
   * @returns {EmbedBuilder} Info embed
   */
  static info(title, description, options = {}) {
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
   * @param {string} title - Embed title
   * @param {string} description - Embed description
   * @param {Object} options - Additional embed options
   * @returns {EmbedBuilder} Warning embed
   */
  static warning(title, description, options = {}) {
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
   * @param {string} title - Embed title
   * @param {string} description - Embed description
   * @param {number} color - Hex color code
   * @param {Object} options - Additional embed options
   * @returns {EmbedBuilder} Custom embed
   */
  static custom(title, description, color, options = {}) {
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
   * @param {Array} commands - Array of command objects
   * @param {string} prefix - Bot command prefix
   * @returns {EmbedBuilder} Help embed
   */
  static help(commands, prefix) {
    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('📚 Command List')
      .setDescription(`Use \`${prefix}\` before each command`)
      .setTimestamp();

    // Group commands by category
    const categories = {};
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
   * @param {Client} client - Discord client
   * @param {string} botName - Name of the bot
   * @returns {EmbedBuilder} Status embed
   */
  static status(client, botName) {
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
        { name: 'Node.js', value: process.version, inline: true },
        { name: 'Discord.js', value: require('discord.js').version, inline: true }
      )
      .setTimestamp();
  }
}

module.exports = EmbedHelper;
