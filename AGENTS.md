# Repository Guidance

## Documentation Structure
- Keep SDLC docs under `docs/SDLC/` using the existing capitalization.
- Use these subfolders for SDLC materials:
  - `plans/` — implementation plans only.
  - `research/` — research notes and spikes.
  - `decisions/` — architectural or technical decisions (e.g., ADRs).
  - `reviews/` — design or code review records.
  - `rca/` — post-incident and root cause analyses.
- Empty subfolders should retain a `.gitkeep` until real content replaces it. Remove the placeholder once a substantive file exists in that folder.

## General Notes
- Prefer moving or renaming files over copying to preserve history when relocating documents within `docs/SDLC`.
- Keep filenames descriptive and kebab-cased.
