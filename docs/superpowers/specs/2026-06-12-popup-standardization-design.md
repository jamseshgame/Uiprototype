# Popup Standardization — Design Spec

**Date:** 2026-06-12
**File touched:** `index.html` (single-file app)
**Goal:** Give every popup/picker an identical frame — same ratio as the main UI, fixed size, a large top-right X, and a centered row of equal-width CTA buttons — so layout and CTA placement are consistent and build "muscle memory."

---

## 1. Requirements (locked with user)

- **Frame size:** every in-scope popup is a fixed **1152×1152px** square (1:1, matching the 1920×1920 main UI), centered in the viewport — a 20% (384px) inset on all four sides.
- **Overflow:** content is **scaled to fit** the square. No scrollbars. Dense grids/lists shrink their items to fit.
- **Close:** a **large X** button, top-right, on every popup. X is the universal dismiss. It **replaces** any Cancel/Back button.
- **CTA buttons:** 0–3 affirmative CTAs in a **centered footer row**, all the **same height and width**, pinned to the bottom.
- **Scope:** content/dialog popups only. Full-bleed screens stay as-is.

---

## 2. The Standard Frame

A single shared CSS system (`.std-popup*`) layered onto the existing overlays. Each popup keeps its existing `id` and `open*/close*` JS — only frame markup/CSS changes.

```
┌─────────────────────────────────────┐  ← .std-popup : 1152×1152, centered
│  Title                          [✕]  │  ← .std-popup-header (pinned), X top-right
│                                      │
│         …popup content…              │  ← .std-popup-body (flex:1, min-height:0)
│         (scaled to fit, no scroll)   │
│                                      │
│         [  CTA  ]   [  CTA  ]         │  ← .std-popup-footer (pinned, centered)
└─────────────────────────────────────┘
```

### 2.1 Overlay (`.std-popup-overlay`)
- `position:absolute; inset:0; z-index:999; display:flex; align-items:center; justify-content:center;`
- Most overlays already do this; normalize the ones that differ.
- Backdrop background kept per existing popup (dark). Click-on-backdrop-to-close behavior preserved where it already exists.

### 2.2 Frame (`.std-popup`)
- `width:1152px; height:1152px;` fixed (NOT max-width — fixed square).
- `border-radius: var(--radius-outer);` (56px)
- `border: 1px solid var(--btn-tab-border);` background `var(--bg-panel)` / existing panel color.
- `padding: 56px;` internal.
- `display:flex; flex-direction:column; gap:24px;`
- `position:relative;` (anchors the absolutely-positioned X).
- **Chromium 91:** `aspect-ratio` is NOT used — width/height are set explicitly. OK.

### 2.3 Header (`.std-popup-header`)
- `flex-shrink:0;` holds the centered title.
- Title: reuse existing per-popup title styling (e.g. `.option-picker-title`, `.save-popup h2`), centered.
- A popup with no title still renders the header band (so the X has consistent placement) — header may be empty but reserves height ~88px.

### 2.4 Close button (`.popup-close-btn`, upgraded)
- Existing class, bumped to **80×80px** (from 64), `top:32px; right:32px;`, `font-size:40px`, `border-radius:50%`, `z-index:10`.
- Already present on 9 popups; **added** to the 4 that lack it: `solo-popup`, `option-picker`, `loadout`, `load`.
- `onclick` wired to that popup's existing close function.

### 2.5 Body (`.std-popup-body`)
- `flex:1; min-height:0; display:flex; flex-direction:column;` (or grid, per popup).
- Holds the popup's existing content. Content is sized to the available inner box and must NOT scroll.
- **Available inner box** ≈ `1152 − 56·2 (pad) − ~88 (header) − ~24·2 (gaps) − ~104 (footer)` ≈ **1040px wide × ~760px tall**. Dense content sizes to this.

