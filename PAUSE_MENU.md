# WebView pause menu

Open [pause.html](pause.html) directly for a standalone preview. The game loads this small page into its existing Vuplex panel during pause. It uses local fonts and no network assets. The custom dropdown stays inside the VR panel instead of opening an Android select dialog.

Resume, host-only restart, and exit use the existing gameplay actions. Guitar spawn/rotation toggles retain their existing settings. Controller pairing and drum layout editing open their existing dedicated Unity panels. If the pause page fails to become ready within 15 seconds, the original Unity pause panel is shown as a recovery path.

## Battle selection

The dropdown contains None and all seven current battle effects: Ink splatter, Reverse highway, Left / right flip, Fast gems, Tiny gems, Spawn shift, and PLAY DRUMS. The existing battle implementation runs on guitar charts; other instruments show an unavailable message rather than a nonfunctional selector.

Selecting an effect applies a local override, independent of the battle debug checkbox, enabled-effect list, cooldown, and duration. It replaces the previous effect and suppresses timed incoming effects while selected. None clears the override and restores normal battle rules. Selection survives pause/resume and rebuilding the same gameplay runtime for a restart; leaving gameplay destroys it. It does not send attacks to other players or change shared session settings.

## Bridge

Page to Unity: `{ "type": "pauseAction", "action": "ready|resume|restart|home|debuff|anchored|rotation|controller|layout" }`. Debuff carries `effect` (-1 for None, 0 through 6 in BattleModeSettings order). Toggles carry boolean `value`.

Unity to page: `pauseState` with `song`, `canRestart`, `canDebuff`, `selectedEffect`, `effects` labels, `instrument`, `anchored`, and `freeRotation`. State is rehydrated whenever the page is recreated; Unity is authoritative when connected.

Unity implementation: GameplayUI / PauseWebViewMenu / BattleRuntime. WebUiBuildValidation packages and requires this page alongside index.html and results.html.
