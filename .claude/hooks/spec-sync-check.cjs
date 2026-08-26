'use strict';

// PreToolUse hook (Edit|Write|NotebookEdit): blocks edits to src/** until the
// developer has been asked, once per feature area per turn, whether to update
// the matching spec. See specs/SPEC_SYNC_POLICY.md.

const {
  readStdinJson,
  loadSpecIndex,
  toRepoRelativePosix,
  matchBucket,
  fallbackBucketKey,
  isTrackedSourceFile,
  readState,
  writeState,
} = require('./lib/spec-sync-common.cjs');

function main() {
  const input = readStdinJson();
  const toolName = input.tool_name;
  if (!['Edit', 'Write', 'NotebookEdit'].includes(toolName)) process.exit(0);

  const toolInput = input.tool_input || {};
  const filePath = toolInput.file_path || toolInput.notebook_path;
  const relPath = toRepoRelativePosix(filePath);
  if (!isTrackedSourceFile(relPath)) process.exit(0);

  const sessionId = input.session_id || 'default';
  const state = readState(sessionId);
  const buckets = loadSpecIndex();
  const matched = matchBucket(relPath, buckets);
  const bucketKey = matched ? matched.name : fallbackBucketKey(relPath);
  const specs = matched ? matched.specs : [];

  const answered = state.answered && state.answered[bucketKey];
  if (answered && answered.turn === state.currentTurn) {
    process.exit(0);
  }

  state.pending = { bucket: bucketKey, turn: state.currentTurn, specs };
  writeState(sessionId, state);

  const specLine = specs.length
    ? `Candidate spec(s) already on file for this area: ${specs.join(', ')} (see specs/<folder>/spec.md and plan.md).`
    : 'No existing spec matches this path in specs/spec-index.json — this looks like new functionality.';

  const reason = [
    `Spec Sync Policy: you're about to edit "${relPath}" (feature area: ${bucketKey}), and this feature area hasn't been confirmed with the developer yet this turn.`,
    specLine,
    'Before proceeding, call AskUserQuestion with header "SpecSync" and exactly these 3 options:',
    '1. Update spec along with code changes (Recommended)',
    '2. Do not update spec, just make code changes.',
    '3. Create new spec',
    'Then retry this edit — it will go through once the answer is recorded. See specs/SPEC_SYNC_POLICY.md for what each option requires.',
  ].join('\n');

  process.stderr.write(reason);
  process.exit(2);
}

main();
