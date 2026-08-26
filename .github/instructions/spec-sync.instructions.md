---
applyTo: "src/**"
---

# Spec Sync — required before this change

You are about to touch a file under `src/`. **Stop and ask the developer first** — do not make the edit yet.

Ask exactly this, as a single question with three choices:

1. Update spec along with code changes (Recommended)
2. Do not update spec, just make code changes.
3. Create new spec

Steps:

1. Look up the file's path in `specs/spec-index.json` (`buckets.<name>.paths` / `.specs`) to find its matching spec folder(s). Mention what you found (or that nothing matched) when you ask.
2. Wait for the developer's choice before editing.
3. Act according to the choice — full procedure in `specs/SPEC_SYNC_POLICY.md`:
   - **Option 1**: make the code change, then update the matched `spec.md` (if behavior/scope changed) and the matched `plan.md`'s "Source Code" tree (if files were added/removed/renamed).
   - **Option 2**: make the code change only.
   - **Option 3**: make the code change, scaffold a new `specs/NNN-feature-name/` folder, and — required, not optional — add its source-folder mapping to `specs/spec-index.json`.

Only ask once per feature area per conversation turn — if you already asked about this same feature area earlier in this response, don't ask again; if this edit is in a different, unrelated feature area, ask again.
