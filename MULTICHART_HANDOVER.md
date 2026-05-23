# Multichart Instrument Picker — Unity Handover

The instrument picker (`openOptionPicker('instrument')`) now supports **multiple chart variants per instrument** per song. There are two visual layouts, picked automatically based on the chart data you push.

---

## TL;DR for Unity

1. Parse `song.ini` `[beatmap_N]` sections per song.
2. Push them with one Vuplex message:
   ```json
   { "type": "updateSongCharts",
     "data": { "title": "Espresso",
               "charts": {
                 "guitar": [
                   {"id":"4d038f06","name":"v10-polyphonic","preset":"v10-polyphonic-basic-pitch","active":true},
                   {"id":"a91b4d03","name":"v9-sparse","preset":"v9-sparse-strong-beat"}
                 ],
                 "drums":  [{"id":"db1","name":"drums-v1","preset":"drums-v1","active":true}],
                 "vocals": [{"id":"vx1","name":"main","preset":"vocals-v1","active":true}]
               } } }
   ```
3. Listen for the user's pick on the existing `instrument` outgoing message — payload is now an **object**, not a string.

That's it. Layout switching, chart capping, and selection state are handled UI-side.

---

## 1. Incoming bridge message — `updateSongCharts`

Push the chart catalogue for one song (or many) at any time. The UI stores the charts on the song object and reads them whenever the picker opens.

**Message envelope** (same shape Unity uses for every Vuplex push):

```json
{ "type": "updateSongCharts", "data": <payload> }
```

**Payload — single song:**
```json
{
  "rank": 12,                 // optional — matched first if present
  "title": "Espresso",        // fallback match key
  "charts": {
    "guitar": [ { "id": "<beatmap_id>", "name": "<display>", "preset": "<preset slug>", "active": true } ],
    "drums":  [ ... ],
    "vocals": [ ... ]
  }
}
```

**Payload — batch (array):**
```json
[
  { "rank": 1,  "charts": { ... } },
  { "rank": 2,  "charts": { ... } }
]
```

### Field reference

| Field | Required | Notes |
|---|---|---|
| `rank` | one of rank/title | Matches `song.rank` from `updateSongs`. Preferred — survives title typos. |
| `title` | one of rank/title | Fallback string match against `song.title`. |
| `charts` | yes | Object keyed by instrument id. Keys MUST be lowercase: `guitar`, `drums`, `vocals`. Other keys ignored. |
| `charts[inst]` | yes if key present | Array of chart variants. Max 10 per instrument — extras are clipped UI-side. |
| `charts[inst][n].id` | yes | Stable opaque string. Echoed back when the user picks. Use the madmom `beatmap_id` (12-char hex). |
| `charts[inst][n].name` | preferred | Friendly label shown on the chip. Falls back to `preset`, then `id`. |
| `charts[inst][n].preset` | optional | Preset slug — used as fallback label only. |
| `charts[inst][n].active` | preferred | Exactly one per instrument should be `true`. Used as the default selection. |

### When to call

- Once per song after parsing `song.ini`. Calling early (before setlist load) is fine — the UI keys by rank/title, and the picker reads at open time.
- Re-call when the variant catalogue changes (e.g., user enabled an alt beatmap via your CMS). The UI will re-render the picker live if it's open.

### What happens if you don't call it

The picker falls back to **single layout** — three instruments in a row, no chart strip. This is the correct behaviour for stock songs that only ship one chart per instrument.

---

## 2. Outgoing bridge message — `instrument` (selection)

When the user picks, the UI emits the existing message but the payload is now an **object**:

```json
{ "type": "instrument", "data": { "instrument": "guitar", "chartId": "4d038f06" } }
```

| Field | Notes |
|---|---|
| `instrument` | `"guitar"` \| `"drums"` \| `"vocals"`. |
| `chartId` | The exact `id` you sent in `updateSongCharts`. `null` if the song has no chart catalogue (i.e., this is a single-chart legacy song). |

> ⚠️ **Breaking change**: previously `data` was a bare string (e.g., `"guitar"`). If your message handler reads `msg.data` as a string, update it to `msg.data.instrument`.

The chart selection is also persisted UI-side, per song, in `songChartSelections[setlistIdx]`. When the user re-opens the picker the previous chart pick is restored. The `startGame` message does not yet include the chart id — let me know if you need it added there too.

---

## 3. Layout selection — automatic

The UI inspects the active song's `charts` at picker open and picks the layout:

