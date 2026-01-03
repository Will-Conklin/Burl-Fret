import { Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { Command } from '../types/command';

const setCommand: Command = {
    name: 'set',
    description: 'Set a member nickname.',
    async execute(message: Message, args?: string[]) {
        if (!message.guild) {
            return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('This command can only be used in a server.')] });
        }

        if (!message.member || !message.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('You need MANAGE_NICKNAMES to use this command.')] });
        }

        if (!message.guild.members.me || !message.guild.members.me.permissions.has(PermissionFlagsBits.ManageNicknames)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('I need MANAGE_NICKNAMES to change nicknames.')] });
        }

        const user = message.mentions.users.first();
        if (!user) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('You need to mention the user!')] });

        if (!args || args.length < 2) {
            return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('You need to input the nickname!')] });
        }

        const nick = args.slice(1).join(' ');
        if (!nick) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('You need to input the nickname!')] });

        let member = message.guild.members.cache.get(user.id);
        if (!member) {
            member = await message.guild.members.fetch(user.id).catch(() => null) || undefined;
        }
        if (!member) {
            return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('Could not find that user in this server.')] });
        }
        if (!member.manageable) {
            return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('I cannot change that user\'s nickname.')] });
        }

        return member
            .setNickname(nick)
            .then(() => message.reply({ embeds: [new EmbedBuilder().setColor('Green').setDescription(`Successfully changed **${user.tag}** nickname to **${nick}**`)] }))
            .catch(err => message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription(`Error: ${err}`)] }));
    },
};

export = setCommand;
