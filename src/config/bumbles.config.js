"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bumblesConfig = {
    token: process.env.BUMBLES_TOKEN || '',
    clientId: process.env.BUMBLES_CLIENT_ID || '',
    prefix: process.env.BUMBLES_PREFIX || '!',
    name: 'Bumbles',
    color: '#5865F2',
    commandsPath: './src/commands'
};
if (!bumblesConfig.token) {
    throw new Error('BUMBLES_TOKEN environment variable is required');
}
if (!bumblesConfig.clientId) {
    throw new Error('BUMBLES_CLIENT_ID environment variable is required');
}
exports.default = bumblesConfig;
//# sourceMappingURL=bumbles.config.js.map