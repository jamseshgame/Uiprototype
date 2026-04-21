# Jamsesh - VR Music Rhythm Game UI

Single-file HTML/CSS/JS UI prototype for **Jamsesh**, a VR music rhythm game running inside Vuplex WebView on Meta Quest headsets. Fixed 1920x1920 pixel viewport.

## Changelog

### 2026-04-21

- **Empty default setlist** — Main Stage now starts with zero songs (big "+ Add Songs" tile) instead of 3 random picks. `generateDefaultSetlists()` is no longer called, so the preset Rock Classics / Chill Vibes / Party Mix / Throwbacks / Hot Hits entries are gone
- **Manage popup simplified** — "Edit Setlist" and "Community" tiles removed; popup is now a 1×2 grid of **Save Setlist** / **Load Setlist** with a full-width **Back** button at the bottom
- **Load Setlist — 3 tabs** — Personal / Jamsesh / Community. Jamsesh and Community show a large "Coming Soon..." placeholder; Personal shows only user-saved setlists (built-in lesson setlists removed from this view)
- **Leaderboard picker** — instrument rotation skips Keys ("Coming Soon")
- **Leaderboard colours** — position, name, and score forced white across all themes; stars forced gold (`#ffd700`); top-3 position no longer recoloured
- **Load item text** — setlist name and song count rows forced white
- **Per-tile "Mixed" fix** — song-tile instrument badges resolve a `mixed` setlist selection to the individual song's own instrument (e.g. Guitar Basics → `Guitar`), so "Mixed" never appears on a single tile. The setlist-level `Instrument: Mixed` indicator in the options row is unchanged

### 2026-04-20

- **"Main Stage" nav rebrand** — renamed Play tab to Main Stage with a proscenium stage icon and a 3s breathing cyan→purple attract glow
- **Main Stage tab overhaul** — dedicated songs panel with state-aware grid: 0 songs → single big `+`; 1 song → 1×2 `[song][+]`; 2–3 songs → 2×2 with `+` at bottom-right; 4 songs → 2×2 full; 5+ songs → 2×2 paginated with vertical ▲/▼ arrows on the right. Mode tabs reduced to Solo / Group. Start button halved in height; songs area absorbs the freed space. `Save / Load Setlist` joins Instrument / Difficulty / Experience / Apply-to-All in a unified 5-tile options row and opens a 2×2 picker (Edit / Save / Load / Community)
- **"Play Now" home tile** — new highest-priority mainstage tile (cyan→purple glow matching the nav button); replaces Grammys Season as the featured home slot
- **Home tile text** — forced uppercase removed; 3×2 tiles double their title/subtitle/detail font sizes with matching shadow and letter-spacing scale
- **Default home layout** — changed from 283 → 317 (applies to everyone via the static initial value and the out-of-range fallback)
- **Store tiling** — all four tabs (Songs, Packs, Items, Vault) now use the home-grid tiling mechanic. `?layout=N` reshapes the store too; layout picker rebuilds propagate, and real songs repopulate the tiled Songs tab after `updateSongsFromBackend`
- **Leaderboard styling** — panel and namecards use `--btn-panel` / `--btn-panel-hover` so they match the rest of the main-panel elements; modifier buttons (Guitar / Medium / Worldwide) forced to white text across all themes
- **`?layoutPicker` URL flag** — layout-picker button hidden by default and only revealed when the flag is present. URL parser now also tolerates stray `?` after `&`

### 2026-04-09

- **Song picker grid overhaul** — changed from 5-column to 4-column layout with CSS `padding-top: 100%` aspect ratio (replaces unsupported `aspect-ratio`). Absolute-positioned cover images with improved text shadows
- **Emoji filter tiles** — filter popups replaced with colourful emoji-based grid tiles. Genre and Decade are now multi-select with Apply/Clear buttons; Duration and Sort remain single-select
- **Drag-and-drop setlist** — drag songs from the picker grid into setlist slots, reorder setlist tiles by dragging, or drag tiles out to remove. Visual ghost + drop-target highlights
- **Row-level "Edit Setlist"** — solo play grid no longer shows per-tile replace/remove buttons. Hovering the songs row darkens all tiles and shows a centered "Edit Setlist" label; clicking opens the picker
- **Setlist picker arrows** — horizontal left/right arrows replace the old nav section; 4 visible slots (down from 6)
- **Dynamic grid pagination** — row-based paging with computed metrics (`getGridPagingMetrics`, `syncGridPageMetrics`). Step size adapts to visible rows so page-down never skips content
- **CSS variable buttons** — button/tab borders now use `--btn-tab` and `--btn-tab-border` variables instead of hardcoded values
- **Named step routing** — `?step=` URL param now accepts named slugs (`legal`, `perms`, `tutorial`, `menu`) and auto-sets onboard flags for all prior steps
- **Song cover sync** — `updateSongCover()` now uses `data-song-index` attributes to update all visible instances of a song tile simultaneously

