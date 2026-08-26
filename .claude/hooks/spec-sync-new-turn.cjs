'use strict';

// UserPromptSubmit hook: starts a new "turn" so spec-sync-check.cjs re-asks
// about any feature area touched in this new message, even one it already
// asked about earlier in the conversation.

const { readStdinJson, readState, writeState } = require('./lib/spec-sync-common.cjs');

function main() {
  const input = readStdinJson();
  const sessionId = input.session_id || 'default';
  const state = readState(sessionId);
  state.currentTurn = (state.currentTurn || 0) + 1;
  state.pending = null;
  writeState(sessionId, state);
  process.exit(0);
}

main();
