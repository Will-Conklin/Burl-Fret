module.exports = {
    name: 'set',
    description: 'Set a member nickname.',
    async execute(message, args) {
        if (!message.guild) {
            return message.channel.send({embed: {color: 'RED', description: 'This command can only be used in a server.'}});
        }

        if (!message.member || !message.member.hasPermission('MANAGE_NICKNAMES')) {
            return message.channel.send({embed: {color: 'RED', description: 'You need MANAGE_NICKNAMES to use this command.'}});
        }

        if (!message.guild.me || !message.guild.me.hasPermission('MANAGE_NICKNAMES')) {
            return message.channel.send({embed: {color: 'RED', description: 'I need MANAGE_NICKNAMES to change nicknames.'}});
        }

        const user = message.mentions.users.first(); // You can mention someone, not only just user.
        if (!user) return message.channel.send({embed: {color: 'RED', description: 'You need to mention the user!'}});

        const nick = args.slice(1).join(' ');
        if (!nick) return message.channel.send({embed: {color: 'RED', description: 'You need to input the nickname!'}});

        let member = message.guild.members.cache.get(user.id);
        if (!member) {
            member = await message.guild.members.fetch(user.id).catch(() => null);
        }
        if (!member) {
            return message.channel.send({embed: {color: 'RED', description: 'Could not find that user in this server.'}});
        }
        if (!member.manageable) {
            return message.channel.send({embed: {color: 'RED', description: 'I cannot change that user\'s nickname.'}});
        }

        return member
            .setNickname(nick)
            .then(() => message.channel.send({embed: {color: 'GREEN', description: `Successfully changed **${user.tag}** nickname to **${nick}**`}}))
            .catch(err => message.channel.send({embed: {color: 'RED', description: `Error: ${err}`}}));
    },
};
