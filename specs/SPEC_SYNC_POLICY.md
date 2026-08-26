# Spec Sync Policy

This repo follows GitHub Spec Kit (`specs/NNN-feature-name/`, workflow in the root `plan.md`). This policy keeps specs from drifting silently out of sync with the code.

**Rule**: before editing or creating any file under `src/`, a coding agent must first ask the developer to choose one of:

1. **Update spec along with code changes (Recommended)** — after making the code change, also update the matching spec.
2. **Do not update spec, just make code changes.**
3. **Create new spec** — this is new functionality with no existing spec.

`specs/spec-index.json` maps source-code locations to the spec folder(s) that cover them. Look up the file being changed there first — its `buckets.<name>.specs` array lists the candidate spec folder(s). If nothing matches, say so plainly and lean toward option 3.

## What each option requires

**Option 1 — Update spec**: this is a direct, lightweight edit, not a full re-run of `/speckit-plan`.
- If the change alters behavior, user-facing scope, or edge cases: update the matched `spec.md` (Functional Requirements / Edge Cases).
- If files were added, removed, or renamed: update the "Source Code (repository root)" tree in the matched `plan.md`.
- If a tracked task was completed: check it off in `tasks.md`.
- If a feature area has more than one spec folder (e.g. telemetry → 007/008/010), use judgment — update whichever spec's scope actually covers the change; when genuinely unclear, ask.

**Option 2 — Skip**: proceed with the code-only change. Nothing further required.

**Option 3 — Create new spec**:
1. Determine the next spec number (highest existing `specs/NNN-*` + 1).
2. Scaffold `specs/NNN-feature-name/` — prefer the `speckit-specify` skill; otherwise copy the structure from `.specify/templates/`.
3. **Add the new source-folder → spec-folder mapping to `specs/spec-index.json`.** This is required, not optional — it's what makes the new spec discoverable the next time this feature area is touched. Two Claude Code hooks (`spec-sync-record.cjs`, `spec-sync-index-check.cjs`) will remind you if this is skipped, but don't rely on the reminder — do it as part of finishing the task.

## Enforcement

- **Claude Code**: hard-enforced via `.claude/hooks/` — a `PreToolUse` hook blocks `Edit`/`Write`/`NotebookEdit` on `src/**` until this question has been asked and answered once for that feature area in the current turn (a new user message resets it, so a later unrelated feature area is asked about too).
- **GitHub Copilot / other agents**: best-effort only, via `.github/copilot-instructions.md` and `.github/instructions/spec-sync.instructions.md`. There is no tool-blocking mechanism available — treat this as a strong instruction, not a guarantee.
