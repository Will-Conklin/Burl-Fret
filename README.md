# Burl-Fret

Discord bot with a small set of prefix commands.

## Setup

1. `npm install`
2. Copy `config.example.json` to `config.json`
3. Fill in `prefix` and `token`
4. If your bot needs message content, enable the Message Content Intent in
   the Discord Developer Portal.

## Run

`node index.js`

## Commands

- `set @user nickname` (requires `MANAGE_NICKNAMES`; bot must have it too)
- `doit` (sends the Burl Fret link)

## Structure

- Entry point: `index.js`
- Commands: `commands/`