### 2.6 Footer (`.std-popup-footer`)
- `flex-shrink:0; display:flex; justify-content:center; gap:24px;`
- Omitted entirely for select-and-close pickers (Difficulty, Instrument) — those have no CTA, just the X.
- Buttons: `.std-popup-btn` — **440px wide × 104px tall**, fixed, `border-radius: var(--panel-radius)`, `font-size:28px`. Affirmative styling uses page-aware `--btn-primary`. For 1 button it's centered alone; 2–3 are centered as a group.
- A "primary/hero" CTA may keep the `jamsesh-signature` texture (e.g. Accept) while still using the fixed 440×104 box.

---

## 3. Per-popup migration

For each, the body is wrapped in the standard header/body/footer, Cancel/Back is dropped, X is ensured, and the panel is resized to 1152².

| # | Popup (overlay id) | Panel class today | Today's CTAs | After |
|---|---|---|---|---|
| 1 | `purchase-overlay` | `.purchase-popup` | Cancel + Confirm | **Confirm** only; X added-already; resize |
| 2 | `solo-popup-overlay` | `.solo-popup` | (varies) | X **added**; footer per content |
| 3 | `option-picker-overlay` | `.option-picker-panel` (1200px; 1700 for name picker) | Experience: Cancel+Accept; Difficulty/Instrument: none | **Accept** only (experience); **none** (difficulty/instrument/name → select+X); X **added**; resize to 1152, remove 1700 override |
| 4 | `loadout-overlay` | `.loadout-popup` | (varies) | X **added**; footer per content |
| 5 | `save-overlay` | `.save-popup` (1600px) | Cancel + Save | **Save** only; resize |
| 6 | `referral-code-overlay` | `.referral-code-popup` (980px) | Cancel + (submit) | submit only; resize |
| 7 | `referral-help-overlay` | (save-popup variant) | Cancel | **none** (X only); resize |
| 8 | `challenge-overlay` | challenge content | (varies) | per content; resize |
| 9 | `load-overlay` | load content | (varies) | X **added**; per content; resize |
| 10 | `create-group-overlay` | `.create-group-popup` | Cancel + Create | **Create** only; resize. Two-column invite shrinks to fit. |
| 11 | `logo-picker-overlay` | logo grid | (varies) | per content; resize |
| 12 | `create-space-overlay` | `.create-space-popup` | Cancel + Create | **Create** only; resize |

> The name-picker 1700px width override (`openCreatorNamePicker`) and any `closeOptionPicker` width/maxHeight reset must be updated to the 1152 standard.

---

## 4. Out of scope (unchanged)

Full-bleed system screens and non-dialog overlays:
- `early-access-overlay`, `onboard-*` (legal, perms, meta-store, quest, boot, perm popups), tutorial gameplay screens
- creator camera / `.creator-screen`
- `layout-overlay`, `quest-layout-overlay` (fullscreen thumbnail grids)
- `challenge-spinner-overlay` (transient loading spinner)
- **Song picker** (`showPlayPicker`) — an in-page sub-panel that replaces the Main Stage layout, not a centered modal. (Flag for later if desired.)

---

## 5. Constraints & risks

- **Chromium 91 / ES5:** all main-app JS stays ES5 (`var`, `function`, string concat, IIFEs). No `aspect-ratio`, no `gap` reliance on flex where unsupported — but `gap` is already used widely in this file's flex/grid, so it is acceptable here.
- **Hidden-element measurement:** any popup that measures content (`offsetHeight`) must do so after the overlay is visible (`.active`), per existing pitfalls.
- **Tightest fits (accepted by user, no scroll):** create-group two-column invite and song-pack purchase grid get smaller tiles inside 1152². Save/load lists likewise. These are intentional.
- **Pseudo-elements:** `::after`/`::before` already used for themes/shimmer/banners — the frame relies on real elements (header/footer divs, real `<button>` X), avoiding conflicts.
- **Page-aware theming:** buttons and accents use existing `--btn-*` / `--page-accent` variables so each popup still adopts the active page's color.

## 6. Validation

No tests/build. Validate by loading `http://localhost:3000` in desktop Chromium and opening each of the 12 popups: confirm identical 1152² footprint, X top-right at 80px, centered equal-size CTA row, content fits with no scrollbar. Spot-check in a few themes (Arcade, Nebula, Wireframe) and on a per-page color (e.g. open a picker from Store vs Main Stage).
