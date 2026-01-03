import doitCommand = require('./doit');

describe('doit command', () => {
    let mockMessage: any;

    beforeEach(() => {
        mockMessage = {
            reply: jest.fn().mockResolvedValue({}),
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

    test('should reply with the Burl Fret link when executed', async () => {
        await doitCommand.execute(mockMessage);

        expect(mockMessage.reply).toHaveBeenCalledTimes(1);
        expect(mockMessage.reply).toHaveBeenCalledWith(
            'Do it for Burl Fret https://cdn.discordapp.com/attachments/764971562205184002/767324313987579914/video0.mov'
        );
    });

    test('should return the promise from message.reply', async () => {
        const result = doitCommand.execute(mockMessage);
        expect(result).toBeDefined();
        await result;
    });
});
