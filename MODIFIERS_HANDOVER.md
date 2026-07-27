# Miss-Feedback Modifiers — Unity Handover

The **Difficulty** option tile now opens a full-screen **Difficulty & Modifiers** popup carrying 15 miss-feedback modifiers and 23 tuning sliders, modelled on how Rock Band / Guitar Hero signal a missed note. The WebView owns the UI and the persisted values; Unity owns **who sees the tuning tier** and **what the values actually do**.

---

## TL;DR for Unity

1. Decide the tier per user — send once at launch:
   ```json
   { "type": "setModifierTier", "data": { "accountId": "<PlayFab id>" } }
   ```
   Or force it: `{"tier": "team"}` / `{"tier": "player"}`.

2. Read the modifier block off the existing `startGame` message — it is already there, no new listener needed:
   ```json
   { "type": "startGame",
     "data": { "instrument": "guitar", "difficulty": "easy", "setlist": ["…"],
               "tutorial": false,
               "modifiers": {
                 "tier": "team",
                 "preset": "Practice Mode",
                 "enabled": { "stemDuck": true, "failSong": false, … },
                 "values":  { "duckDb": -24, "duckDurationMs": 250, … } } } }
   ```

3. Optionally listen for live edits (`modifierChanged`) if you want the mix to update while the popup is open.

Everything else — layout, persistence, presets, tier gating — is handled UI-side.

---

## 1. Tier gating — `setModifierTier`

Two variants of the same popup:

| Tier | What the user sees |
|---|---|
| `player` | One on/off toggle per modifier. **Default.** |
| `team` | The same toggles **plus** the numeric sliders behind each one, and a cyan `TUNING` badge. |

The tuning sliders are audio-engineering values (ms, dB) and are not intended for players. Send the tier at launch:

```json
{ "type": "setModifierTier", "data": { "tier": "team" } }
```

**Payload — any of these three shapes:**

| Shape | Behaviour |
|---|---|
| `"team"` (bare string) | Sets the tier directly. |
| `{ "tier": "team" }` | Sets the tier directly. |
| `{ "accountId": "ABC123" }` | Resolved against `MODIFIER_TEAM_ACCOUNTS` in `index.html` → `team` if listed, else `player`. |

Anything unrecognised falls back to `player` — fail closed, so a malformed message never leaks the tuning UI to a player.

### Adding team accounts

Near the top of the modifier block in `index.html`:

```js
var MODIFIER_TEAM_ACCOUNTS = [];   // paste PlayFab account IDs here
```

Either paste IDs there and send `{accountId}`, or keep the list empty and decide entirely on the Unity side with `{tier}`. Both work; `{tier}` is the cleaner long-term option since it keeps the allowlist out of a shipped HTML file.

### Timing

Safe to send at any point. If the popup happens to be open, it repaints in place. The tier is also cached in `localStorage`, so it survives a WebView reload — but Unity's message always wins, so treat the cache as a browser-testing convenience, not state you need to manage.

---

## 2. Outgoing — the `modifiers` payload

Identical shape everywhere it appears:

```json
{
  "tier": "team",
  "preset": "Practice Mode",
  "enabled": { "<modifierId>": true },
  "values":  { "<sliderId>": 250 }
}
```

| Field | Notes |
|---|---|
| `tier` | Echo of the current tier. Useful for telemetry — tells you whether a session was tuned or played. |
| `preset` | Name of the active preset, or `""`. Suffixed `" (modified)"` when the live values have drifted from it. Display/telemetry only. |
| `enabled` | Every modifier id → bool. Always complete — all 15 keys present. |
| `values` | Every slider id → number. Always complete — all 23 keys present, even for modifiers that are switched off. |

**`enabled` and `values` are independent.** A slider keeps its value while its modifier is off, so the user can toggle a modifier back on without losing their tuning. **Always check `enabled[id]` before applying `values`** — do not infer "off" from a value.

### Where it arrives

| Message | When |
|---|---|
| `startGame` | Under `data.modifiers`. **This is the authoritative one** — the state at the moment the song starts. |
| `modifiers` | Whole-payload push, sent on **Reset Defaults** and on **applying a preset**. |
| `modifierChanged` | Single-field delta, sent live as the user edits (see below). |

---

## 3. Outgoing — `modifierChanged` (live edits)

Sent as the user works, so the team can hear a change without restarting a song. Optional to implement.

**Toggle:**
```json
{ "type": "modifierChanged", "data": { "modifier": "stemDuck", "enabled": false } }
```

**Slider:**
```json
{ "type": "modifierChanged",
  "data": { "modifier": "stemDuck", "slider": "duckDurationMs", "value": 600, "enabled": true } }
```

A `slider` key present means it is a value change; absent means a toggle. During a drag these are **throttled to roughly one every 60 ms**, and the final value on release is always sent unthrottled — so the last message you receive is authoritative and you can apply every one you get without debouncing.

