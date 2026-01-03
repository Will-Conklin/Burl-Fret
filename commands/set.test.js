const setCommand = require('./set');

describe('set command', () => {
    let mockMessage;
    let mockChannel;
    let mockGuild;
    let mockMember;
    let mockUser;
    let mockGuildMe;
    let mockTargetMember;

    beforeEach(() => {
        mockChannel = {
            send: jest.fn().mockResolvedValue({}),
        };

        mockUser = {
            id: '123456789',
            tag: 'TestUser#1234',
        };

        mockTargetMember = {
            manageable: true,
            setNickname: jest.fn().mockResolvedValue({}),
        };

        mockGuildMe = {
            hasPermission: jest.fn().mockReturnValue(true),
        };

        mockMember = {
            hasPermission: jest.fn().mockReturnValue(true),
        };

        mockGuild = {
            me: mockGuildMe,
            members: {
                cache: {
                    get: jest.fn().mockReturnValue(mockTargetMember),
                },
                fetch: jest.fn().mockResolvedValue(mockTargetMember),
            },
        };

        mockMessage = {
            channel: mockChannel,
            guild: mockGuild,
            member: mockMember,
            mentions: {
                users: {
                    first: jest.fn().mockReturnValue(mockUser),
                },
            },
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should have correct name', () => {
        expect(setCommand.name).toBe('set');
    });

    test('should have a description', () => {
        expect(setCommand.description).toBeDefined();
        expect(typeof setCommand.description).toBe('string');
    });

    test('should reject command in DMs (no guild)', async () => {
        mockMessage.guild = null;

        await setCommand.execute(mockMessage, []);

        expect(mockChannel.send).toHaveBeenCalledWith({
            embed: {
                color: 'RED',
                description: 'This command can only be used in a server.',
            },
        });
    });

    test('should reject if user lacks MANAGE_NICKNAMES permission', async () => {
        mockMember.hasPermission.mockReturnValue(false);

        await setCommand.execute(mockMessage, []);

        expect(mockChannel.send).toHaveBeenCalledWith({
            embed: {
                color: 'RED',
                description: 'You need MANAGE_NICKNAMES to use this command.',
            },
        });
    });

    test('should reject if bot lacks MANAGE_NICKNAMES permission', async () => {
        mockGuildMe.hasPermission.mockReturnValue(false);

        await setCommand.execute(mockMessage, []);

        expect(mockChannel.send).toHaveBeenCalledWith({
            embed: {
                color: 'RED',
                description: 'I need MANAGE_NICKNAMES to change nicknames.',
            },
        });
    });

    test('should reject if no user is mentioned', async () => {
        mockMessage.mentions.users.first.mockReturnValue(null);

        await setCommand.execute(mockMessage, []);

        expect(mockChannel.send).toHaveBeenCalledWith({
            embed: {
                color: 'RED',
                description: 'You need to mention the user!',
            },
        });
    });

    test('should reject if no nickname is provided', async () => {
        await setCommand.execute(mockMessage, ['@user']);

        expect(mockChannel.send).toHaveBeenCalledWith({
            embed: {
                color: 'RED',
                description: 'You need to input the nickname!',
            },
        });
    });

    test('should reject if member is not in server', async () => {
        mockGuild.members.cache.get.mockReturnValue(null);
        mockGuild.members.fetch.mockRejectedValue(new Error('Not found'));

        await setCommand.execute(mockMessage, ['@user', 'NewNick']);

        expect(mockChannel.send).toHaveBeenCalledWith({
            embed: {
                color: 'RED',
                description: 'Could not find that user in this server.',
            },
        });
    });

    test('should reject if member is not manageable', async () => {
        mockTargetMember.manageable = false;

        await setCommand.execute(mockMessage, ['@user', 'NewNick']);

        expect(mockChannel.send).toHaveBeenCalledWith({
            embed: {
                color: 'RED',
                description: 'I cannot change that user\'s nickname.',
            },
        });
    });

    test('should successfully set nickname with single word', async () => {
        await setCommand.execute(mockMessage, ['@user', 'NewNick']);

        expect(mockTargetMember.setNickname).toHaveBeenCalledWith('NewNick');
        expect(mockChannel.send).toHaveBeenCalledWith({
            embed: {
                color: 'GREEN',
                description: 'Successfully changed **TestUser#1234** nickname to **NewNick**',
            },
        });
    });

    test('should successfully set nickname with multiple words', async () => {
        await setCommand.execute(mockMessage, ['@user', 'New', 'Nick', 'Name']);

        expect(mockTargetMember.setNickname).toHaveBeenCalledWith('New Nick Name');
        expect(mockChannel.send).toHaveBeenCalledWith({
            embed: {
                color: 'GREEN',
                description: 'Successfully changed **TestUser#1234** nickname to **New Nick Name**',
            },
        });
    });

    test('should fetch member if not in cache', async () => {
        mockGuild.members.cache.get.mockReturnValue(null);
        mockGuild.members.fetch.mockResolvedValue(mockTargetMember);

        await setCommand.execute(mockMessage, ['@user', 'NewNick']);

        expect(mockGuild.members.fetch).toHaveBeenCalledWith('123456789');
        expect(mockTargetMember.setNickname).toHaveBeenCalledWith('NewNick');
    });

    test('should handle setNickname errors', async () => {
        const error = new Error('Permission denied');
        mockTargetMember.setNickname.mockRejectedValue(error);

        await setCommand.execute(mockMessage, ['@user', 'NewNick']);

        expect(mockChannel.send).toHaveBeenCalledWith({
            embed: {
                color: 'RED',
                description: 'Error: Error: Permission denied',
            },
        });
    });
});
