const fs = require('fs');
const Discord = require('discord.js');

let config;
try {
    config = require('./config.json');
} catch (err) {
    console.error('Missing config.json. Copy config.example.json to config.json and fill in your bot token.');
    process.exit(1);
}

const { prefix, token } = config;

const client = new Discord.Client({
    ws: {
        intents: ['GUILDS', 'GUILD_MESSAGES'],
    },
});
client.commands = new Discord.Collection();

const commandsPath = './commands';
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        client.commands.set(command.name, command);
    }
} else {
    console.warn('commands/ directory not found; skipping command load.');
}

client.once('ready', () => {
    console.log('Ready!');
});
client.on('message', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();
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