---

## 4. The modifiers

15 modifiers across 4 tabs. `def` is the shipped default.

| id | Tab | Label | Default | Sliders |
|---|---|---|---|---|
| `stemDuck` | Audio | Duck Your Stem On Miss | `true` | 4 |
| `stemBoost` | Audio | Boost Your Stem | `true` | 1 |
| `missSfx` | Audio | Miss Sound Effect | `true` | 1 |
| `hitFlames` | Highway | Fret Flames On Hit | `true` | 2 |
| `ghostMissedNote` | Highway | Missed Notes Ghost Through | `true` | 1 |
| `streakCounter` | Highway | Streak Counter | `true` | 1 |
| `streakBreak` | Scoring | Miss Breaks Streak | `true` | 1 |
| `multiplierDrop` | Scoring | Miss Drops Multiplier | `true` | 2 |
| `overdriveVoid` | Scoring | Miss Voids Overdrive Phrase | `true` | — |
| `rockMeter` | Failure | Rock Meter | `true` | 3 |
| `failSong` | Failure | Fail On Empty Meter | `true` | — |
| `dangerVignette` | Failure | Danger Screen Edges | `true` | 3 |
| `highwayDesat` | Failure | Highway Drains In Danger | `false` | 1 |
| `crowdReacts` | Failure | Crowd Reacts To Misses | `true` | 2 |
| `bandRevive` | Failure | Bandmate Revive | `true` | 1 |

### What each one means

| id | Behaviour when enabled |
|---|---|
| `stemDuck` | The player's own instrument stem drops out of the mix on a miss. The signature Rock Band / Guitar Hero cue — the failure is expressed *in the music*, so it reads as "I played it wrong" rather than "the game penalised me". |
| `stemBoost` | The played stem sits above the rest of the mix, so both hits and dropouts read clearly. |
| `missSfx` | Broken-string screech layered over the dip. Matters most on drums and vocals, where the stem dropout alone is hard to hear. |
| `hitFlames` | Reward burst at the strike line on a hit. With this on, a miss reads as the *absence* of the flame — no penalty graphic needed. |
| `ghostMissedNote` | A missed gem slides past the strike line unlit instead of vanishing, so the player sees what they dropped. |
| `streakCounter` | Streak counter fades in past a threshold and disappears on a miss. A HUD element vanishing is very legible in peripheral vision. |
| `streakBreak` | Note streak resets to zero on a miss. `streakForgiveness > 0` turns this into a streak-protection assist. |
| `multiplierDrop` | Score multiplier falls on a miss. `multiplierSteps: 4` is a full Guitar Hero style reset to 1×. |
| `overdriveVoid` | Missing inside a glowing Overdrive phrase reverts the rest of that phrase to ordinary notes — the reward visibly de-powers. |
| `rockMeter` | The crowd / failure meter exists. See the asymmetry note below. |
| `failSong` | Empty meter fails the song. **Off = No Fail practice mode** — scores still tracked, flag them as assisted. |
| `dangerVignette` | Red vignette pulses at the screen edge as the meter nears empty. Stronger in VR than on a TV — it sits in genuine peripheral vision. |
| `highwayDesat` | Note highway loses colour as the meter falls. Off by default — it competes with the vignette for the same signal. |
| `crowdReacts` | Cheering sours into booing as the meter drops, escalating failure out of the HUD and into the world. |
| `bandRevive` | Group only. A player who fails out goes silent and can be revived by a bandmate spending Overdrive. |

---

## 5. The sliders

23 sliders. Ranges are enforced UI-side — values are always clamped and snapped to `step`, so you will never receive an out-of-range or off-step number.

