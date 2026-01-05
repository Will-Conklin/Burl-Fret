/**
 * Bumbles Bot Configuration
 *
 * Configuration for the Bumbles Discord bot instance.
 * Uses environment variables for sensitive data.
 */

export interface BotConfig {
  token: string;
  clientId: string;
  prefix: string;
  name: string;
  color: string;
  commandsPath: string;
}

const bumblesConfig: BotConfig = {
  // Bot token from environment
  token: process.env.BUMBLES_TOKEN || '',

  // Discord application client ID
  clientId: process.env.BUMBLES_CLIENT_ID || '',

  // Command prefix (default: !)
  prefix: process.env.BUMBLES_PREFIX || '!',

  // Bot display name
  name: 'Bumbles',

  // Bot theme color (Discord Blurple)
  color: '#5865F2',

  // Path to shared commands directory
  commandsPath: './src/commands'
};

// Validate required configuration
if (!bumblesConfig.token) {
  throw new Error('BUMBLES_TOKEN environment variable is required');
}

if (!bumblesConfig.clientId) {
  throw new Error('BUMBLES_CLIENT_ID environment variable is required');
}

export default bumblesConfig;
