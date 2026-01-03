# Burl-Fret Project Info

## Summary

- TypeScript Discord bot built with Discord.js v14
- Entry point: `index.ts` (compiles to `dist/index.js`)
- Commands: `set` (nickname management) and `doit` (Burl Fret link)
- Command modules in `commands/` directory
- Winston logger for structured logging
- Environment-based configuration via `.env`

## Requirements

- Node.js 16.11.0 or higher
- npm or yarn
- `.env` file with required variables (see `.env.example`)
- Discord bot needs `Guilds`, `GuildMessages`, and `MessageContent` gateway intents
- `set` command requires `MANAGE_NICKNAMES` permissions

## Setup

1. `npm install`
2. `cp .env.example .env`
3. Edit `.env` with Discord token and preferences
4. `npm run build` (compile TypeScript)
5. `npm start` (production) or `npm run dev` (development)

## Dependencies

### Production

- `discord.js` 14.14.1 - Discord API client
- `dotenv` 16.x - Environment variable management
- `winston` 3.x - Logging library

### Development

- `typescript` 5.9.3 - TypeScript compiler
- `ts-node` 10.9.2 - TypeScript execution
- `ts-jest` 29.4.6 - Jest TypeScript support
- `jest` 30.2.0 - Testing framework
- `eslint` 8.57.1 - Code linting
- `@typescript-eslint/*` 8.51.0 - TypeScript ESLint plugins

## Architecture

- **Entry**: `index.ts` loads commands, sets up client, handles events
- **Commands**: Each command exports a Command interface with `name`, `description`,
  and `execute()` method
- **Types**: TypeScript interfaces in `types/` for type safety
- **Logging**: Winston logger in `utils/logger.ts` with file and console transports
- **Config**: Environment variables via dotenv, validated on startup
- **Build**: TypeScript compiles to `dist/`, JavaScript files gitignored

## Development Notes

- All code is TypeScript with strict mode enabled
- Tests achieve 96%+ coverage on command modules
- ESLint enforces code quality (4-space indents, single quotes)
- Commands use Discord.js v14 API (EmbedBuilder, PermissionFlagsBits, Events)
- Logging captures command execution and errors
