# 🎸 Dual Discord Bot Deployment on Fly.io

This PR implements a comprehensive dual-bot system for the Burl-Fret Discord server, featuring **Bumbles** and **DiscoCowboy** - two identical bots with different command prefixes deployed to the same server.

---

## 📋 Implementation Plan

### ✅ Completed

#### Phase 0: Planning & Documentation
- ✅ Created comprehensive implementation plan (`docs/sdlc/plans/dual-bot-flyio-deployment.md`)
- ✅ Defined architecture for dual-bot deployment
- ✅ Named bots: **Bumbles** (prefix: `!`) and **DiscoCowboy** (prefix: `?`)

#### Phase 1: Foundation & Setup
- ✅ Updated `package.json` to v2.0.0
- ✅ Upgraded discord.js from v12.4.1 → v14.14.1
- ✅ Added dependencies: express, winston, dotenv
- ✅ Created npm scripts for both bots:
  - `npm run dev:bumbles`
  - `npm run dev:discocowboy`
- ✅ Created `.env.example` with all environment variables
- ✅ Created `.gitignore` and `.dockerignore`
- ✅ Created complete directory structure:
  ```
  src/
    ├── bots/{bumbles,discocowboy}/
    ├── commands/{utility,fun}/
    └── shared/{utils,middleware,services}/
  config/
  scripts/
  ```
- ✅ Installed 242 packages

### 🚧 In Progress / Planned

#### Phase 2: Shared Infrastructure
- [ ] Logger setup (Winston)
- [ ] Error handler
- [ ] Embed builder helpers
- [ ] Command loading system
- [ ] Health check HTTP server

#### Phase 3: Command Migration
- [ ] Migrate `set` command to discord.js v14
- [ ] Migrate `doit` command to discord.js v14
- [ ] Create `ping` command
- [ ] Create `help` command

#### Phase 4: Bot Implementation
- [ ] Create Bumbles bot entry point
- [ ] Create DiscoCowboy bot entry point
- [ ] Create startup scripts
- [ ] Local testing

#### Phase 5-8: Deployment & Testing
- [ ] Docker containerization
- [ ] Fly.io configuration
- [ ] Deployment to production
- [ ] Testing & validation
- [ ] Documentation updates

---

## 🏗️ Architecture

### Design Pattern
**Dual-Purpose Bots with Shared Commands**

- Both bots have identical functionality
- Same codebase, different configurations (tokens & prefixes)
- Single source of truth for commands
- Shared utilities for logging, error handling, etc.

### Bot Configuration

| Bot | Prefix | Token Env Var | Purpose |
|-----|--------|---------------|----------|
| **Bumbles** | `!` | `BUMBLES_TOKEN` | Primary bot instance |
| **DiscoCowboy** | `?` | `DISCOCOWBOY_TOKEN` | Secondary bot instance |

### Technology Stack

- **Runtime**: Node.js 18+
- **Discord Library**: discord.js v14.14.1
- **HTTP Server**: Express v4.18.2
- **Logging**: Winston v3.11.0
- **Environment**: dotenv v16.3.1
- **Deployment**: Fly.io (multi-process)

---

## 📦 What's Included

### Configuration Files
- `.env.example` - Environment variable template
- `.gitignore` - Excludes secrets, node_modules, logs
- `.dockerignore` - Optimizes Docker builds
- `package.json` - Updated dependencies and scripts

### Directory Structure
```
Burl-Fret/
├── docs/sdlc/plans/
│   └── dual-bot-flyio-deployment.md    # Complete implementation plan
├── src/
│   ├── bots/
│   │   ├── bumbles/                    # Bumbles bot (Phase 4)
│   │   └── discocowboy/                # DiscoCowboy bot (Phase 4)
│   ├── commands/                       # Shared commands (Phase 3)
│   │   ├── utility/
│   │   └── fun/
│   └── shared/                         # Shared utilities (Phase 2)
│       ├── utils/
│       ├── middleware/
│       └── services/
├── config/                             # Bot configs (Phase 4)
├── scripts/                            # Startup scripts (Phase 4)
├── .env.example
├── .gitignore
├── .dockerignore
└── package.json
```

---

## 🚀 Getting Started (After PR Merge)

### Prerequisites
1. Node.js 18+
2. Two Discord bot tokens (from Discord Developer Portal)
3. Discord Developer Portal setup:
   - Enable **MESSAGE CONTENT INTENT**
   - Enable **SERVER MEMBERS INTENT**

### Local Development
```bash
# 1. Copy environment template
cp .env.example .env

# 2. Add your bot tokens to .env
# BUMBLES_TOKEN=your_token_here
# DISCOCOWBOY_TOKEN=your_token_here

# 3. Install dependencies (already done)
npm install

# 4. Run bots (after Phase 4 complete)
npm run dev:bumbles        # Terminal 1
npm run dev:discocowboy    # Terminal 2
```

---

## 💰 Deployment Cost Estimate

**Fly.io Deployment**: ~$3.50-7/month
- 512MB RAM: $3.50/month (initial)
- 1GB RAM: $7/month (if scaling needed)

---

## 📊 Migration Notes

### Discord.js v12 → v14 Breaking Changes
1. **Gateway Intents Required** - Must specify intents explicitly
2. **Message Content Intent** - Required for prefix commands
3. **Embed Builders** - New `EmbedBuilder` class
4. **Managers** - Updated API methods

All commands will be updated in Phase 3 to accommodate these changes.

---

## ✅ Testing Plan

### Phase 7: Discord Functionality Tests
- [ ] Both bots appear online
- [ ] `!set @user nickname` works (Bumbles)
- [ ] `?set @user nickname` works (DiscoCowboy)
- [ ] `!doit` and `?doit` work
- [ ] `!ping` / `?ping` respond with latency
- [ ] `!help` / `?help` show command list

### Infrastructure Tests
- [ ] Health check endpoint returns 200
- [ ] Both processes running in fly.io
- [ ] Graceful shutdown works
- [ ] Memory usage < 80%

---

## 📝 Commits Summary

1. **Add comprehensive dual-bot fly.io deployment plan** - Complete implementation roadmap
2. **Update implementation plan with bot names Bumbles and DiscoCowboy** - Named the bots
3. **Phase 1: Foundation & Setup complete** - Project infrastructure ready

---

## 🔜 Next Steps

Once this PR is merged:
1. Continue with Phase 2: Shared Infrastructure
2. Progress through Phases 3-8
3. Deploy to Fly.io
4. Launch Bumbles and DiscoCowboy! 🎸🤠

---

**Estimated Timeline**: 4-5 days for full implementation
**Current Progress**: Phase 1/8 Complete (Foundation)
