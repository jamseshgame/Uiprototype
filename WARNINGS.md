# ⚠️ WARNINGS — Do Not Regress (Unity bridge contract)

This UI talks to the Unity game over a **message bridge** (`sendToUnity('type', data)` out,
`handleUnityMessage({type,data})` in). The Unity side (`WebViewBridge.cs`) routes inbound
messages with a big `switch (type)`. **Anything it doesn't recognise hits a silent `default:`
and does nothing** — no error, no crash, the feature just dies quietly.

So a harmless-looking UI edit (renaming a `sendToUnity` type, changing a payload field, moving a
button to a function that's never called) can **silently break a shipped feature**. This file lists
the things that MUST NOT regress. **Treat the message names + payload shapes below as a hard API.**

---

## The #1 rule

**Before you rename / remove / re-shape any `sendToUnity('X', …)` call, or any
`handleUnityMessage` `case 'Y':`, check `WebViewBridge.cs` in the game repo first.**

If you must rename a message, it has to be renamed in **both** places in the same change set.

## Audit after every reskin / merge

After any significant UI change, diff the live message vocab against the bridge:

```bash
# Outbound names this UI emits:
grep -oE "sendToUnity\('[a-zA-Z]+'" index.html results.html | sort -u
# Names the game actually handles (run in the game repo):
grep -oE 'case "[a-zA-Z]+"' Assets/Scripts/Jamsesh/OpenLobby/WebViewBridge.cs | sort -u
```

Any `sendToUnity` name NOT in the bridge's case list = a **dead feature**. Investigate before shipping.

**Also verify the emitter is actually wired.** A reskin can leave a `sendToUnity` call inside a
function that nothing calls anymore (dead code). Trace the live click path, don't assume the
function you see is reached. (This is exactly how `addCoopPlayer` died — see cautionary tales.)

---

## Inbound contract — `sendToUnity('TYPE', …)` the game consumes

Renaming or removing any of these **breaks the matching feature**. Grouped by area:

**Core game loop:** `selectSong` · `previewSong` · `selectInstrument` (alias `instrument`) ·
`selectDifficulty` (alias `difficulty`) · `experience` · `experienceClosed` · `startGame` ·
`playMode` · `exitResults` · `gameRetry`

**Setlist / networked lobby:** `setlistUpdated` · `songInstrument` · `songDifficulty` ·
`playerReady` · `kickPlayer`

**Bands / social:** `enterBandspace` · `joinGroup` · `joinHub` · `viewGroup` · `createGroup` ·
`inviteToGroup` · `acceptGroupInvite` · `declineGroupInvite` · `renameGroup` · `invitePlayer` ·
`referFriend`

**Store / economy:** `purchaseItem` · `equipItem` · `storeBuyPack`

**Challenges / referrals:** `challengeCTA` · `challengeRewardClaimed` · `jamCreatorOpened` ·
`referralsOpened` · `referralCodeEntered` · `claimReferralPicks`

**Creator (photos / AI art):** `creatorPageOpened` · `creatorOpenCamera` · `creatorCancelCamera` ·
`creatorGenerateArt` · `creatorDeletePhoto` · `creatorDeleteArt`

**Avatar editor:** `avatarAuthScreenOpened` · `avatarLoginRequested` · `avatarOpenSignUp` ·
`avatarEmailSignin` · `avatarOtpSubmit` · `avatarOtpResend` · `avatarEditorOpened` ·
`avatarEditorClosed` · `avatarRequestCatalog` · `avatarEquip` · `avatarUnequip` · `avatarSetColor` ·
`avatarSetBodyType` · `avatarSetMorph` · `avatarRotate` · `avatarSave` · `avatarCancel`

**Keyboard:** `requestKeyboard` · `closeKeyboard`

> Messages NOT in this list (e.g. `inviteToSpace`, `createSpace`, `deleteSpace`, `getLobby`,
> `loadout`, `songSpace`, `selectVaultItem`, theme/banner/frame changes, `layoutChanged`,
> `storeBuySong`, `updateName`, `leaderboardType`, `creatorPhoto`, `linkSocialHandle`,
> `onboardStepComplete`, `pauseOpened`/`pauseToggle`, `resumeGame`/`restartGame`/`exitToHome`)
> are **emitted by the UI but have no Unity handler yet** — they currently do nothing. Don't assume
> they work; they're tracked separately for wiring.

## Wiring status — handled vs pending (snapshot 2026-06-24)

The Unity client only acts on a message if it has a handler; everything else hits the silent
`default:`. This is the audited status of every message the UI emits. **The "NOT YET WIRED" list is
the important one: the C# side intends to wire each of those *later, against exactly this name +
payload*. If you rename one, change its payload, or stop emitting it, FLAG IT** — otherwise the
eventual handler silently won't match. Re-run the audit (above) after every UI bump and diff against
this snapshot; if a pending message changed, the wiring plan changed.

### ✅ WIRED — a handler exists; renaming/reshaping BREAKS a live feature
Everything in the **Inbound contract** list below is handled. Most recently wired:
`inviteToGroup`, `acceptGroupInvite`, `declineGroupInvite`, `renameGroup`, plus the `experience`
skin tabs `guitarSkin`/`drumSkin` (these were silently dropped by a reskin — see cautionary tales).

### ⏳ NOT YET WIRED — emitted, no handler yet. Keep the name + payload stable or flag the change
Each is parked pending the backend/feature in *italics*. The payload shown is what the future handler
will be written against:

- `sendFriendRequest {name}` · `removeFriend {name}` — *no in-app friend graph exists (friends are Meta-only).*
- `inviteToSpace {name}` · `createSpace {name,type,env,forGroup}` · `deleteSpace {name,forGroup}` — *no "spaces" backend exists.*
- `songSpace songIdx:catId:optId` · `loadout idx:catId:optId` — per-song env / loadout. *No per-song apply system (per-song settings currently collapse to session-level).*
- `themeChanged` · `themePurchased` · `bannerChanged` · `bannerPurchased` · `frameChanged` · `framePurchased` `<id>` — *cosmetic persistence + economy; uses a MOCK "Coins" currency (NOT the real Picks/JC), hardcoded unlocks, no persistence.*
- `storeBuySong {title,artist}` — *song-DLC; needs IAP SKUs + entitlement + content gating. Payload has no SKU/id.*
- `layoutChanged <index>` · `challengeLayoutChanged <index>` — *home / challenges grid tiling; hidden dev pickers; needs PlayFab user-data persistence.*
- `updateName <newName>` — *custom display name; `UpdateDisplayName` exists but login re-syncs the Meta name, so it needs persist + override-gate first.*
- `linkSocialHandle {platform,handle}` · `linkTiktokHandle {handle}` — *creator socials; no persistence backend.*
- `onboardStepComplete {step,flags}` — *onboarding server-mirror; already in localStorage, server side needs user-data.*
- `pauseToggle {id,value}` — *in-game settings toggles; needs per-toggle meaning.*
- `resumeGame {}` · `restartGame {}` · `exitToHome {}` — pause-menu transport. **These map 1:1 onto existing `JamseshEvents.Gameplay.OnGameplayResumed/Restarted/Exited`** (live systems already act on them) — a 3-case wire the moment the pause-menu UI is finalized. **Keep these exact names.**

### 🗑️ STALE / REDUNDANT — do NOT wire; safe to delete from the UI
- `getLobby` — only a comment, never actually emitted; Unity already pushes `updateLobby` proactively.
- `selectVaultItem {name,cat}` — fires alongside `openItemPurchase('equip')` → `equipItem`, which already handles the equip; carries no usable id.
- `leaderboardType <label>` — results scope (Group/Me) switches locally; both datasets already pushed via `gameResultsLeaderboard`.
- `creatorPhoto {}` — demo stand-in (empty payload); the real capture flow is `creatorOpenCamera` → `creatorPhotos`.
- `pauseOpened {instrument}` — Unity has already paused before this fires (it's emitted from `showPause`, which Unity triggered via `openPause`); it's a confirmation only.

## Outbound contract — `handleUnityMessage` `case 'TYPE':` the UI must keep

The game pushes these to the UI; if the UI drops the matching `case`, the game's update is ignored:

`updateProfile` · `updateProgression` · `updateXp` · `updatePicks` · `updateOwnedItems` ·
`updateFriends` · `updateGroups` · `updateLobby` · `updateIsHost` · `setInBandspace` ·
`sessionInProgress` · `setCurrentSpace` · `groupInvite` · `updateSongs` · `hostSetlistUpdated` ·
`updateClientInfo` · `updateChallenges` · `updateReferralCode` · `updateReferralCount` ·
`updateReferralList` · `gameResults` · `gameResultsGroupScore` · `gameResultsLeaderboard` ·
`gameResultsProgression` · `creatorPhotos` · `creatorPhotoAdded` · `creatorArt` ·
`creatorArtGenerated` · `creatorArtError` · `avatarLoginStatus` · `avatarAuthStatus` ·
`avatarCatalog` · `navigate`

---

## High-risk PAYLOAD contracts (not just the name)

Changing these payload shapes breaks the feature even if the message name is unchanged:

- **`invitePlayer` / `inviteToGroup`** must send `platformId` (Meta id), not just `name`. The game
  resolves people by `platformId`; name-only invites can't be sent. `inviteToGroup` also sends
  `groupName` (the active band) and is only emitted in **manage** mode.
- **`createGroup`** sends `members:[{name,platformId}]` AND `invited:[{name,platformId}]`. The
  `invited` entries need `platformId` or those create-time invites are silently dropped.
- **`renameGroup`** must send `{ id, name }` — the band's real PlayFab `id` (from `updateGroups`),
  not just the new name. Without the id the rename can't be targeted.
- **`acceptGroupInvite` / `declineGroupInvite`** send the band **name** string shown in the popup.
- **`experience`** skin tabs are `'guitarSkin'` / `'drumSkin'` (and `'environment'`). The game
  matches these exact tab strings — a renamed tab = the selection does nothing.
- **Skin / item ids must match the store catalog id.** The lobby loadout (Vibe picker) skin id, the
  store item id, and the PlayFab `store_catalog` key must be the **same string**
  (e.g. `iridescent-guitar`). A mismatch means a purchased item never shows as owned / can't equip.
- **Ownership-gated tiles**: the Vibe picker only shows skins that are `Original` or in
  `owned_items_v1` (pushed via `updateOwnedItems`). Don't hardcode unowned skins as always-visible.
- **Purchases are server-authoritative**: do NOT optimistically deduct Picks or mark owned in JS.
  The balance/ownership update only from `updatePicks` / `updateOwnedItems`.

---

## Coop / bandspace lobby rendering invariants

The group lobby renders a **networked** roster pushed from Unity (`updateLobby`). These invariants
are easy to break with a "polish" pass and the breakage only shows up in a live multiplayer session:

- **The local player MUST be rendered.** Do NOT `continue`/filter on `isSelf` in the member-row
  loop. Each player's roster includes themselves with `isSelf:true`; the tile renderer gives self
  the `YOU` badge. In a live bandspace there is no band header to stand in for self, so skipping
  `isSelf` means **you never see yourself** (this shipped once — see cautionary tales).
- **Host comes from Unity, not local guesswork.** `hostName`/`isHost` are set only from the
  `updateIsHost` push. The HOST badge is `p.name === hostName`. Don't infer the host from roster
  order or set `hostName = me.name` in a live session (that's mock-only `?host`/`?client` code).
- **`getCoopRoster()` is the source of truth** — in a bandspace it returns `lobbyPlayers` (the Unity
  roster). Don't render the coop lobby from a different array.
- **Pending invite tiles must survive `updateLobby` rebuilds.** `updateLobbyFromBackend` preserves
  `pending` entries and drops them once the invitee appears in the networked roster (matched by
  `platformId`, then name). Don't clobber the whole roster on each push.
- **Ready/Start gating must ignore pending + disconnected.** `coopReadyCounts` and `_allNonHostReady`
  skip `pending` and `disconnected` players, or an invited-but-not-joined friend ransoms the host's
  Start button (it can never reach N/N).
- **Remove/kick is host-only.** A non-host must not be able to remove anyone; nobody removes self or
  the host. (Enforced at the web tile, AND server-side — don't rely on the UI alone.)

## Cautionary tales (real regressions this has caused)

- **`addCoopPlayer` → dead code.** A reskin rewired the stage "Add Player" to a new path, leaving the
  old `addCoopPlayer` function (which emitted `invitePlayer` + the pending tile) **never called**.
  Invites silently stopped working. Always trace the LIVE click path after a reskin.
- **`enterBandspace` → `joinGroup`.** A reskin renamed the bandspace-entry message; the bridge still
  listened for the old name → entering a band did nothing until the bridge added the new case.
- **`experience{tab:'skin'}` → `'guitarSkin'`/`'drumSkin'`.** The reskin split the skin tab into
  per-instrument tabs; the bridge only handled `'skin'`, so skin selection silently no-op'd.
- **Coop lobby skipped self.** A "coop lobby polish" reskin added `if (roster[i].isSelf) continue;`
  in `buildCoopMembersRow`, so in a live bandspace **every player saw everyone except themselves**.
  No error — it only showed up in a 3-player on-device playtest. (See the rendering invariants above.)

The pattern is always the same: **a rename on the UI side, no error, a dead feature.** This file
exists so the next rename gets caught in review instead of in a playtest.
