# Burl-Fret

TypeScript Discord bot with prefix commands, built with Discord.js v14.

## Features

- TypeScript for type safety
- Discord.js v14 with modern API
- Environment variable configuration
- Winston logging
- Comprehensive test coverage (96%+)
- ESLint code quality

## Requirements

- Node.js 16.11.0 or higher
- npm or yarn
- Discord bot token from [Discord Developer Portal](https://discord.com/developers/applications)

## Setup

1. Install dependencies

   ```bash
   npm install
   ```

2. Create environment file

   ```bash
   cp .env.example .env
   ```

3. Configure environment variables in `.env`
   - `DISCORD_TOKEN`: Your bot token from Discord Developer Portal
   - `COMMAND_PREFIX`: Command prefix (default: `!`)
   - `NODE_ENV`: Environment (`development` or `production`)
   - `LOG_LEVEL`: Logging level (`error`, `warn`, `info`, `debug`)

4. Enable bot intents in Discord Developer Portal
   - Navigate to your application
   - Go to Bot settings
   - Enable "Message Content Intent" under Privileged Gateway Intents
   - Enable "Server Members Intent" (for nickname management)

## Development

Build TypeScript code:

```bash
npm run build
```text

Run in development mode (with ts-node):

```bash
npm run dev
```text

Run tests:

```bash
npm test
```text

Run tests with coverage:

```bash
npm run test:coverage
```text

Lint code:

```bash
npm run lint
```text

## Production

Build and start:

```bash
npm run build
npm start
```text

## Commands

- `set @user nickname` - Set a user's nickname (requires `MANAGE_NICKNAMES`
  permission for both user and bot)
- `doit` - Sends the Burl Fret link

## Project Structure

```text
Burl-Fret/
├── commands/          # Bot commands
│   ├── doit.ts       # Doit command
│   ├── doit.test.ts  # Doit tests
│   ├── set.ts        # Set nickname command
│   └── set.test.ts   # Set tests
├── types/            # TypeScript type definitions
│   ├── command.ts    # Command interface
│   └── config.ts     # Config interface
├── utils/            # Utility modules
│   └── logger.ts     # Winston logger
├── index.ts          # Main entry point
├── tsconfig.json     # TypeScript configuration
├── .env.example      # Environment template
└── package.json      # Dependencies and scripts
```text

## Logging

Logs are written to:

- `logs/error.log` - Error messages only
- `logs/combined.log` - All log levels
- Console (development mode only)

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Bot Framework**: Discord.js v14
- **Testing**: Jest with ts-jest
- **Linting**: ESLint with TypeScript support
- **Logging**: Winston
- **Configuration**: dotenv
