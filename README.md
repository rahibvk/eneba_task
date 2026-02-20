# eneba-task

A game marketplace search app with FTS5 full-text search, React UI, cart/checkout sidebar, and a single deployable service.

## Tech Stack

| Layer       | Technology               |
|-------------|--------------------------|
| Frontend    | React 19 + Vite 7        |
| Backend     | Node.js + Express        |
| Database    | SQLite (better-sqlite3)  |
| Search      | FTS5 (Full-Text Search)  |
| Deploy      | Render (single service)  |

## Features

- **Full-text search** — instant fuzzy search powered by SQLite FTS5
- **Debounced input** — 300ms debounce for smooth typing experience
- **Game catalog** — 13 games with real cover art from Steam CDN
- **Cart & Checkout** — add/remove games, sidebar with running total
- **Single deployable** — API serves the React build in production
- **Health endpoint** — `GET /health` for uptime monitoring
- **API tests** — Jest + Supertest for endpoint validation

## Project Structure

```
eneba-task/
├── api/                  # Backend
│   ├── src/
│   │   ├── server.js     # Express app + static hosting
│   │   ├── db.js         # SQLite schema + seed data
│   │   ├── listRoute.js  # GET /list endpoint
│   │   └── server.test.js
│   └── package.json
├── web/                  # Frontend
│   ├── src/
│   │   ├── App.jsx       # Main UI + cart logic
│   │   ├── api.js        # API client
│   │   ├── useDebouncedValue.js
│   │   ├── App.css
│   │   └── index.css
│   ├── .env
│   └── package.json
└── package.json          # Root monorepo scripts
```

## API

| Method | Endpoint  | Params                          | Description        |
|--------|-----------|---------------------------------|--------------------|
| GET    | `/health` | —                               | Health check       |
| GET    | `/list`   | `?search=&limit=50&offset=0`    | Search/list games  |

## Local Development

```bash
# Terminal 1 — API (port 4000)
cd api && npm install && npm run dev

# Terminal 2 — Web (port 5173)
cd web && npm install && npm run dev
```

## Local Production

```bash
npm run install:all
npm run build:web
NODE_ENV=production PORT=4000 npm run start
```

Open http://localhost:4000

## Run Tests

```bash
cd api && npx jest
```

## Deploy (Render)

| Setting         | Value                                       |
|-----------------|---------------------------------------------|
| Build Command   | `npm run install:all && npm run build:web`  |
| Start Command   | `npm run start`                             |
| Env Variable    | `NODE_ENV=production`                       |

## Author

Rahib — [@rahibvk](https://github.com/rahibvk)