### 2026-04-01

- **Per-page colour themes** — each tab has its own gradient background, wave/particle colours (Home=purple, Social=green, Spaces=blue, Play=cyan, Creator=amber, Store=pink, Season=gold, Profile=purple)
- **Page-aware buttons** — all buttons use CSS variables that auto-adapt to each page's accent colour. Zero grey buttons across entire UI
- **Nested radius system** — `--radius-outer` (56px) for containers, `--panel-radius` (28px) for tiles. Removed all octagon clip-paths, replaced with border-radius
- **Home tile system** — 7 tile types with 5 size variants each in `/home_tiles/`. Priority-based assignment (biggest tile gets highest priority). `?layout=N` and `?tiles=` URL params
- **Play tab redesign** — song hover actions (replace/remove buttons), 1:1 square cover art, smart empty-state layouts (1 song centered, 0 songs single add tile)
- **Setlist loader** — 3x3 grid picker with adaptive art layouts (1 song=full cover, 2=side-by-side, 3+=2x2 grid). Lesson setlists with lock flags for instrument/difficulty/experience/songs
- **Tutorial onboarding** — locked UI with only Load button active, Basic/Advanced/Expert lesson progression, Mixed instrument type
- **Profile page** — neon glow name tile, profile picture with purple glow, Genies avatar (zoom animation), news tile, credits (floating team avatars), device info tile
- **Avatar customization** — Genies SDK integration with 9 asset categories (Shirts, Hoodies, Jackets, Pants, Dresses, Shoes, Hats, Glasses, Earrings)
- **Creator page** — photos/art/songs tabs with camera capture, photo picker, shape/word cloud/prompt config, 2x2 AI results with tickbox selection
- **Virtual keyboard** — `keyboard.html` using simple-keyboard library, dark theme, Vuplex bridge integration
- **Transparent topbar** — profile info over particle background with no banner overlay
- **Play button highlight** — 10% larger navbar button with subtle 8s pulse animation (5s gap)
- **URL updates** — onboarding step shown in URL via `history.replaceState` (`?step=legal`, `?step=perms`, `?step=tutorial`, `?step=menu`)
- **`?skip` flag** — bypasses everything, straight to full unlocked menu regardless of localStorage
- **Popup theming** — all popups and their buttons use page-aware colour variables

## Quick Start

```bash
# Serve with live reload
npx browser-sync start --server --files "*.html" --port 3000 --no-open
```

Open http://localhost:3000 in your browser.

## Features

- **9 navigable pages**: Home, Social, Spaces, Play, Creator, Store, Season, Profile, Settings
- **Per-page colour themes**: Each page has its own gradient background, wave colours, and particle tints (Home=purple, Social=green, Spaces=blue, Play=cyan, Creator=amber, Store=pink, Season=gold, Profile=purple)
- **Customizable home page**: 322 valid rectangular tilings of a 3x3 grid with priority-based tile assignment. `?layout=N` URL param + `?tiles=` priority override
- **Home tile system**: 7 tile types (Season, Store, Vault, Creator, Spaces, News, Social) with 5 size variants each (1x1, 2x1, 3x1, 1x2, 1x3) in `/home_tiles/`
- **Play tab**: Solo (3 songs + pagination + setlist summary), Group/Battle (song column + 9 friend avatars per song). Song tiles with hover replace/remove actions. 1:1 cover art
- **Setlist loader**: 3x3 grid picker with adaptive art layouts (1 song = full cover, 2 = side-by-side, 3+ = 2x2 grid). Lesson setlists with lock flags
- **Tutorial onboarding**: Locked UI with only Load button active, lesson setlists (Basic/Advanced/Expert) with instrument/difficulty/song locks
- **Creator page**: Photos tab (3x3 + camera capture), Art tab (photo picker → shape/word cloud/prompt → 2x2 AI results), Songs (Coming Soon)
- **Profile page**: Name (neon glow text), Picture (profile avatar circle with purple glow), Avatar (Genies SDK — 9 asset categories), News, Credits (floating team avatars), Device info
- **Avatar customization**: Genies SDK integration with 9 categories (Shirts, Hoodies, Jackets, Pants, Dresses, Shoes, Hats, Glasses, Earrings)
- **Store page**: Songs, Packs (with unlock dates), Items (9 categories), Vault tabs
- **Virtual keyboard**: Standalone `keyboard.html` using simple-keyboard library, themed to match UI, Vuplex bridge integration
- **Nested radius system**: `--radius-outer` (56px) for containers, `--panel-radius` (28px) for tiles/buttons following R_outer = R_inner + padding formula
- **Page-aware buttons**: All buttons use CSS variables (`--btn-tab`, `--btn-panel`, `--btn-primary`) that auto-adapt to each page's accent colour. Zero grey buttons
- **Profile switcher**: Multiple user profiles (Rael, Jooleeno, Ted, Abbie, Arthen) with avatar, level, XP, and coins
- **Transparent topbar**: Profile info over particle background with no banner overlay
- **Play button highlight**: 10% larger navbar button with subtle pulse animation (8s cycle, 5s gap)
- **Shimmer animations**: Three-tier hover system (idle/hover/active) with staggered delays
- **Vuplex bridge**: JSON message passing to/from Unity game engine

