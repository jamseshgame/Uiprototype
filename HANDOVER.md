# Group Lobby Handover — Unity Integration

This doc covers the new Group-tab lobby UI shipped to `production`. The lobby
view replaces the old coop tile grid; Solo mode is unchanged.

## TL;DR

- New URL slugs `?host` and `?client` open the page directly into the Group
  lobby with a populated roster, so the UI is testable in a browser without
  a Unity session in the loop.
- The lobby is a vertical list of up to **4 players** (host + 3) — the group
  member limit. Each row shows avatar, name, instrument icon, difficulty bars
  (colour-coded), and a status pill — `CHOOSING` (amber) or `READY` (green).
- The button on the bottom of the page is **Ready** (renamed from Start).
  Host taps Ready → `startGame`. Clients tap Ready → toggle their own status
  pill (we send `playerReady` via the bridge).
- Songs side max = 9 (featured 2×2 + small tiles, transitioning to 3×3 at 7+).
  Players side max = 4 (the group member limit; `COOP_PLAYERS_MAX`).

## URL slugs

| URL | Effect |
| --- | --- |
| `/?host` | Sets `inBandspace=true`, `isHost=true`, `hostName=<active profile>`. The lobby renders the active profile as host at the top of the list. `+ Add Player` is enabled. |
| `/?client` | Sets `inBandspace=true`, `isHost=false`, `hostName=<first mock entry>`. Active profile renders second in the list with a `YOU` badge. `+ Add Player` is hidden. Lobby is read-only. |
| (none) | Default Main Stage flow. Group tab still works — user is implicit host of an empty pre-session lobby and can invite friends. |

Combine with `&skip` to bypass onboarding (`?host&skip`, `?client&skip`).

Both slugs run *after* `startFlow()`, so the legal / perms onboarding screens
will still gate access if not yet complete. They override the post-onboarding
navigation target.

## What Unity owns

The HTML prototype contains *mock* lobby data so the UI is demoable, but
production strips those mocks. In production, Unity owns the lobby state and
pushes it via the Vuplex bridge.

### Messages Unity should send to the WebView

| Type | Payload | When |
| --- | --- | --- |
| `setInBandspace` | `boolean` | Entering/leaving a bandspace session. The web side flips `inBandspace`, clears the local roster, and switches the play tab to Group mode. |
| `updateIsHost` | `{ isHost: boolean, hostName: string }` | After joining a session. Drives the HOST pill placement and Ready-button behavior. |
| `lobbyRoster` *(new — recommended)* | `Array<{ name, avatar, instrument, difficulty, status, isSelf? }>` | Push the canonical roster (max 4 — the group member limit) whenever it changes (join, leave, instrument change, ready flip, etc.). The web side renders the list verbatim. `status` ∈ `"choosing" \| "ready"`. |
| `sessionInProgress` | `boolean` | Toggles the "Late-join Spectate" view if a player joins mid-song. Unchanged from previous spec. |
| `updateInstrumentAvailability` | `{ guitar, drums, vocals }` | Greys out instruments already claimed in the bandspace picker. Unchanged. |
| `updateGroups` | `Array<group>` | The player's bands (shown on Bandmates ▸ Groups). The **active** band's roster auto-populates the Perform ▸ Group lobby (logo + name header + member list). |
| `setActiveGroup` | `string` (group `id` or `name`) | Switch the active band. The web side repaints the Bandmates tiles + the Perform group lobby immediately. |
| `updateFriends` | `Array<{ name, oculusId, platformId, avatar, online, playing, accepted:true }>` | Meta friends who **own Jamsesh** (Bandmates ▸ Friends, left column; also the Create Group / Create Space invite pickers). Sent once Meta has answered — `[]` means "none", not "loading". See *Friends page* below. |
| `updateInvitableFriends` | `Array<{ name, oculusId, platformId, avatar, online }>` | People the player can **invite to download Jamsesh** (Bandmates ▸ Friends, right column). |
| `appInviteResult` | `{ platformId, ok, error }` | Reply to `inviteFriendToApp`. `ok:false` resets the row and shows an "Invite Not Sent" popup. |
| `appInvitePanelResult` | `{ ok:false, error }` | Sent only when Quest's invite panel (`openAppInvitePanel`) couldn't open; the web side shows an "Invite List Unavailable" popup. |
| `friendRequestResult` | `{ platformId, sent }` | Reply to `sendFriendRequest` (Meta follow-request dialog). `sent:false` = cancelled/failed; the button resets. |

