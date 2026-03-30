# Jamsesh - VR Music Rhythm Game UI

Single-file HTML/CSS/JS UI prototype for **Jamsesh**, a VR music rhythm game running inside Vuplex WebView on Meta Quest headsets. Fixed 1920x1920 pixel viewport.

## Quick Start

```bash
# Serve with live reload
npx browser-sync start --server --files "*.html" --port 3000 --no-open
```

Open http://localhost:3000 in your browser.

## Features

- **9 navigable pages**: Home, Social, Spaces, Play, Creator, Store, Season, Career, Settings
- **Customizable home page**: 3x3 grid layout system with every valid rectangular tiling — browse and select from all possible partitions via a layout picker overlay
- **11 themes**: Wireframe Light/Dark, Neon Pink, Cyber Cyan, Sunset Blaze, Light Mode, Rainforest, Neon Arcade, Hunter, Nebula, Liquid Glass
- **Scrolling banners**: Purchasable banner images that scroll across topbar, navbar, and content area with dark overlays for readability
- **Profile frames**: Animated gradient borders on profile avatars with purchasable color combinations
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

## URL Parameters (Mode System)

The UI supports URL parameters to control the startup flow for development, testing, and stakeholder demos. Parameters are independent flags that can be combined freely.

### Flags

| Parameter | Description |
|-----------|-------------|
| `?demo` | Enables **demo-only screens**: Meta Store page, Quest OS Home, Boot Splash, OS permission popups. These screens simulate the full Quest experience for stakeholder presentations. |
| `?onboard` | Forces the **onboarding flow** from the beginning, clearing all saved progress. Shows Legal Agreement, Permissions Explainer, and Tutorial Play even if previously completed. |
| `?step=N` or `?step=name` | Jumps to onboarding **step N** (number or name), marking all prior steps as complete. See step list below. |
| `?reset` | Clears all saved onboarding progress from `localStorage` without starting any flow. |

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
index.html              # The full UI prototype (~15000 lines)
songs.json              # Song library (100 tracks with metadata)
CLAUDE.md               # AI coding assistant instructions
screenshot_script.cjs   # Playwright automated screenshot testing
rael_new.png            # Profile avatar - Rael
jooleeno.jpg            # Profile avatar - Jooleeno
ted.png                 # Profile avatar - Ted
abbie.png               # Profile avatar - Abbie
arthen.jpg              # Profile avatar - Arthen
art/                    # Song cover artwork (001-100.jpg)
banners/                # Banner image PNGs for scrolling banner system
bandlogos/              # Band/group logo images for social groups
instruments/            # Instrument icons (guitar.png, drums.png, vocals.png)
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
