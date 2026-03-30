# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jamsesh is a VR music rhythm game. This repo contains its UI prototype — a **single-file HTML/CSS/JS application** (`index.html`, ~14000 lines) designed to run inside **Vuplex WebView on Meta Quest headsets**. The viewport is a fixed **1920x1920 pixel** panel.

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
- **Exception**: The second `<script>` block (~line 13800) is a post-load interaction layer that uses modern JS (arrow functions, `forEach`). This block runs after the main ES5 app and is acceptable since it is a separate concern — but all **main application code** in the first `<script>` must remain ES5.

## Data Files

- **songs.json**: Song library containing 100 tracks with metadata fields: `rank`, `title`, `artist`, `file` (path to cover art in `art/`), `duration` (seconds), `bpm`, `genre`, `decade`
  - Loaded via XMLHttpRequest in `init()` and rendered by `buildPlayGrid()` for the solo setlist and `buildStoreGrid()` for the store songs tab
  - Cover art files are `art/001.jpg` through `art/100.jpg`
- **banners/**: Banner image PNGs (Space 1, Daisies, Gothic, etc.) used by the scrolling banner system
- **Space images**: `stage.png`, `social.png`, `lobby.png` — used as tile backgrounds in the Spaces page
- **Game assets**: `vlcsnap-2026-03-10-14h09m45s826.png` (gameplay screenshot), `JamPick.png` (picks icon), `grammys.jpg` (season banner), `Logo (1080 x 1080 px).png` (Jamsesh logo)
- **Profile avatars**: `rael_new.png`, `jooleeno.jpg`, `ted.png`, `abbie.png`, `arthen.jpg` — used by the profile switcher in the topbar

## Architecture of index.html

### Structure (top to bottom)
1. **CSS** (lines 9–7800): Global styles, component styles, play grid/coop/option-picker styles, game screen/results/rewards styles, theme overrides (Arcade, Hunter, Nebula, Liquid Glass, Wireframe), banner/frame styles, shimmer animations, layout overlay styles, onboarding/early-access styles, create-group/create-space popup styles
2. **HTML** (lines ~7801–8870): Onboarding screens (legal agreement, permissions), `.viewport` containing early access overlay, full-screen `<canvas>` for particle background, `.topbar`, 9 `.page` elements (home, play, career, season, social, spaces, vault, store, settings), `.navbar`, all popup overlays (solo-popup, option-picker, save/load setlist, create-group, logo-picker, create-space), `.layout-overlay`, and game screens (gameplay, results 1, results 2)
3. **JavaScript — Main App** (lines ~8870–13800): Vuplex bridge, navigation, page builders, theme engine, banner/frame systems, profile system, play grid system (solo/coop/battle), option picker popups, store builder, home grid tiling generator, social/spaces builders, create-group/create-space flows, onboarding flow, data arrays
4. **JavaScript — Interaction Layer** (lines ~13800–13967): Click bounce feedback and canvas-based particle festival background animation (uses modern JS)

### Navigation
- Pages use `display: none` / `.page.active { display: flex }` — **elements in hidden pages have 0 `offsetHeight`**
- `navigateTo(pageName)` toggles page visibility and updates navbar
- Song picker is a sub-panel within the Play page, toggled via `showPlayPicker()`/`hidePlayPicker()`
- Settings page has toggled sub-sections: `showThemes()`, `showBanners()`, `showFrames()`, `showTos()`, `showPrivacy()`
- Social page: 2 tabs (Groups, Friends) via `switchSocialTab(tab)`
- Spaces page: 2 tabs (Public, Private) via `switchSpacesTab(tab)`
- Vault page: 2 tabs (Owned, Creator) via `switchVaultTab(tab)`
- Store page: 3 tabs (Songs, Packs, Items) via `switchStoreTab(tab)`
- Season page: "COMING SOON" placeholder (no interactive content)

### Home Grid & Layout System
- `generateAllTilings()` computes all valid rectangular tilings of a 3x3 grid into `var allTilings = []`
- `buildHomeGrid(layoutIndex)` renders the home page as octagon-clipped tiles with per-tile glow colors and drop-shadow hover effects
- `var currentLayout = 283` — default tiling index
- Layout picker overlay (`.layout-overlay`) shows thumbnail previews of all tilings in a scrollable grid
- `openLayoutPicker()` / `closeLayoutPicker()` / `selectLayout(index)` manage the overlay

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

### Play Tab System
- Three modes: **Solo**, **Group**, **Battle** — switched via `setPlayMode(mode)` which calls `buildPlayGrid()`
- `buildPlayGrid()` dispatches to `buildSoloGrid()` or `buildCoopGrid()` based on `playMode`
- **Solo mode**: 3 songs per page with pagination (`soloGridPage`), setlist summary row (song count + total duration), and option tiles (Instrument/Difficulty/Experience)
- **Group/Battle mode**: Left column of song tiles + 3x3 friend avatar grid per song from `lobbyPlayers[]`, bottom 6 buttons (options row + Save/Start/Load)
- Option tiles open popup panels via `openOptionPicker(type)`:
  - **Instrument**: Simple list (Guitar, Drums, Vocals, Bass) → sets `selectedInstrument`
  - **Difficulty**: Simple list (Easy, Normal, Hard, Expert) → sets `selectedDifficulty`
  - **Experience**: Tabbed picker with 5 tabs (Stage, Gem, Highway, Inst. Skin, Skybox) → sets `selectedExpItems[tab]` and `selectedExperience`
- `buildPlayPanel(songs)` initializes the setlist with 3 random songs and calls `buildPlayGrid()`
- Static `.play-go-bar` (Save/Start/Load) shown in solo mode, hidden in coop (rendered dynamically)

### Song Picker Grid
- `SONGS_PER_PAGE = 20` songs per grid page
- `buildGrid(songs)` renders the paginated song grid with `buildNavButtons()` for pagination
- `constrainGridNav()` measures grid page height dynamically — must run after picker is visible
- `applyPickerFilters()` applies genre/decade/duration/sort filters
- `showPlayPicker()` hides play-main-layout and shows the picker; `hidePlayPicker()` reverses

### Gameplay & Results Flow
- `startGame()` populates results from setlist, fades to gameplay screen via `#onboard-black` overlay
- **Gameplay screen**: Full-screen screenshot, click anywhere → `showResults1()`
- **Results Screen 1**: Two columns — left (album art + score with Group/Me tabs, 2x2 stats grid), right (full-height leaderboard with Group/Me lists). `switchResultsTab(tab)` syncs both panels.
- **Results Screen 2**: 2x2 rewards grid (Picks, Badges, XP, Grammys Season). Back/Continue buttons.
- All game screens use `position: absolute; z-index: 998` inside `.viewport`, toggled via `.active` class
- Transitions use fade-to-black (`#onboard-black` div at z-index 1001, 200ms opacity transition)

### Store Page
- 3 tabs: **Songs** (9 random cover art tiles with $2.99 price tags), **Packs** (6 themed bundles + 3 locked with unlock dates), **Items** (9 category sections: Spaces, Stages, Avatar, Instruments, Gem, Highway, Skybox, Theme, Frame)
- `buildStoreGrid()` called after songs load in XHR callback (needs `allSongs` populated)
- `switchStoreTab(tab)` toggles between songs/packs/items

### Popup Overlays
- All overlays (solo-popup, option-picker, loadout, purchase, save, load, layout-overlay, create-group, logo-picker, create-space) live **inside `.viewport`** and use `position: absolute` to center relative to the 1920x1920 UI panel
- **Z-index layering**: Early access overlay (1002) → onboard-black transition (1001) → onboard screens / logo picker (1000) → all other popups (999) → game screens (998)
- Option picker overlay (`#option-picker-overlay`) used by instrument/difficulty/experience selection
- Purchase flow: check `locked` + `isThemeUnlocked()`/`isBannerUnlocked()`/`isFrameUnlocked()` → open popup → confirm → add to unlocked array → apply

### Onboarding & Early Access Flow
- **Early Access overlay** (`#early-access-overlay`, z-index 1002): Full-panel disclaimer shown on load before the main menu. Transparent background shows the particle canvas beneath. `dismissEarlyAccess()` hides it and reveals the topbar/navbar/pages.
- **`init()` hides main UI on startup**: Topbar and navbar are set to `display: none`, pages to `visibility: hidden` until the early access screen is dismissed.
- **Onboard Legal screen** (`#onboard-legal`, z-index 1000): Terms of Service / Privacy Policy agreement with tabbed content, checkbox, and agree button. `onboardComplete()` validates and transitions to permissions screen.
- **Onboard Permissions screen** (`#onboard-perms-explain`, z-index 1000): Explains Camera & Microphone permissions. `onboardPermsOk()` transitions to home page.
- **Fade-to-black transitions**: `onboardFadeToBlack()` uses `#onboard-black` (z-index 1001) for 200ms opacity transitions between onboarding stages.

### Social & Spaces Builders
- `buildSocialPage()` renders the Groups tab (3x3 grid with "Create New" tile + 7 sample groups) and Friends tab (list with online/offline status + "Add Friend" button)
- `buildSpacesGrid()` renders Public tab (3x3 grid with "Create New" tile + 8 sample hubs) and Private tab ("Create New" tile + 3 preset spaces)
- Both "Create New" tiles use dashed borders and `+` icons styled with `.create-new-tile`

### Create Group Popup
- `openCreateGroup()` opens `#create-group-overlay` (z-index 999) with group name input, logo picker button, and two-column friend invite layout (Available Friends / Group Members)
- `renderCreateGroupLists()` renders add/remove buttons for friend management
- `confirmCreateGroup()` sends group data to Unity via `sendToUnity('createGroup', ...)`
- **Logo Picker** (`#logo-picker-overlay`, z-index 1000): Sub-overlay with 3x3 grid of band logos from `groupLogoOptions[]`. `openLogoPicker()` / `selectGroupLogo()` / `closeLogoPicker()` manage it.
- Group name input uses native OS keyboard (no on-screen keyboard)

### Create Space Popup
- `openCreateSpace(type)` opens `#create-space-overlay` (z-index 999) with space name input, public/private toggle (pre-set from calling tab), and 3x3 environment selector grid
- 9 environments: Stage, Social Hub, Lobby, Arena, Beach, Forest, Rooftop, Studio, Stadium
- `setCreateSpaceType(type)` toggles between public/private
- `selectSpaceEnv(env)` highlights the selected environment tile
- `confirmCreateSpace()` sends space data to Unity via `sendToUnity('createSpace', ...)`
- Space name input uses native OS keyboard (no on-screen keyboard)

### Profile System
- `var profiles = [...]` defines user profiles (Rael, Jooleeno, Ted, Abbie, Arthen) with avatar, level, XP, coins
- `switchProfile(profileId)` changes active profile and updates topbar
- `initStatTicker()` drives the topbar stat ticker rotating through Level, XP, Coins, Season progress every 5 seconds, synced with 3D coin spin animation

### Particle Background
- Full-viewport `<canvas id="jamseshParticles">` at z-index 0 behind all UI
- 90 particles: 40 wave-riders follow sine-wave music bands, 50 ambient floaters drift upward
- 5 horizontal wave lines with glow effects (cyan → purple → pink palette)
- `drawParticles()` runs via `requestAnimationFrame` loop in the second `<script>` block

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

**Unified radius**: All panels, buttons, tabs, and tiles use `var(--panel-radius)` (28px). No `calc(var(--panel-radius) / 2)` or hardcoded pixel values — only exceptions are `50%` for circles, `999px` for pills, and the quest onboarding screen.

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
- `var playMode = 'solo'` — current play tab mode (solo/coop/battle)
- `var selectedInstrument`, `var selectedDifficulty`, `var selectedExperience` — play option selections
- `var selectedExpItems = {stage, gem, highway, skin, skybox}` — per-tab experience selections
- `var soloGridPage = 0` — pagination state for solo play grid
- `var currentTheme`, `var currentBanner`, `var currentFrame` — active cosmetic selections
- `var unlockedThemes`, `var unlockedBanners`, `var unlockedFrames` — arrays of unlocked IDs
- `var userCoins = 5000` — currency for purchasing locked items
- `var currentPage = 0` — pagination state for song picker
- `var allTilings = []`, `var currentLayout = 283` — home grid tiling data and selected layout
- `var lobbyPlayers = [9]` — player data for coop/battle friend grids

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
- **Two script blocks**: The main app (first `<script>`) is ES5. The interaction layer (second `<script>`) uses modern JS. New application logic should go in the first block using ES5 syntax.
- **Canvas z-index**: The particle canvas is at `z-index: 0` with `pointer-events: none`. UI elements must remain above it.
- **Null guard on removed elements**: If you remove an HTML element (e.g., `#season-grid`), any JS function that accesses it must add a null check (`if (!container) return;`), otherwise it crashes and blocks all subsequent JS execution in `init()`.
- **Store grid needs songs loaded**: `buildStoreGrid()` must be called inside the XHR callback after `allSongs` is populated, not in the synchronous init block.
- **Play grid mode switching**: `buildPlayGrid()` dynamically changes the `#play-grid` className between `play-grid--solo` and `play-grid--coop`, and toggles the static `.play-go-bar` visibility. Coop mode renders its own bottom buttons.
- **`aspect-ratio` CSS not supported**: Chromium 91 does not support `aspect-ratio`. Use fixed `width`/`height` dimensions instead.
- **Greyscale wireframe design**: The current UI is a greyscale wireframe for UX evaluation. All results/rewards screens, buttons, and tabs use black/white/grey color scheme (#333333 inactive, #ffffff active with `box-shadow: 0 0 0 2px #ffffff`).
- **Early access hides main UI**: `init()` hides topbar/navbar/pages on startup. `dismissEarlyAccess()` restores them. If adding new init-time UI, ensure it handles the hidden state.
- **Create popups use native keyboard**: Group name and space name inputs are standard `<input type="text">` — no on-screen keyboard. Don't add `readonly` to these inputs.
