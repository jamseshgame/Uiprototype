# Badges — Unity / PlayFab Hookup

The **Progress ▸ Badges** tab shows the player's achievement medallions in a paginated
4×3 grid. It is reached from the bottom nav **Progress** tab → **Badges** sub-tab
(the other sub-tab is **Challenges** — see `CHALLENGES_HANDOVER.md`).

Each badge is a **pre-rendered PNG medallion** that bakes its own **name + requirement
into the artwork** (`badges/badge_*.png`), so the only state Unity drives is **earned vs
locked** (plus optional in-progress %). The four referral-tier badges are *also* surfaced
on the Referrals screen — see section 5.

The WebView currently renders from an in-browser **mock** (`badgeData`, ~`index.html`
line 18882) so it is testable on desktop. The **inbound** side (real earned/locked state
per player) is **not wired yet**. Section 1 specifies the `updateBadges` message Unity
should send to replace the mock.

---

## 1. Unity → WebView  *(to implement)*

Send a JSON string via the WebView's `postMessage`. Add a router case alongside the other
`update*` handlers (next to `updateChallenges` / `updateReferrals`):

```js
case 'updateBadges': updateBadgesFromBackend(msg.data); break;
```

### `updateBadges` — set earned/locked (+ optional progress) per badge
```jsonc
{
  "type": "updateBadges",
  "data": {
    "badges": [                          // match each entry to badgeData by `name`
      { "name": "Rising Star",   "earned": true  },
      { "name": "Shooting Star", "earned": false,
        "progress": { "pct": 60, "label": "3 of 5 tracks" } },   // optional in-progress bar
      { "name": "Superstar",     "earned": false },
      { "name": "All-Star Band", "earned": false },
      { "name": "Recruiter",     "earned": true  },
      { "name": "Band Together", "earned": false,
        "progress": { "pct": 50, "label": "1 of 2 friends" } },
      { "name": "Full Lineup",   "earned": false },
      { "name": "Top Promoter",  "earned": false }
    ]
  }
}
```

Field notes:
- **Match by `name`** — must equal the badge's `name` in `badgeData` (the art also resolves
  by name). Unknown names are ignored; omitted badges keep their current state. Send the
  full set on each push to be safe.
- **`earned`** (bool) is the only required per-badge field. `true` → mint border + ✓ check;
  `false` → dimmed (0.45 opacity) locked tile.
- **`progress`** (optional) `{ pct: 0..100, label: "<text>" }` renders a thin progress bar +
  caption under a *locked* badge (e.g. "3 of 5 tracks"). Omit for badges that are simply
  locked or already earned. A badge with `earned: true` ignores `progress`.
- The WebView does **not** compute earn conditions — PlayFab is the source of truth. The
  WebView only renders what `earned` / `progress` say.

### Suggested handler (drop in near `buildBadgeGrid`)
```js
// Unity → WebView: set earned/progress per badge by name, then re-render.
function updateBadgesFromBackend(data) {
  if (!data || !data.badges) return;
  for (var i = 0; i < data.badges.length; i++) {
    var u = data.badges[i];
    for (var j = 0; j < badgeData.length; j++) {
      if (badgeData[j].name === u.name) {
        if (u.earned != null) badgeData[j].earned = !!u.earned;
        if (u.progress) badgeData[j].progress = u.progress;
        else delete badgeData[j].progress;
        break;
      }
    }
  }
  buildBadgeGrid();
  buildReferralsSection();   // keep the referral badge band in sync (section 5)
}
```

---

## 2. The badge set (current 8)

| # | Name | Requirement (baked into art) | Art file | Group |
|---|------|------------------------------|----------|-------|
| 1 | **Rising Star**   | Get 4 stars on 1 track        | `badges/badge_risingstar_4starsin1track.png`    | 4-star ladder |
| 2 | **Shooting Star** | Get 4 stars on 5 tracks       | `badges/badge_shootingstar_4starsin5tracks.png` | 4-star ladder |
| 3 | **Superstar**     | Get 4 stars on 10 tracks      | `badges/badge_superstar_4starsin10tracks.png`   | 4-star ladder |
| 4 | **All-Star Band** | Get 4 stars on a group track  | `badges/badge_allstarband_4starsasagroup.png`   | 4-star ladder |
| 5 | **Recruiter**     | Refer 1 friend who plays      | `badges/badge_recruiter_refer1friend.png`       | Referral tier |
| 6 | **Band Together** | Refer 2 friends who play      | `badges/badge_bandtogether_refer2friends.png`   | Referral tier |
| 7 | **Full Lineup**   | Refer 5 friends who play      | `badges/badge_fulllineup_refer5friends.png`     | Referral tier |
| 8 | **Top Promoter**  | Refer 10 friends who play     | `badges/badge_toppromoter_refer10friends.png`   | Referral tier |

