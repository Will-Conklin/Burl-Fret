import fs from 'fs';
import path from 'path';
import { Collection, Message } from 'discord.js';
import type { Logger } from 'winston';

export interface BotCommand {
  name: string;
  description: string;
  category?: string;
  aliases?: string[];
  permissions?: string[];
  cooldown?: number;
  execute: (message: Message, args: string[]) => Promise<void> | void;
}

interface CommandStats {
  total: number;
  categories: Record<string, number>;
  aliases: number;
}

/**
 * Command loader utility
 */
export class CommandLoader {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Load all commands from the commands directory
   * @param commandsPath - Path to commands directory
   * @returns Collection of commands
   */
  loadCommands(commandsPath: string = path.join(process.cwd(), 'src', 'commands')): Collection<string, BotCommand> {
    const commands = new Collection<string, BotCommand>();
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
        .filter((dirent: any) => dirent.isDirectory())
        .map((dirent: any) => dirent.name);

      this.logger.info(`Found ${categories.length} command categories: ${categories.join(', ')}`);

      // Load commands from each category
      for (const category of categories) {
        const categoryPath = path.join(commandsPath, category);
        const commandFiles = fs.readdirSync(categoryPath)
          .filter((file: any) => file.endsWith('.js') || file.endsWith('.ts'));

        this.logger.info(`Loading ${commandFiles.length} commands from ${category} category`);

        for (const file of commandFiles) {
          try {
            const filePath = path.join(categoryPath, file);
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const command: BotCommand = require(filePath);

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
              message: (error as Error).message,
              stack: (error as Error).stack
            });
          }
        }
      }

      this.logger.info(`Command loading complete: ${loadedCount} commands loaded, ${errorCount} errors`);
    } catch (error) {
      this.logger.error('Error loading commands:', {
        message: (error as Error).message,
        stack: (error as Error).stack
      });
    }

    return commands;
  }

  /**
   * Validate command structure
   * @param command - Command object to validate
   * @param fileName - Name of the command file
   * @returns True if valid, false otherwise
   */
  private validateCommand(command: BotCommand, fileName: string): boolean {
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
   * @param commands - Commands collection
   * @param commandName - Name of command to reload
   * @param commandsPath - Path to commands directory
   * @returns True if successful, false otherwise
   */
  reloadCommand(
    commands: Collection<string, BotCommand>,
    commandName: string,
    commandsPath: string = path.join(process.cwd(), 'src', 'commands')
  ): boolean {
    try {
      // Find the command in the collection
      const command = commands.get(commandName);
      if (!command) {
        this.logger.error(`Command ${commandName} not found`);
        return false;
      }

      // Find the command file
      const categories = fs.readdirSync(commandsPath, { withFileTypes: true })
        .filter((dirent: any) => dirent.isDirectory())
        .map((dirent: any) => dirent.name);

      for (const category of categories) {
        const categoryPath = path.join(commandsPath, category);
        const commandFiles = fs.readdirSync(categoryPath)
          .filter((file: any) => file.endsWith('.js') || file.endsWith('.ts'));

        for (const file of commandFiles) {
          const filePath = path.join(categoryPath, file);
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const testCommand: BotCommand = require(filePath);

          if (testCommand.name === commandName) {
            // Delete from require cache
            delete require.cache[require.resolve(filePath)];

            // Reload the command
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const newCommand: BotCommand = require(filePath);
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
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      return false;
    }
  }

  /**
   * Get command statistics
   * @param commands - Commands collection
   * @returns Statistics object
   */
  getStats(commands: Collection<string, BotCommand>): CommandStats {
    const stats: CommandStats = {
      total: 0,
      categories: {},
      aliases: 0
    };

    const uniqueCommands = new Set<string>();

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
