# Solitaire

Klondike solitaire as a Progressive Web App — playable in the browser and installable on phone or iPad.

**Live site:** after enabling GitHub Pages, the game is served at  
`https://<username>.github.io/game-solitaire/`

## Play locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). For local dev the base path is `/game-solitaire/`; override with `BASE_PATH=/ npm run dev` if you prefer root.

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Development server       |
| `npm run build`| Production build         |
| `npm run preview` | Preview production build |
| `npm test`     | Run unit tests           |

## GitHub Pages setup

1. Push this repo to GitHub.
2. **Settings → Pages → Build and deployment:** Source = **GitHub Actions**.
3. Push to `main` (or run the **Deploy to GitHub Pages** workflow manually).

The workflow sets `BASE_PATH` to `/game-solitaire/` automatically from the repository name.

## Architecture

- **`src/game/variant.ts`** — shared contract for any solitaire ruleset (`SolitaireVariant`).
- **`src/game/registry.ts`** — register variants; UI reads the list when multiple games exist.
- **`src/game/klondike/`** — Klondike deal, rules, and tests (v1).
- Future variants (Spider, FreeCell, etc.) add a folder + entry in `VARIANTS` / `byId`.

Game progress is saved to `localStorage` and restored on reload.

## PWA

The build includes a web manifest and service worker (`vite-plugin-pwa`). On iOS: **Share → Add to Home Screen**.
