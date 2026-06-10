# Referrals — Unity / PlayFab Hookup

The **Profile ▸ Referrals** page ("Share The Love") lets a player invite friends,
redeem a friend's code, and claim Picks as each referral progresses. It is reached
from **Settings ▸ Profile ▸ Referrals**, and is also the deep-link target of the
`refer_friends` challenge CTA (see `CHALLENGES_HANDOVER.md`).

The WebView already **emits** every player action over the Vuplex bridge (section 2).
The **inbound** side (real code + per-friend state + tier progress) is **not wired yet** —
the page renders from an in-browser **mock** (`referralCode`, `referralStates`,
`REFERRAL_BADGES`) so it is testable on desktop. Section 1 specifies the `updateReferrals`
message Unity should send to replace that mock.

---

## 1. Unity → WebView  *(to implement)*

Send a JSON string via the WebView's `postMessage`. Add a router case
`case 'updateReferrals': updateReferralsFromBackend(msg.data); break;` alongside the
other `update*` handlers (next to `updateFriends` / `updateChallenges`).

### `updateReferrals` — populate / refresh the page
```jsonc
{
  "type": "updateReferrals",
  "data": {
    "code":        "J4M-53SH",          // string — THIS player's own referral code (shown in the chip)
    "enteredCode": null,                 // string — a friend's code this player already redeemed, or null
    "friends": [                         // per-friend referral lifecycle; keyed by friend `name`
      {
        "name":    "Jooleeno",           // string — MUST match a name in the Friends roster (updateFriends)
        "state":   "complete",           // sent | complete | jamming   (omit the entry entirely = "not invited")
        "claimed": false                 // bool — has the player already claimed this referral's Picks
      },
      { "name": "Abbie",  "state": "sent",    "claimed": false },
      { "name": "Arthen", "state": "jamming"  }                       // jamming → no claim field needed
    ],
    "tiers": [                           // referral badge tiers shown in the bottom band
      { "name": "Recruiter",     "hint": "Refer 1 person who plays Jamsesh",  "earned": true  },
      { "name": "Band Together", "hint": "Refer 2 people who play Jamsesh",    "earned": false,
        "progress": { "pct": 50, "label": "1 out of 2 referrals complete" } },
      { "name": "Full Lineup",   "hint": "Refer 5 people who play Jamsesh",    "earned": false },
      { "name": "Going Viral",   "hint": "Refer 10 people who play Jamsesh",   "earned": false }
    ]
  }
}
```

Field notes:
- **`code`** is the player's own code, rendered in the "Your Code" chip and used to reject
  a player who tries to redeem their own code in the entry popup.
- **`enteredCode`** — if non-null, the **"Enter a Friend's Code"** button shows
  *"Code Applied: <code>"* and goes inert (a player can only redeem one code, once).
- **`friends`** overlays the existing **Friends roster** (the same list driven by
  `updateFriends` / `getFriendsData`). Match by **`name`**. Avatar / online status come
  from the roster, not from here. Each entry's **`state`**:
  | `state` | Row shows | Meaning |
  |---------|-----------|---------|
  | *(entry absent)* | **Invite** pill | Not yet invited. Tapping the row fires `referFriend`. |
  | `sent`      | amber **Sent** tag + **Claim Picks** | Invite sent → **500 Picks** to claim. |
  | `complete`  | green **Complete** tag + **Claim Picks** | Referred player finished their first jam → **1,000 Picks** to claim. |
  | `jamming`   | **Already Jamming** tag (no action) | Already a Jamsesh player — not referrable. |
  - **`claimed: true`** swaps the **Claim Picks** pill for an inert **Claimed** pill.
  - The friends list paginates at **8 per page** (2×4); send the full roster's worth of states.