- Adding/removing/renaming a badge is a `badgeData` edit (`index.html`). Keep the `name`
  unique and stable — it is the join key for both `updateBadges` and the Referrals band.
- The grid paginates at **12 per page** (4×3, `BADGES_PER_PAGE`); 8 badges = one page.
- The `hint` text in `badgeData` is the requirement caption shown under the medallion in the
  **normal** (labelled) view. It is redundant with the art and is hidden in the Bare/Boxed
  display views (section 4).

---

## 3. WebView → Unity  *(events)*

The Badges screen is **display-only** — there are no outbound badge actions today. The
WebView emits a generic `navigate` event when the player moves between tabs; treat the
arrival on **Progress** as a good moment to (re)push `updateBadges` (and `updateChallenges`).
If you want an explicit hook, add a `badgesOpened {}` emit in `switchProgressTab('badges')`
mirroring `referralsOpened` — currently not present.

---

## 4. Display variants & URL slugs (desktop/QA)

Earned tiles get a mint border + ✓; locked tiles render dimmed (0.45). Three deep-link
slugs open straight onto the Badges tab (they mark onboarding complete so the screen is
reachable on a fresh launch):

| Slug | Effect |
|------|--------|
| `?badges`       | Deep-link to **Progress ▸ Badges**, normal labelled view (real mock earned/locked state). |
| `?badgesBare`   | Badges tab, **no tile box, no text labels, every medallion maxed** (forced earned). Art only. |
| `?badgesBoxed`  | Badges tab, **keep the tile box, no text labels, medallion maxed inside** (forced earned, ✓ hidden). |
| `?unlockAll`    | Marks every badge earned (and unlocks all cosmetics) — for screenshots. Combine: `?badges&unlockAll`. |

`?badgesBare` / `?badgesBoxed` are presentation views for reviewing the medallion artwork at
size; they force all badges earned and hide the name/requirement labels (the art carries
them). They do not affect production rendering.

---

## 5. Relationship to Referrals (important)

The **four referral-tier badges** (Recruiter, Band Together, Full Lineup, Top Promoter) appear
in **two** places, both resolving art by `name` against `badgeData`:

1. **Progress ▸ Badges** grid — earned/locked driven by **`updateBadges`** (this doc).
2. **Profile ▸ Referrals** bottom band — earned/progress driven by **`updateReferrals.tiers`**
   (see `REFERRALS_HANDOVER.md` §1), which *overrides* the badge's copy with referral-count
   progress.

Keep the two in step: a player who has referred 2 friends should read **earned** on both the
Referrals band (via `updateReferrals`) and the Badges grid (via `updateBadges`). The suggested
handler in §1 calls `buildReferralsSection()` after applying, so a single `updateBadges` push
also refreshes the band if the Referrals page is mounted. The tier `name`s **must** stay
identical across `badgeData`, `REFERRAL_BADGES`, and both messages.

> Note: `REFERRALS_HANDOVER.md` still lists the 4th tier as *"Going Viral"* in its examples;
> the live name is now **"Top Promoter"**. Use **Top Promoter** for all referral/badge payloads.

---

## 6. Suggested PlayFab mapping

- **4-star ladder** (`Rising Star` / `Shooting Star` / `Superstar`) → count of distinct tracks
  the player has earned 4★ on (≥1 / ≥5 / ≥10). `progress.label` = "N of M tracks".
- **All-Star Band** → earned once the player gets 4★ on any **group** (coop) track.
- **Referral tiers** → count of **completed** referrals (a referred player finished their first
  jam) against 1 / 2 / 5 / 10 — the same count that drives `updateReferrals.tiers`.

---

## 7. Quick desktop test

The grid renders from mock state today, so it is clickable on desktop without Unity. Open
`?badges` (or navigate to Progress ▸ Badges). Once `updateBadgesFromBackend` is wired, in the
console:
```js
updateBadgesFromBackend({
  badges: [
    { name: 'Rising Star',   earned: true },
    { name: 'Shooting Star', earned: false, progress: { pct: 60, label: '3 of 5 tracks' } },
    { name: 'Recruiter',     earned: true },
    { name: 'Band Together', earned: false, progress: { pct: 50, label: '1 of 2 friends' } }
  ]
});
```
Until that handler exists, edit the `earned` flags in the `badgeData` mock (~line 18882)
directly, or use `?unlockAll` to preview the all-earned state.
