# Solitaire

Klondike solitaire as a Progressive Web App — playable in the browser and installable on phone or iPad.

**Play online:** [https://kimmania.github.io/game-solitaire/](https://kimmania.github.io/game-solitaire/)

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

## Games

| Game | Id | Notes |
|------|-----|--------|
| Klondike | `klondike` | Classic draw-1, unlimited stock recycle |
| FreeCell | `freecell` | All cards face up; four free cells |
| Spider (1 suit) | `spider` | Easiest — build down by rank; suit ignored |
| Spider (2 suits) | `spider-2` | Spades & hearts — build down in matching suit |
| Spider (4 suits) | `spider-4` | Full difficulty — all four suits |
| Yukon | `yukon` | All face up; move any face-up stack (alternating build) |
| Easthaven | `easthaven` | Build down in suit; one card at a time; stock + one recycle |
| Pyramid | `pyramid` | Pair exposed cards that sum to 13; clear the pyramid |
| TriPeaks | `tripeaks` | Clear three peaks — play ±1 rank onto the waste |
| Forty Thieves | `fortythieves` | Two decks, build down in suit; eight foundations |
| Eight Off | `eightoff` | Eight cells, build tableau down in suit |
| Canfield | `canfield` | Reserve pile, cyclic foundations from a starter rank |
| Scorpion | `scorpion` | Build down in suit; clear four King-to-Ace runs |

Use **Games** in the header to switch. Each game saves its own in-progress state.

## Architecture

- **`src/game/variant.ts`** — shared contract (`SolitaireVariant`, `PileRef`, `GameAction`).
- **`src/game/registry.ts`** — register variants; drives the game picker.
- **`src/game/<variant>/`** — rules, types, help, and tests per game.
- **`src/components/VariantBoard.tsx`** — routes to the correct board UI per variant.

Game progress is saved to `localStorage` and restored on reload.

## PWA

The build includes a web manifest and service worker (`vite-plugin-pwa`). On iOS: **Share → Add to Home Screen**.
