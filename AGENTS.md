# Burl-Fret Project Info

## Summary

- Node.js Discord bot.
- Entry point: `index.js`.
- Commands: `set` (set nickname) and `doit` (send a link).
- Command modules live in `commands/`.

## Requirements

- Node.js + npm.
- `config.json` in repo root with:
  - `prefix`: command prefix string.
  - `token`: Discord bot token.
- `commands/` directory is expected at startup.
- Discord bot needs `GUILDS` and `GUILD_MESSAGES` gateway intents.
- The `set` command requires `MANAGE_NICKNAMES` permissions.

## Setup

1. `npm install`
2. Add `config.json`
3. `node index.js`

## Dependencies

- `discord.js` 12.4.1
- `eslint` 7.12.1
