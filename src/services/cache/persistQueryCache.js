import { dehydrate, hydrate } from "@tanstack/react-query";

const KEY = "f1-dashboard-query-cache-v1";
const MAX_AGE = 24 * 60 * 60 * 1000;

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
      // eslint-disable-next-line no-empty
    } catch {
    }
  };
  queryClient.getQueryCache().subscribe(() => {
    clearTimeout(timeout);
    timeout = setTimeout(write, 1000);
  });
}

export { restoreQueryCache, persistQueryCache };
