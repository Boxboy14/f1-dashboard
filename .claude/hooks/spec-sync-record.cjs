'use strict';

// PostToolUse hook (AskUserQuestion): if a spec-sync question is pending for
// this turn, records the developer's choice so spec-sync-check.cjs lets the
// retried edit through, and reminds about updating spec-index.json when
// "create new spec" was chosen for a previously-unmapped feature area.

const { readStdinJson, readState, writeState } = require('./lib/spec-sync-common.cjs');

function classifyAnswer(text) {
  if (typeof text !== 'string') return null;
  const t = text.toLowerCase();
  if (t.includes('create new spec')) return 'new';
  if (t.includes('do not update spec')) return 'skip';
  if (t.includes('update spec')) return 'update';
  return null;
}

function findAnswerChoice(value) {
  if (value == null) return null;
  if (typeof value === 'string') return classifyAnswer(value);
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findAnswerChoice(item);
      if (found) return found;
    }
    return null;
  }
  if (typeof value === 'object') {
    for (const item of Object.values(value)) {
      const found = findAnswerChoice(item);
      if (found) return found;
    }
  }
  return null;
}

function main() {
  const input = readStdinJson();
  if (input.tool_name !== 'AskUserQuestion') process.exit(0);

  const sessionId = input.session_id || 'default';
  const state = readState(sessionId);

  if (!state.pending || state.pending.turn !== state.currentTurn) process.exit(0);

  const choice = findAnswerChoice(input.tool_response);
  if (!choice) process.exit(0); // not (recognizably) the spec-sync question; leave pending for a real retry

  const { bucket, specs } = state.pending;
  state.answered = state.answered || {};
  state.answered[bucket] = { turn: state.currentTurn, choice };
  state.pending = null;
  writeState(sessionId, state);

  if (choice === 'new' && (!specs || specs.length === 0)) {
    process.stderr.write(
      `Spec Sync reminder: once the new spec folder is created, add its source-folder mapping to specs/spec-index.json (feature area "${bucket}") as the final step — that's what makes it discoverable next time. See specs/SPEC_SYNC_POLICY.md.`
    );
    process.exit(2);
  }

  process.exit(0);
}

main();
