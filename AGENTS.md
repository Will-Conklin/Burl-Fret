# Agent Guidance
- Scope: applies to the whole repository.
- SDLC docs live only in `docs/SDLC/` and must use the existing capitalization.
  - Subfolders: `plans/`, `research/`, `decisions/`, `reviews/`, `rca/`.
  - Keep `.gitkeep` placeholders until real content exists; remove the placeholder when adding a substantive file.
  - Prefer moving/renaming over copying when relocating SDLC documents to preserve history.
  - Use descriptive, kebab-case filenames for any new docs.
- Current codebase is a legacy single-bot `index.js` while a dual-bot v14 migration is planned (see `docs/SDLC/plans/dual-bot-flyio-deployment.md`). Align changes with that direction when possible and avoid inventing undocumented configuration.
