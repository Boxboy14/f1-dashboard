'use strict';

// PostToolUse hook (Write): safety net for the "create new spec" flow. When a
// new specs/<folder>/spec.md is written, checks whether spec-index.json
// already references that spec folder anywhere; if not, reminds the agent to
// add the mapping before finishing. Non-blocking — the spec write already
// succeeded, this is just a nudge. See specs/SPEC_SYNC_POLICY.md.

const fs = require('fs');
const path = require('path');
const { readStdinJson, toRepoRelativePosix, REPO_ROOT } = require('./lib/spec-sync-common.cjs');

function main() {
  const input = readStdinJson();
  if (input.tool_name !== 'Write') process.exit(0);

  const toolInput = input.tool_input || {};
  const relPath = toRepoRelativePosix(toolInput.file_path);
  const match = relPath && relPath.match(/^specs\/([^/]+)\/spec\.md$/);
  if (!match) process.exit(0);

  const specFolder = match[1];
  const indexPath = path.join(REPO_ROOT, 'specs', 'spec-index.json');

  let indexed = true; // fail open: an unreadable index shouldn't block/nag on every new spec
  try {
    const data = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    const buckets = data.buckets || {};
    indexed = Object.values(buckets).some((b) => (b.specs || []).includes(specFolder));
  } catch {
    process.exit(0);
  }

  if (!indexed) {
    process.stderr.write(
      `Spec Sync reminder: "specs/${specFolder}/spec.md" was just created but isn't referenced anywhere in specs/spec-index.json yet. Before finishing this feature, add a bucket entry mapping its source folder(s) to "${specFolder}". See specs/SPEC_SYNC_POLICY.md.`
    );
    process.exit(2);
  }

  process.exit(0);
}

main();
