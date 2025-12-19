# Campus LMS Frontend

React + TypeScript + Vite frontend for the Campus LMS.

## Prerequisites

- Node.js 18+ and npm
- Backend running on `http://localhost:8080`

## Development

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:5173`.

### API Proxy

In development, requests to `/api/*` are proxied to the backend (`http://localhost:8080`) via `vite.config.ts`.

## Build

```bash
cd frontend
npm run build
```

Output is generated in `frontend/dist/`.

## Project Structure (high level)

- `src/api/`: API client + endpoint wrappers
- `src/context/`: Auth context
- `src/components/`: Shared UI components
- `src/pages/`: Pages (dashboards, CRUD screens)
