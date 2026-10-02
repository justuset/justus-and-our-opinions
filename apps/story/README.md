# @opinion/story

The React story page: React 19 + React Router 7 in framework mode, with **Node server rendering** (`ssr: true`).
Every request gets fully rendered HTML; React then hydrates it.

```bash
npm run dev -w @opinion/story     # http://localhost:5173
npm run build -w @opinion/story   # build/client (static assets) + build/server (the Node renderer)
npm run start -w @opinion/story   # serve the production build
```

Styles come from `@opinion/design-system`; story copy will come from `@opinion/archie` (chunk 03).
See [docs/plan/phase-2](../../docs/plan/phase-2/README.md).
