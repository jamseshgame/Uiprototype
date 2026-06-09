# Challenges — Unity / PlayFab Hookup

The **Progress › Challenges** tab is fully data-driven from Unity over the Vuplex
bridge, in the same style as `updateGroups` / `updateFriends` / `updateHubs`. The
WebView only renders what Unity pushes and forwards the player's intent back.

Until Unity pushes data, an in-browser **mock** (`questData`, a single "Rate Us"
challenge) renders so the page is testable on desktop.

---

## 1. Unity → WebView

Send a JSON string via the WebView's `postMessage`:

### `updateChallenges` — populate / refresh the grid
```jsonc
{
  "type": "updateChallenges",
  "data": [
    {
      "id":        "rate_us",                       // string — stable key (PlayFab item/quest id)
      "name":      "Rate Us",                       // string — display title on the tile + popup
      "type":      "rate_us",                       // rate_us | play_setlist | refer_friends | share_videos
      "setlistId": "hot_hits",                      // play_setlist ONLY — setlist the CTA deep-links into
      "count":     3,                               // refer_friends / share_videos — required quantity (variable)
      "progress":  1,                               // refer_friends / share_videos — how many done so far (0..count)
      "rewards": [                                  // array — 1 to 4 rewards (cosmetic and/or picks)
        { "name": "Iridescent Classic Guitar #1",   //   cosmetic: { name, image }
          "image": "vault/iridescent-guitar.png" },
        { "picks": 1000 }                            //   picks: { picks: <quantity> } (uses the JAMSESH pick image)
      ],
      "startDate": "2026-06-01T00:00:00Z",          // ISO-8601 string, or null
      "endDate":   null,                            // ISO-8601 string, or null = NO EXPIRY
      "completed": false,                           // bool — has THIS player completed it
      "image":     ""                               // optional — custom tile art; omit to use the gold-star motif
    }
  ]
}
```

Field notes:
- **`rewards`** holds **up to 3 cosmetics plus at most ONE picks entry** (4 total max).
  There is never more than one picks lot. List cosmetics first, picks last. Each entry:
  - a **cosmetic** — `{ "name": "...", "image": "<url>" }`, or
  - **picks** — `{ "picks": <number> }` (renders the JAMSESH pick image + the quantity).
  - Valid shapes: `cosmetic` · `cosmetic + picks` · `2 cosmetic + picks` · `3 cosmetic + picks`.
- The reward popup lays the rewards out by count: **1** = one big square, **2** =
  side-by-side, **3** = a row of three, **4** = a 2×2 grid. Each reward shows greyed
  until claimed, then turns full-colour.
- **`endDate: null`** renders as **"No expiry"**. A past `endDate` renders **"Ended"**;
  a future `startDate` renders **"Starts <date>"**; otherwise **"Ends <date>"**.
- **`count` / `progress`** drive partial-completion display for `refer_friends` /
  `share_videos`. When `count > 1` and not yet `completed`, the tile shows a **`progress/count`
  chip** (e.g. `4/5`) on the bottom row, and the popup shows a **bar + "N of M videos/friends"**
  in the bottom-right. `count` omitted or `<= 1` = binary challenge (no progress shown). Push an
  updated `progress` via `updateChallenges` as the player advances.
- **`completed: true`** renders the tile in the mint "earned" style with a ✓, and the
  popup opens straight to **Claim Reward** (skipping the CTA/verify step).
- **`image`** is optional. If omitted the tile shows five gold stars; the reward popup
  always uses each reward's own image (pick image for picks).
- The grid paginates automatically at **12 per page** (4×3). Send as many as you like.

### Challenge `type` — what the CTA says and does
All four types share the SAME hookup: tapping the CTA fires one `challengeCTA` message
(below); Unity routes by `type` and PlayFab tracks completion. The destination sections
for `refer_friends` / `share_videos` should be **created if they don't exist yet**.

| `type` | CTA label | CTA action (Unity) | extra field |
|--------|-----------|--------------------|-------------|
| `rate_us`       | **Rate Us**     | open the app-store listing, then verify the rating → Claim | — |
| `play_setlist`  | **Perform Now** | deep-link to the Perform tab and open the setlist | `setlistId` |
| `refer_friends` | **Refer Now**   | deep-link to Profile ▸ **Referrals** (create if absent) | `count` (friends) |
| `share_videos`  | **Create Now**  | deep-link to Profile ▸ **JamCreator** (create if absent) | `count` (videos) |

`rate_us` runs the in-popup "Verifying…" spinner then **Claim Reward**. The other three
deep-link away; completion is detected by PlayFab and pushed back via `updateChallenges`
(`completed:true`), after which the player returns and taps **Claim Reward**.

### `setChallengeVerifySeconds` — length of the "Verifying…" spinner
```jsonc
{ "type": "setChallengeVerifySeconds", "data": 15 }   // seconds (default 15)
```
This is the spinner shown after the player taps **Rate Us**, before **Claim Reward**
becomes available. Set it to however long server-side verification actually takes.

---

## 2. WebView → Unity

Emitted via `sendToUnity(type, data)` (i.e. `window.vuplex.postMessage`):

| Event | Payload | When |
|-------|---------|------|
| `challengeCTA`           | `{ id, type, setlistId, count }` | Player tapped the CTA. Route by `type`: open the store listing (`rate_us`) or deep-link (`play_setlist`/`refer_friends`/`share_videos`), and start tracking completion in PlayFab. |
| `challengeRewardClaimed` | `{ id, rewards }`                | Player tapped **Claim Reward**. Grant the reward(s) in PlayFab and mark the challenge claimed (e.g. drop it from the next `updateChallenges`). |

`id`/`type` come from the challenge; `setlistId`/`count` are null when not applicable;
`rewards` are the reward display name(s).

---

## 3. Player flow (popup)

1. Tap a challenge tile → popup opens with the (greyed) reward image + **Rate Us**.
2. Tap **Rate Us** → full-screen "Verifying…" spinner for `challengeVerifySeconds`
   (fires `challengeRateUs`).
3. Spinner ends → button becomes **Claim Reward**.
4. Tap **Claim Reward** → reward image turns full-colour, "<reward> added to your
   collection" shows, button becomes **OK** (fires `challengeRewardClaimed`).
5. Tap **OK** → closes.

If `completed` is already `true`, the popup skips straight to step 4's end state.

---

## 4. Suggested PlayFab mapping

- **Challenge list** → a Title Data key (e.g. `Challenges`) or CatalogV2 items, mapped
  to the schema above. `id` = the PlayFab item/quest id.
- **`completed`** → per-player state: a PlayFab user-data flag, statistic, or inventory
  check (does the player already own the reward item?).
- **`startDate` / `endDate`** → store as UTC ISO-8601; the WebView formats them locally.
- **On `challengeRateUs`** → run verification (e.g. confirm the store rating via your
  backend), then, when satisfied, you may also gate the Claim button server-side.
- **On `challengeRewardClaimed`** → grant the reward item(s) and set `completed = true`,
  then re-push `updateChallenges` so the tile reflects the earned state.

---

## 5. Quick desktop test

In the browser console (with the page open on Progress › Challenges):
```js
updateChallengesFromBackend([
  { id: 'rate_us', name: 'Rate Us',
    rewards: [{ name: 'Iridescent Classic Guitar #1', image: 'vault/iridescent-guitar.png' }],
    startDate: '2026-06-01T00:00:00Z', endDate: null, completed: false }
]);
setChallengeVerifySeconds(3);   // shorten the spinner for testing
```
