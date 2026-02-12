# Jamsesh - VR Music Rhythm Game UI

Single-file HTML/CSS/JS UI prototype for **Jamsesh**, a VR music rhythm game running inside Vuplex WebView on Meta Quest headsets. Fixed 1920x1920 pixel viewport.

## Quick Start

```bash
# Serve with live reload
npx browser-sync start --server --files "*.html" --port 3000 --no-open
```

Open http://localhost:3000 in your browser.

## Features

- **8 navigable pages**: Home, Social, Spaces, Play, Vault, Store, Season, Settings
- **11 themes**: Wireframe Light/Dark, Neon Pink, Cyber Cyan, Sunset Blaze, Light Mode, Rainforest, Neon Arcade, Hunter, Nebula, Liquid Glass
- **Profile switcher**: Multiple user profiles (Rael, Jooleeno, Ted, Abbie, Arthen) with avatar, level, XP, and coins
- **Stat ticker**: Rotating topbar display cycling through Level, XP, Coins, Season progress
- **Solo setlist builder**: Paginated song grid with instrument buttons, cover art, and modifier controls
- **Popup overlays**: Solo options, loadout, purchase, save/load setlists — all centered to the 1920x1920 viewport
- **Shimmer animations**: Three-tier hover system (idle/hover/active) with staggered delays
- **Vuplex bridge**: JSON message passing to/from Unity game engine

## Constraints

- **Chromium 91 only** (Vuplex WebView on Quest)
- ES5 JavaScript: no `let`/`const`, no arrow functions, no template literals, no `class`
- Single file: all CSS, HTML, and JS inline in `index.html`
- No build step — served directly to WebView

## Project Structure

```
index.html              # The full UI prototype (~7500 lines)
CLAUDE.md               # AI coding assistant instructions
screenshot_script.cjs   # Playwright automated screenshot testing
rael_new.png            # Profile avatar - Rael
jooleeno.jpg            # Profile avatar - Jooleeno
ted.png                 # Profile avatar - Ted
abbie.png               # Profile avatar - Abbie
arthen.jpg              # Profile avatar - Arthen
art/                    # Song cover artwork (001-100.jpg)
src/                    # Figma Make-exported React/Vite app (reference only)
```

## Reference App (src/)

The `src/` directory contains a separate Figma-exported React/Vite application — not the primary working file.

```bash
npm install
npm run dev      # Vite dev server
npm run build    # Production build
```
