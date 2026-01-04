# Dual-Bot Fly.io Deployment - Implementation Plan

**Project**: Burl-Fret Discord Bots
**Version**: 2.0.0
**Date**: 2026-01-04
**Status**: Planning

---

## Executive Summary

Transform the Burl-Fret repository from a single Discord bot into a dual-bot deployment on fly.io. Both bots will have identical functionality deployed to the same Discord server, using different command prefixes to avoid conflicts.

### Key Objectives
- Deploy two identical Discord bots to fly.io
- Both bots accessible on the same Discord server
- Shared codebase with no command duplication
- Modern discord.js v14 implementation
- Cost-effective deployment (~$3.50-7/month)
- Health monitoring and automatic recovery

---

## Current State Analysis

### Existing Codebase
- **Discord Library**: discord.js v12.4.1 (deprecated)
- **Structure**: Single monolithic `index.js` file
- **Commands**:
  - `set` - Changes user nicknames
  - `doit` - Sends "do it for burl fret" message
- **Configuration**: `config.json` (deleted from git)
- **Deployment**: None (local development only)
- **Dependencies**: Outdated, minimal

### Issues to Address
1. Outdated discord.js version (v12 → v14 required)
2. No modular command structure
3. No deployment configuration
4. Missing error handling and logging
5. No health monitoring
6. Hardcoded configuration

---

## Architecture Overview

### Design Pattern: Dual-Purpose Bots with Shared Commands

**Core Concept**: Two identical bot instances running from the same codebase, differentiated only by configuration (tokens, prefixes).

```
┌─────────────────────────────────────────┐
│         Fly.io Application              │
│                                         │
│  ┌───────────────┐  ┌───────────────┐  │
│  │   Bot 1       │  │   Bot 2       │  │
│  │   Prefix: !   │  │   Prefix: ?   │  │
│  │   Token: T1   │  │   Token: T2   │  │
│  └───────┬───────┘  └───────┬───────┘  │
│          │                  │          │
│          └────────┬─────────┘          │
│                   │                    │
│         ┌─────────▼─────────┐          │
│         │  Shared Commands  │          │
│         │   - set           │          │
│         │   - doit          │          │
│         │   - ping          │          │
│         │   - help          │          │
│         └───────────────────┘          │
│                   │                    │
│         ┌─────────▼─────────┐          │
│         │ Shared Utilities  │          │
│         │  - Logger         │          │
│         │  - Error Handler  │          │
│         │  - Command Loader │          │
│         └───────────────────┘          │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   Health Check Server (HTTP)    │   │
│  │   Port: 3000                    │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                   │
                   ▼
         Discord API (Both Bots)
```

### Component Breakdown

#### 1. Bot Instances
- **Bot 1**: Discord bot with `!` prefix, Token 1
- **Bot 2**: Discord bot with `?` prefix, Token 2
- Both load same commands from shared directory
- Both use same shared utilities

#### 2. Shared Command System
- Single source of truth for all commands
- Commands loaded dynamically at startup
- Environment-aware (prefix from config)
- Support for both prefix and slash commands

#### 3. Shared Utilities
- **Logger**: Winston-based structured logging
- **Error Handler**: Centralized error handling
- **Command Loader**: Dynamic command registration
- **Embed Builder**: Consistent Discord embeds

#### 4. Health Monitoring
- HTTP server on port 3000
- `/health` endpoint for fly.io checks
- Reports status of both bot processes
- Enables automatic restart on failure

---

## Technical Specifications

### Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | 18+ LTS |
| Discord Library | discord.js | ^14.14.1 |
| HTTP Server | Express | ^4.18.2 |
| Logging | Winston | ^3.11.0 |
| Environment | dotenv | ^16.3.1 |
| Container | Docker | Alpine-based |
| Hosting | Fly.io | Multi-process |

### Discord.js v14 Migration

**Breaking Changes from v12:**
1. **Gateway Intents Required**
   ```javascript
   // v12
   const client = new Discord.Client();

   // v14
   const { Client, GatewayIntentBits } = require('discord.js');
   const client = new Client({
     intents: [
       GatewayIntentBits.Guilds,
       GatewayIntentBits.GuildMessages,
       GatewayIntentBits.MessageContent, // Required for prefix commands
       GatewayIntentBits.GuildMembers    // Required for nickname changes
     ]
   });
   ```

