# Group Lobby Handover — Unity Integration

This doc covers the new Group-tab lobby UI shipped to `production`. The lobby
view replaces the old coop tile grid; Solo mode is unchanged.

## TL;DR

- New URL slugs `?host` and `?client` open the page directly into the Group
  lobby with a populated roster, so the UI is testable in a browser without
  a Unity session in the loop.
- The lobby is a vertical list of up to **10 players** (host + 9). Each row
  shows avatar, name, instrument icon, difficulty star (colour-coded), and a
  status pill — `CHOOSING` (amber) or `READY` (green).
- The button on the bottom of the page is **Ready** (renamed from Start).
  Host taps Ready → `startGame`. Clients tap Ready → toggle their own status
  pill (we send `playerReady` via the bridge).
- Songs side max = 9 (featured 2×2 + small tiles, transitioning to 3×3 at 7+).
  Players side max = 10 (vertical list, fixed slot height).

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
| `lobbyRoster` *(new — recommended)* | `Array<{ name, avatar, instrument, difficulty, status, isSelf? }>` | Push the canonical 10-slot roster whenever it changes (join, leave, instrument change, ready flip, etc.). The web side renders the list verbatim. `status` ∈ `"choosing" \| "ready"`. |
| `sessionInProgress` | `boolean` | Toggles the "Late-join Spectate" view if a player joins mid-song. Unchanged from previous spec. |
| `updateInstrumentAvailability` | `{ guitar, drums, vocals }` | Greys out instruments already claimed in the bandspace picker. Unchanged. |

> Until `lobbyRoster` is wired, the web side reads from the existing
> `lobbyPlayers` global. The previous `host*`/`updatePlayer*` patterns still
> work — just make sure every entry carries `instrument`, `difficulty`, and
> a `status` field so the row renders correctly.

### Messages the WebView sends to Unity

These already fire from the prototype — Unity just needs handlers.

| Type | Payload | Trigger |
| --- | --- | --- |
| `playerReady` | `{ ready: boolean }` | Client taps the Ready button — toggles their own status. |
| `startGame` | `{ instrument, difficulty, setlist: string[] }` | Host taps the Ready button. (Existing flow — unchanged.) |
| `invitePlayer` | `{ name: string }` | Host clicks `+ Add Player` and picks a friend. The web side also appends locally for instant feedback; Unity should treat this as the source of truth and echo back via `lobbyRoster`. |
| `kickPlayer` | `{ name: string }` | Host clicks the × on a player row. Same echo-back rule as invite. |
| `playMode` | `"solo" \| "coop"` | User flips the Solo / Group tab. |

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
  (host only); rows beyond are dim dashed placeholders. The list always
  draws all 10 rows so vertical alignment is stable.
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