## URL Parameters (Mode System)

The UI supports URL parameters to control the startup flow for development, testing, and stakeholder demos. Parameters are independent flags that can be combined freely.

### Flags

| Parameter | Description |
|-----------|-------------|
| `?demo` | Enables **demo-only screens**: Meta Store page, Quest OS Home, Boot Splash, OS permission popups. These screens simulate the full Quest experience for stakeholder presentations. |
| `?onboard` | Forces the **onboarding flow** from the beginning, clearing all saved progress. Shows Legal Agreement, Permissions Explainer, and Tutorial Play even if previously completed. |
| `?step=N` or `?step=name` | Jumps to onboarding **step N** (number or name), marking all prior steps as complete. See step list below. |
| `?reset` | Clears all saved onboarding progress from `localStorage` without starting any flow. |
| `?skip` | Bypasses everything — straight to full unlocked menu. Ignores localStorage and onboarding flags. |
| `?layout=N` | Sets home grid layout (0–321). Persists via `sendToUnity('layoutChanged', N)`. |
| `?tiles=a,b,c` | Overrides home tile priority order. E.g. `?tiles=social,store,season,news,spaces,vault,creator` |

### Combining Flags

Flags can be combined with `&`:

```
http://localhost:3000/?demo                  # Full demo with all screens
http://localhost:3000/?onboard               # Force fresh onboarding (no demo screens)
http://localhost:3000/?demo&onboard          # Demo screens + forced fresh onboarding
http://localhost:3000/?demo&step=tutorial     # Demo screens + skip to Tutorial Play
http://localhost:3000/?step=tutorial          # Skip to Tutorial Play (no demo screens)
http://localhost:3000/?step=menu             # Skip everything, straight to full menu
http://localhost:3000/?step=perms            # Skip to Permissions Explainer
http://localhost:3000/?reset                 # Clear all progress
http://localhost:3000/                       # Normal mode (skips completed steps)
```

### Onboarding Steps

| Step | Number | Name | Shown When |
|------|--------|------|------------|
| 1 | `?step=1` | `?step=legal` | Legal Agreement. Once per user. Re-shown if `LEGAL_VERSION` is bumped. |
| 2 | `?step=2` | `?step=perms` | Permissions Explainer. Once per user. Explains Camera + Mic permissions. |
| 3 | `?step=3` | `?step=tutorial` | Tutorial Play. Once per user. Locks UI to Play tab with tutorial songs. |
| 4 | `?step=4` | `?step=menu` | Full menu. All steps complete — straight to main UI. |

### Demo-Only Screens (require `?demo`)

These screens are **never shown in production** — they exist only for stakeholder walkthroughs:

1. **Meta Store Page** — Mock Quest store listing with "Get" button
2. **Quest OS Home** — Mock Quest home environment with app grid (click Jamsesh icon to proceed)
3. **Boot Splash** — Jamsesh logo (click to proceed)
4. **OS Camera Permission** — Mock system permission dialog
5. **OS Microphone Permission** — Mock system permission dialog
6. **Tutorial Gameplay** — Screenshot walkthrough of guitar tutorial (demo mode only, after Start)

### Screen Flow

**Normal user (first launch):**
Early Access → Legal Agreement → Permissions Explainer → Main UI (Tutorial Play locked) → Full UI

**Returning user (all steps done):**
Early Access → Main UI

