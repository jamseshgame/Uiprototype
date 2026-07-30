# Handover — Hyperpop Reskin push (2026-06-17)

**Audience:** Unity / `WebViewBridge` developer.
**Scope:** Vuplex bridge-contract changes introduced by the hyperpop reskin, on top of
what was already on `main` (`14f9ca5` — difficulty-vocab fix + Pastel Loft removal).
Everything below is *new or changed* in this push. Earlier contracts in
[`HANDOVER.md`](HANDOVER.md) (Group Lobby) and
[`MULTICHART_HANDOVER.md`](MULTICHART_HANDOVER.md) (instrument picker) still apply unchanged
except where noted.

All messages still go through the existing `sendToUnity(type, data)` /
`window.vuplex.postMessage({type, data})` envelope and `handleUnityMessage(msg)` switch.

---

## TL;DR

| Direction | Message | Status | Payload |
|-----------|---------|--------|---------|
| WebView → Unity | `joinGroup` | **new** | `"<groupName>"` (string) |
| WebView → Unity | `leaveGroup` | **new** | `"<groupName>"` (string) |
| WebView → Unity | `joinHub` | **new** | `"<hubName>"` (string) |
| WebView → Unity | `acceptGroupInvite` | **new** | `"<groupName>"` (string) |
| WebView → Unity | `declineGroupInvite` | **new** | `"<groupName>"` (string) |
| WebView → Unity | `linkSocialHandle` | **new** | `{ platform, handle }` |
| WebView → Unity | `createGroup` | **changed** | members now `[{name, platformId}]` |
| WebView → Unity | `experience` | **changed** | skin split into `guitarSkin` / `drumSkin` / `highway` / `environment` |
| WebView → Unity | `startGame` | **changed** | `instrument` may now be `"spectator"` (late-join) |
| WebView → Unity | `requestKeyboard` | **changed** | now only fires when `window.vuplex` is present |
| WebView → Unity | `enterBandspace` | **removed** | replaced by `joinGroup` / `joinHub` |
| WebView → Unity | `viewGroup` | **removed** | replaced by `joinGroup` |
| Unity → WebView | `setActiveGroup` | **new** | `"<groupName>"` (string) |
| Unity → WebView | `groupInvite` | **new** | `{ groupName, inviter?, logo?, members? }` |
| Unity → WebView | `updateCreatorSocials` | **new** | `{ tiktok, instagram, youtube }` |
| URL | `?goto=<page>[.<tab>]` | **new** | unified deeplink |
| URL | `?invite` | **new** | boots straight into a group-invite popup |

---

## WebView → Unity (outgoing)

### New

- **`joinGroup`** — `"<groupName>"`
  Fired from the Bandmates ▸ Groups switch-group confirmation
  (`confirmGroupJoin`). The user is leaving their current active group and
  joining `groupName`. Unity should disconnect the old group session and connect
  the new one. The WebView optimistically moves its local "active group" pill to
  the joined group.

- **`leaveGroup`** — `"<groupName>"`
  Fired from the manage-group flow when the user leaves their active group.

- **`joinHub`** — `"<hubName>"`
  Fired from the Spaces ▸ Public switch-space confirmation
  (`confirmSpaceSwitch`). Moves the user from the current public hub to `hubName`.
  (This replaces the old direct `joinHub` call that fired without a confirmation
  step — same message name, now gated behind the switch popup.)

- **`acceptGroupInvite`** / **`declineGroupInvite`** — `"<groupName>"`
  Fired from the incoming group-invite popup (see `groupInvite` below). Sends the
  group name the user accepted/declined.

- **`linkSocialHandle`** — `{ platform: "tiktok"|"instagram"|"youtube", handle: "<bare handle, no @>" }`
  Fired from the Creator ▸ social-link section when the user confirms a handle.
  `handle` is stripped of leading `@`/whitespace. An empty `handle` means the user
  cleared the link. The WebView also persists this to `localStorage`
  (`jamsesh_socials`); Unity should treat its PlayFab copy as source of truth and
  echo counts back via `updateCreatorSocials`.

### Changed

- **`createGroup`** — `{ name, logo, members: [{ name, platformId }] }`
  `members` is now an array of objects (`{name, platformId}`) instead of bare
  names, so Unity can resolve invitees by platform id. `logo` is the selected
  band-logo id/path.