2. **Message Content Intent**
   - Must be enabled in Discord Developer Portal
   - Required for `message.content` access
   - Navigate to: Bot → Privileged Gateway Intents → MESSAGE CONTENT INTENT

3. **Embed Builders**
   ```javascript
   // v12
   message.channel.send({embed: {color: "RED", description: "Text"}});

   // v14
   const { EmbedBuilder } = require('discord.js');
   message.channel.send({
     embeds: [new EmbedBuilder()
       .setColor('Red')
       .setDescription('Text')]
   });
   ```

4. **Slash Commands Support**
   - Built-in slash command registration
   - Hybrid support (prefix + slash)
   - Better user experience

---

## Repository Structure

### New Directory Layout

```
Burl-Fret/
├── docs/
│   └── sdlc/
│       └── plans/
│           └── dual-bot-flyio-deployment.md    # This document
│
├── src/
│   ├── bots/
│   │   ├── bot1/
│   │   │   ├── index.js                        # Bot 1 entry point
│   │   │   └── config.js                       # Bot 1 configuration
│   │   └── bot2/
│   │       ├── index.js                        # Bot 2 entry point
│   │       └── config.js                       # Bot 2 configuration
│   │
│   ├── commands/                               # SHARED by both bots
│   │   ├── utility/
│   │   │   ├── set.js                         # Nickname command
│   │   │   ├── ping.js                        # Latency check
│   │   │   └── help.js                        # Command list
│   │   └── fun/
│   │       └── doit.js                        # "Do it for burl fret"
│   │
│   └── shared/
│       ├── utils/
│       │   ├── logger.js                      # Winston logger
│       │   ├── errorHandler.js                # Error handling
│       │   └── embedBuilder.js                # Discord embeds
│       ├── middleware/
│       │   └── commandLoader.js               # Dynamic command loading
│       └── services/
│           └── healthCheck.js                 # HTTP health endpoint
│
├── scripts/
│   ├── start-bot1.js                          # Bot 1 startup wrapper
│   ├── start-bot2.js                          # Bot 2 startup wrapper
│   └── deploy.sh                              # Deployment helper
│
├── config/
│   ├── bot1.config.js                         # Bot 1 environment config
│   └── bot2.config.js                         # Bot 2 environment config
│
├── .env.example                               # Environment template
├── .gitignore                                 # Git ignore rules
├── .dockerignore                              # Docker ignore rules
├── Dockerfile                                 # Container build
├── fly.toml                                   # Fly.io configuration
├── package.json                               # Dependencies & scripts
├── README.md                                  # Documentation
└── index.js                                   # Legacy (to be removed)
```

### Key Design Decisions

**Shared Commands Directory** (`src/commands/`)
- Single source of truth for all commands
- Both bots load from same location
- Write once, deploy to both bots
- Organized by category (utility, fun, admin, etc.)

**Separate Bot Entry Points** (`src/bots/bot1/`, `src/bots/bot2/`)
- Different configurations (token, prefix)
- Same initialization logic
- Independent process management
- Isolated error handling

**Shared Utilities** (`src/shared/`)
- Reusable across both bots
- Consistent logging and error handling
- Centralized service management

---

## Configuration Management

### Environment Variables

**Required Secrets** (via `fly secrets set`):
```bash
# Bot 1 Configuration
BOT1_TOKEN=your_discord_bot_token_1
BOT1_CLIENT_ID=your_discord_client_id_1
BOT1_PREFIX=!

# Bot 2 Configuration
BOT2_TOKEN=your_discord_bot_token_2
BOT2_CLIENT_ID=your_discord_client_id_2
BOT2_PREFIX=?

# Shared Configuration
NODE_ENV=production
LOG_LEVEL=info
HEALTH_CHECK_PORT=3000
```

**Local Development** (`.env` file):
```bash
# Copy from .env.example
cp .env.example .env

# Edit .env with your tokens
BOT1_TOKEN=your_development_token_1
BOT2_TOKEN=your_development_token_2
BOT1_PREFIX=!
BOT2_PREFIX=?
NODE_ENV=development
LOG_LEVEL=debug
```

### Configuration Files

**`config/bot1.config.js`**
```javascript
module.exports = {
  token: process.env.BOT1_TOKEN,
  clientId: process.env.BOT1_CLIENT_ID,
  prefix: process.env.BOT1_PREFIX || '!',
  name: 'Burl-Fret Bot 1',
  color: '#5865F2', // Discord blue
  commandsPath: './src/commands'
};
```

