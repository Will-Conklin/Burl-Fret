const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

/**
 * Command loader utility
 */
class CommandLoader {
  constructor(logger) {
    this.logger = logger;
  }

  /**
   * Load all commands from the commands directory
   * @param {string} commandsPath - Path to commands directory
   * @returns {Collection} Collection of commands
   */
  loadCommands(commandsPath = path.join(process.cwd(), 'src', 'commands')) {
    const commands = new Collection();
    let loadedCount = 0;
    let errorCount = 0;

    this.logger.info(`Loading commands from: ${commandsPath}`);

    try {
      // Check if commands directory exists
      if (!fs.existsSync(commandsPath)) {
        this.logger.warn(`Commands directory does not exist: ${commandsPath}`);
        return commands;
      }

      // Read all category directories
      const categories = fs.readdirSync(commandsPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      this.logger.info(`Found ${categories.length} command categories: ${categories.join(', ')}`);

      // Load commands from each category
      for (const category of categories) {
        const categoryPath = path.join(commandsPath, category);
        const commandFiles = fs.readdirSync(categoryPath)
          .filter(file => file.endsWith('.js'));

        this.logger.info(`Loading ${commandFiles.length} commands from ${category} category`);

        for (const file of commandFiles) {
          try {
            const filePath = path.join(categoryPath, file);
            const command = require(filePath);

            // Validate command structure
            if (!this.validateCommand(command, file)) {
              errorCount++;
              continue;
            }

            // Add category to command
            command.category = category.charAt(0).toUpperCase() + category.slice(1);

            // Add to collection
            commands.set(command.name, command);
            loadedCount++;

            this.logger.debug(`Loaded command: ${command.name} from ${category}/${file}`);

            // Load aliases if they exist
            if (command.aliases && Array.isArray(command.aliases)) {
              command.aliases.forEach(alias => {
                commands.set(alias, command);
                this.logger.debug(`Registered alias: ${alias} -> ${command.name}`);
              });
            }
          } catch (error) {
            errorCount++;
            this.logger.error(`Failed to load command ${file}:`, {
              message: error.message,
              stack: error.stack
            });
          }
        }
      }

      this.logger.info(`Command loading complete: ${loadedCount} commands loaded, ${errorCount} errors`);
    } catch (error) {
      this.logger.error('Error loading commands:', {
        message: error.message,
        stack: error.stack
      });
    }

    return commands;
  }

  /**
   * Validate command structure
   * @param {Object} command - Command object to validate
   * @param {string} fileName - Name of the command file
   * @returns {boolean} True if valid, false otherwise
   */
  validateCommand(command, fileName) {
    // Check if command has required properties
    if (!command.name) {
      this.logger.error(`Command ${fileName} is missing 'name' property`);
      return false;
    }

    if (!command.description) {
      this.logger.error(`Command ${fileName} is missing 'description' property`);
      return false;
    }

    if (typeof command.execute !== 'function') {
      this.logger.error(`Command ${fileName} is missing 'execute' function`);
      return false;
    }

    // Validate optional properties
    if (command.aliases && !Array.isArray(command.aliases)) {
      this.logger.warn(`Command ${fileName} has invalid 'aliases' property (must be array)`);
    }

    if (command.permissions && !Array.isArray(command.permissions)) {
      this.logger.warn(`Command ${fileName} has invalid 'permissions' property (must be array)`);
    }

    if (command.cooldown && typeof command.cooldown !== 'number') {
      this.logger.warn(`Command ${fileName} has invalid 'cooldown' property (must be number)`);
    }

    return true;
  }

  /**
   * Reload a specific command
   * @param {Collection} commands - Commands collection
   * @param {string} commandName - Name of command to reload
   * @param {string} commandsPath - Path to commands directory
   * @returns {boolean} True if successful, false otherwise
   */
  reloadCommand(commands, commandName, commandsPath = path.join(process.cwd(), 'src', 'commands')) {
    try {
      // Find the command in the collection
      const command = commands.get(commandName);
      if (!command) {
        this.logger.error(`Command ${commandName} not found`);
        return false;
      }

      // Find the command file
      const categories = fs.readdirSync(commandsPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const category of categories) {
        const categoryPath = path.join(commandsPath, category);
        const commandFiles = fs.readdirSync(categoryPath)
          .filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
          const filePath = path.join(categoryPath, file);
          const testCommand = require(filePath);

          if (testCommand.name === commandName) {
            // Delete from require cache
            delete require.cache[require.resolve(filePath)];

            // Reload the command
            const newCommand = require(filePath);
            newCommand.category = category.charAt(0).toUpperCase() + category.slice(1);

            // Update collection
            commands.set(newCommand.name, newCommand);

            this.logger.info(`Reloaded command: ${commandName}`);
            return true;
          }
        }
      }

      this.logger.error(`Could not find file for command: ${commandName}`);
      return false;
    } catch (error) {
      this.logger.error(`Failed to reload command ${commandName}:`, {
        message: error.message,
        stack: error.stack
      });
      return false;
    }
  }

  /**
   * Get command statistics
   * @param {Collection} commands - Commands collection
   * @returns {Object} Statistics object
   */
  getStats(commands) {
    const stats = {
      total: 0,
      categories: {},
      aliases: 0
    };

    const uniqueCommands = new Set();

    commands.forEach((command, key) => {
      // Count unique commands only
      if (!uniqueCommands.has(command.name)) {
        uniqueCommands.add(command.name);
        stats.total++;

        // Count by category
        const category = command.category || 'Uncategorized';
        stats.categories[category] = (stats.categories[category] || 0) + 1;
      } else if (key !== command.name) {
        // This is an alias
        stats.aliases++;
      }
    });

    return stats;
  }
}

module.exports = CommandLoader;
