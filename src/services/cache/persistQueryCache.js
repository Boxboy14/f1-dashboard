import { dehydrate, hydrate } from "@tanstack/react-query";

// Historical F1 data never changes, so we persist successful query results to
// localStorage and restore them on startup. Reloads then paint instantly from
// cache instead of re-hitting the rate-limited OpenF1 API. Built on the core
// dehydrate/hydrate helpers — no extra dependency.

const KEY = "f1-dashboard-query-cache-v1";
const MAX_AGE = 24 * 60 * 60 * 1000; // 24h

function restoreQueryCache(queryClient) {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const { timestamp, state } = JSON.parse(raw);
    if (Date.now() - timestamp > MAX_AGE) {
      localStorage.removeItem(KEY);
      return;
    }
    hydrate(queryClient, state);
  } catch {
    localStorage.removeItem(KEY);
  }
}

function persistQueryCache(queryClient) {
  let timeout = null;
  const write = () => {
    try {
      const state = dehydrate(queryClient, {
        shouldDehydrateQuery: (query) => query.state.status === "success",
      });
      localStorage.setItem(KEY, JSON.stringify({ timestamp: Date.now(), state }));
    } catch {
      // localStorage full or value not serialisable — skip this write
    }
  };
  // Debounce: a page load settles many queries in quick succession.
  queryClient.getQueryCache().subscribe(() => {
    clearTimeout(timeout);
    timeout = setTimeout(write, 1000);
  });
}

export { restoreQueryCache, persistQueryCache };
