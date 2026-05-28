# F1 Dashboard

A Formula 1 stats dashboard for F1 fans — fast access to driver and team standings, race results, telemetry, and (eventually) an AI assistant for natural-language queries.

Data comes from the [OpenF1 API](https://openf1.org/). Free tier covers historical data from 2023 onwards.

## Stack

React 19 · React Router 7 · Redux Toolkit · TanStack Query · ag-grid 35 · Salt Design System · SCSS Modules · Vite

## Getting Started

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check and produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint over the codebase |

## Project Structure

```
src/
├── components/dashboard/   # Page-level components (DriversGrid, Sidebar, Navbar, …)
├── hooks/useOpenF1.js      # TanStack Query hooks — one per OpenF1 endpoint
├── services/api/openf1.js  # Single source of truth for API calls
├── constants/              # Shared maps (country codes, team colors, …)
├── store/                  # Redux slices (client-only UI state)
└── main.jsx                # App entry, providers, router setup
```

## Planning & Specs

- **[plan.md](./plan.md)** — full project plan: scope, phases, routes, OpenF1 reference, current state. Read this before adding any feature.
- **[.specify/memory/constitution.md](./.specify/memory/constitution.md)** — non-negotiable project principles.
- **[CLAUDE.md](./CLAUDE.md)** — rules Claude Code follows when generating code (not committed; lives locally).
- New features start with `/speckit-specify` and follow the Speckit workflow described in `plan.md`.