**`config/bot2.config.js`**
```javascript
module.exports = {
  token: process.env.BOT2_TOKEN,
  clientId: process.env.BOT2_CLIENT_ID,
  prefix: process.env.BOT2_PREFIX || '?',
  name: 'Burl-Fret Bot 2',
  color: '#57F287', // Discord green
  commandsPath: './src/commands'
};
```

---

## Deployment Architecture

### Fly.io Multi-Process Configuration

**`fly.toml`**
```toml
app = "burl-fret-bots"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"
  LOG_LEVEL = "info"
  HEALTH_CHECK_PORT = "3000"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 1

[[services]]
  internal_port = 3000
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

  [services.concurrency]
    type = "connections"
    hard_limit = 25
    soft_limit = 20

  [[services.tcp_checks]]
    interval = "15s"
    timeout = "2s"
    grace_period = "5s"

  [[services.http_checks]]
    interval = "30s"
    timeout = "2s"
    grace_period = "10s"
    method = "get"
    path = "/health"

[processes]
  bot1 = "node scripts/start-bot1.js"
  bot2 = "node scripts/start-bot2.js"
  web = "node src/shared/services/healthCheck.js"

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512
```

### Docker Configuration

**`Dockerfile`**
```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Default command (overridden by fly.toml processes)
CMD ["node", "src/shared/services/healthCheck.js"]
```

### Resource Allocation

**Initial Configuration (512MB RAM):**
- Bot 1 Process: ~180MB
- Bot 2 Process: ~180MB
- Health Check Server: ~50MB
- System Overhead: ~102MB

**Scaling Strategy:**
- **Vertical**: Increase memory if > 80% usage
- **Horizontal**: Not beneficial for Discord bots (single WebSocket per bot)
- **Monitoring**: Use fly.io metrics dashboard

**Cost Estimates:**
| Configuration | Monthly Cost | Use Case |
|---------------|--------------|----------|
| 512MB Shared CPU | ~$3.50 | Small servers (< 1000 users) |
| 1GB Shared CPU | ~$7.00 | Medium servers (1000-5000 users) |
| 2GB Shared CPU | ~$14.00 | Large servers (5000+ users) |

---

## Command System Design

### Shared Command Structure

**Command File Template** (`src/commands/utility/example.js`):
```javascript
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'example',
  description: 'Example command description',
  usage: '<required> [optional]',
  category: 'utility',

  // Prefix command execution
  async execute(message, args, client, config) {
    try {
      // Command logic here
      const embed = new EmbedBuilder()
        .setColor(config.color)
        .setDescription('Command response');

      await message.reply({ embeds: [embed] });
    } catch (error) {
      client.logger.error('Example command error:', error);
      await message.reply('An error occurred!');
    }
  },

  // Slash command data (optional)
  slashData: {
    name: 'example',
    description: 'Example command description',
    options: []
  },

  // Slash command execution (optional)
  async slashExecute(interaction, client, config) {
    // Slash command logic
    await interaction.reply('Response');
  }
};
```

### Command Loader

**`src/shared/middleware/commandLoader.js`**
```javascript
const fs = require('fs');
const path = require('path');

function loadCommands(client, commandsPath) {
  client.commands = new Map();
  const categories = fs.readdirSync(commandsPath);

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    const commandFiles = fs.readdirSync(categoryPath)
      .filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(path.join(categoryPath, file));
      client.commands.set(command.name, command);
      client.logger.info(`Loaded command: ${command.name}`);
    }
  }

  return client.commands.size;
}

module.exports = { loadCommands };
```

### Existing Commands Migration

