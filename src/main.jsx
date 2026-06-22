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
import ThemeProvider from "./theme/ThemeProvider.jsx";
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
      gcTime: 24 * 60 * 60 * 1000,
    },
  },
});

restoreQueryCache(queryClient);
persistQueryCache(queryClient);

ModuleRegistry.registerModules([AllCommunityModule]);

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <StrictMode>
            <App />
          </StrictMode>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </Provider>,
);