**Group shape** (`updateGroups`):
```
group  = { id, name, logo, photo, online, active, members: [member, ...] }
member = { name, avatar, instrument, difficulty, ready, online }
```
`logo` = small square band badge (Perform lobby header, left); `photo` = cover art on the Bandmates tile; `online` = e.g. `"3/4"` (group member limit is 4); exactly one group should carry `active:true` (or drive it with `setActiveGroup`).

### Active band → Perform Group lobby

Outside a live `setInBandspace` session, the **Perform ▸ Group** lobby is driven by the player's **active band** (not `lobbyPlayers`): `getCoopRoster()` returns the active band's `members`, the web side injects the local player at the top (YOU badge), and renders the band logo + name as a header above the list. Switching the active band — via a Bandmates tile tap (`joinGroup` → local `applyActiveGroup`) or `setActiveGroup` — repopulates the lobby. Inside a live bandspace (`setInBandspace:true`), `lobbyRoster`/`lobbyPlayers` still take over as before.

### Friends page (Bandmates ▸ Friends)

Two side-by-side columns, both pushed by Unity from Meta. **No mock people on the headset**: until
Unity answers, each column shows "Loading…"; an empty push shows an empty state.

**Left — On Jamsesh** (`updateFriends`): Meta mutual followers who own Jamsesh
(`Users.GetLoggedInUserFriends`). Every entry is `accepted:true`. Sorted by status, 5 per page:

| Status | Pill |
|---|---|
| `online` + `playing` (their Meta presence is in Jamsesh) | `Playing Jamsesh` (teal) |
| `online` | `Online` (green) |
| otherwise | `Offline` (grey) |

Tapping a friend opens an info popup (no Remove — Meta gives apps no unfollow API).

**Right — Invite to Jamsesh** (`updateInvitableFriends`): Meta's invitable users
(`GroupPresence.GetInvitableUsers` — mutual followers + recently met) minus the left column. 4 per
page plus a last row **+ Invite more from Quest** → `openAppInvitePanel {}` (Meta's own invite
panel). Tapping a person → popup → **Send Invite** → `inviteFriendToApp { platformId, name }`; the
row shows `Sending…` then `Invited` on `appInviteResult { ok:true }`. Unity also records a pending
referral for each invitee, so the inviter is credited if they install.

> Unconfirmed on device: whether Meta's invitable list includes friends who **don't** own Jamsesh.
> Unity logs both lists at launch under `[FRIENDS-DIAG]`.

