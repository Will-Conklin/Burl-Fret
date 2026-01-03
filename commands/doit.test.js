const doitCommand = require('./doit');

describe('doit command', () => {
    let mockMessage;
    let mockChannel;

    beforeEach(() => {
        mockChannel = {
            send: jest.fn().mockResolvedValue({}),
        };

        mockMessage = {
            channel: mockChannel,
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should have correct name', () => {
        expect(doitCommand.name).toBe('doit');
    });

    test('should have a description', () => {
        expect(doitCommand.description).toBeDefined();
        expect(typeof doitCommand.description).toBe('string');
    });

    test('should send the Burl Fret link when executed', async () => {
        await doitCommand.execute(mockMessage);

        expect(mockChannel.send).toHaveBeenCalledTimes(1);
        expect(mockChannel.send).toHaveBeenCalledWith(
            'Do it for Burl Fret https://cdn.discordapp.com/attachments/764971562205184002/767324313987579914/video0.mov'
        );
    });

    test('should return the promise from channel.send', () => {
        const result = doitCommand.execute(mockMessage);
        expect(result).toBeDefined();
        expect(typeof result.then).toBe('function');
    });
});
