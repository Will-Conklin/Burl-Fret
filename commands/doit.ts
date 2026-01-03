import { Message } from 'discord.js';
import { Command } from '../types/command';

const doitCommand: Command = {
    name: 'doit',
    description: 'Send the Burl Fret link.',
    execute(message: Message) {
        return message.channel.send('Do it for Burl Fret https://cdn.discordapp.com/attachments/764971562205184002/767324313987579914/video0.mov');
    },
};

export = doitCommand;
