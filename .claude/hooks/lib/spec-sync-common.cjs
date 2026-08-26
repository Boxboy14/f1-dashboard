'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = process.cwd();
const SPEC_INDEX_PATH = path.join(REPO_ROOT, 'specs', 'spec-index.json');
const STATE_DIR = path.join(REPO_ROOT, '.claude', 'hooks', '.state');

const SRC_PREFIX = 'src/';

function readStdinJson() {
  let raw = '';
  try {
    raw = fs.readFileSync(0, 'utf8');
  } catch {
    return {};
  }
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function loadSpecIndex() {
  try {
    const parsed = JSON.parse(fs.readFileSync(SPEC_INDEX_PATH, 'utf8'));
    return parsed.buckets || {};
  } catch {
    return {};
  }
}

function toRepoRelativePosix(filePath) {
  if (!filePath) return null;
  const rel = path.isAbsolute(filePath) ? path.relative(REPO_ROOT, filePath) : filePath;
  return rel.split(path.sep).join('/');
}

// Longest/most-specific match wins: exact file entries beat directory prefixes,
// and longer prefixes beat shorter ones.
function matchBucket(relPath, buckets) {
  let best = null;
  for (const [name, def] of Object.entries(buckets)) {
    for (const entry of def.paths || []) {
      const isDir = entry.endsWith('/');
      const matches = isDir ? relPath.startsWith(entry) : relPath === entry;
      if (matches && (!best || entry.length > best.matchLength)) {
        best = { name, specs: def.specs || [], matchLength: entry.length };
      }
    }
  }
  return best;
}

function fallbackBucketKey(relPath) {
  const tabsMatch = relPath.match(/^src\/components\/tabs\/([^/]+)\//);
  if (tabsMatch) return `tabs:${tabsMatch[1]}`;
  const parts = relPath.split('/');
  const grouped = parts.slice(0, Math.min(3, Math.max(parts.length - 1, 1)));
  return grouped.join('/') || relPath;
}

function isTrackedSourceFile(relPath) {
  return !!relPath && relPath.startsWith(SRC_PREFIX);
}

function stateFilePath(sessionId) {
  if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR, { recursive: true });
  const safeId = String(sessionId || 'default').replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(STATE_DIR, `spec-sync-${safeId}.json`);
}

function readState(sessionId) {
  try {
    return JSON.parse(fs.readFileSync(stateFilePath(sessionId), 'utf8'));
  } catch {
    return { currentTurn: 0, answered: {}, pending: null };
  }
}

function writeState(sessionId, state) {
  fs.writeFileSync(stateFilePath(sessionId), JSON.stringify(state, null, 2));
}

module.exports = {
  REPO_ROOT,
  SPEC_INDEX_PATH,
  readStdinJson,
  loadSpecIndex,
  toRepoRelativePosix,
  matchBucket,
  fallbackBucketKey,
  isTrackedSourceFile,
  readState,
  writeState,
};