**Member popup ▸ Add Friend**: for a lobby member with a `platformId` who isn't in `updateFriends`
(and isn't you), the Group Member popup shows **Add Friend** → `sendFriendRequest { platformId, name }`,
which opens Meta's follow-request dialog; `friendRequestResult { sent }` flips it to `Request Sent`.

> On a fresh start the player is in **no group** — `bandGroups` is empty, the
> Groups tab shows only "Create New Group", `getActiveBand()` returns `null`, and
> the Perform ▸ Group lobby shows just the player + invite slots (no band header).
> The player gets into a group by creating one, accepting an invite (`?invite` /
> `?skip&invite` force the incoming-invite popup for testing), or via Unity's
> `updateGroups` + `setActiveGroup`. (`jamseshPlayers`/`thePicksPlayers` remain as
> sample rosters those flows can reference.)
> Until `lobbyRoster` is wired, the live bandspace reads from `lobbyPlayers`.
> The previous `host*`/`updatePlayer*` patterns still work — just make sure
> every entry carries `instrument`, `difficulty`, and a `status`/`ready` field.

### Messages the WebView sends to Unity

These already fire from the prototype — Unity just needs handlers.

| Type | Payload | Trigger |
| --- | --- | --- |
| `playerReady` | `{ ready: boolean }` | Client taps the Ready button — toggles their own status. |
| `startGame` | `{ instrument, difficulty, setlist: string[] }` | Host taps the Ready button. (Existing flow — unchanged.) |
| `invitePlayer` | `{ name: string }` | Host clicks `+ Add Player` and picks a friend. The web side also appends locally for instant feedback; Unity should treat this as the source of truth and echo back via `lobbyRoster`. |
| `kickPlayer` | `{ name: string }` | Host clicks the × on a player row. Same echo-back rule as invite. |
| `playMode` | `"solo" \| "coop"` | User flips the Solo / Group tab. |
| `createGroup` | `{ name, logo, members:[{name,platformId}], invited:[name,…] }` | Confirms Create Group. `members` = already-accepted; `invited` = pending invites (see below). Names are de-duplicated client-side (`Dupe` → `Dupe #2`) so ids/names never collide. |
| `inviteToGroup` | `{ name: string }` | An INVITE tapped in the Create/Manage Group panel. The slot stays empty + the friend shows an "Invited" pill until they accept. |
| `createSpace` | `{ name, type:"public"\|"private", environment, invited:[name,…] }` | Confirms Create Space. The web side also surfaces the space locally (Spaces grid) immediately. |
| `deleteSpace` | `{ name, forGroup }` | Fired when a group is **disbanded** — its auto-created `"<group> Studio"` private space is removed so it isn't orphaned. |
| `equipItem` | `{ id, name }` | "Equip Now" tapped on an owned item in My Collection. |

> **Local economy is per-profile.** Owned items (e.g. the store guitar) are tracked per active profile (`switchProfile` swaps the owned state), and the personal `"<name>'s Private Space"` is renamed to follow the active profile. The setlist is capped at 9 songs (`coopMax`) with duplicates rejected on add. Start/Ready is blocked while the setlist is empty (Solo shows a popup; Host's Start stays disabled until the host has a song + instrument + difficulty + vibe **and** all bandmates are Ready).

> **Group invites are UNLIMITED and accepts are first-come-first-served.** The web
> side does not cap invites — invite as many friends as you like; each gets an
> "Invited" pill and the member slot stays empty. The 4-member limit
> (`CG_MEMBERS_MAX`) is enforced **on accept**: Unity admits accepters in order
> until the band hits 4 (you + 3), then rejects/ignores any later accepts. Push
> each new member into the roster (`updateGroups`/`lobbyRoster`) as they accept.

## Status pill rules

- A player whose **instrument or difficulty just changed** should be marked
  `choosing`. The web side does this automatically for the local user when
  they open the instrument/difficulty picker — Unity should mirror this for
  remote players (any pick change → flip pill to `choosing`).
- A player who taps **Ready** flips to `ready`. The web side fires
  `playerReady: { ready: true }`. Unity broadcasts; the next `lobbyRoster`
  push flips their pill.
- Cancelling ready: the same button toggles back. Web sends
  `playerReady: { ready: false }`.

## Layout notes

- **Self-row aesthetics:** the active profile's row has a brighter left
  border and a `YOU` badge to distinguish it. Self also gets the live
  instrument/difficulty selections rendered immediately (before Ready) so
  the picker's effect is visible.
- **Empty slots:** rows 1..N show players; row N+1 is `+ Add Player`
  (host only); rows beyond are dim dashed placeholders. The list draws up to
  the member limit (4 rows) so vertical alignment is stable.
- **Songs side:** uses the same "featured" 2×2 + small tiles grid as the
  prototype. Setlist mutation goes through the existing
  `swapSetlistSong` / `removeSoloSong` / `addSongToSetlist` paths — no
  changes for Unity.

## Testing in a browser

```
# Open Group as host with a populated mock roster
http://localhost:3000/?host&skip

# Open Group as client (host is xShredMaster, you appear second with YOU)
http://localhost:3000/?client&skip

# Same but force re-onboarding
http://localhost:3000/?host&onboard
```

> `production` strips placeholder media (`art/`, `avatars/`, etc.) and
> mock arrays. With those gone, the URL slugs still navigate to the
> Group tab and set `isHost`/`hostName`/`inBandspace`, but the roster
> renders empty until Unity pushes one. To demo the full UI in a browser,
> use the `main` branch (which keeps the mock data).
