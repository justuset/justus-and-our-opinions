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

## `/photo-essay`: the photo essay in the reference page's React components

The photo-essay template (`projects/photo-essay`, Svelte) rebuilt with the components the shipped Opinion photo essay
uses: `HeaderBasic`, `ParagraphBlock`, `MediaFigure`, `Diptych`, `Scrolly`, `ResponsiveAd`, `RelatedLinks` and the
platform shell, each block inside `withErrorBoundary`. One doc feeds both templates:
`app/article/fromBirdkitDoc.ts` converts `projects/photo-essay/content/doc.json` into the platform's `__typename`
blocks on the server.

```bash
npm run dev -w @opinion/story        # copies the photos, then http://localhost:5173/photo-essay
npm run check -w @opinion/story      # route types + tsc
npm run test:e2e -w @opinion/story   # Playwright at 390 / 800 / 1440, JS on and off
```

| Svelte (projects/photo-essay) | Block `__typename` | React component |
|---|---|---|
| `Header` | `HeaderBasicBlock` | `HeaderBasic` › `Opinion`, `HangingPunctuation`, `Timestamp`, `MediaFigure` |
| `Text` ($kit) | `ParagraphBlock` | `ParagraphBlock` › `Italic` |
| `Photo` | `ImageBlock` | `MediaFigure` › `Credit` |
| `Diptych` | `DiptychBlock` | `Diptych` |
| `PhotoScrolly` | `UnstructuredBlock` (`ExperimentalBlock_Scrolly`) | `Scrolly` (class component) |
| `Bio` | `ParagraphBlock` (italic) | `ParagraphBlock` › `Italic` |
| shell `AdSlot` | `Dropzone` | `ResponsiveAd` › `AdSlot` |
| shell `Recirc` | `RelatedLinksBlock` (in body) + `Recirc` (shell) | `RelatedLinks` › `RelatedLink` |
| `Blocks` ($kit) | | `Body` + `withErrorBoundary` |

Photos are copied from `projects/photo-essay/big_assets/images` into `public/images` (gitignored) by
`npm run photos`, which runs before `dev` and `build`.
