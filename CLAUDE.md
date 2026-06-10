# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jamsesh is a VR music rhythm game. This repo contains its UI prototype — a **single-file HTML/CSS/JS application** (`index.html`, ~18,000 lines) designed to run inside **Vuplex WebView on Meta Quest headsets**. The viewport is a fixed **1920x1920 pixel** panel.

A second standalone page, `results.html`, ships the end-of-song results UI on its own (mounted by `LobbyWebView` in place of `index.html` when the gameplay-end flag is set). It duplicates the look of `index.html`'s results screens but ships **none of the lobby app** (no song library, themes, banners, particles, etc.) so the page stays small. Same ES5 / Chromium 91 rules apply.

There is also `claudedesignui/` — a Babel-in-the-browser React design-exploration tool that is a **separate reference artifact**, **not** the primary working file, and does **not** follow the ES5 / single-file rules below (see "The claudedesignui/ Design Tool" section).

Handover docs for the Unity integration live at the repo root: `HANDOVER.md` (Group Lobby / bandspace contract) and `MULTICHART_HANDOVER.md` (multichart / instrument picker contract).

## Development

```bash
# Serve all HTML locally with live reload (index.html + results.html)
npx browser-sync start --server --files "*.html" --port 3000 --no-open
# Then open http://localhost:3000
```

The `claudedesignui/` HTML files transpile JSX in-browser via `@babel/standalone`, so they need no build step either — open them directly (or via the same static server).

There are no tests, no linter, and no build step for `index.html` / `results.html` — they are served verbatim to the WebView. Validate changes by loading the page in a desktop Chromium and exercising the relevant flows.

## Critical Constraints

- **Chromium 91 only** (Vuplex WebView on Quest). This means:
  - **ES5 JavaScript**: No `let`/`const`, no arrow functions, no template literals, no destructuring, no `class`, no `for...of`, no `Promise`/`async`/`await`
  - Use `var`, `function(){}`, string concatenation with `+`
  - Use IIFEs for closures in loops: `tile.onclick = (function(s) { return function() { doThing(s); }; })(song);`
  - `:not()` CSS pseudo-class only accepts **simple selectors** (not `.parent .child`)
  - No CSS `gap` on flex in older builds; test carefully
- **Single file**: All CSS is in `<style>`, all JS is in `<script>`, all HTML is inline
- **No build step**: The file is served directly to the WebView
- **Exception**: The second `<script>` block (line ~17969–18071) is a post-load interaction layer that uses modern JS (arrow functions, `forEach`). This block runs after the main ES5 app and is acceptable since it is a separate concern — but all **main application code** in the first `<script>` (line ~9609–17968) must remain ES5.

## Data Files & Directory Structure

- **songs.json**: Song library containing 100 tracks with metadata fields: `rank`, `title`, `artist`, `file` (path to cover art in `art/`), `duration` (seconds), `bpm`, `genre`, `decade`
  - Loaded via XMLHttpRequest fallback in `init()` when running outside Vuplex; in production, Unity pushes data via `updateSongsFromBackend()`