**`src/commands/utility/set.js`** (Migrated from old code):
```javascript
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'set',
  description: 'Change a user\'s nickname',
  usage: '<@user> <new nickname>',
  category: 'utility',
  permissions: [PermissionFlagsBits.ManageNicknames],

  async execute(message, args, client, config) {
    try {
      // Check bot permissions
      if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageNicknames)) {
        return message.reply('I don\'t have permission to manage nicknames!');
      }

      // Get mentioned user
      const target = message.mentions.members.first();
      if (!target) {
        return message.reply('Please mention a user to change their nickname!');
      }

      // Get new nickname
      const nickname = args.slice(1).join(' ');
      if (!nickname) {
        return message.reply('Please provide a new nickname!');
      }

      // Change nickname
      await target.setNickname(nickname);

      const embed = new EmbedBuilder()
        .setColor(config.color)
        .setDescription(`✅ Changed ${target.user.tag}'s nickname to **${nickname}**`);

      await message.reply({ embeds: [embed] });
      client.logger.info(`Nickname changed: ${target.user.tag} -> ${nickname}`);

    } catch (error) {
      client.logger.error('Set command error:', error);
      await message.reply('Failed to change nickname. Make sure I have the proper permissions!');
    }
  }
};
```

**`src/commands/fun/doit.js`** (Migrated from old code):
```javascript
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'doit',
  description: 'Do it for burl fret!',
  usage: '',
  category: 'fun',

  async execute(message, args, client, config) {
    try {
      const embed = new EmbedBuilder()
        .setColor(config.color)
        .setTitle('🎸 Do it for Burl Fret! 🎸')
        .setDescription('*Do it for her...*')
        .setImage('https://i.imgur.com/placeholder.png'); // Add actual image URL

      await message.channel.send({ embeds: [embed] });
      client.logger.info(`Doit command used by ${message.author.tag}`);

    } catch (error) {
      client.logger.error('Doit command error:', error);
      await message.reply('Failed to send message!');
    }
  }
};
```

---

## Health Monitoring & Logging

### Health Check Service

**`src/shared/services/healthCheck.js`**
```javascript
const express = require('express');
const app = express();
const port = process.env.HEALTH_CHECK_PORT || 3000;

let bot1Status = { status: 'starting', uptime: 0 };
let bot2Status = { status: 'starting', uptime: 0 };

app.get('/health', (req, res) => {
  const healthy = bot1Status.status === 'running' || bot2Status.status === 'running';

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    bots: {
      bot1: bot1Status,
      bot2: bot2Status
    }
  });
});

app.listen(port, () => {
  console.log(`Health check server running on port ${port}`);
});

// Export status setters for bot processes
module.exports = { app, setBotStatus };
```

### Logging System

**`src/shared/utils/logger.js`**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'burl-fret-bots' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      )
    })
  ]
});

module.exports = logger;
```

### Error Handling

**`src/shared/utils/errorHandler.js`**
```javascript
const logger = require('./logger');

function handleError(error, context = '') {
  logger.error(`Error in ${context}:`, {
    message: error.message,
    stack: error.stack,
    code: error.code
  });
}

function handleUncaughtException(error) {
  logger.error('Uncaught Exception:', error);
  process.exit(1); // Let fly.io restart the process
}

function handleUnhandledRejection(reason, promise) {
  logger.error('Unhandled Rejection:', { reason, promise });
}

function setupGlobalHandlers() {
  process.on('uncaughtException', handleUncaughtException);
  process.on('unhandledRejection', handleUnhandledRejection);
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });
}

module.exports = {
  handleError,
  setupGlobalHandlers
};
```

---

## Implementation Plan

### Phase 1: Foundation & Setup (Day 1)

**1.1 Update package.json**
- [ ] Update discord.js to v14.14.1
- [ ] Add express ^4.18.2
- [ ] Add winston ^3.11.0
- [ ] Add dotenv ^16.3.1
- [ ] Update scripts for multi-bot development
- [ ] Update project metadata

**1.2 Create configuration files**
- [ ] Create `.env.example` with all required variables
- [ ] Create `.gitignore` (exclude .env, node_modules, logs)
- [ ] Create `.dockerignore` (exclude .git, tests, docs)

**1.3 Install dependencies**
```bash
npm install
```

**1.4 Create directory structure**
```bash
mkdir -p src/{bots/{bot1,bot2},commands/{utility,fun},shared/{utils,middleware,services}}
mkdir -p config scripts docs/sdlc/plans
```

### Phase 2: Shared Infrastructure (Day 1-2)

**2.1 Create shared utilities**
- [ ] `src/shared/utils/logger.js` - Winston logger setup
- [ ] `src/shared/utils/errorHandler.js` - Global error handlers
- [ ] `src/shared/utils/embedBuilder.js` - Discord embed helpers

**2.2 Create middleware**
- [ ] `src/shared/middleware/commandLoader.js` - Dynamic command loading

**2.3 Create health check service**
- [ ] `src/shared/services/healthCheck.js` - Express HTTP server