| id | Modifier | Label | Range | Step | Default | Unit |
|---|---|---|---|---|---|---|
| `duckDb` | `stemDuck` | Dip Depth | −60 – 0 | 1 | **−24** | dB |
| `duckDurationMs` | `stemDuck` | Dip Duration | 0 – 1500 | 10 | **250** | ms |
| `duckAttackMs` | `stemDuck` | Dip Fade Out | 0 – 300 | 5 | **15** | ms |
| `duckReleaseMs` | `stemDuck` | Dip Fade In | 0 – 1000 | 10 | **120** | ms |
| `boostDb` | `stemBoost` | Boost | 0 – 12 | 0.5 | **3** | dB |
| `missSfxDb` | `missSfx` | SFX Level | −40 – 0 | 1 | **−6** | dB |
| `flameScale` | `hitFlames` | Flame Size | 0.5 – 2 | 0.05 | **1** | × |
| `flameHoldMs` | `hitFlames` | Flame Length | 60 – 600 | 10 | **180** | ms |
| `ghostOpacity` | `ghostMissedNote` | Ghost Opacity | 0 – 100 | 5 | **35** | % |
| `streakCounterAt` | `streakCounter` | Show After | 5 – 60 | 5 | **30** | notes |
| `streakForgiveness` | `streakBreak` | Misses Forgiven | 0 – 3 | 1 | **0** | misses |
| `multiplierSteps` | `multiplierDrop` | Steps Lost | 1 – 4 | 1 | **4** | steps |
| `multiplierEveryN` | `multiplierDrop` | Notes Per Step | 5 – 30 | 1 | **10** | notes |
| `meterStart` | `rockMeter` | Starts At | 0 – 100 | 5 | **50** | % |
| `meterHitGain` | `rockMeter` | Gain Per Hit | 0.25 – 3 | 0.25 | **1** | steps |
| `meterMissCost` | `rockMeter` | Cost Per Miss | 0.5 – 8 | 0.5 | **3** | steps |
| `vignetteAt` | `dangerVignette` | Kicks In Below | 5 – 50 | 5 | **25** | % |
| `vignetteOpacity` | `dangerVignette` | Peak Opacity | 10 – 100 | 5 | **60** | % |
| `vignettePulseMs` | `dangerVignette` | Pulse Period | 200 – 2000 | 50 | **700** | ms |
| `desatAmount` | `highwayDesat` | Max Drain | 0 – 100 | 5 | **70** | % |
| `crowdBooAt` | `crowdReacts` | Boos Below | 5 – 60 | 5 | **35** | % |
| `crowdBooDb` | `crowdReacts` | Boo Level | −40 – 0 | 1 | **−12** | dB |
| `reviveCostPct` | `bandRevive` | Overdrive Cost | 25 – 100 | 25 | **50** | % |

### The stem-duck envelope

The four `stemDuck` sliders describe one envelope, in this order:

```
 0 dB ─────╮                              ╭─────────
           │  duckAttackMs                │  duckReleaseMs
           │  (fade out, 15 ms)           │  (fade in, 120 ms)
duckDb ────╰──────────────────────────────╯
              duckDurationMs (250 ms)
```

**`duckDurationMs` is the time held at *full* depth, not end-to-end.** Total silence at defaults ≈ 15 + 250 + 120 = **385 ms**.

### The Rock Meter asymmetry

`meterMissCost` defaulting to **3×** `meterHitGain` is the core tuning decision inherited from Guitar Hero, not an arbitrary number: a miss drags you toward danger three times faster than a hit recovers you. That is what makes the meter feel like real-time feedback while staying recoverable. Change the ratio deliberately.

---

## 6. Presets

Users can save the full modifier state — every toggle and slider across all tabs — as a named preset, then apply / update / rename / delete it. Stored entirely in the WebView's `localStorage`; **Unity does not need to do anything.**

The only thing that reaches you is the `preset` string on the `modifiers` payload, for telemetry:

| Value | Meaning |
|---|---|
| `""` | No preset active. |
| `"Practice Mode"` | That preset applied, values untouched since. |
| `"Practice Mode (modified)"` | That preset applied, then edited. |

If you later want presets to follow the user across devices, the natural move is a PlayFab-backed `updateModifierPresets` push — not currently implemented.

---

## 7. Browser testing

| URL flag | Effect |
|---|---|
| `?modifiers=team` | Force the tuning tier. Sticky — persists via `localStorage` until changed. |
| `?modifiers=player` | Force the toggles-only tier. |

Example: `http://localhost:3000/?skip&modifiers=team`

The onboarding flow rewrites the URL to `?step=menu` immediately, which is expected — the flag is read before the rewrite and cached, so it survives.

**To reach the popup:** Perform → the **Instrument / Difficulty / Vibe** options row → **Difficulty** tile → pick a tab other than Difficulty. The Difficulty tab holds only the three difficulty cards; the modifiers live on Audio / Highway / Scoring / Failure.

Console helpers:
```js
setModifierTier('team')      // switch tier live
getModifierPayload()         // inspect exactly what Unity will receive
resetModifiers()             // back to shipped defaults
```

---

## 8. Notes & gotchas

- **Difficulty is per-song; modifiers are global.** The difficulty cards apply to the active song (`songDiffs[idx]`); the modifiers apply to the whole session. Same popup, two scopes — the header says so, but worth knowing when reading the payload.
- **`enabled` and `values` are always complete.** Every key is present on every payload, so you can index without existence checks. Values persist while a modifier is off.
- **Adding a modifier later is safe.** Presets and saved state rebase on the shipped defaults, so anything a stored payload does not mention comes back at its default rather than `undefined`.
- **Tier failure mode is closed.** Unknown tier strings resolve to `player`.
- **Nothing here is wired to gameplay yet** — the WebView collects and transmits the values. Applying them is Unity-side work.
