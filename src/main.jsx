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

// Register the community modules
ModuleRegistry.registerModules([AllCommunityModule]);

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <SaltProvider mode="dark" applyClassesTo="root">
      <StrictMode>
        <App />
      </StrictMode>
    </SaltProvider>
  </Provider>,
);
