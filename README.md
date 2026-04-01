# Jamsesh - VR Music Rhythm Game UI

Single-file HTML/CSS/JS UI prototype for **Jamsesh**, a VR music rhythm game running inside Vuplex WebView on Meta Quest headsets. Fixed 1920x1920 pixel viewport.

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
index.html              # The full UI prototype (~15500 lines)
keyboard.html           # Virtual QWERTY keyboard (simple-keyboard, Vuplex bridge)
songs.json              # Song library (100 tracks with metadata)
CLAUDE.md               # AI coding assistant instructions
AR_Glasses.png          # Genies avatar preview image
art/                    # Song cover artwork (001-100.jpg)
avatar_tiles/           # Avatar asset category images (shirts, shoes, etc.)
banners/                # Banner image PNGs for scrolling banner system
bandlogos/              # Band/group logo images for social groups
home_tiles/             # Per-tile home grid images (7 types x 5 sizes)
instruments/            # Instrument icons (guitar.png, drums.png, vocals.png)
js/                     # simple-keyboard library files
photos/                 # Creator photos (user-captured stock photos)
src/                    # Figma Make-exported React/Vite app (reference only)
```

## Reference App (src/)

The `src/` directory contains a separate Figma-exported React/Vite application — not the primary working file.

```bash
npm install
npm run dev      # Vite dev server
npm run build    # Production build
```
