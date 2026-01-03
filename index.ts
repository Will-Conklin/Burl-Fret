import * as fs from 'fs';
import { Client, Collection, GatewayIntentBits, Events } from 'discord.js';
import * as dotenv from 'dotenv';
import { Command } from './types/command';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

const prefix = process.env.COMMAND_PREFIX || '!';
const token = process.env.DISCORD_TOKEN;

if (!token) {
    logger.error('Missing DISCORD_TOKEN environment variable. Please create a .env file based on .env.example');
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
}) as Client & { commands: Collection<string, Command> };

client.commands = new Collection<string, Command>();

const commandsPath = './commands';
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

    for (const file of commandFiles) {
        const command: Command = require(`./commands/${file}`);
        client.commands.set(command.name, command);
        logger.info(`Loaded command: ${command.name}`);
    }
} else {
    logger.warn('commands/ directory not found; skipping command load.');
}

client.once(Events.ClientReady, (readyClient) => {
    logger.info(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift()?.toLowerCase();
    if (!commandName) return;

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        await command.execute(message, args);
        logger.info(`Command executed: ${commandName} by ${message.author.tag}`);
    } catch (err) {
        logger.error(`Command failed: ${commandName}`, err);
        message.reply('Something went wrong while running that command.');
    }
});

client.login(token);
