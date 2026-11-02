# Portfolio

Personal portfolio site built with Vue 3, Vue Router and Vite. All page content lives in `src/data/profile.js`.

## Run locally

```bash
npm install
npm run dev
```

## Run with Docker

Production build served by nginx at http://localhost:8080:

```bash
docker compose up -d --build web
```

Dev server with hot reload at http://localhost:5173:

```bash
docker compose --profile dev up dev
```

Stop everything with `docker compose --profile dev down`.
