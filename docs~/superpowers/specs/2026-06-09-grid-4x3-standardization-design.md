# Grid 4×3 Standardization + Reserved Top Band

**Date:** 2026-06-09
**Branch:** hyperpop-reskin
**File:** `index.html` (single-file app, Chromium 91 / ES5 rules apply)

## Goal

Make browse/library panels visually consistent by converting them all to a **4×3 grid** (matching the existing Journeys / badges layout), and give every converted-grid page a **reserved top band** so grids always start at the same Y and never crowd the tab strip.

## Scope

**In scope** (user-selected):
- Browse/library grids: Social (Groups), Spaces (Public/Private), Creator (Photos/Art) — the `.spaces-grid` family — and Challenges (`.quest-grid`).
- Song picker grid.
- Store tabs (Songs/Packs/Items/Vault).
- Cosmetic swatches: Frames and Banners.

**Out of scope** (would break or look wrong at 4×3):
- Home grid (322-tiling system) — keeps its tiling mechanic.
- Option pickers (instrument = 4 items, difficulty list) — stay 2×2 / list.
- Results stats (2×2 readouts), leaderboard.
- Profile panels.

## The 4×3 standard

4 columns × 3 rows = **12 cells**. Gap **36px** (matches existing Journeys/badges). Square-ish tiles.

| Grid | Location | Change |
|------|----------|--------|
| `.spaces-grid` (Social, Spaces, Creator) | `index.html:3586` | `grid-template-columns: repeat(4,1fr)`; rows `repeat(3,1fr)`; gap 48→36 |
| `.quest-grid` (Challenges) | `index.html:5555` | same |
| `.badge-grid` | `index.html:5619` | already 4×3 — reference, no change |
| Song picker | `index.html:10324` | `GRID_COLUMNS = 3` → `4` (scrolling grid, 3 rows visible, 4 wide) |
| Store (4 tabs) | `buildStoreGrid` `index.html:15200` | replace `buildTiledGrid(...)` calls with a uniform 4×3 render; bump per-tab item count 9 → up to 12. Drops the home-tiling mechanic **for Store only**; the home page keeps it. |
| Frames / Banners | `buildFrameGrid` `:15700`, `buildBannerGrid` `:15679` | container → 4 columns; wrap/scroll past 12 |

## Reserved top band

A fixed-height band at the top of every converted-grid page so all grids align:
- `.play-mode-tabs` standardized to a **fixed height + bottom margin**; the tab strip lives in the band.
- Non-tabbed grid pages get an **empty band spacer** of the same height so their grid still aligns.
- Content area below the band stays `flex: 1`.
- **Band height** defaults to the current tab-strip height (so tabbed pages don't shift).
- Home (tiling) and Profile keep their own layouts.

## VR guardrails

- 4-across tiles are ~25% narrower than 3-across. Verify the **16px text floor** still holds on `.space-tile` / `.song-tile` titles; tighten font/padding only if content clips.
- Keep `:active` fallbacks and existing hover clusters intact.

## Approach

**Edit existing grid containers in place** (chosen): change each grid's CSS to the shared 4×3 values + the JS edits above. Lowest-risk diff; per-content tile styling stays. Validate live via the running browser-sync server (`http://localhost:3006`).

## Out of scope / non-goals

- No change to the home tiling system, option pickers, results, or profile.
- No new build step, no framework, no shared utility-class refactor (rejected Approach #2).
