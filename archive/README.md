# Archive Directory

This directory contains deprecated code that has been replaced by newer implementations.

## Files

### index.js.deprecated

**Deprecated:** 2026-01-06
**Reason:** Security vulnerabilities and deprecated Discord.js v12
**Replaced By:** TypeScript implementation in `src/bots/`

**Known Issues in This File:**
1. Uses Discord.js v12 (deprecated, security vulnerabilities)
2. Hardcoded config.json dependency (token exposure risk)
3. Logs all messages to console (PII exposure, disk exhaustion)
4. Missing permission checks on nickname changes
5. No rate limiting or cooldown enforcement
6. No structured logging

**Do NOT use this file in production.**

For current implementation, see:
- `src/bots/bumbles/index.ts`
- `src/bots/discocowboy/index.ts`