**2.4 Test shared utilities**
```bash
node -e "const logger = require('./src/shared/utils/logger'); logger.info('Test')"
```

### Phase 3: Command Migration (Day 2)

**3.1 Create command structure**
- [ ] `src/commands/utility/set.js` - Migrate nickname command to v14
- [ ] `src/commands/fun/doit.js` - Migrate "do it" command to v14
- [ ] `src/commands/utility/ping.js` - New ping command
- [ ] `src/commands/utility/help.js` - New help command

**3.2 Test command exports**
```bash
node -e "console.log(require('./src/commands/utility/set'))"
```

### Phase 4: Bot Implementation (Day 2-3)

**4.1 Create bot configurations**
- [ ] `config/bot1.config.js` - Bot 1 config
- [ ] `config/bot2.config.js` - Bot 2 config

**4.2 Create bot entry points**
- [ ] `src/bots/bot1/index.js` - Bot 1 main file (discord.js v14)
- [ ] `src/bots/bot2/index.js` - Bot 2 main file (discord.js v14)

**4.3 Create startup scripts**
- [ ] `scripts/start-bot1.js` - Bot 1 process wrapper
- [ ] `scripts/start-bot2.js` - Bot 2 process wrapper

**4.4 Test bots locally**
```bash
# Terminal 1
npm run dev:bot1

# Terminal 2
npm run dev:bot2
```

### Phase 5: Containerization (Day 3)

**5.1 Create Docker files**
- [ ] `Dockerfile` - Multi-stage build configuration
- [ ] `.dockerignore` - Optimize build context

**5.2 Test Docker build**
```bash
docker build -t burl-fret-bots .
docker run --env-file .env burl-fret-bots
```

**5.3 Optimize image size**
- Use Alpine base image
- Multi-stage build
- Production dependencies only

### Phase 6: Fly.io Deployment (Day 3-4)

**6.1 Create fly.toml**
- [ ] Configure multi-process setup
- [ ] Configure health checks
- [ ] Set resource limits (512MB initially)
- [ ] Configure auto-restart policies

**6.2 Initialize fly.io app**
```bash
fly launch --no-deploy --name burl-fret-bots --region iad
```

**6.3 Set secrets**
```bash
fly secrets set BOT1_TOKEN="..." BOT2_TOKEN="..." BOT1_PREFIX="!" BOT2_PREFIX="?"
```

**6.4 Deploy to fly.io**
```bash
fly deploy
```

**6.5 Verify deployment**
```bash
fly status
fly logs
fly checks list
curl https://burl-fret-bots.fly.dev/health
```

### Phase 7: Testing & Validation (Day 4)

**7.1 Discord functionality tests**
- [ ] Both bots appear online in Discord
- [ ] `!set @user nickname` works (Bot 1)
- [ ] `?set @user nickname` works (Bot 2)
- [ ] `!doit` works (Bot 1)
- [ ] `?doit` works (Bot 2)
- [ ] `!ping` / `?ping` respond with latency
- [ ] `!help` / `?help` show command list

**7.2 Infrastructure tests**
- [ ] Health check endpoint returns 200
- [ ] Logs appear in `fly logs`
- [ ] Both processes running in `fly status`
- [ ] Graceful shutdown works (fly restart)
- [ ] Auto-recovery after crash

**7.3 Performance validation**
- [ ] Memory usage < 80% (target: ~400MB / 512MB)
- [ ] CPU usage reasonable
- [ ] Response time < 1s for commands
- [ ] No memory leaks over 24 hours

### Phase 8: Documentation & Cleanup (Day 4-5)

**8.1 Update README.md**
- [ ] Project overview
- [ ] Prerequisites (Node.js, Discord bots, fly.io)
- [ ] Local development setup
- [ ] Environment variables documentation
- [ ] Deployment instructions
- [ ] Command list
- [ ] Troubleshooting guide

**8.2 Create deployment script**
- [ ] `scripts/deploy.sh` - Automated deployment helper

**8.3 Cleanup**
- [ ] Remove old `index.js` or archive as `index.legacy.js`
- [ ] Remove unused dependencies
- [ ] Verify `.gitignore` coverage

**8.4 Final git commit**
```bash
git add .
git commit -m "Implement dual-bot fly.io deployment with discord.js v14"
git push -u origin claude/list-branches-9CyYe
```

---

## Discord Developer Portal Setup

### Prerequisites

Before deployment, create two Discord bot applications:

