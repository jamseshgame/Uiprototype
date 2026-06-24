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

## Cautionary tales (real regressions this has caused)

- **`addCoopPlayer` → dead code.** A reskin rewired the stage "Add Player" to a new path, leaving the
  old `addCoopPlayer` function (which emitted `invitePlayer` + the pending tile) **never called**.
  Invites silently stopped working. Always trace the LIVE click path after a reskin.
- **`enterBandspace` → `joinGroup`.** A reskin renamed the bandspace-entry message; the bridge still
  listened for the old name → entering a band did nothing until the bridge added the new case.
- **`experience{tab:'skin'}` → `'guitarSkin'`/`'drumSkin'`.** The reskin split the skin tab into
  per-instrument tabs; the bridge only handled `'skin'`, so skin selection silently no-op'd.

The pattern is always the same: **a rename on the UI side, no error, a dead feature.** This file
exists so the next rename gets caught in review instead of in a playtest.
