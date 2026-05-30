# Gnosis Frontend

React + Vite + TypeScript + Tailwind + shadcn/ui

## Quick Start

```bash
npm install
npm run dev
```

## Install missing deps

```bash
npm install react-router-dom react-dropzone axios clsx tailwind-merge lucide-react
```

## .env

```
VITE_API_URL=http://localhost:8000
```

## File Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx         # Left nav, MCP badge
│   │   └── PageWrapper.tsx     # Topbar + page shell
│   └── upload/
│       ├── DropZone.tsx        # react-dropzone wrapper
│       └── UploadQueue.tsx     # Progress list
├── pages/
│   ├── DashboardPage.tsx       # Greeting, stats, courses, gaps
│   ├── UploadPage.tsx          # File upload + quick note
│   ├── KnowledgeBasePage.tsx   # Browse + search notes
│   ├── ProgressPage.tsx        # Course coverage + timeline
│   └── SettingsPage.tsx        # Profile + MCP config
├── hooks/
│   └── index.ts                # useCourses, useNotes, useUpload, useProgress, useProfile
├── lib/
│   ├── api.ts                  # Axios calls — all endpoints
│   ├── types.ts                # Shared TypeScript types
│   └── utils.ts                # cn(), formatRelativeTime(), colors
└── App.tsx                     # BrowserRouter + Routes
```

## Mock Data

All pages include mock data fallbacks so the UI renders correctly before the
backend is running. Once Selorm's FastAPI server is up, mock data is
automatically replaced by real API responses.

## Connecting to Backend

The API client (`src/lib/api.ts`) hits `VITE_API_URL` (default: localhost:8000).
All endpoints match the routes defined in the architecture doc:

- `GET /api/courses`
- `GET /api/notes`
- `POST /api/upload/file`
- `GET /api/progress/stats`
- `GET /api/progress/gaps`
- etc.

## Color System

| Course    | Color     |
|-----------|-----------|
| ECON 201  | `#1D9E75` |
| BIO 102   | `#378ADD` |
| CHEM 301  | `#BA7517` |

Primary green: `#1D9E75` / `#0F6E56`
Background tint: `#E1F5EE`
