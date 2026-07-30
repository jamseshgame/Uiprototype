# Jamsesh UI Prototype — Final Handover

Single-file HTML/CSS/JS prototype of the Jamsesh lobby UI, built to run inside the
**Vuplex WebView on Meta Quest** at a fixed **1920×1920** panel. All app code lives in
**`index.html`** (~24k lines); `results.html` is a standalone end-of-song results page.

This doc is the top-level map. Deep Unity contracts live in the topic handovers
(see [Unity integration](#unity-integration)). For architecture/coding rules read
**`CLAUDE.md`** first — especially the **Chromium-91 / ES5** constraints (no `let`/`const`,
arrow fns, template literals, etc. in the main `<script>`).

---

## Run it

```bash
npx browser-sync start --server --files "*.html" --port 3000 --no-open
# open http://localhost:3000
```

No build step, no linter, no tests — `index.html` is served verbatim to the WebView.
Validate by loading in desktop Chromium and exercising the flow. Outside Vuplex the app
runs in "demo/browser" mode (`window.vuplex` undefined) and loads `songs.json` via XHR.

**Useful URL flags** (full list in CLAUDE.md): `?skip` (straight to unlocked menu),
`?onboard` / `?onboard&step=legal|perms|tutorial`, `?demo`, `?host` / `?client` (open the
Group lobby with a roster), `?layout=N`, `?layoutPicker`.

---

## Branch / repo state

- Active work branch: **`hyperpop-reskin`**; everything below is merged to **`main`** (`origin/main`).
- **Image assets are git-tracked and were optimized** this round (see [Assets](#assets)).
- `art/` is **not** tracked (supplied locally). `art/benchango.jpg` is the shared cover
  placeholder (`SONG_COVER_PLACEHOLDER`) used wherever a song has no real art yet.
- A `screenshots/` folder of every screen/popup exists locally but is **not committed**
  (generated artifact). Regenerate with the Puppeteer script (see [Screenshots](#screenshots)).

---

## What changed in this round

All in `index.html` unless noted.

### Topbar
- **XP bar** added under the username (teal `--cyan` accent), with the **level** shown to
  the left of the Picks balance. Username enlarged. Fill is **Unity-driven** — see
  `updateXp` below. Seeded from the active profile until Unity pushes.

### Results screen 1 (`#screen-results1`)
- Header trimmed to just **"RESULTS"**; **ME/GROUP pill moved to the top-right** and enlarged.
- **Full square cover art** with song name/details beneath it; the "A" grade badge removed.
- **Leaderboard**: 12 rows, bigger text, no scrollbar (`overflow:hidden`); subtext removed.
- **Group tab swaps the leaderboard to a band list** (`buildResultsBandLeaderboard`); the
  left-card stat boxes are hidden on the Group tab.
- Stat blocks fill the card; NOTES HIT shows `412/438` one size; "TOP STARPOWER" (was MULT).
- **Per-song pager**: when the setlist has >1 song, ◄ ► arrows under the cover art flick
  through each song — art, score, stars, stats, and the leaderboard all update per song.
  (Mock per-song data in browser; Unity can push real per-song results — see below.)
- Single full-width green **CONTINUE** button (Start-button style).

### Results screen 2 / Rewards (`#screen-results2`)
- Reduced to **3 equal tiles — XP / Picks / Badges** — centred vertically; icons grow to
  fill the tile. Picks uses the JamPick asset; **Badges reuses the exact `.badge-tile`**
  element from the Badges page (`makeBadgeTile`).
- **Single long green CTA**: **"BACK TO LOBBY"** when `playMode === 'coop'`, else
  **"BACK TO SOCIAL HUB"**. (Currently calls `exitResults()` — the *destination nav* is a
  Unity wiring TODO; only the label is mode-aware.)

### Perform / Group
- **Invite** (Perform ▸ Group ▸ Invite) opens a full **"Invite People"** people grid (no band
  UI), CTA **"OK"**; never bounces to Create Group even with no active band.
- **Create Group** popup: people fill the top, member slots pinned to the bottom.
- **No auto-seeded default group** on fresh launch (Groups tab shows only "Create New").
- Difficulty picker tiles centred vertically.

### Misc
- Result panels excluded from the global `.fx-press` hover (they aren't clickable —
  added `.r2-card` to `FX_SKIP`).
- Song-cover placeholder (`art/benchango.jpg`) used on song tiles + the results art when a
  song's `file` is empty (`updateSongsFromBackend` fills empties).

---

## Unity integration

The WebView ↔ Unity bridge is `sendToUnity(type, data)` / `initVuplexListener()` →
`handleUnityMessage()`. **New this round:**

| Message (Unity → WebView) | Handler | Payload | Effect |
|---|---|---|---|
| `updateXp` | `updateXpFromBackend` | `{ level, xp, xpMax }` (or a bare number = current xp) | Fills the topbar XP bar (`fill = xp/xpMax`, animated) + sets the level label. Console helper: `setXp(xp, xpMax, level)`. |

Pre-existing contracts are unchanged and documented in their own files:

- **`HANDOVER.md`** — Group Lobby / bandspace contract (`setInBandspace`, `lobbyRoster`,
  `updateIsHost`, `sessionInProgress`, `playerReady`, `startGame`, `invitePlayer`, …).
- **`MULTICHART_HANDOVER.md`** — instrument picker / multichart contract.
- **`CHALLENGES_HANDOVER.md`**, **`BADGES_HANDOVER.md`**, **`REFERRALS_HANDOVER.md`** — those screens.
- **`HANDOVER_RESKIN_2026-06-17.md`**, **`SESSION_HANDOVER.md`** — earlier session notes.

### Results data (mock vs real)
- The per-song results pager and the band leaderboard use **deterministic mock data** in the
  browser. `meScoreData` is the canonical base (never mutated); the screen reads the current
  song via `_resultsMeData()` / `_resultsGroupData()`, and `resultsPerSong[]` holds per-song
  entries. Unity can populate real per-song results into the same path; `showGameResults` /
  `applyGroupScore` / `applyResultsLeaderboard` are the existing entry points.

---

## Assets

Image assets were recompressed/resized with **ffmpeg** (the only real image tool on this
box — `convert` is the Windows disk utility, **not** ImageMagick):

- **~73 MB → ~26 MB (~64% smaller)**, format-preserving so **no code/reference changes**.
- Method: opaque/photo PNGs → 256-color dithered quantize; alpha PNGs → resize ≤1280 +
  max compression; large JPEG/JFIF (`home_tiles` were 2800–3168px) → resize ≤1600 + q≈85.
  Every replace was gated **keep-only-if-smaller**.
- Quality caveat: photographic PNGs (avatars) use a 256-color palette → mild banding up
  close; glow edges on the pick/instruments slightly softened. All git-tracked → revert with
  `git checkout -- <dir>` if any look too rough.
- The shipped app (index.html + referenced asset folders) is now **~29 MB**. The 98 MB repo
  total is dominated by `claudedesignui/` (57 MB, the separate React design tool — not shipped)
  and source/working files.

---

## Screenshots

A full set of screen + popup screenshots can be regenerated headlessly:

- Tooling: `puppeteer-core` driving the **installed Chrome** (no download). Script lives in
  the session scratchpad (`…/scratchpad/shots/capture.js`) — not committed.
- It loads `localhost:3000?skip` and calls the app's real `navigateTo` / `switch*` / `open*` /
  `show*` functions to reach each state, screenshotting the `.viewport` element at 1920×1920.
- Output → `screenshots/` + `_manifest.txt`. ~62 states captured. **Caveat:** open popups
  whose overlay id isn't in the close-list can bleed into the next shot (the results shots
  needed a clean re-capture for this reason) — close popups between shots or capture in a
  fresh page.
- The legacy demo OS mock screens (Quest Home / Boot Splash / OS permission popups) referenced
  in CLAUDE.md no longer exist as elements and were skipped.

---

## Known follow-ups / TODOs

- **Rewards CTA navigation**: "Back to Lobby" / "Back to Social Hub" only changes the *label*;
  both still call `exitResults()`. Wire the actual destination (group lobby vs social-hub
  space) on the Unity side when ready.
- **Per-song results + band leaderboard** are mock in-browser — replace with real Unity data.
- Dead CSS/JS left in place after refactors (e.g. removed reward cards, `backToResults1()`,
  `.r2-back--studio`/`.rw-*` for deleted tiles, `.topbar-spacer`). Harmless; clean up if desired.
- A queued, **out-of-repo** request exists: *on the activity-feed "synced collection" card, if
  the viewer is Pro and hasn't synced with PowerTools, show a reminder + link to the PowerTools
  guide.* That card is **not** in this repo — needs the target codebase before it can be built.