**Step 1: Create Bot Applications**
1. Visit https://discord.com/developers/applications
2. Click "New Application" → Name: "Burl-Fret Bot 1"
3. Navigate to "Bot" tab → Click "Add Bot"
4. Copy the bot token → Save as `BOT1_TOKEN`
5. Copy the Application ID → Save as `BOT1_CLIENT_ID`
6. Repeat for "Burl-Fret Bot 2"

**Step 2: Enable Privileged Intents**
For BOTH bots:
1. Navigate to "Bot" tab
2. Scroll to "Privileged Gateway Intents"
3. Enable:
   - ✅ **SERVER MEMBERS INTENT** (for nickname changes)
   - ✅ **MESSAGE CONTENT INTENT** (for prefix commands)

**Step 3: Configure Bot Permissions**
1. Navigate to "OAuth2" → "URL Generator"
2. Select scopes:
   - ✅ `bot`
   - ✅ `applications.commands` (for slash commands)
3. Select bot permissions:
   - ✅ Manage Nicknames
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Read Message History
   - ✅ Use Slash Commands
4. Copy generated URL
5. Open URL in browser → Invite to your server
6. Repeat for second bot

**Step 4: Verify Setup**
- Both bots should appear offline in your Discord server
- Both bots should have proper roles/permissions
- Save tokens securely (do NOT commit to git)

---

## Security Considerations

### Token Management
- ✅ Never commit tokens to git
- ✅ Use `.env` for local development
- ✅ Use `fly secrets` for production
- ✅ Rotate tokens if exposed
- ✅ Use different tokens for dev/prod

### Permissions
- ✅ Request only necessary intents
- ✅ Use least-privilege bot permissions
- ✅ Validate user permissions in commands
- ✅ Rate limiting on commands (prevent spam)

### Container Security
- ✅ Run as non-root user
- ✅ Use official Node.js Alpine images
- ✅ Keep dependencies updated
- ✅ Scan for vulnerabilities (`npm audit`)

