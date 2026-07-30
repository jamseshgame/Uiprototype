/* global React */
// ============================================================
// HI-FI · USER JOURNEY SCREENS
// Social Lobby · Perform (Solo) · Perform (Multiplayer) · Studio
// ============================================================

// ── Topbar (compact, single row — reused across screens) ──
const HifiTopbar = ({ page = "Social" }) => (
  <div className="topbar topbar--single">
    <div className="topbar-row topbar-row--single">
      <div className="topbar-left">
        <div className="topbar-logo">
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'grid', placeItems: 'center',
            fontFamily: 'Gasoek One', fontSize: 32, color: 'var(--bg-deep)',
          }}>J</div>
          <div className="topbar-wordmark">JAMSESH</div>
        </div>
        <div className="topbar-divider"></div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 14, letterSpacing: '0.28em', color: 'var(--text-3)', fontWeight: 700 }}>NOW</div>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 42, lineHeight: 1, letterSpacing: '0.02em' }}>{page}</div>
        </div>
      </div>
      <div className="topbar-top-right">
        <div className="topbar-stat topbar-stat--xp">
          <div className="topbar-stat-label">LV 27 · 920 TO 28</div>
          <div className="topbar-xp-bar"><div className="topbar-xp-fill" style={{ width: '63%' }}></div></div>
        </div>
        <div className="topbar-coin">
          <div className="topbar-coin-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-3 2-5 5-5 9 0 5 3 9 5 11 2-2 5-6 5-11 0-4-2-7-5-9z"/></svg>
          </div>
          <div className="topbar-coin-val">14,820</div>
        </div>
        <div className="topbar-profile">
          <div className="avatar s96" style={{ backgroundImage: 'url(assets/avatars/01.png)' }}></div>
          <div className="topbar-profile-text">
            <div className="topbar-name">RAEL</div>
            <div className="topbar-handle">@rael.live</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ── Navbar (7-tab) ──