| Condition | CSS class on grid | UX |
|---|---|---|
| Any of guitar/drums/vocals has **>1** chart | `instrument-picker--multichart` | 3-column stacked layout. Each column = instrument header + vertical list of charts. Up to 10 per instrument; extras are dropped. Instruments with 0 charts show a "No chart" placeholder so columns stay aligned. |
| All instruments have **≤1** chart (or no chart data) | `instrument-picker--single` | 3 square instrument tiles in a row. Click selects instrument. |

You don't need to do anything to choose between them — just send the chart data and the UI will route itself. The slug is the only thing that changes; both layouts emit the same outgoing `instrument` message format.

---

## 4. Edge cases handled UI-side

- **>10 charts per instrument**: clipped to first 10 (`MAX_CHARTS_PER_INSTRUMENT`).
- **0 charts for one instrument in a multichart song**: that column renders a "No chart" placeholder (visual only; header still selects the instrument with a `null` chartId).
- **No catalogue at all**: single layout, behaves like before (with Keys removed).
- **Picker open when `updateSongCharts` arrives**: re-renders live, preserving the user's instrument hover.
- **Coop/battle mode**: existing `updateInstrumentAvailability` "taken by another player" overlay still works on each column.
- **Per-song memory**: each setlist slot remembers its own chart selection. Switching setlist songs resets to the `active` chart of the new song.

---

## 5. Other changes in this drop

- **"Keys / Coming Soon" tile removed** from the picker.
- Picker grid is now **3-in-a-row** (was 2x2).
- Panel widened to 1400px to accommodate the third column.

---

## 6. Testing without Unity

### Auto-seeding (browser-sync only)
When `index.html` is served outside Vuplex (i.e. `window.vuplex` is undefined), the XHR fallback that loads `songs.json` also seeds **every song in `allSongs` with 10 charts per instrument** (guitar/drums/vocals). Any song added to the setlist therefore renders the `--multichart` layout in the picker without further action.

This auto-seed is a no-op in Vuplex — Unity's `updateSongCharts` pushes are the only source of chart data in production.

### Forcing a specific layout from the console
Two helpers are exposed on `window` (defined in `init()`):

| Helper | Effect |
|---|---|
| `debugMaxCharts()` | Fills the active song with **10 charts per instrument** → forces `instrument-picker--multichart`. |
| `debugMaxCharts('Espresso')` | Same, targeted by title. |
| `debugMaxCharts({rank: 12})` | Same, targeted by rank. |
| `debugMaxCharts('Espresso', 3)` | 3 charts per instrument instead of 10. Still triggers multichart (any >1 triggers it). |
| `debugSetSongCharts({title:'X', charts:{ guitar:[{id:'a',name:'A',active:true}] }})` | Free-form — set exactly the charts you want. One chart per instrument across the board → forces `instrument-picker--single`. |
| `debugSetSongCharts({title:'X', charts:{}})` | Clears all charts on that song → returns it to single layout. |
| `__buildMaxCharts(n)` | Lower-level: returns a `{guitar, drums, vocals}` object with `n` charts each. Use when batching via `updateSongChartsFromBackend([...])`. |

### Layout summary

| Goal | How |
|---|---|
| Preview **single** layout | `debugSetSongCharts({title: setlist[activeSongIdx].title, charts: {}})` |
| Preview **multichart** layout (max 10) | `debugMaxCharts()` |
| Preview multichart with arbitrary n | `debugMaxCharts(null, n)` or `debugMaxCharts('Title', n)` |
| Preview asymmetric (e.g. guitar=3, drums=1, vocals=0) | Use `debugSetSongCharts` with hand-built `charts` object |

All helpers are dev-only conveniences that route through `updateSongChartsFromBackend` — the same path Unity uses — so what you see in dev is what Unity will produce.

---

## 7. Code locations (index.html)

| Concern | Function / selector |
|---|---|
| State | `songChartSelections`, `MAX_CHARTS_PER_INSTRUMENT` (near `var songSpaces`) |
| Helpers | `getSongCharts`, `getSongActiveChart`, `setSongChart`, `anySongInstrumentHasMultichart` (near `setSongInstrument`) |
| Incoming bridge | `case 'updateSongCharts':` in the Vuplex listener; handler is `updateSongChartsFromBackend` |
| Outgoing bridge | `sendToUnity('instrument', { instrument, chartId })` inside `openOptionPicker('instrument')` |
| Picker render | `if (type === 'instrument')` branch of `openOptionPicker` |
| CSS | `.instrument-picker--single`, `.instrument-picker--multichart`, `.instrument-picker__column/__header/__charts/__chart` |
