# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jamsesh is a VR music rhythm game. This repo contains its UI prototype — a **single-file HTML/CSS/JS application** (`index.html`, ~8700 lines) designed to run inside **Vuplex WebView on Meta Quest headsets**. The viewport is a fixed **1920x1920 pixel** panel.

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
  - Use IIFEs for closures in loops: `tile.onclick = (function(s) { return function() { doThing(s); }; })(song);`
  - `:not()` CSS pseudo-class only accepts **simple selectors** (not `.parent .child`)
  - No CSS `gap` on flex in older builds; test carefully
- **Single file**: All CSS is in `<style>`, all JS is in `<script>`, all HTML is inline
- **No build step**: The file is served directly to the WebView

## Data Files

- **songs.json**: Song library containing 100 tracks with metadata fields: `rank`, `title`, `artist`, `file` (path to cover art in `art/`), `duration` (seconds), `bpm`, `genre`, `decade`
  - Loaded via XMLHttpRequest in `init()` and rendered by `buildSoloPanel()` for the paginated setlist grid
  - Cover art files are `art/001.jpg` through `art/100.jpg`
- **banners/**: Banner image PNGs (Space 1, Daisies, Gothic, etc.) used by the scrolling banner system
- **Profile avatars**: `rael_new.png`, `jooleeno.jpg`, `ted.png`, `abbie.png`, `arthen.jpg` — used by the profile switcher in the topbar

## Architecture of index.html

### Structure (top to bottom)
1. **CSS** (lines 9–5374): Global styles, component styles, theme overrides (Arcade, Hunter, Nebula, Liquid Glass, Wireframe), banner/frame styles, shimmer animations
2. **HTML** (lines ~4969–6144): `.viewport` containing `.topbar`, 9 `.page` elements (home, play, career, season, social, spaces, vault, store, settings), `.navbar`, and all popup overlays (inside `.viewport` for correct centering)
3. **JavaScript** (lines ~6100–8688): Vuplex bridge, navigation, page builders, theme engine, banner/frame systems, profile system, data arrays

### Navigation
- Pages use `display: none` / `.page.active { display: flex }` — **elements in hidden pages have 0 `offsetHeight`**
- `navigateTo(pageName)` toggles page visibility and updates navbar
- Song picker is a sub-panel within the Play page, toggled via `showPlayPicker()`/`hidePlayPicker()`
- Settings page has toggled sub-sections: `showThemes()`, `showBanners()`, `showFrames()`, `showTos()`, `showPrivacy()`

### Theme System
- `var themes = [...]` array (~20 themes) defines theme objects with `id`, `bg`, `panel`, `tile`, `tileHover`, `accent`, and optional `cssClass`, `locked`, `price`, `bgImage`
- `applyTheme(themeId)` takes a **string ID** (not an object), sets CSS custom properties on `:root`, auto-derives light/dark text colors via `hexLum()`
- Themes with `cssClass` (e.g., `'theme-arcade'`, `'theme-hunter'`, `'theme-nebula'`, `'theme-liquid'`) add a class to `.viewport` enabling scoped CSS overrides
- Wireframe Light/Dark themes use `cssClass: 'theme-wireframe'` for B&W flow testing (Arial font, no color, no shimmer)
- Some themes are `locked: true` with a `price` — purchased via in-UI coin system

### Banner System
- `var banners = [...]` array defines banner objects with `id`, `name`, `file` (path to `banners/*.png`), optional `locked`, `price`
- `applyBanner(bannerId)` injects a dynamic `<style id="banner-style">` tag targeting `.topbar::before`, `#navbar-banner`, and `#content-banner`
- Banners scroll horizontally via `@keyframes bannerScroll` (90s linear infinite, `width: 200%` for seamless repeat)
- Three layers: topbar, navbar, and content area — each with a dark overlay (`::after` or overlay div) for text readability
- `buildBannerGrid()` renders purchasable banner preview cards in a 4-column grid

### Profile Frames
- `var frames = [...]` array defines frame objects with `id`, `name`, `color1`, `color2`, optional `locked`, `price`
- `applyFrame(frameId)` sets CSS custom properties `--frame-color-1` and `--frame-color-2` on `:root`
- Profile avatar border animates between frame colors via `@keyframes frameGlow`
- `buildFrameGrid()` renders circular frame preview cards in a 5-column grid

### Solo Panel & Pagination
- `SOLO_PER_PAGE = 3` rows per page, paginated with arrow buttons
- `buildSoloPanel()` renders the setlist grid with instrument/difficulty/space/loadout buttons, cover art, and metadata bubbles
- Page transitions use directional slide animations (up/down)
- `sizeSoloPeek()` must be called when the Play page **becomes visible** (not during init when page is `display: none`)

### Song Picker Grid
- `SONGS_PER_PAGE = 20` songs per grid page
- `buildGrid(songs)` renders the paginated song grid with `buildNavButtons()` for pagination
- `constrainGridNav()` measures grid page height dynamically — must run after picker is visible
- `applyPickerFilters()` applies instrument/difficulty/sort filters

### Play Mode Tabs
- Three modes: Solo, Co-op, Battle — switched via `setPlayMode(mode)`
- `buildSoloPanel()` for solo; `buildCoopPanel()` for co-op/battle (with player nameplates)
- `buildSongColumn()` renders the left-side setlist with add/remove/swap

### Popup Overlays
- All overlays (solo-popup, loadout, purchase, save, load) live **inside `.viewport`** and use `position: absolute` to center relative to the 1920x1920 UI panel
- Overlays use `z-index: 999`
- Purchase flow: check `locked` + `isThemeUnlocked()`/`isBannerUnlocked()`/`isFrameUnlocked()` → open popup → confirm → add to unlocked array → apply

### Profile System
- `var profiles = [...]` defines user profiles (Rael, Jooleeno, Ted, Abbie, Arthen) with avatar, level, XP, coins
- `switchProfile(profileId)` changes active profile and updates topbar
- `initStatTicker()` drives the topbar stat ticker rotating through Level, XP, Coins, Season progress every 5 seconds, synced with 3D coin spin animation

### Liquid Glass Theme
- `initLiquidSpecular()` injects `::before` pseudo-elements into 20+ interactive element types (only when Liquid Glass is active)
- `handleLiquidPointerMove()` applies 3D skew transforms based on pointer position for specular highlights
- Must be re-initialized when switching to/from Liquid Glass theme — `applyTheme()` handles this

### Vuplex Bridge
- `sendToUnity(type, data)` sends JSON messages to Unity via `window.vuplex.postMessage()`; falls back to `console.log` for desktop testing
- `initVuplexListener()` listens for incoming Unity messages (handles `updateProfile`, `navigate`)
- All user actions (navigation, song selection, theme/banner/frame changes) emit bridge messages

### CSS Custom Properties
Key variables set by themes: `--bg-body`, `--bg-panel`, `--bg-surface`, `--bg-surface-hover`, `--pink` (accent), `--text-primary`, `--text-secondary`, `--text-muted`, `--border-strong`, `--border-subtle`, `--panel-radius`, `--grid-gap`, `--tile-h`, `--nav-btn-h`

Frame variables: `--frame-color-1`, `--frame-color-2`

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

### Key Global State
- `var allSongs = []` — loaded from songs.json
- `var setlist = []` — current song setlist (global, not per-profile)
- `var currentTheme`, `var currentBanner`, `var currentFrame` — active cosmetic selections
- `var unlockedThemes`, `var unlockedBanners`, `var unlockedFrames` — arrays of unlocked IDs
- `var userCoins = 5000` — currency for purchasing locked items
- `var soloPage = 0`, `var currentPage = 0` — pagination state for solo panel and song picker respectively

## Common Pitfalls

- **Measuring hidden elements**: `offsetHeight` returns 0 for elements inside `display: none` pages. Schedule measurements in `navigateTo()` callbacks when the page becomes active.
- **`requestAnimationFrame` timing**: A single rAF after DOM insertion may not be enough if the page was just made visible. Double rAF or measurement in `navigateTo()` is more reliable.
- **Inline styles on solo buttons**: Instrument button colors are set via `style.background` in JS. CSS overrides need `!important`.
- **Pseudo-element conflicts**: `::after` is used by theme background images, banner overlays, and active nav underlines. `::before` is used by shimmer animations, scrolling banners, and Liquid Glass specular effects. Check both before adding new pseudo-element usage.
- **`applyTheme()` takes a string**: Call `applyTheme('nebula')`, not `applyTheme(themeObj)`. Same pattern for `applyBanner()` and `applyFrame()`.
- **Song data structure**: Songs in `songs.json` must include all metadata fields (`duration`, `bpm`, `genre`, `decade`) for the solo panel bubbles to render correctly.
- **Dynamic style injection**: `applyBanner()` creates/replaces a `<style id="banner-style">` element at runtime. Don't duplicate this pattern without checking for the existing element.
- **Liquid Glass cleanup**: Switching away from Liquid Glass must clean up injected specular elements and pointer tracking listeners. `applyTheme()` handles this, but be aware if modifying theme switching.
- **Setlist is global**: Setlist state does not change when switching profiles — it persists across profile switches.