- **`tiers`** are the four referral badges in the bottom band. They reuse the **Badges**
  screen art (matched by `name` against `badgeData`), but `hint` / `earned` / `progress`
  here **override** the badge's own copy — these track *referral counts*, not the badge's
  generic unlock condition. `progress` is optional: `{ pct: 0..100, label: "<text>" }`.
  Keep the four `name`s in sync with `badgeData` so the art resolves (currently
  *Recruiter*, *Band Together*, *Full Lineup*, *Going Viral*).

---

## 2. WebView → Unity  *(already wired)*

Emitted via `sendToUnity(type, data)` (i.e. `window.vuplex.postMessage`):

| Event | Payload | When |
|-------|---------|------|
| `referralsOpened`    | `{}`                                  | Player opened **Profile ▸ Referrals**. Good moment to (re)push `updateReferrals`. |
| `referFriend`        | `{ name }`                            | Player tapped an un-invited friend row. Send the invite; the row flips to **Invited** locally. Track the new `sent` state in PlayFab and re-push. |
| `claimReferralPicks` | `{ name, reward }`                    | Player tapped **Claim Picks**. `reward` = **500** (`sent`) or **1000** (`complete`). Grant the Picks, set `claimed = true`, re-push. |
| `referralCodeEntered`| `{ code }`                            | Player submitted a friend's code in the entry popup. Validate it server-side; on success record the referral (both players earn **1,000 Picks** on the redeemer's first jam). |

The WebView updates its own UI **optimistically** (invite pill → *Invited*, claim pill →
*Claimed*, code button → *Code Applied*). PlayFab is the source of truth — re-push
`updateReferrals` so the next open reflects the authoritative state.

---

## 3. Reward economics (from the in-UI copy)

- **Invite sent** → the inviter earns **500 Picks** (claimable once the invite is sent).
- **Referred player completes their first jam** → **both** players earn **1,000 Picks**.
- **Redeeming a friend's code** (entry popup, or during onboarding) counts the redeemer as
  that friend's referral; **both** earn **1,000 Picks** on the redeemer's first jam.

These numbers live only in display copy today; treat PlayFab as authoritative and keep the
copy (`#profile-section-referrals .referral-sub`, the popup sub, and the `reward` value in
`claimReferralPicks`) in step if the economy changes.

---

## 4. Suggested PlayFab mapping

- **`code`** → a per-player generated referral code (PlayFab user-data or title-player entity).
- **`friends[].state`** → derived per (inviter, invitee) pair: invite sent (`sent`),
  invitee's first jam completed (`complete`), or invitee already an existing player (`jamming`).
- **`friends[].claimed`** → per-referral grant flag; flip on `claimReferralPicks` after the
  Picks are granted.
- **`enteredCode`** → the code this player redeemed (one-shot); set on a validated
  `referralCodeEntered`.
- **`tiers[].earned` / `progress`** → from the count of `complete` referrals against each
  tier threshold (1 / 2 / 5 / 10).

---

## 5. Quick desktop test

The page renders from mock state today, so it is fully clickable on desktop without Unity.
To exercise the inbound contract once `updateReferralsFromBackend` is wired, in the console
(with **Profile ▸ Referrals** open):
```js
updateReferralsFromBackend({
  code: 'ABC-123',
  enteredCode: null,
  friends: [
    { name: 'Jooleeno', state: 'complete', claimed: false },
    { name: 'Abbie',    state: 'sent',     claimed: false },
    { name: 'Arthen',   state: 'jamming' }
  ],
  tiers: [
    { name: 'Recruiter',     hint: 'Refer 1 person who plays Jamsesh', earned: true },
    { name: 'Band Together', hint: 'Refer 2 people who play Jamsesh',  earned: false,
      progress: { pct: 50, label: '1 out of 2 referrals complete' } },
    { name: 'Full Lineup',   hint: 'Refer 5 people who play Jamsesh',  earned: false },
    { name: 'Going Viral',   hint: 'Refer 10 people who play Jamsesh', earned: false }
  ]
});
```
Until that handler exists, edit the `referralCode` / `referralStates` / `REFERRAL_BADGES`
mock vars (~line 16844) directly to preview states.