const HifiNavbar = ({ active = "social" }) => {
  const items = [
    { id: "home",    label: "HOME"    },
    { id: "perform", label: "PERFORM" },
    { id: "social",  label: "SOCIAL"  },
    { id: "spaces",  label: "SPACES"  },
    { id: "creator", label: "CREATE"  },
    { id: "store",   label: "STORE"   },
    { id: "vault",   label: "VAULT"   },
  ];
  return (
    <div className="navbar">
      {items.map(i => (
        <div key={i.id} className={"nav-item " + (i.id === active ? "is-active" : "")}>
          <div className="nav-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="8"/>
            </svg>
          </div>
          <div className="nav-label">{i.label}</div>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// SCREEN 1 — SOCIAL LOBBY
// ============================================================
const LobbyPersonRow = ({ avatar, name, sub, you, emoji }) => (
  <div className={"lobby-overlay-row " + (you ? "is-you" : "")}>
    <div className="avatar s64" style={{ backgroundImage: `url(${avatar})` }}></div>
    <div className="lobby-overlay-row-text">
      <div className="lobby-overlay-row-name">
        {name}
        {you && <span className="lobby-here-tag">YOU</span>}
      </div>
      <div className="lobby-overlay-row-sub">{sub}</div>
    </div>
    {emoji && <div className="lobby-overlay-row-emoji">{emoji}</div>}
  </div>
);

const LobbyScreen = () => (
  <div className="hifi-vp">
    <div className="lobby-stage">
      {/* ─── Placeholder 3D lobby room ─── */}
      <div className="lobby-stage-room">
        {/* horizon glow */}
        <div className="lobby-stage-sky"></div>
        {/* grid floor */}
        <div className="lobby-stage-floor"></div>
        {/* sun / focal light */}
        <div className="lobby-stage-sun"></div>
        {/* placeholder label */}
        <div className="lobby-stage-tag">
          <div className="lobby-stage-tag-dot"></div>
          <div>
            <div className="lobby-stage-tag-eyebrow">PLACEHOLDER</div>
            <div className="lobby-stage-tag-text">3D social lobby render · live avatars · ambient music · drop-in voice</div>
          </div>
        </div>
      </div>

      {/* ─── Top status strip ─── */}
      <div className="lobby-top-strip">
        <div className="lobby-top-pill">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          LEAVE
        </div>
        <div className="lobby-top-title">
          <div className="lobby-top-eyebrow">SOCIAL LOBBY</div>
          <div className="lobby-top-name">SATURDAY NIGHT · 12:42 AM</div>
        </div>
        <div className="lobby-top-presence">
          <div className="studio-presence-avatars">
            <div className="avatar s64" style={{ backgroundImage: 'url(assets/avatars/01.png)' }}></div>
            <div className="avatar s64" style={{ backgroundImage: 'url(assets/avatars/02.jpg)' }}></div>
            <div className="avatar s64" style={{ backgroundImage: 'url(assets/avatars/03.png)' }}></div>
            <div className="avatar s64" style={{ backgroundImage: 'url(assets/avatars/04.png)' }}></div>
          </div>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 26, letterSpacing: '0.06em' }}>4 HERE</div>
        </div>
      </div>

      {/* ─── Overlay: who's in the lobby (top-left) ─── */}
      <div className="lobby-overlay lobby-overlay--top">
        <div className="lobby-overlay-head">
          <div>
            <div className="lobby-overlay-eyebrow">
              <span className="lobby-overlay-pulse"></span>
              IN THE LOBBY
            </div>
            <div className="lobby-overlay-title">4 here right now</div>
          </div>
          <div className="lobby-overlay-count">4</div>
        </div>
        <div className="lobby-overlay-list">
          <LobbyPersonRow avatar="assets/avatars/01.png" name="RAEL" sub="just got here · idle" you emoji="🎸" />
          <LobbyPersonRow avatar="assets/avatars/02.jpg" name="JOOLEENO" sub="@jooleeno · Lv 41" emoji="👀" />
          <LobbyPersonRow avatar="assets/avatars/03.png" name="TED" sub="@ted · Lv 33" emoji="🎧" />
          <LobbyPersonRow avatar="assets/avatars/04.png" name="ABBIE" sub="@abbie.fm · Lv 47" emoji="✨" />
        </div>
      </div>

      {/* ─── Overlay: friends online (bottom-left) ─── */}
      <div className="lobby-overlay lobby-overlay--bottom">
        <div className="lobby-overlay-head">
          <div>
            <div className="lobby-overlay-eyebrow" style={{ color: 'var(--accent-4)' }}>
              <span className="lobby-overlay-pulse" style={{ background: 'var(--accent-4)', boxShadow: '0 0 14px var(--accent-4)' }}></span>
              FRIENDS ONLINE
            </div>
            <div className="lobby-overlay-title">3 friends online</div>
          </div>
          <button className="lobby-overlay-invite">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            INVITE
          </button>
        </div>
        <div className="lobby-overlay-list">
          <LobbyPersonRow avatar="assets/avatars/05.jpg" name="ARTHEN" sub="browsing the Store" emoji="🛍" />
          <LobbyPersonRow avatar="assets/avatars/02.jpg" name="KAISERWAVE" sub="jamming · Burn Stairwell" emoji="🎤" />
          <LobbyPersonRow avatar="assets/avatars/03.png" name="NYTEFALL" sub="in Velvet Club lobby" emoji="🌙" />
        </div>
      </div>

      {/* ─── Bottom CTA: Play Now ─── */}
      <div className="lobby-cta-dock">
        <div className="lobby-cta-quick">
          <div className="studio-quick-btn is-on">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zM11 19h2v3h-2z"/></svg>
          </div>
          <div className="studio-quick-btn">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/></svg>
          </div>
          <div className="studio-quick-btn">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
          </div>
        </div>

        <button className="lobby-play-cta">
          <span className="lobby-play-cta-glow"></span>
          <span className="lobby-play-cta-icon">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </span>
          <span className="lobby-play-cta-text">
            <span className="lobby-play-cta-eyebrow">READY WHEN YOU ARE</span>
            <span className="lobby-play-cta-label">PLAY NOW</span>
          </span>
          <span className="lobby-play-cta-arrow">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </span>
        </button>

        <div className="lobby-cta-quick">
          <div className="studio-quick-btn">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94a7.99 7.99 0 000-1.88l2.03-1.58a.5.5 0 00.12-.63l-1.92-3.32a.5.5 0 00-.6-.22l-2.39.96a8 8 0 00-1.62-.94l-.36-2.54A.5.5 0 0014 2h-4a.5.5 0 00-.5.42l-.36 2.54a8 8 0 00-1.62.94l-2.39-.96a.5.5 0 00-.6.22L2.61 8.48a.5.5 0 00.12.63l2.03 1.58a8 8 0 000 1.88l-2.03 1.58a.5.5 0 00-.12.63l1.92 3.32a.5.5 0 00.6.22l2.39-.96a8 8 0 001.62.94l.36 2.54A.5.5 0 0010 22h4a.5.5 0 00.5-.42l.36-2.54a8 8 0 001.62-.94l2.39.96a.5.5 0 00.6-.22l1.92-3.32a.5.5 0 00-.12-.63l-2.03-1.58zM12 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z"/></svg>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================
// SCREEN 2 — PERFORM PAGE · MULTIPLAYER
// Renders the prototype's actual PlayScreen with mode="group",
// wrapped in the prototype's viewport-body / Topbar / Navbar chrome.
// ============================================================
const PROTO_PROFILE = {
  name:   "RAEL",
  handle: "rael.live",
  avatar: "assets/avatars/01.png",
};

const PerformMpScreen = () => {
  const { Topbar, Navbar } = window.JamUI;
  const { PlayScreen } = window.JamScreens;

  // Build the same state the prototype's reducer starts with, but flipped to "group" mode
  const protoState = {
    page: "play",
    mode: "group",
    setlist: [window.SONG_CATALOG[2], window.SONG_CATALOG[5], window.SONG_CATALOG[8]],
    activeIdx: 0,
    previewIdx: null,
    songInstruments: { 0: "guitar", 1: "drums", 2: "vocals" },
    songDiffs:       { 0: "Hard",   1: "Normal", 2: "Expert" },
    picker: null,
    toast: null,
  };
  const noop = () => {};

  return (
    <div className="hifi-vp">
      <div className="viewport-body">
        <Topbar profile={PROTO_PROFILE} coins={5240} page="play" />
        <div className="content">
          <PlayScreen
            state={protoState}
            dispatch={noop}
            onStart={noop}
            onOpenPicker={noop}
            hideConfig
            startLabel="Go To Studio"
            startIcon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>}
          />
        </div>
        <Navbar current="play" onNav={noop} />
      </div>
    </div>
  );
};

// ============================================================
// SCREEN 3 — PERSONAL STUDIO / DEFAULT BAND SPACE
// (3D room full-screen, loadout HUD overlay bottom-right)
// ============================================================
const StudioScreen = () => {
  const { PlayScreen } = window.JamScreens;
  const studioConfigState = {
    page: "play",
    mode: "group",
    setlist: [window.SONG_CATALOG[2], window.SONG_CATALOG[5], window.SONG_CATALOG[8]],
    activeIdx: 0,
    previewIdx: null,
    songInstruments: { 0: "guitar", 1: "drums", 2: "vocals" },
    songDiffs:       { 0: "Hard",   1: "Normal", 2: "Expert" },
    picker: null,
    toast: null,
  };
  const noop = () => {};
  return (
  <div className="hifi-vp">
    <div className="hifi-body" style={{ padding: 24, gap: 18 }}>
      <HifiTopbar page="Personal Studio" />

      <div className="studio-screen" style={{ flex: "none", height: 820 }}>
        {/* The 3D room art — using a fallback gradient if no asset */}
        <div className="studio-room" style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 30%, color-mix(in oklab, var(--accent-2) 35%, transparent) 0%, transparent 60%), ' +
            'radial-gradient(ellipse 50% 40% at 20% 80%, color-mix(in oklab, var(--accent-3) 45%, transparent), transparent 60%), ' +
            'radial-gradient(ellipse 50% 40% at 90% 80%, color-mix(in oklab, var(--accent-4) 40%, transparent), transparent 60%), ' +
            'linear-gradient(180deg, #0E0823 0%, #2A1F50 60%, #160826 100%)',
        }}>
          {/* horizon line + grid floor */}
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, height: '60%',
            background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.45) 100%)',
          }}></div>
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, height: '50%',
            backgroundImage:
              'linear-gradient(rgba(232,255,58,0.10) 2px, transparent 2px), ' +
              'linear-gradient(90deg, rgba(232,255,58,0.10) 2px, transparent 2px)',
            backgroundSize: '120px 120px',
            transform: 'perspective(900px) rotateX(70deg)',
            transformOrigin: 'bottom center',
            maskImage: 'linear-gradient(180deg, transparent 0%, black 50%)',
          }}></div>
          {/* Skybox windows */}
          <div style={{
            position: 'absolute', top: '12%', left: '8%', width: 280, height: 380,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.6), rgba(0,0,0,0.85))',
            borderRadius: 24,
            border: '2px solid rgba(255,255,255,0.08)',
            boxShadow: '0 0 60px rgba(0,0,0,0.5)',
          }}>
            <div style={{
              position: 'absolute', inset: 12,
              background: 'radial-gradient(ellipse at 30% 40%, #ff8fc3, #B0A6DF 30%, #1B1638 80%)',
              borderRadius: 16,
            }}></div>
          </div>
          <div style={{
            position: 'absolute', top: '14%', right: '10%', width: 260, height: 320,
            background: 'rgba(0,0,0,0.5)', borderRadius: 20, border: '2px solid rgba(255,255,255,0.08)',
            display: 'grid', placeItems: 'center',
            color: 'rgba(255,255,255,0.6)',
            fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: '0.08em',
            textAlign: 'center',
            padding: 22,
          }}>
            <div>
              <div style={{ fontSize: 14, letterSpacing: '0.32em', color: 'var(--accent-4)', marginBottom: 12 }}>POSTER</div>
              VELOCITY<br/>WORLD TOUR<br/>2027
            </div>
          </div>
        </div>
        <div className="studio-room-shade"></div>

        {/* Top bar overlay */}
        <div className="studio-topbar">
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="studio-pill">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
              LEAVE
            </div>
            <div className="studio-pill">PERSONAL STUDIO</div>
            <div className="studio-pill is-host">★ HOST · YOU</div>
          </div>
          <div className="studio-presence">
            <div className="studio-presence-avatars">
              <div className="avatar s64" style={{ backgroundImage: 'url(assets/avatars/01.png)' }}></div>
              <div className="avatar s64" style={{ backgroundImage: 'url(assets/avatars/02.jpg)' }}></div>
              <div className="avatar s64" style={{ backgroundImage: 'url(assets/avatars/03.png)' }}></div>
              <div className="avatar s64" style={{ backgroundImage: 'url(assets/avatars/04.png)' }}></div>
            </div>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: 26, letterSpacing: '0.06em', marginLeft: 6 }}>4/4 IN SPACE</div>
          </div>
        </div>

        {/* Avatars in space — illustrative */}
        <div className="studio-stand-row">
          {[
            { src: 'assets/avatars/02.jpg', name: 'JOOLEENO' },
            { src: 'assets/avatars/01.png', name: 'YOU' },
            { src: 'assets/avatars/03.png', name: 'TED' },
            { src: 'assets/avatars/04.png', name: 'ABBIE' },
          ].map((p, i) => (
            <div key={i} className="studio-figure">
              <div className="avatar s140" style={{ backgroundImage: `url(${p.src})`, border: '4px solid rgba(255,255,255,0.18)' }}></div>
              <div className="studio-figure-label">{p.name}</div>
            </div>
          ))}
        </div>

        {/* Bottom-left quick actions */}
        <div className="studio-quick">
          <div className="studio-quick-btn is-on" title="Mic on">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zM11 19h2v3h-2z"/></svg>
          </div>
          <div className="studio-quick-btn" title="Chat">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/></svg>
          </div>
          <div className="studio-quick-btn" title="Emote">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
          </div>
          <div className="studio-quick-btn" title="Settings">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94a7.99 7.99 0 000-1.88l2.03-1.58a.5.5 0 00.12-.63l-1.92-3.32a.5.5 0 00-.6-.22l-2.39.96a8 8 0 00-1.62-.94l-.36-2.54A.5.5 0 0014 2h-4a.5.5 0 00-.5.42l-.36 2.54a8 8 0 00-1.62.94l-2.39-.96a.5.5 0 00-.6.22L2.61 8.48a.5.5 0 00.12.63l2.03 1.58a8 8 0 000 1.88l-2.03 1.58a.5.5 0 00-.12.63l1.92 3.32a.5.5 0 00.6.22l2.39-.96a8 8 0 001.62.94l.36 2.54A.5.5 0 0010 22h4a.5.5 0 00.5-.42l.36-2.54a8 8 0 001.62-.94l2.39.96a.5.5 0 00.6-.22l1.92-3.32a.5.5 0 00-.12-.63l-2.03-1.58zM12 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z"/></svg>
          </div>
        </div>

        {/* Loadout HUD overlay */}
        <div className="loadout-hud">
          <div className="loadout-head">
            <div className="loadout-eyebrow">PICK YOUR LOADOUT · OVERLAY</div>
            <div className="loadout-title">EACH PLAYER PICKS<br/>INSTRUMENT + DIFFICULTY</div>
          </div>

          <div className="loadout-row is-self">
            <div className="avatar s64" style={{ backgroundImage: 'url(assets/avatars/01.png)' }}></div>
            <div>
              <div className="loadout-row-name">YOU <span style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.16em', marginLeft: 6 }}>HOST</span></div>
              <div className="loadout-row-tag">profile · Lv 27</div>
            </div>
            <div className="loadout-pick">🎸 GUITAR ▾</div>
            <div className="loadout-pick">HARD ▾</div>
          </div>
          <div className="loadout-row">
            <div className="avatar s64" style={{ backgroundImage: 'url(assets/avatars/03.png)' }}></div>
            <div>
              <div className="loadout-row-name">TED</div>
              <div className="loadout-row-tag">Lv 33</div>
            </div>
            <div className="loadout-pick">🥁 DRUMS ▾</div>
            <div className="loadout-pick">NORMAL ▾</div>
          </div>
          <div className="loadout-row">
            <div className="avatar s64" style={{ backgroundImage: 'url(assets/avatars/02.jpg)' }}></div>
            <div>
              <div className="loadout-row-name">JOOLEENO</div>
              <div className="loadout-row-tag">Lv 41</div>
            </div>
            <div className="loadout-pick">🎤 VOCALS ▾</div>
            <div className="loadout-pick">EXPERT ▾</div>
          </div>
          <div className="loadout-row is-choosing">
            <div className="avatar s64" style={{ backgroundImage: 'url(assets/avatars/04.png)' }}></div>
            <div>
              <div className="loadout-row-name">ABBIE</div>
              <div className="loadout-row-tag">choosing…</div>
            </div>
            <div className="loadout-pick is-placeholder">PICK ▾</div>
            <div className="loadout-pick is-placeholder">— ▾</div>
          </div>

          <div className="loadout-foot">
            <div className="loadout-ready-counter"><b>3/4</b> ready · waiting on Abbie</div>
            <button className="loadout-play-btn is-locked">PLAY ▶</button>
          </div>
        </div>
      </div>

      {/* Pre-show configuration — moved here from the Multiplayer screen */}
      <div className="studio-config">
        <div className="studio-config-head">
          <div className="studio-config-eyebrow">Set The Show</div>
          <div className="studio-config-title">Pick songs, instruments &amp; staging</div>
        </div>
        <PlayScreen
          state={studioConfigState}
          dispatch={noop}
          onStart={noop}
          onOpenPicker={noop}
          configOnly
        />
      </div>
    </div>
  </div>
  );
};

Object.assign(window, { LobbyScreen, PerformMpScreen, StudioScreen, HifiTopbar, HifiNavbar });