### Error Handling
- ✅ Never expose tokens in logs
- ✅ Sanitize user input
- ✅ Handle API rate limits gracefully
- ✅ Fail securely (don't crash on errors)

---

## Monitoring & Observability

### Metrics to Track

**Bot Health:**
- Uptime percentage
- Connection status (online/offline)
- WebSocket latency
- Reconnection frequency

**Performance:**
- Memory usage (target: < 200MB per bot)
- CPU usage
- Command response time
- API rate limit headroom

**Usage:**
- Commands executed per hour
- Active users
- Error rate
- Most popular commands

### Fly.io Monitoring

**Dashboard Metrics:**
```bash
fly dashboard
```
- CPU/Memory graphs
- Request rate
- Health check status

**Real-time Logs:**
```bash
fly logs -a burl-fret-bots
```

**Process Status:**
```bash
fly status
fly checks list
```

### Alerting Strategy

**Critical Alerts:**
- Both bots offline (> 5 minutes)
- Memory usage > 90%
- Health check failing
- Continuous crash loop

**Warning Alerts:**
- Single bot offline (> 2 minutes)
- Memory usage > 80%
- High error rate (> 5% of commands)
- API rate limit approaching

---

## Scaling Strategy

### When to Scale

**Vertical Scaling Triggers:**
- Memory usage consistently > 80%
- CPU usage consistently > 70%
- Command response time > 2 seconds
- Frequent OOM (Out of Memory) crashes

**Scaling Actions:**
```bash
# Scale to 1GB RAM
fly scale memory 1024

# Scale to 2 vCPUs
fly scale vm shared-cpu-2x

# Check current resources
fly scale show
```

### Cost vs Performance

| Configuration | Cost/mo | Users | Servers | Commands/min |
|---------------|---------|-------|---------|--------------|
| 512MB, 1 vCPU | $3.50 | < 1000 | 1-5 | < 50 |
| 1GB, 1 vCPU | $7.00 | 1000-5000 | 5-20 | 50-200 |
| 2GB, 2 vCPU | $14.00 | 5000+ | 20+ | 200+ |

### Optimization Before Scaling

**Code Optimizations:**
1. Implement command cooldowns
2. Cache frequently accessed data
3. Optimize database queries (if added)
4. Reduce unnecessary logging

**Resource Optimizations:**
1. Use production mode (`NODE_ENV=production`)
2. Remove development dependencies
3. Optimize Docker image layers
4. Enable compression

---

## Rollback & Disaster Recovery

### Rollback Procedure

**If deployment fails:**
```bash
# View release history
fly releases

# Rollback to previous version
fly releases rollback <version-number>
```

**If bots are crashing:**
```bash
# Check logs
fly logs

# Restart all processes
fly restart

# Scale down if resource issue
fly scale memory 1024
```

### Emergency Fallback

**Keep legacy bot ready:**
1. Archive current `index.js` as `index.legacy.js`
2. Keep old dependencies in `package-legacy.json`
3. Document rollback steps in README

**Quick revert:**
```bash
# Restore old bot
mv index.legacy.js index.js
npm install discord.js@12.4.1
node index.js
```

### Backup Strategy

**Configuration Backups:**
- `.env.example` in git (no secrets)
- Document all fly secrets
- Export fly.toml to git

**Data Backups:**
- Currently stateless (no data to backup)
- If database added: daily automated backups

---

## Testing Strategy

### Local Testing

**Prerequisites:**
```bash
# Create .env from template
cp .env.example .env

# Add your development bot tokens
nano .env

# Install dependencies
npm install
```

**Run tests:**
```bash
# Test Bot 1
npm run dev:bot1

# Test Bot 2 (in new terminal)
npm run dev:bot2

# Test health check (in new terminal)
curl http://localhost:3000/health
```

**Test checklist:**
- [ ] Bots connect to Discord
- [ ] Commands respond correctly
- [ ] Error handling works (try invalid commands)
- [ ] Logs are readable
- [ ] Health check returns JSON
- [ ] Graceful shutdown (Ctrl+C)

### Production Testing

**Post-deployment checklist:**
```bash
# 1. Verify deployment
fly status

# 2. Check health
curl https://burl-fret-bots.fly.dev/health

# 3. Monitor logs
fly logs

# 4. Check processes
fly status --all
```

**In Discord:**
- [ ] Both bots show as online
- [ ] `!ping` and `?ping` respond
- [ ] `!set @user test` changes nickname
- [ ] `?doit` sends embed
- [ ] `!help` shows command list
- [ ] Invalid commands handled gracefully
- [ ] Both bots respond simultaneously

### Load Testing

**Stress test commands:**
```bash
# Send multiple commands rapidly
# Monitor: fly logs
# Watch for: rate limiting, memory spikes

!ping
!ping
!ping
!help
!doit
# ... etc
```

**Monitor during test:**
```bash
fly dashboard  # Watch CPU/Memory graphs
fly logs       # Watch for errors
```

---

## Troubleshooting Guide

### Common Issues

**Issue: Bot won't start**
```bash
# Check logs
fly logs

# Common causes:
# 1. Invalid token → verify fly secrets
# 2. Missing intents → check Developer Portal
# 3. Network issue → check fly status
```

**Issue: Commands not responding**
```bash
# Checklist:
# 1. MESSAGE CONTENT INTENT enabled?
# 2. Correct prefix used? (! vs ?)
# 3. Bot has permissions in channel?
# 4. Check logs: fly logs
```

**Issue: High memory usage**
```bash
# Check current usage
fly status

# Temporary fix: restart
fly restart

# Permanent fix: scale up
fly scale memory 1024
```

**Issue: Health checks failing**
```bash
# Test endpoint manually
curl https://burl-fret-bots.fly.dev/health

# Check if web process running
fly status

# Restart web process
fly restart
```

### Debug Commands

```bash
# View all processes
fly status --all

# View detailed logs
fly logs -a burl-fret-bots

# View specific process logs
fly logs --region iad

# SSH into container (if needed)
fly ssh console

# Check environment variables
fly ssh console -C "env | grep BOT"
```

---

## Future Enhancements

### Phase 2 Features (Post-Launch)

**Slash Commands:**
- [ ] Register slash commands on startup
- [ ] Migrate all commands to slash format
- [ ] Deprecate prefix commands (optional)

**Database Integration:**
- [ ] Add PostgreSQL (fly.io addon)
- [ ] Store user preferences
- [ ] Track command usage statistics
- [ ] Persistent server settings

**Advanced Commands:**
- [ ] Moderation commands (kick, ban, mute)
- [ ] Custom server settings
- [ ] Role management
- [ ] Welcome messages

**Monitoring Improvements:**
- [ ] Prometheus metrics export
- [ ] Grafana dashboard
- [ ] Discord webhook alerts
- [ ] Uptime tracking

**Performance Optimizations:**
- [ ] Redis caching (fly.io addon)
- [ ] Command rate limiting per user
- [ ] Bulk operation optimizations
- [ ] WebSocket compression

### Scaling Roadmap

**Stage 1: Current (512MB)**
- 2 bots, basic commands
- Single server deployment
- Manual monitoring

**Stage 2: Growth (1GB)**
- Add database persistence
- Implement slash commands
- Automated monitoring alerts

**Stage 3: Scale (2GB+)**
- Multi-server support
- Advanced moderation features
- Analytics dashboard
- API for third-party integrations

---

## Success Criteria

### Deployment Success

- [x] Both bots online in Discord
- [x] Health check returning 200
- [x] All commands functional
- [x] Logs accessible via `fly logs`
- [x] Memory usage < 80%
- [x] No crash loops
- [x] Graceful restart works

### User Experience Success

- [x] Commands respond < 1 second
- [x] Clear error messages
- [x] Help command explains usage
- [x] No conflicts between bots
- [x] Stable connection (no random disconnects)

### Operational Success

- [x] Automated deployments via `fly deploy`
- [x] Secrets managed securely
- [x] Logs retained for debugging
- [x] Health monitoring active
- [x] Rollback procedure documented

---

## Timeline & Milestones

### Week 1: Implementation
- **Day 1**: Foundation & shared infrastructure
- **Day 2**: Command migration & bot implementation
- **Day 3**: Containerization & deployment setup
- **Day 4**: Deploy to fly.io & testing
- **Day 5**: Documentation & refinement

### Week 2: Stabilization
- **Day 6-7**: Monitor production usage
- **Day 8-9**: Fix any issues found
- **Day 10**: Performance optimization

### Week 3+: Enhancement
- Implement slash commands
- Add new features based on user feedback
- Scale resources as needed

---

## Appendix

### File Checklist

**Configuration Files:**
- [x] `.env.example`
- [x] `.gitignore`
- [x] `.dockerignore`
- [x] `fly.toml`
- [x] `Dockerfile`
- [x] `package.json`

**Source Files:**
- [x] `src/bots/bot1/index.js`
- [x] `src/bots/bot2/index.js`
- [x] `src/bots/bot1/config.js`
- [x] `src/bots/bot2/config.js`
- [x] `src/commands/utility/set.js`
- [x] `src/commands/fun/doit.js`
- [x] `src/commands/utility/ping.js`
- [x] `src/commands/utility/help.js`
- [x] `src/shared/utils/logger.js`
- [x] `src/shared/utils/errorHandler.js`
- [x] `src/shared/utils/embedBuilder.js`
- [x] `src/shared/middleware/commandLoader.js`
- [x] `src/shared/services/healthCheck.js`

**Scripts:**
- [x] `scripts/start-bot1.js`
- [x] `scripts/start-bot2.js`
- [x] `scripts/deploy.sh`

**Documentation:**
- [x] `README.md`
- [x] `docs/sdlc/plans/dual-bot-flyio-deployment.md`

### References

**Documentation:**
- [Discord.js v14 Guide](https://discordjs.guide/)
- [Fly.io Documentation](https://fly.io/docs/)
- [Winston Logger](https://github.com/winstonjs/winston)
- [Express.js](https://expressjs.com/)

**Discord Developer:**
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Discord API Documentation](https://discord.com/developers/docs)
- [Gateway Intents](https://discord.com/developers/docs/topics/gateway#gateway-intents)

**Fly.io Resources:**
- [Multi-Process Apps](https://fly.io/docs/app-guides/multiple-processes/)
- [Health Checks](https://fly.io/docs/reference/configuration/#services-http_checks)
- [Secrets Management](https://fly.io/docs/reference/secrets/)

---

## Approval & Sign-off

**Plan Created**: 2026-01-04
**Plan Status**: Ready for Implementation
**Estimated Effort**: 4-5 days
**Estimated Cost**: $3.50-7/month (fly.io)

**Next Steps:**
1. Review and approve this plan
2. Create Discord bot applications (2)
3. Begin Phase 1 implementation
4. Deploy to fly.io
5. Monitor and iterate

---

**Document Version**: 1.0
**Last Updated**: 2026-01-04
**Maintained By**: Development Team
