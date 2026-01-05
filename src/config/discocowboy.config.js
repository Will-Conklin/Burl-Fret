"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discocowboyConfig = {
    token: process.env.DISCOCOWBOY_TOKEN || '',
    clientId: process.env.DISCOCOWBOY_CLIENT_ID || '',
    prefix: process.env.DISCOCOWBOY_PREFIX || '?',
    name: 'DiscoCowboy',
    color: '#57F287',
    commandsPath: './src/commands'
};
if (!discocowboyConfig.token) {
    throw new Error('DISCOCOWBOY_TOKEN environment variable is required');
}
if (!discocowboyConfig.clientId) {
    throw new Error('DISCOCOWBOY_CLIENT_ID environment variable is required');
}
exports.default = discocowboyConfig;
//# sourceMappingURL=discocowboy.config.js.map