- **art/**: Song cover artwork (`001.jpg` through `100.jpg`)
- **avatars/**: Profile pictures (`rael_new.png`, `jooleeno.jpg`, `ted.png`, `abbie.png`, `arthen.jpg`)
- **avatar_tiles/**: Avatar clothing category tiles (shirts, hoodies, jackets, etc.)
- **bandlogos/**: Band/group logo images for social groups and creator art
- **banners/**: Banner image PNGs (Space 1, Daisies, Gothic, etc.) for the scrolling banner system
- **branding/**: `Logo (1080 x 1080 px).png`, `JamPick.png`, `AR_Glasses.png`, `news-banner.jfif`
- **demo/**: Demo-only background images (`meta-store-bg.webp`, `quest-home-bg.webp`)
- **home_tiles/**: Home grid tile images (7 categories × 5 size variants each)
- **instruments/**: Instrument icons (`guitar.png`, `drums.png`, `vocals.png`, `keys.png`, `bass.png`)
- **photos/**: Creator photos (user-captured stock photos)
- **plates/**: Lobby player plate backgrounds
- **spaces/**: Space images (`001.jpg`–`025.jpg` + `lobby.png`, `stage.png`, `social.png`)
- **tutorial/**: Tutorial gameplay screenshots (`fretslide1.png`, `fretslide2.png`)
- **vault/**: Vault item images (`001.jpg`–`025.jpg`)

## Architecture of index.html

### Structure (top to bottom)
> Line numbers below are approximate and drift as the file changes (~18,000 lines). Grep for function/section names rather than trusting exact offsets.
1. **CSS** (lines 9–~8523): Global styles, component styles, play grid/coop/option-picker styles, game screen/results/rewards styles, creator page styles, Genies avatar customization styles, theme overrides (Arcade, Hunter, Nebula, Liquid Glass, Wireframe), banner/frame styles, shimmer animations, layout overlay styles, onboarding/early-access styles, create-group/create-space popup styles, demo screen styles (Meta Store, Quest Home, Boot Splash, OS permission popups), jamsesh-signature texture class
2. **HTML** (lines ~8524–9608): Onboarding screens (legal, permissions), demo screens (Meta Store, Quest Home, Boot Splash, OS permission popups), `.viewport` containing early access overlay, full-screen `<canvas>`, tutorial gameplay screens, `.topbar`, 9 `.page` elements, `.navbar`, Genies avatar section, all popup overlays, creator screens, `.layout-overlay`, game screens (results 1, results 2)
3. **JavaScript — Main App** (lines ~9609–17968): Vuplex bridge, navigation, page builders, theme engine, banner/frame systems, profile system, Main Stage grid system (solo + group lobby with per-song settings), Genies avatar system, option picker popups, store builder, creator system, home grid tiling generator, social/spaces builders, create-group/create-space flows, mode system (demo/onboard/host/client flags), onboarding flow (legal, perms, tutorial play), data arrays
4. **JavaScript — Interaction Layer** (lines ~17969–18071): Click bounce feedback and canvas-based particle festival background animation (uses modern JS)

### Navigation
- Pages use `display: none` / `.page.active { display: flex }` — **elements in hidden pages have 0 `offsetHeight`**
- `navigateTo(pageName)` toggles page visibility and updates navbar
- Song picker is a sub-panel within the Play page, toggled via `showPlayPicker()`/`hidePlayPicker()`
- Settings page has toggled sub-sections: `showThemes()`, `showBanners()`, `showFrames()`, `showTos()`, `showPrivacy()`
- Social page: 2 tabs (Groups, Friends) via `switchSocialTab(tab)`
- Spaces page: 2 tabs (Public, Private) via `switchSpacesTab(tab)`
- Creator page: 3 tabs (Photos, Art, Songs) via `switchCreatorTab(tab)`
- Store page: 4 tabs (Songs, Packs, Items, Vault) via `switchStoreTab(tab)`
- Season page: "COMING SOON" placeholder (no interactive content)

### Home Grid & Layout System
- `generateAllTilings()` computes all valid rectangular tilings of a 3x3 grid into `var allTilings = []` (322 valid tilings).
- `buildHomeGrid(layoutIndex)` renders the home page as tiled rectangles with per-tile background images, glow colours, and drop-shadow hover effects. **Octagon clip-paths have been removed** — tiles are now plain `border-radius` rectangles using the nested radius system.
- `var currentLayout = 317` — default tiling index. Out-of-range guard also resets to 317.
- **7 tile types × 5 size variants each** in `/home_tiles/` (1x1, 2x1, 3x1, 1x2, 1x3): Season, Store, Vault, Creator, Spaces, News, Social. Priority-based assignment — biggest cell in the tiling gets highest priority. The **Play Now** tile is the highest-priority mainstage slot (cyan→purple glow matching the Main Stage nav button); it replaced Grammys Season as the featured home slot.
- **3x2 tiles** double their title/subtitle/detail font sizes with matching shadow and letter-spacing. Forced uppercase has been removed from home tile text.
- **Social tile** has a floating-avatar-bubbles animation. **Store / Vault / Spaces / News / Creator** tiles use background images.
- Layout picker overlay (`.layout-overlay`) shows thumbnail previews of all tilings in a scrollable grid. **Hidden by default**; reveal with `?layoutPicker` URL flag.
- `openLayoutPicker()` / `closeLayoutPicker()` / `selectLayout(index)` manage the overlay.
- `?tiles=` URL param overrides tile priority order (e.g. `?tiles=social,store,season,news,spaces,vault,creator`).

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

### Main Stage Tab System (formerly "Play")
- The Play tab was rebranded to **Main Stage** (proscenium stage icon, cyan→purple attract glow). Internally most code still uses `play*` / `solo`/`coop` identifiers — only the user-facing label changed.
- Modes are switched via `setPlayMode(mode)` which calls `buildPlayGrid()`:
  - **Solo** — always available (single player setlist). `playMode = 'solo'`.
  - **Group** — only visible when `inBandspace === true`. `playMode = 'coop'` internally. There is no Battle mode anymore. Inside a bandspace, Solo is rendered greyed-out (still visible but disabled).
- `buildPlayGrid()` dispatches to `buildSoloGrid()` (solo) or `buildCoopGrid()` (group lobby — see Group Lobby section below).
- **Solo mode layout** (top to bottom): State-aware songs panel → unified 5-tile options row (Save/Load Setlist, Instrument, Difficulty, Experience, Apply to All) → Half-height Start button with `jamsesh-signature` texture and `playNudge` attract animation.
- **Default setlist is empty** — `init()` calls `buildPlayPanel([])`. `generateDefaultSetlists()` exists but is no longer called automatically; preset Rock Classics / Chill Vibes / Party Mix / Throwbacks / Hot Hits entries are gone.
- **State-aware songs panel**: 0 songs → single big `+ Add Songs` tile; 1 song → 1×2 `[song][+]`; 2–3 songs → 2×2 with `+` at bottom-right; 4 songs → 2×2 full; 5+ songs → 2×2 paginated with vertical ▲/▼ arrows on the right (`soloGridPage` tracks page).
- **Row-level edit affordance**: Hovering the songs row darkens all tiles and shows a centred **Edit Setlist** label → opens the picker. There are no per-tile replace/remove buttons on the Main Stage tiles themselves anymore — replace/remove flows live inside the picker and via drag-and-drop.
- **Per-song settings**: Each song tile tracks its own instrument and difficulty via `songInstruments[idx]` and `songDiffs[idx]`. Clicking a tile calls `selectSong(idx)` to set `activeSongIdx` (active tile gets white outer glow). The options row shows/changes settings for the active song only.
- **Apply to All**: 5th tile in the options row copies the active song's instrument + difficulty to every song in the setlist via `applyToAllSongs()`.
- **Mixed setlist resolution**: Per-tile instrument badges resolve a setlist-level `mixed` selection to the song's own instrument (e.g. Guitar Basics → `Guitar`), so "Mixed" never appears on a single tile. The setlist-level `Instrument: Mixed` indicator in the options row is unchanged.
- **Drag-and-drop setlist**: Drag songs from the picker grid into setlist slots, reorder setlist tiles by dragging, or drag tiles out to remove. Visual ghost + drop-target highlights.
- **Mode tabs**: Can have background images via `modeTabImages` object.
- Option tiles open popup panels via `openOptionPicker(type)`:
  - **Instrument**: 2x2 image grid (Guitar, Drums, Vocals, Keys "Coming Soon") → sets `selectedInstrument` and per-song via `setSongInstrument()`
  - **Difficulty**: Simple list (Easy, Normal, Hard, Expert) → sets `selectedDifficulty` and per-song via `setSongDifficulty()`
  - **Experience**: Tabbed picker with 5 tabs (Stage, Gem, Highway, Inst. Skin, Skybox) → sets `selectedExpItems[tab]` and `selectedExperience`
- **Manage popup** (formerly Edit/Save/Load/Community): now a **1×2 grid of Save Setlist / Load Setlist** with a full-width **Back** button at the bottom. Edit/Community tiles were removed.
- **Load Setlist — 3 tabs**: Personal / Jamsesh / Community. Jamsesh and Community show a large "Coming Soon..." placeholder; Personal lists user-saved setlists only (built-in lesson setlists are no longer shown in this view).
- **Lesson setlists**: `lessonSetlists[]` (Basic, Advanced, Expert) are still used by the Tutorial Play onboarding step but no longer surface in the standard Load popup.

### Group Lobby (Bandspace)
When Unity flips `inBandspace=true`, the Group tab becomes available and `buildCoopGrid()` renders a vertical list of up to **10 players** (host + 9). Each row shows avatar, name, instrument icon, colour-coded difficulty star, and a status pill — `CHOOSING` (amber) or `READY` (green). See `HANDOVER.md` for the full Unity contract.

- **`?host`** URL slug: sets `inBandspace=true`, `isHost=true`, `hostName=<active profile>`. Active profile renders as host at top of list. `+ Add Player` enabled.
- **`?client`** URL slug: sets `inBandspace=true`, `isHost=false`, `hostName=<first mock entry>`. Active profile renders second with a `YOU` badge. `+ Add Player` hidden, lobby is read-only.
- Bottom button is **Ready** (not Start). Host tapping Ready fires `startGame`; client tapping Ready toggles their own pill via `playerReady`.
- Songs side max = 9 (featured 2×2 + small tiles, transitioning to 3×3 at 7+). Players side max = 10 (vertical list, fixed slot height).
- Unity → WebView messages: `setInBandspace`, `updateIsHost`, `lobbyRoster` (canonical 10-slot roster), `sessionInProgress` (toggles late-join Spectate), `updateInstrumentAvailability`.
- WebView → Unity messages: `playerReady {ready}`, `startGame {instrument, difficulty, setlist[]}`, `invitePlayer {name}`, `kickPlayer {name}`, `playMode "solo"|"coop"`.
- Mock lobby data exists on the `main` branch for in-browser demos; the `production` branch strips placeholder media and mock arrays.

### Song Picker Grid
- **3×3 grid, 9 songs per page**, discrete (non-overlapping) paging. Driven by `GRID_COLUMNS = 3` and `GRID_DEFAULT_ROWS = 3`. `getGridPagingMetrics()` returns `pageRows === stepRows`, so each down/up arrow click advances by a full page.
- `buildGrid(songs)` renders the paginated song grid with `buildNavButtons()` for pagination
- `constrainGridNav()` measures grid page height dynamically — must run after picker is visible
- `applyPickerFilters()` applies genre/decade/duration/sort filters
- `showPlayPicker()` hides play-main-layout and shows the picker; `hidePlayPicker()` reverses
- **Picker tile hover buttons**: each `.song-tile` carries the same `.song-hover-actions` cluster used on the Main Stage tiles, but smaller (86×86) and limited to two buttons — `.song-hover-btn-play` (calls `sendToUnity('previewSong', …)`) and `.song-hover-btn-add` (calls `addSongToSetlist`). `addSongToSetlist` immediately calls `hidePlayPicker()`, so adding/swapping returns the user to the setlist main screen — there is no in-picker setlist preview.

### Gameplay & Results Flow
- `startGame()` populates results from setlist, fades to gameplay screen via `#onboard-black` overlay
- **Gameplay screen**: Full-screen screenshot, click anywhere → `showResults1()`
- **Results Screen 1**: Two columns — left (album art + score with Group/Me tabs, 2x2 stats grid), right (full-height leaderboard with Group/Me lists). `switchResultsTab(tab)` syncs both panels.
- **Results Screen 2**: 2x2 rewards grid (Picks, Badges, XP, Grammys Season). Back/Continue buttons.
- All game screens use `position: absolute; z-index: 998` inside `.viewport`, toggled via `.active` class
- Transitions use fade-to-black (`#onboard-black` div at z-index 1001, 200ms opacity transition)

### Store Page
- 4 tabs: **Songs** (cover-art tiles with $2.99 price tags), **Packs** (themed bundles + locked entries with unlock dates), **Items** (9 category sections: Spaces, Stages, Avatar, Instruments, Gem, Highway, Skybox, Theme, Frame), **Vault** (owned items + creator shapes grid).
- **All four tabs now use the home-grid tiling mechanic.** `?layout=N` reshapes the store too; layout-picker rebuilds propagate, and real songs repopulate the tiled Songs tab after `updateSongsFromBackend`.
- `buildStoreGrid()` called after songs load in XHR callback (needs `allSongs` populated).
- `switchStoreTab(tab)` toggles between songs/packs/items/vault.

### Creator Page
- 3 tabs: **Photos** (3x3 grid with `+` capture tile, paginated), **Art** (3x3 grid with `+` create tile, band logos, paginated), **Songs** ("COMING SOON" placeholder)
- `buildCreatorGrids()` initializes both grids; called in `init()`
- **Photo capture**: `+` tile → `openCreatorCamera()`. **Demo mode** opens camera screen (white canvas + viewfinder). **Normal mode** skips camera and adds a random photo from `stockPhotos[]` directly.
- **Art creation flow**: `+` tile → `openArtPhotoPicker()` → `openArtConfig()` (2x2 shape picker + name picker + word cloud + prompt) → `createArt()` → 5-second loading spinners on all 4 tiles → 2x2 AI results grid with tickbox selection → Save
- **Name picker**: `openCreatorNamePicker()` uses a 3x3 grid (profile pic for solo, band logos for groups, "None" tile) in a widened `#option-picker-overlay` (1700px)
- **Photo/Art preview**: Full-screen view with Back / **New Art** / Delete buttons. `usePhotoForArt()` sends the current photo into the art config flow. Left/right nav arrows (`previewNav(dir)`) to browse through the collection.
- **Photos source**: `creatorPhotos[]` loaded from `photos/` folder (5 stock photos). `stockPhotos[]` used for random additions.
- Creator screens use `.creator-screen` class (absolute, 1920x1920, z-index 998), toggled via `.active`

### Popup Overlays
- All overlays (solo-popup, option-picker, loadout, purchase, save, load, layout-overlay, create-group, logo-picker, create-space) live **inside `.viewport`** and use `position: absolute` to center relative to the 1920x1920 UI panel
- **Z-index layering**: Early access overlay (1002) → onboard-black transition (1001) → onboard screens / logo picker (1000) → all other popups (999) → game screens (998)
- Option picker overlay (`#option-picker-overlay`) used by instrument/difficulty/experience selection
- Purchase flow: check `locked` + `isThemeUnlocked()`/`isBannerUnlocked()`/`isFrameUnlocked()` → open popup → confirm → add to unlocked array → apply

### Mode System (Demo / Onboard / URL Flags)
- **Independent flags**: `demoEnabled` and `onboardEnabled` (not mutually exclusive). Parsed from URL params by `parseMode()`. URL parser tolerates stray `?` after `&`.
- **Full URL parameter list**:
  | Flag | Effect |
  |------|--------|
  | `?demo` | Enables demo-only screens (Meta Store, Quest Home, Boot Splash, OS permission popups). |
  | `?onboard` | Forces fresh onboarding from the beginning, clearing saved progress. |
  | `?step=N` or `?step=<name>` | Jumps to step N (number or named slug: `legal`, `perms`, `tutorial`, `menu`). Auto-marks all prior steps complete. |
  | `?reset` | Clears all `localStorage` onboarding progress without starting any flow. |
  | `?skip` | Bypass everything — straight to full unlocked menu. Ignores localStorage and onboarding flags. |
  | `?layout=N` | Sets home grid layout (0–321). Persists via `sendToUnity('layoutChanged', N)`. Also reshapes the Store tiling. |
  | `?tiles=a,b,c` | Overrides home tile priority order (e.g. `?tiles=social,store,season,news,spaces,vault,creator`). |
  | `?layoutPicker` | Reveals the layout-picker button (hidden by default). |
  | `?challengeLayout=N` | Sets the Challenges (Progress tab) 4x3 grid layout (0–3163). Persists via `sendToUnity('challengeLayoutChanged', N)`. |
  | `?challengeLayoutPicker` | Reveals the Challenges layout-picker button (hidden by default). |
  | `?host` / `?client` | Open directly into the Group lobby with a populated roster — see Group Lobby section. |
- **Combining**: flags combine with `&`, e.g. `?demo&onboard&step=tutorial`, `?host&skip`.
- **`isDemoMode()`** / **`isOnboardMode()`** — helper functions checked throughout the flow.
- **`startFlow()`** — entry point called at end of `init()`. Demo → Meta Store screen. Normal → Early Access overlay. `?host` / `?client` run *after* `startFlow()`, so legal/perms onboarding still gates access.
- **Onboarding steps** (tracked in `onboardFlags` via localStorage under key `jamsesh_onboard`, synced to PlayFab via Vuplex):
  1. `legal` — Terms of Service / Privacy Policy. Re-shown if `LEGAL_VERSION` is bumped.
  2. `perms_explainer` — Camera & Microphone permissions explainer.
  3. `tutorial_play` — Locks UI to Main Stage tab with Guitar/Drum/Vocal Basics tutorial songs.
- **`completeOnboardStep(step)`** saves to localStorage and fires `sendToUnity('onboardStepComplete', ...)`. On launch Unity may push `{type:'onboardProgress', data:{completedSteps:[...]}}` to restore progress.
- **URL is updated live** as onboarding progresses via `history.replaceState` (`?step=legal`, `?step=perms`, `?step=tutorial`, `?step=menu`).

### Onboarding & Early Access Screens
- **Early Access overlay** (`#early-access-overlay`, z-index 1002): Full-panel disclaimer with particle background, shown every session. `dismissEarlyAccess()` calls `onboardAfterEarlyAccess()`.
- **`init()` hides main UI on startup**: Topbar and navbar set to `display: none`, pages to `visibility: hidden` until `_showMainUI()` is called.
- **Legal screen** (`#onboard-legal`, z-index 1000): TOS/PP with checkbox. OK button hidden until checkbox ticked (fades in via `opacity` transition). `onboardComplete()` saves flag and routes to next step.
- **Permissions explainer** (`#onboard-perms-explain`, z-index 1000): Camera & Mic explanation. Demo mode → OS permission popups next. Normal → main UI.
- **Tutorial Play** (`tutorial_play` flag): `startTutorialPlay()` greys out navbar/topbar/mode-tabs/save-load, overrides setlist with `tutorialSongs[]`, only Start is active. `completeTutorialPlay()` restores UI. Demo mode shows tutorial gameplay screenshots (`fretslide1.png`/`fretslide2.png`) before results.
- **Fade-to-black**: `onboardFadeToBlack()` uses `#onboard-black` (z-index 1001) for 200ms opacity transitions.

### Demo-Only Screens (require `?demo`)
- **Meta Store Page** (`#onboard-meta-store`): Mock Quest store listing with "Get" button → Quest Home
- **Quest Home** (`#onboard-quest`): Mock Quest OS environment with app grid, live clock. Click Jamsesh icon → Boot Splash
- **Boot Splash** (`#onboard-boot`): Jamsesh logo, click anywhere → Early Access
- **OS Permission Popups** (`#onboard-perm-camera`, `#onboard-perm-mic`): Mock system dialogs with Allow/Deny buttons
- **Tutorial Gameplay** (`#screen-tutorial-1`, `#screen-tutorial-2`): Screenshot walkthrough with caption overlays

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
- The Profile page also hosts the **Genies avatar** entry tile, plus Name (neon glow), Picture, News, Credits (floating team avatars), and Device info tiles

### Genies Avatar Customization
- A full avatar-editing UI driven entirely by Unity over the Vuplex bridge — **all catalog data and auth state come from Unity**, the WebView only renders and forwards intent. `showAvatarSection()` / `hideAvatarSection()` toggle it.
- **Auth flow** (when not signed into a real Genies account): a login gate (`avatarShowGate()`) → `avatarShowAuthScreen()` with email/OTP modes (`avatarSetAuthMode`, `avatarSubmitSignin`, `avatarSubmitOtp`, `avatarResendOtp`, `avatarShowAuthError`). `avatarLoggedIn` is flipped by Unity's `avatarLoginStatus` message.
- **Catalog**: Unity pushes `avatarCatalog` → `applyAvatarCatalog()` fills `avatarCatalogs` (keyed `'section/sub'` → `[{id,name,iconUrl}]`). Until it arrives, placeholder tiles render. Categories cover clothing (Shirts, Hoodies, Jackets, Pants, Dresses, Shoes, Hats, Glasses, Earrings) plus body-type and slider (morph) sections.
- **Rendering modes** per sub-section: asset-tile grid (`buildAvatarAssetTile`, 4×2 = `avatarItemsPerPage` per page, `avatarGoToPage`), body-type picker (`avatarIsBodyType`), or morph **sliders** (`avatarIsSliderMode` → `buildAvatarSliderRow`, values in `avatarMorphValues` −1..1). Some sections have a "None" cell (`avatarHasNoneCell`).
- **State**: `avatarSection`, `avatarSubIndex`, `avatarPage`, `avatarSelected` (key `'section/sub'` → assetId), `avatarMorphValues`. `avatarRotate()` / `avatarSave()` / `avatarCancel()` send `sendToUnity('avatarRotate'|'avatarSave'|'avatarCancel', …)`.

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
Key theme-set variables: `--bg-body`, `--bg-panel`, `--bg-surface`, `--bg-surface-hover`, `--pink` (accent), `--text-primary`, `--text-secondary`, `--text-muted`, `--border-strong`, `--border-subtle`, `--grid-gap`, `--tile-h`, `--nav-btn-h`.

Frame variables: `--frame-color-1`, `--frame-color-2`.

**Nested radius system**:
- `--radius-outer` (56px) for containers (panels that hold tiles)
- `--panel-radius` (28px) for tiles, buttons, tabs
- Follows the formula `R_outer = R_inner + padding` so nested shapes look concentric. Only exceptions: `50%` for circles, `999px` for pills, and the Quest onboarding screen.

**Per-page colour theming**: Each tab has its own gradient background, wave/particle colours, and accent — Home=purple, Social=green, Spaces=blue, Play=cyan, Creator=amber, Store=pink, Season=gold, Profile=purple. All buttons use page-aware CSS variables (`--btn-tab`, `--btn-tab-border`, `--btn-panel`, `--btn-panel-hover`, `--btn-primary`) that auto-adapt to the active page's accent — there are no grey buttons across the UI. Popups and their buttons inherit the same page-aware variables.

**Signature texture**: `.jamsesh-signature` class applies the JamPick-derived diagonal purple→blue→cyan gradient with repeating stripe overlay and cyan edge glow. Used on special/hero buttons (e.g., Start button).

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
- `var allSongs = []` — loaded from songs.json or via Unity bridge
- `var setlist = []` — current song setlist (global, not per-profile)
- `var playMode = 'solo'` — current Main Stage mode (`'solo'` or `'coop'` — `'coop'` is the Group lobby, only selectable when `inBandspace` is true)
- `var activeSongIdx = 0` — currently selected song tile in solo mode
- `var selectedInstrument`, `var selectedDifficulty`, `var selectedExperience` — play option defaults
- `var songInstruments = {}`, `var songDiffs = {}` — per-song instrument/difficulty overrides (keyed by setlist index)
- `var selectedExpItems = {stage, gem, highway, skin, skybox}` — per-tab experience selections
- `var soloGridPage = 0` — pagination state for solo play grid
- `var currentTheme`, `var currentBanner`, `var currentFrame` — active cosmetic selections
- `var unlockedThemes`, `var unlockedBanners`, `var unlockedFrames` — arrays of unlocked IDs
- `var userCoins = 5000` — currency for purchasing locked items
- `var currentPage = 0` — pagination state for song picker
- `var allTilings = []`, `var currentLayout = 317` — home grid tiling data and selected layout
- `var avatarCatalogs = {}`, `var avatarSelected = {}`, `var avatarMorphValues = {}`, `var avatarLoggedIn` — Genies avatar state (all populated from Unity)
- `var lobbyPlayers = [9]` — mock roster for the Group lobby (replaced by Unity-pushed `lobbyRoster` in production)
- `var inBandspace`, `var isHost`, `var hostName` — Group lobby state pushed by Unity (or set by `?host`/`?client` URL slugs)
- `var demoEnabled = false`, `var onboardEnabled = false` — URL flag toggles
- `var onboardFlags = {}` — onboarding step completion state (persisted to localStorage)

## The claudedesignui/ Design Tool

`claudedesignui/` is a **separate, self-contained design-exploration app** — a React rebuild of the prototype's screens used for high-fidelity visual exploration, wireframes, and user-journey decks. **It is not shipped to the WebView and shares no code with `index.html`.** Treat it as its own project with its own rules.

- **Different constraints — modern JS/JSX, no ES5, no single-file rule.** It runs React 18 + `@babel/standalone` (in-browser JSX transpile, no build step) via CDN `<script>` tags. `.jsx` files use `const`/arrow functions/JSX freely. **Do not** apply the Chromium-91 / ES5 constraints from `index.html` here.
- **Multiple HTML entry points**, each composing a different set of `.jsx`/`.css` files (open directly in a browser — no dev server needed):
  - `Jamsesh Prototype.html` → `app.jsx` — interactive React prototype of the Main Stage / play / results flow (`data.js` + `image-slot.js` + `tweaks-panel.jsx` + `ui.jsx` + `screens.jsx`).
  - `Hi-Fi Screens.html` → `hifi-*.jsx` + `design-canvas.jsx` — annotated hi-fi screen boards.
  - `User Journey Wireframe.html` / `End of Session Wireframe.html` — wireframe decks.
- **Component layout**: `ui.jsx` (Topbar/Navbar) → `window.JamUI`; `screens.jsx` (all page/screen components) → `window.JamScreens`; `app.jsx` wires them with a `useReducer` store and a `Scaler` that fits the fixed **1920×1920** canvas into the window. `data.js` exposes a fictional `window.SONG_CATALOG` / `LEADERBOARD` / `INSTRUMENTS` etc. (separate from the root `songs.json`).
- **Its own assets** live in `claudedesignui/assets/` — do **not** point it at the root `art/`, `avatars/`, etc.
- **Tweaks/edit-mode host protocol**: `tweaks-panel.jsx` provides `window.useTweaks` + `TweaksPanel`/`TweakRadio`/`TweakSlider`/etc. Defaults are declared between `/*EDITMODE-BEGIN*/ … /*EDITMODE-END*/` markers (see `app.jsx`'s `TWEAK_DEFAULTS`) — the host edit-mode bridge reads/writes those keys, so keep that marker block a plain JSON-literal object. `image-slot.js` is a user-fillable image placeholder that persists drops to an `.image-slots.state.json` sidecar via the same host bridge; it is read-only outside that runtime.

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
- **Play grid mode switching**: `buildPlayGrid()` dynamically changes the `#play-grid` className between `play-grid--solo` and `play-grid--coop`. Solo mode hides static `.play-go-bar` and renders Start button dynamically. Group mode renders the lobby roster (see Group Lobby section). There is no Battle mode anymore.
- **`aspect-ratio` CSS not supported**: Chromium 91 does not support `aspect-ratio`. Use `padding-top: 100%` trick for 1:1 squares instead.
- **Early access hides main UI**: `init()` hides topbar/navbar/pages on startup. `_showMainUI()` restores them after onboarding completes. If adding new init-time UI, ensure it handles the hidden state.
- **Create popups use native keyboard**: Group name, space name, and save setlist inputs are standard `<input type="text">` — no on-screen keyboard. Don't add `readonly` to these inputs.
- **Per-song state keyed by index**: `songInstruments` and `songDiffs` use setlist array indices as keys. When songs are removed via `removeSoloSong()`, `activeSongIdx` is clamped but the key mappings may shift — be aware when modifying setlist manipulation code.
- **Demo vs normal behaviour**: Several functions check `isDemoMode()` to branch behaviour (e.g., `openCreatorCamera()` skips camera screen in normal mode, `completeTutorialPlay()` shows gameplay screenshots only in demo). When adding new flows, consider whether they should differ between modes.
- **Option picker panel width**: `openCreatorNamePicker()` widens the panel to 1700px. `closeOptionPicker()` resets width/maxHeight. Any new picker that changes panel dimensions must also reset them on close.
- **File paths moved to subfolders**: Avatars are in `avatars/`, branding in `branding/`, space backgrounds in `spaces/`, demo assets in `demo/`, tutorial assets in `tutorial/`. No image files should live in root.
