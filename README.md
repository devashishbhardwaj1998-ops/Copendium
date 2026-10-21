# Compendium

A private-markets complexity knowledge book: cases, checklists and real asset examples.
Built with React 19 + TypeScript + Vite + Tailwind CSS v4. Fully static, no server or API keys.

## Run locally

```
npm install
npm run dev        # http://localhost:3000
```

| Script              | What it does                     |
| ------------------- | -------------------------------- |
| `npm run dev`       | Dev server with hot reload       |
| `npm run typecheck` | TypeScript check only            |
| `npm run build`     | Production build to `dist/`      |
| `npm run preview`   | Serve the production build       |

## Deploy (GitHub Pages)

1. Settings → Pages → Build and deployment → Source: **GitHub Actions**
2. Push to `main`. The workflow type-checks, builds and publishes automatically.

Seed content lives in `src/data/seedData.ts`. Edits made in the app are stored in each
visitor's browser (localStorage) only.
