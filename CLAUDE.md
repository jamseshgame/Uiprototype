# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jamsesh is a VR music rhythm game. This repo contains its UI prototype — a **single-file HTML/CSS/JS application** (`index.html`, ~8000 lines) designed to run inside **Vuplex WebView on Meta Quest headsets**. The viewport is a fixed **1920x1920 pixel** panel.

There is also a `src/` directory with a Figma Make-exported React/Vite app — this is a separate reference artifact and is **not** the primary working file.

## Development

```bash
# Serve index.html locally with live reload
npx browser-sync start --server --files "index.html" --no-open

# The React/Figma app (not the main prototype):
npm install
npm run dev      # Vite dev server
npm run build    # Vite production build
```

## Critical Constraints

- **Chromium 91 only** (Vuplex WebView on Quest). This means:
  - **ES5 JavaScript**: No `let`/`const`, no arrow functions, no template literals, no destructuring, no `class`, no `for...of`, no `Promise`/`async`/`await`
  - Use `var`, `function(){}`, string concatenation with `+`
  - `:not()` CSS pseudo-class only accepts **simple selectors** (not `.parent .child`)
  - No CSS `gap` on flex in older builds; test carefully
- **Single file**: All CSS is in `<style>`, all JS is in `<script>`, all HTML is inline
- **No build step**: The file is served directly to the WebView

## Data Files

- **songs.json**: Song library containing 100 tracks with metadata fields: `rank`, `title`, `artist`, `file` (path to cover art in `art/`), `duration` (seconds), `bpm`, `genre`, `decade`
  - Loaded and rendered by `buildSoloPanel()` to generate the paginated setlist grid
  - Cover art files are `art/001.jpg` through `art/100.jpg`
- **Profile avatars**: `rael_new.png`, `jooleeno.jpg`, `ted.png`, `abbie.png`, `arthen.jpg` — used by the profile switcher in the topbar
- **screenshot_script.cjs**: Playwright-based automated screenshot testing (not part of the main prototype)

## Architecture of index.html

### Structure (top to bottom)
1. **CSS** (lines 9–4965): Global styles, component styles, theme overrides (Arcade, Hunter, Nebula, Liquid Glass, Wireframe), shimmer animations
2. **HTML** (lines 4969–5644): `.viewport` containing `.topbar`, `.page` elements (home, play, career, season, social, spaces, vault, store, settings), `.navbar`, and all popup overlays (inside `.viewport` for correct centering)
3. **JavaScript** (lines 5645–8005): Vuplex bridge, navigation, page builders, theme engine, profile system, data

### Theme System
- `var themes = [...]` array (~20 themes) defines theme objects with `id`, `bg`, `panel`, `tile`, `tileHover`, `accent`, and optional `cssClass`, `locked`, `price`
- `applyTheme(themeId)` takes a **string ID** (not an object), sets CSS custom properties on `:root`, auto-derives light/dark text colors via `hexLum()`
- Themes with `cssClass` (e.g., `'theme-arcade'`, `'theme-hunter'`, `'theme-nebula'`, `'theme-liquid'`) add a class to `.viewport` enabling scoped CSS overrides
- Wireframe Light/Dark themes use `cssClass: 'theme-wireframe'` for B&W flow testing (Arial font, no color, no shimmer)
- Some themes are `locked: true` with a `price` — purchased via in-UI coin system

### Navigation
- Pages use `display: none` / `.page.active { display: flex }` — **elements in hidden pages have 0 `offsetHeight`**
- `navigateTo(pageName)` toggles page visibility and updates navbar
- Song picker is a sub-panel within the Play page, toggled via `showPlayPicker()`/`hidePlayPicker()`

### Solo Panel & Pagination
- `SOLO_PER_PAGE = 3` rows per page, paginated with arrow buttons
- `buildSoloPanel()` renders the setlist grid with instrument buttons, cover art, and metadata bubbles (title, artist, duration, BPM)
- Song metadata is loaded from `songs.json` and displayed as colored bubbles on each song tile
- Page transitions use directional slide animations (up/down) when navigating between pages
- `sizeSoloPeek()` must be called when the Play page **becomes visible** (not during init when page is `display: none`)

### Popup Overlays
- All overlays (solo-popup, loadout, purchase, save, load) live **inside `.viewport`** and use `position: absolute` to center relative to the 1920x1920 UI panel
- Overlays use `z-index: 999`

### Profile System
- `var profiles = [...]` defines user profiles (Rael, Jooleeno, Ted, Abbie, Arthen) with avatar, level, XP, coins
- `initStatTicker()` drives the topbar stat ticker rotating through Level, XP, Coins, Season progress

### Vuplex Bridge
- `sendToUnity(type, data)` sends JSON messages to the Unity game via `window.vuplex.postMessage()`
- All user actions (navigation, song selection, theme changes) emit bridge messages

### CSS Custom Properties
Key variables set by themes: `--bg-body`, `--bg-panel`, `--bg-surface`, `--bg-surface-hover`, `--pink` (accent), `--text-primary`, `--text-secondary`, `--text-muted`, `--border-strong`, `--border-subtle`, `--panel-radius`, `--grid-gap`, `--tile-h`, `--nav-btn-h`

### Shimmer Animations
- `::before` pseudo-element on interactive elements (nav items, buttons, tiles)
- Three tiers: `shimmerIdle` (10s), `shimmerHover` (3s), `shimmerActive` (0.6s)
- Staggered `animation-delay` per element type
- Disabled in wireframe themes via `display: none !important`

### VR-Specific Optimizations
- **Minimum text size**: 16px minimum for all text to ensure readability in VR
- **SVG nav icons**: Inline SVG icons replace Unicode characters for consistent rendering across VR WebView
- **:active fallbacks**: Interactive elements use `:active` pseudo-class for Quest laser pointer compatibility (since hover is unreliable)
- **Page transitions**: Cross-fade animations between pages for smooth VR navigation
- **3D coin**: CSS 3D transform-based rotating coin in topbar with stacked edge slices and ticker-synced animation

## Common Pitfalls

- **Measuring hidden elements**: `offsetHeight` returns 0 for elements inside `display: none` pages. Schedule measurements in `navigateTo()` callbacks when the page becomes active.
- **`requestAnimationFrame` timing**: A single rAF after DOM insertion may not be enough if the page was just made visible. Double rAF or measurement in `navigateTo()` is more reliable.
- **Inline styles on solo buttons**: Instrument button colors are set via `style.background` in JS. CSS overrides need `!important`.
- **Pseudo-element conflicts**: `::after` is used by theme background images on panels and active nav underlines. `::before` is used by shimmer animations and Liquid Glass specular effects. Check both before adding new pseudo-element usage.
- **`applyTheme()` takes a string**: Call `applyTheme('nebula')`, not `applyTheme(themeObj)`.
- **Song data structure**: Songs in `songs.json` must include all metadata fields (`duration`, `bpm`, `genre`, `decade`) for the solo panel bubbles to render correctly.
