# Guitar Tutorial Prompt — Unity Handover

When a player hits **Start** on a setlist that uses Guitar and they have not completed the guitar tutorial, the UI offers it first. It is a **recommendation, never a gate** — declining starts the song immediately.

Unity owns exactly one thing here: **whether the tutorial has been completed.** Everything else is UI-side.

---

## TL;DR for Unity

1. Push completion state at launch (and whenever it changes):
   ```json
   { "type": "tutorialStatus", "data": { "guitar": true } }
   ```

2. Handle the launch. The tutorial comes through as an ordinary `startGame` carrying a `tutorial` marker:
   ```json
   { "type": "startGame",
     "data": { "instrument": "guitar", "difficulty": "easy",
               "setlist": ["Guitar Basics"], "tutorial": "guitar",
               "modifiers": { … } } }
   ```
   `tutorial` is `false` on every normal start.

3. When the player finishes the tutorial, push `tutorialStatus` again with `true` so the prompt stops appearing.

That's it. There is **no separate `startTutorial` message** — one launch path, deliberately.

---

## 1. Incoming — `tutorialStatus`

Tells the WebView which instrument tutorials are done. Nothing is inferred locally; if you never send this, the prompt behaves as though nothing is complete.

**Two accepted payload shapes:**

Map form — set several at once:
```json
{ "type": "tutorialStatus", "data": { "guitar": true, "drums": false } }
```

Pair form — set one:
```json
{ "type": "tutorialStatus", "data": { "instrument": "guitar", "completed": true } }
```

| Field | Notes |
|---|---|
| instrument keys | Lowercase: `guitar`, `drums`, `vocals`. Unknown keys are stored harmlessly but only `guitar` currently prompts. |
| values | Coerced with `!!`, so `1` / `0` / `null` are safe. |

**Send it at launch**, before the user can reach the Main Stage. Sending it later is fine — if the instrument picker is open it repaints in place — but a late push means an already-trained player may see the prompt once.

**Not persisted in the WebView.** This is deliberate: completion is account state and belongs in PlayFab, not `localStorage`. Push it every session.

---

## 2. When the prompt fires

At **Start**, after the existing guards (host-only in group mode, empty-setlist check) and before the song launches. All of these must be true:

1. The setlist uses an instrument with a tutorial — currently **guitar only**.
2. That tutorial is not already complete per `tutorialStatus`.
3. It has not been declined **this session**.
4. The setlist is not itself a tutorial setlist.

Point 1 walks the **per-song** instruments, so a mixed setlist containing a single guitar track still surfaces the recommendation.

Point 4 matters: without it, accepting the prompt would load the Guitar Basics setlist, and hitting Start on *that* would offer the tutorial as an alternative to itself. Any setlist whose tracks are all `artist: "Jamsesh Tutorial"` skips the check.

### Why Start and not instrument selection

The prompt originally fired when Guitar was picked in the instrument picker. It was moved because at Start the player has actually committed to playing — the recommendation is timely rather than an interruption partway through setting up.

---

## 3. The prompt

> ### Try the Guitar tutorial first?
> Guitar Basics is a short lesson covering the essentials. It is worth two minutes before your first real song — but you can jump straight in.
>
> **[ Play Anyway ]**  **[ Start Tutorial ]**

Both buttons are terminal — the player never has to press Start twice.

| Action | What happens |
|---|---|
| **Start Tutorial** | Setlist is swapped to the one-song `Guitar Basics` lesson at Easy, then launched immediately. Sends `tutorialPromptAccepted`, then `startGame` with `tutorial: "guitar"`. |
| **Play Anyway** | The original song starts. Sends `tutorialPromptDeclined`, then `startGame` with `tutorial: false`. Suppressed for the rest of the session. |
| **Tap outside the dialog** | Identical to **Play Anyway**, including starting the song. |

---

## 4. Outgoing messages

### `startGame` — the only launch message

```json
{ "type": "startGame",
  "data": {
    "instrument": "guitar",
    "difficulty": "easy",
    "setlist": ["Guitar Basics"],
    "tutorial": "guitar",
    "modifiers": { … }
  } }
```

