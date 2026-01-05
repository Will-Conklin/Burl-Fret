# Burl-Fret Discord Bots

This repository powers the Burl-Fret Discord bots project. The long-term goal is to run two bots—**Bumbles** (`!`) and **DiscoCowboy** (`?`)—from a shared codebase. The current code is still the legacy single-bot implementation in `index.js`, and a migration to a dual-bot, Discord.js v14 architecture is planned.

## Status
- **Runtime:** Node.js 18+
- **Discord library:** Targeting discord.js v14 (current `index.js` uses legacy patterns and will need updates)
- **Planning:** See the SDLC plan in `docs/SDLC/plans/dual-bot-flyio-deployment.md` for the desired structure and deployment approach.

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Provide bot credentials:
   - **Legacy single bot (current code):** Create `config.json` in the repository root with your bot token and command prefix.
     ```json
     {
       "prefix": "!",
       "token": "your_discord_bot_token"
     }
     ```
   - **Planned dual-bot setup:** Copy `.env.example` to `.env` and fill in the Bumbles and DiscoCowboy tokens, client IDs, and prefixes for future work.
3. Enable the **Message Content Intent** and other required intents for your bot in the Discord Developer Portal.

## Running the bot (legacy entry point)
```bash
node index.js
```

## Development notes
- Linting: `npm run lint` (the script currently targets a future `src/` layout and may need adjusting as the migration progresses).
- Tests: none defined yet.
- Documentation: SDLC documents live under `docs/SDLC/`; the migration plan is the best source of architectural intent.