- **`experience`** — the single instrument-skin message was split. The picker now
  emits one of four `tab` values, each with `{ tab, id, instrument }` (instrument
  defaults to `"guitar"` when none chosen):
  - `{ tab: "environment", id }` — stage/environment (was `"environment"`, unchanged)
  - `{ tab: "guitarSkin",  id, instrument }` — **new** (split out of old `"skin"`)
  - `{ tab: "drumSkin",    id, instrument }` — **new**
  - `{ tab: "highway",     id }` — highway track skin
  The old combined `{ tab: "skin", id, instrument }` message is **gone** — map
  guitar/drum skins separately now. Live preview fires on each tile tap; on
  picker close `experienceClosed {}` still fires, and a Cancel re-emits the four
  messages with the pre-open snapshot to revert.
  Defaults: `selectedEnvironment='Colosseum'`, `selectedGuitarSkin='Original'`,
  `selectedDrumSkin='Original'`, `selectedHighway='Neon'`.

- **`startGame`** — `{ instrument, difficulty, setlist: [titles] }`
  Unchanged shape, but `instrument` can now be the string **`"spectator"`** when a
  late-joiner taps the **Spectate** button in an in-progress group session. Unity
  should drop the player into spectator mode (no instrument claim) for that value.

- **`requestKeyboard`** — `{ inputId, value }`
  Now guarded behind a `window.vuplex` presence check, so it no longer fires on
  desktop/dev. No payload change.

### Removed

- **`enterBandspace`** `{ id, name }` — gone. Group/hub entry is now `joinGroup` /
  `joinHub`. `inBandspace` is still driven *into* the WebView by Unity's
  `setInBandspace` message (unchanged).
- **`viewGroup`** `"<name>"` — gone. Replaced by `joinGroup`.

---

## Unity → WebView (incoming)

Three new `case` entries in `handleUnityMessage`:

- **`setActiveGroup`** — `"<groupName>"`
  Sets the WebView's active-group name (drives the "Active Group" pill in
  Bandmates/Spaces). Send on launch and whenever the active group changes
  server-side.

- **`groupInvite`** — `{ groupName, inviter?, logo?, members? }`
  Opens the incoming group-invite popup.
  - `groupName` (required) — the inviting group's name.
  - `inviter` (optional) — display name shown as "X invited you to join …".
  - `logo` (optional) — band-logo url/path; falls back to the default Jamsesh logo.
  - `members` (optional) — array of member objects (avatar/name), first 10 shown.
  Accept/decline emit `acceptGroupInvite` / `declineGroupInvite`.

- **`updateCreatorSocials`** — confirmed video counts (and optionally handles) per platform:
  ```json
  { "tiktok":   { "videos": 12, "handle": "myhandle" },
    "instagram":{ "videos": 3 },
    "youtube":  { "videos": 0 } }
  ```
  A flat shape is also tolerated: `{ "tiktok": 12, "instagram": 3, "youtube": 0 }`.
  Drives the per-platform video counters in the Creator social section.

No incoming messages were removed; all existing handlers (`setInBandspace`,
`updateIsHost`, `lobbyRoster`/`updateLobby`, `sessionInProgress`,
`updateInstrumentAvailability`, `hostSongSelected`/`hostSetlistUpdated`,
`onboardProgress`, etc.) are unchanged.

---

## URL flags / deeplinks (relevant if Unity launches the WebView with a query string)

- **`?goto=<page>[.<tab>]`** — unified deeplink to any page/tab, applied once the
  main UI is live. Page keys (note the user-facing rebrand — these differ from the
  internal page ids):

  | `goto` key | Internal page | UI label |
  |------------|---------------|----------|
  | `home`     | home    | Home |
  | `bandmates`| social  | Bandmates |
  | `spaces`   | spaces  | Spaces |
  | `perform`  | play    | Perform (Main Stage) |
  | `design`   | creator | Design (Creator) |
  | `store`    | store   | Store |
  | `progress` | season  | Progress |
  | `profile`  | career  | Profile |
  | `settings` | settings| Settings |

  Tab suffix examples: `?goto=perform.group`, `?goto=store.vault`,
  `?goto=bandmates.friends`. The WebView keeps `?goto=` in sync with navigation via
  `history.replaceState`, so the current location is always a valid deeplink.

- **`?invite`** — boots straight into the group-invite popup (paired with a
  `groupInvite` message / mock data) for testing the invite flow.

---

## Notes / non-bridge

- Difficulty vocabulary is unified on `easy` / `medium` / `hard` / `expert` (the
  fix already on `main` in `14f9ca5`), and all unset-state fallbacks — including the
  reskin's new **Spectate** path — default to `easy`. Unity's `ParseDifficulty`
  mapping (`"medium" → Normal`) is unchanged.
- New asset: `branding/setlist-cover.png` (setlist cover art). The `art/` cover-art
  directory remains untracked in git (provided out-of-band as before).