**Demo mode (`?demo`):**
Meta Store → Quest Home → Boot Splash → Early Access → Legal → Perms Explainer → OS Camera → OS Mic → Main UI (Tutorial Play) → Tutorial Gameplay → Results

### Persistence

- **Development**: Onboarding progress is saved to `localStorage` under the key `jamsesh_onboard`. Survives page refreshes.
- **Production**: Each step completion fires `sendToUnity('onboardStepComplete', {step, flags})`. Unity can sync flags to PlayFab. On app launch, Unity sends `{type: 'onboardProgress', data: {completedSteps: [...]}}` to restore progress.
- **Legal versioning**: Bump `LEGAL_VERSION` (currently `'1'`) in the code to force all users to re-accept updated Terms of Service.

## Constraints

- **Chromium 91 only** (Vuplex WebView on Quest)
- ES5 JavaScript: no `let`/`const`, no arrow functions, no template literals, no `class`
- Single file: all CSS, HTML, and JS inline in `index.html`
- No build step — served directly to WebView

## Project Structure

```
index.html              # The full UI prototype (~16400 lines)
songs.json              # Song library (100 tracks with metadata)
CLAUDE.md               # AI coding assistant instructions
README.md               # This file
art/                    # Song cover artwork (001-100.jpg)
avatar_tiles/           # Avatar asset category images (shirts, shoes, etc.)
avatars/                # Profile pictures (rael, jooleeno, ted, abbie, arthen)
bandlogos/              # Band/group logo images for social groups
banners/                # Banner image PNGs for scrolling banner system
branding/               # Logo, JamPick, AR_Glasses, news banner
demo/                   # Demo-only backgrounds (meta store, quest home)
home_tiles/             # Per-tile home grid images (7 types x 5 sizes)
instruments/            # Instrument icons (guitar, drums, vocals, keys, bass)
photos/                 # Creator photos (user-captured stock photos)
plates/                 # Lobby player plate backgrounds
spaces/                 # Space images (001-025 + lobby, stage, social)
tutorial/               # Tutorial gameplay screenshots
vault/                  # Vault item images (001-025)
src/                    # Figma Make-exported React/Vite app (reference only)
```

## Reference App (src/)

The `src/` directory contains a separate Figma-exported React/Vite application — not the primary working file.

```bash
npm install
npm run dev      # Vite dev server
npm run build    # Production build
```

## Changelog

### 2026-04-09 — Play Tab Overhaul, Mode System & File Cleanup

**Play Tab:**
- Per-song instrument and difficulty selection with active song glow
- Instrument picker redesigned as 2x2 image grid (Guitar, Drums, Vocals, Keys "Coming Soon"); Bass removed
- Song tiles show metadata in gradient overlay block with instrument/difficulty badges
- New layout: Setlist row (Edit / Save / Load / Community Setlists) → Options row (Instrument / Difficulty / Experience / Apply to All) → Full-width Start button with signature JamPick texture
- Battle tab shows "Coming Soon..." placeholder
- Community Setlists panel (Coming Soon)
- Lesson setlists (Basic / Advanced / Expert) with JamPick x1000 rewards in Load popup

**Mode System:**
- Independent `?demo` and `?onboard` URL flags (combinable with `&`)
- `?step=N` to jump to specific onboarding step; `?reset` to clear progress
- Demo-only screens: Meta Quest Store page, Quest OS Home, Boot Splash, OS Camera/Mic permission popups
- Tutorial gameplay screenshots with narration hook (demo only)
- Onboarding tutorial: locks UI to Play tab with Guitar/Drum/Vocal Basics songs

**File Organisation:**
- Assets reorganised into subfolders: `avatars/`, `branding/`, `demo/`, `tutorial/`, `spaces/`
- 16 unused files and 2 unused directories removed
- Fixed broken photo references

**Creator:**
- Photos sourced from `/photos` folder; demo-only camera screen
- Full-screen photo preview with left/right navigation and "New Art" button
- Art generation shows 5-second loading spinners before results
- "Create for" name picker redesigned as 3x3 image grid

**Home & UI:**
- Home tiles: background images on Store, Vault, Spaces, News, Creator tiles
- Social tile: floating avatar bubbles animation
- Topbar: 50% black overlay for banner contrast
- Early Access screen: Discord link, positioned after boot splash in flow
- Legal screen: OK button hidden until checkbox ticked
- Save Setlist / Create Group / Create Space: on-screen keyboards removed (native OS)
- Solo mode tab: background image support

### 2026-04-09 — Song Picker Overhaul (earlier)
- 4-column song grid with emoji filter tiles
- Drag-and-drop setlist management
- Row-level edit controls
