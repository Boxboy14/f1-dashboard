import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "@salt-ds/theme/index.css";
import "@salt-ds/core/css/salt-core.css";
import "@salt-ds/lab/css/salt-lab.css";
import "./salt-overrides.css";
import App from "./App.jsx";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import store from "./store/store.js";
import { Provider } from "react-redux";
import { SaltProvider } from "@salt-ds/core";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  restoreQueryCache,
  persistQueryCache,
} from "./services/cache/persistQueryCache.js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      gcTime: 24 * 60 * 60 * 1000, // keep cache long enough to persist + reuse
    },
  },
});

// Restore before first render so the UI paints from cache, then keep persisting.
restoreQueryCache(queryClient);
persistQueryCache(queryClient);

// Register the community modules
ModuleRegistry.registerModules([AllCommunityModule]);

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <SaltProvider mode="dark" applyClassesTo="root">
        <BrowserRouter>
          <StrictMode>
            <App />
          </StrictMode>
        </BrowserRouter>
      </SaltProvider>
    </QueryClientProvider>
  </Provider>,
);
