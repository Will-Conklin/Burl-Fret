import * as fs from 'fs';
import { Client, Collection, Message } from 'discord.js';
import { Command } from './types/command';
import { Config } from './types/config';

let config: Config;
try {
    config = require('./config.json');
} catch {
    console.error('Missing config.json. Copy config.example.json to config.json and fill in your bot token.');
    process.exit(1);
}

const { prefix, token } = config;

const client = new Client({
    ws: {
        intents: ['GUILDS', 'GUILD_MESSAGES'],
    },
}) as Client & { commands: Collection<string, Command> };

client.commands = new Collection<string, Command>();

const commandsPath = './commands';
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

    for (const file of commandFiles) {
        const command: Command = require(`./commands/${file}`);
        client.commands.set(command.name, command);
    }
} else {
    console.warn('commands/ directory not found; skipping command load.');
}

client.once('ready', () => {
    console.log('Ready!');
});

client.on('message', async (message: Message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift()?.toLowerCase();
    if (!commandName) return;

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        await command.execute(message, args);
    } catch (err) {
        console.error(`Command failed: ${commandName}`, err);
        message.channel.send({embed: {color: 'RED', description: 'Something went wrong while running that command.'}});
    }
});

client.login(token);
