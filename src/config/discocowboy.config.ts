/**
 * DiscoCowboy Bot Configuration
 *
 * Configuration for the DiscoCowboy Discord bot instance.
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

const discocowboyConfig: BotConfig = {
  // Bot token from environment
  token: process.env.DISCOCOWBOY_TOKEN || '',

  // Discord application client ID
  clientId: process.env.DISCOCOWBOY_CLIENT_ID || '',

  // Command prefix (default: ?)
  prefix: process.env.DISCOCOWBOY_PREFIX || '?',

  // Bot display name
  name: 'DiscoCowboy',

  // Bot theme color (Discord Green)
  color: '#57F287',

  // Path to shared commands directory
  commandsPath: './src/commands'
};

// Validate required configuration
if (!discocowboyConfig.token) {
  throw new Error('DISCOCOWBOY_TOKEN environment variable is required');
}

if (!discocowboyConfig.clientId) {
  throw new Error('DISCOCOWBOY_CLIENT_ID environment variable is required');
}

export default discocowboyConfig;
