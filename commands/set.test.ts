import setCommand = require('./set');

describe('set command', () => {
    let mockMessage: any;
    let mockGuild: any;
    let mockMember: any;
    let mockUser: any;
    let mockGuildMe: any;
    let mockTargetMember: any;

    beforeEach(() => {
        mockUser = {
            id: '123456789',
            tag: 'TestUser#1234',
        };

        mockTargetMember = {
            manageable: true,
            setNickname: jest.fn().mockResolvedValue({}),
        };

        mockGuildMe = {
            permissions: {
                has: jest.fn().mockReturnValue(true),
            },
        };

        mockMember = {
            permissions: {
                has: jest.fn().mockReturnValue(true),
            },
        };

        mockGuild = {
            members: {
                me: mockGuildMe,
                cache: {
                    get: jest.fn().mockReturnValue(mockTargetMember),
                },
                fetch: jest.fn().mockResolvedValue(mockTargetMember),
            },
        };

        mockMessage = {
            reply: jest.fn().mockResolvedValue({}),
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

        expect(mockMessage.reply).toHaveBeenCalled();
        const call = mockMessage.reply.mock.calls[0][0];
        expect(call.embeds[0].data.description).toContain('server');
    });

    test('should reject if user lacks MANAGE_NICKNAMES permission', async () => {
        mockMember.permissions.has.mockReturnValue(false);

        await setCommand.execute(mockMessage, []);

        expect(mockMessage.reply).toHaveBeenCalled();
        const call = mockMessage.reply.mock.calls[0][0];
        expect(call.embeds[0].data.description).toContain('You need MANAGE_NICKNAMES');
    });

    test('should reject if bot lacks MANAGE_NICKNAMES permission', async () => {
        mockGuildMe.permissions.has.mockReturnValue(false);

        await setCommand.execute(mockMessage, []);

        expect(mockMessage.reply).toHaveBeenCalled();
        const call = mockMessage.reply.mock.calls[0][0];
        expect(call.embeds[0].data.description).toContain('I need MANAGE_NICKNAMES');
    });

    test('should reject if no user is mentioned', async () => {
        mockMessage.mentions.users.first.mockReturnValue(null);

        await setCommand.execute(mockMessage, []);

        expect(mockMessage.reply).toHaveBeenCalled();
        const call = mockMessage.reply.mock.calls[0][0];
        expect(call.embeds[0].data.description).toContain('mention the user');
    });

    test('should reject if no nickname is provided', async () => {
        await setCommand.execute(mockMessage, ['@user']);

        expect(mockMessage.reply).toHaveBeenCalled();
        const call = mockMessage.reply.mock.calls[0][0];
        expect(call.embeds[0].data.description).toContain('input the nickname');
    });

    test('should reject if member is not in server', async () => {
        mockGuild.members.cache.get.mockReturnValue(null);
        mockGuild.members.fetch.mockRejectedValue(new Error('Not found'));

        await setCommand.execute(mockMessage, ['@user', 'NewNick']);

        expect(mockMessage.reply).toHaveBeenCalled();
        const call = mockMessage.reply.mock.calls[0][0];
        expect(call.embeds[0].data.description).toContain('Could not find that user');
    });

    test('should reject if member is not manageable', async () => {
        mockTargetMember.manageable = false;

        await setCommand.execute(mockMessage, ['@user', 'NewNick']);

        expect(mockMessage.reply).toHaveBeenCalled();
        const call = mockMessage.reply.mock.calls[0][0];
        expect(call.embeds[0].data.description).toContain('cannot change');
    });

    test('should successfully set nickname with single word', async () => {
        await setCommand.execute(mockMessage, ['@user', 'NewNick']);

        expect(mockTargetMember.setNickname).toHaveBeenCalledWith('NewNick');
        expect(mockMessage.reply).toHaveBeenCalled();
        const call = mockMessage.reply.mock.calls[0][0];
        expect(call.embeds[0].data.description).toContain('Successfully changed');
        expect(call.embeds[0].data.description).toContain('NewNick');
    });

    test('should successfully set nickname with multiple words', async () => {
        await setCommand.execute(mockMessage, ['@user', 'New', 'Nick', 'Name']);

        expect(mockTargetMember.setNickname).toHaveBeenCalledWith('New Nick Name');
        expect(mockMessage.reply).toHaveBeenCalled();
        const call = mockMessage.reply.mock.calls[0][0];
        expect(call.embeds[0].data.description).toContain('New Nick Name');
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

        expect(mockMessage.reply).toHaveBeenCalled();
        const call = mockMessage.reply.mock.calls[0][0];
        expect(call.embeds[0].data.description).toContain('Error');
    });
});
