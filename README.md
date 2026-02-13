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
- **Liquid Glass theme**: Glassmorphism panels with backdrop-filter blur, prismatic borders, specular tracking, and coloured palette (#5848a0, #c83868, #289878, #c89030)
- **Profile switcher**: Multiple user profiles (Rael, Jooleeno, Ted, Abbie, Arthen) with avatar, level, XP, and coins
- **3D coin**: CSS 3D rotating coin with stacked edge slices, inner ridge, and ticker-synced spin animation
- **Stat ticker**: Rotating topbar display cycling through Level, XP, Coins, Season progress
- **Solo setlist builder**: Paginated song grid with instrument/difficulty/space/loadout buttons, cover art, and coloured metadata bubbles (title, artist, duration, BPM)
- **Setlist pagination**: Animated page transitions with directional slide when navigating up/down
- **Song metadata**: 100 songs with authored duration, BPM, genre, and decade fields (loaded from `songs.json`)
- **Popup overlays**: Solo options, loadout, purchase, save/load setlists — all with close buttons, centered to the 1920x1920 viewport
- **SVG nav icons**: Inline SVG icons replacing Unicode characters for consistent VR rendering
- **VR optimised**: Minimum 16px text sizes, :active hover fallbacks for laser pointers, page cross-fade transitions
- **Shimmer animations**: Three-tier hover system (idle/hover/active) with staggered delays
- **Vuplex bridge**: JSON message passing to/from Unity game engine

## Constraints

- **Chromium 91 only** (Vuplex WebView on Quest)
- ES5 JavaScript: no `let`/`const`, no arrow functions, no template literals, no `class`
- Single file: all CSS, HTML, and JS inline in `index.html`
- No build step — served directly to WebView

## Project Structure

```
index.html              # The full UI prototype (~8100 lines)
songs.json              # Song library (100 tracks with metadata)
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
