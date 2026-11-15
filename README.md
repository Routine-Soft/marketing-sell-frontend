# Marketing Sell — Frontend (web app)

Web app for **Marketing Sell**, a multi-tenant lead generation and sales routine system. It looks and works like the "Marketing and Sales Routine" spreadsheet it replaced: each spreadsheet tab is a screen, with a grid, a colored header and cells colored by status.

![React](https://img.shields.io/badge/react-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/vite-build-646CFF?logo=vite&logoColor=white)
![Vercel](https://img.shields.io/badge/deploy-vercel-000000?logo=vercel)
![License](https://img.shields.io/badge/license-private-lightgrey)

## Demo

- **API:** https://api-marketingsell.sonelia.com.br/api (backend in [`marketing-sell-backend`](../marketing-sell-backend))

## Features

- **Businesses:** switch between several businesses in the same account; each one has its own menu, tabs and routine.
- **Daily routine** (home screen): weekly grid of tasks, with automatic tasks checked by the system.
- **Routine editor:** blocks and tasks, ready-made templates and templates saved by the account.
- **Leads:** list with filters, bulk selection, editing, CSV export and contact tracking.
- **Lead search:** NPI, Google Places, new US companies, Texas licenses and new Brazilian companies by activity.
- **Email:** senders with Gmail, "Today's emails" card with a progress bar per Gmail, send emails with preview and cancel the queue.
- **Spreadsheet tabs:** partners, communities and events, preparation and ads checklists.
- **Video and article ideas:** days in sequence with cards, plus an idea bank.
- **Add and edit always in a modal**, with in-place delete confirmation.
- **Three languages:** Portuguese, English and Spanish.
- **Four theme options:** light, pink, dark and "follow the system".
- **Installable as an app (PWA)**, mobile first.

## Tech stack

| Area | Technology |
|---|---|
| UI | React 19 |
| Build | Vite |
| Routing | React Router (`HashRouter`) |
| Styles | Plain CSS with design tokens (`theme.css`, `ui.css`, `planilha.css`) |
| HTTP | Native `fetch` through a single `httpClient` |
| Quality | ESLint |
| Hosting | Vercel |

## Prerequisites

- **Node.js 26.13.1** (see `.nvmrc`; with nvm, run `nvm use`)
- **npm**
- The backend running locally, or the URL of a test API

## Installation

```bash
git clone <repository-url> marketing-sell-frontend
cd marketing-sell-frontend
nvm use
npm install
cp .env.example .env.local   # set VITE_API_URL
npm run dev
```

The app opens at `http://localhost:5173`.

## Configuration (environment variables)

Only public values go here: everything starting with `VITE_` ends up in the browser bundle.

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | API base URL, including `/api` |

```env
VITE_API_URL=http://localhost:8080/api
```

## Usage

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite dev server |
| `npm run build` | Builds the production bundle in `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Runs ESLint |

Quick check before pushing:

```bash
npx eslint src
npx vite build
```

## Folder structure

```
marketing-sell-frontend/
├── public/               # Icons and PWA manifest
└── src/
    ├── App.jsx           # Routes (HashRouter)
    ├── components/       # Shared components (Planilha, Modal, CrudCard, Sidebar, CampoSenha...)
    ├── context/          # Auth, theme and open business
    ├── hooks/            # useAuth, useTheme, useNegocio, useLista
    ├── i18n/             # English (en.js) and Spanish (es.js) dictionaries
    ├── layouts/          # Main layout with the sidebar
    ├── modules/
    │   └── <entity>/     # rotina, negocio, lead, captacao, remetente, envio,
    │                     # parceiro, comunidade, checklist, ideia, user
    ├── services/         # httpClient
    ├── styles/           # theme.css, ui.css, planilha.css (spreadsheet look)
    └── utils/
```

## Deployment

- Hosted on **Vercel**. Every push to `main` publishes automatically.
- Set `VITE_API_URL` in the Vercel project settings.
- When a change touches both projects, deploy the **backend first**, then push the frontend.

## Contributing

1. Create a branch from `main`: `feature/<name>` (or `fix/<name>`).
2. Every screen text goes through `tr('Portuguese text')` and needs its translations in `src/i18n/en.js` and `src/i18n/es.js`.
3. Keep the spreadsheet look: use the classes in `styles/planilha.css` and the `--aba-*` colors.
4. Every color comes from a token; every screen must work on mobile.
5. Run `npx eslint src` and `npx vite build` before opening a pull request.
6. Write commit messages in Portuguese and open a pull request to `main`.

## License and author

**Private and proprietary.** All rights reserved. Copying, distribution or use without authorization is not allowed.

Developed by **Stanley Andrade**.