| `tutorial` value | Meaning |
|---|---|
| `"guitar"` (instrument name) | This launch came from the tutorial prompt. Load the lesson chart. |
| `false` | Normal song start. |

**There is deliberately no separate `startTutorial` message.** Sending both would give you two launch commands for one user action and an easy double-launch. One code path, one field to branch on.

### `tutorialPromptAccepted` / `tutorialPromptDeclined`

```json
{ "type": "tutorialPromptAccepted", "data": { "instrument": "guitar" } }
{ "type": "tutorialPromptDeclined", "data": { "instrument": "guitar" } }
```

Intent events for analytics — **not** commands. `tutorialPromptAccepted` always arrives immediately before the `startGame` that carries the `tutorial` marker; act on the `startGame`, not on this.

Worth tracking: the accept/decline ratio is the clearest signal of whether the prompt copy and timing are working.

---

## 5. Completion round-trip

The loop only closes if you push completion back:

```
Player hits Start with a guitar setlist
  → WebView: prompt (tutorial not complete)
  → Player picks Start Tutorial
  → WebView: startGame { tutorial: "guitar", setlist: ["Guitar Basics"] }
  → Unity: runs the lesson
  → Unity: writes completion to PlayFab
  → Unity: { "type": "tutorialStatus", "data": { "guitar": true } }
  → WebView: never prompts again; picker chip turns green
```

**If you skip that last push, the prompt reappears next session** even though the player has done the tutorial. This is the single most likely integration bug.

---

## 6. Declining is session-scoped

Declining suppresses the prompt only until the WebView reloads. It is **not** persisted, and that is intentional:

- Prompting before *every* song would be nagging.
- Persisting a dismissal would silently retire the recommendation forever for someone who still has not done the tutorial.

The permanent off-switch is your `tutorialStatus` flag, not a local dismissal. If you would rather a decline stick across sessions, that is a product decision — say so and it becomes a one-line change.

---

## 7. The picker chip

The instrument picker also renders the flag directly, so the state is visible rather than only implied by whether a popup appears:

| State | Chip on the Guitar tile |
|---|---|
| Not complete | Cyan **TUTORIAL AVAILABLE** |
| Complete | Green **TUTORIAL DONE** |

Drums and Vocals show no chip — they have no tutorial yet. Pushing `tutorialStatus` while the picker is open repaints it live.

---

## 8. Adding more instruments later

One line in `index.html`:

```js
var TUTORIAL_PROMPT_INSTRUMENTS = ['guitar'];   // add 'drums', 'vocals'
```

Everything else already generalises — the completion map, the prompt copy (it interpolates the instrument name), the chip, and the lesson lookup, which matches on `lessonBasicSongs[].instrument`. The only requirement is a matching Basic lesson entry for that instrument.

---

## 9. Browser testing

```
http://localhost:3000/?skip
```

Perform → add a song → set Instrument to **Guitar** → **Start**.

Console helpers:
```js
applyTutorialStatus({guitar: true})    // simulate "completed" — prompt stops, chip goes green
applyTutorialStatus({guitar: false})   // back to not-complete
tutorialPromptSuppressed = {}          // clear a session decline without reloading
pendingTutorialInstrument()            // '' means no prompt will fire, and why
```

If the prompt does not appear, it is almost always a session decline — reload, or clear `tutorialPromptSuppressed`.

---

## 10. Notes & gotchas

- **`startTutorialPlay()` is a different thing.** That is the onboarding lockdown — it greys the navbar, topbar and mode tabs and loads the *mixed* Basic Lessons setlist. This prompt deliberately does not use it: the path is opt-in, so the player keeps a normal, usable UI.
- **The prompt never blocks a start.** Every exit — including tapping outside — results in a song starting. There is no path where a player presses Start and nothing happens.
- **Group mode:** only the host reaches this code. Clients return earlier in `startGame()`, so a client is never prompted.
- **Empty setlists** hit the existing "No Songs Yet" guard first; the tutorial prompt cannot pre-empt it.
