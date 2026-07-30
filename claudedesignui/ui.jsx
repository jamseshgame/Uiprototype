/* global React */
const { useState, useEffect, useRef, useMemo } = React;

// ========================== SHARED UI BITS ==========================

const Avatar = ({ src, size = 64, ring }) => (
  <div
    style={{
      width: size, height: size, borderRadius: "50%",
      backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center",
      boxShadow: ring ? `0 0 0 3px var(--accent), 0 0 0 6px rgba(0,0,0,0.5)` : "inset 0 0 0 1px rgba(255,255,255,0.18)",
      flexShrink: 0,
    }}
  />
);

const IconBtn = ({ children, onClick, label, w = 86, h = 86, primary }) => (
  <button
    className={"icon-btn " + (primary ? "icon-btn--primary" : "")}
    onClick={onClick}
    aria-label={label}
    style={{ width: w, height: h }}
  >
    {children}
  </button>
);

// SVG icons —— sized to inherit fill via currentColor
const Icon = {
  play: (s = 28) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>
  ),
  pause: (s = 28) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
  ),
  plus: (s = 28) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
  ),
  x: (s = 28) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
  ),
  swap: (s = 28) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h12l-3-3M17 17H5l3 3"/></svg>
  ),
  arrowLeft: (s = 28) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
  ),
  arrowRight: (s = 28) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
  ),
  search: (s = 24) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
  ),
  coin: (s = 28) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5c5.4 0 9.5 3.2 9.5 7.6 0 4.6-5.5 11.4-9.5 11.4S2.5 14.7 2.5 10.1C2.5 5.7 6.6 2.5 12 2.5Z"/></svg>
  ),
  bolt: (s = 24) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h6l-1 8 9-12h-6z"/></svg>
  ),
  check: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
  ),
  star: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 7 7 .6-5.4 4.6L18 22l-6-3.8L6 22l1.4-7.8L2 9.6 9 9z"/></svg>
  ),
};

const NavIcon = {
  home: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>
  ),
  play: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="15.5" cy="8.5" r="5"/><path d="M13.13 13.13 L5.63 20.63 A1.6 1.6 0 0 1 3.37 18.37 L10.87 10.87"/><path d="M11.36 14.90 L9.10 12.64"/></svg>
  ),
  social: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2"/><circle cx="17" cy="9" r="2.5"/><path d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M14 19c0-2.5 1.8-4.5 4-5"/></svg>
  ),
  spaces: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 4l9 5.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-7h6v7"/></svg>
  ),
  creator: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4l6 6-10 10H4v-6z"/><path d="M13 5l6 6"/></svg>
  ),
  store: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8l1.5-4h13L20 8M4 8h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M9 12a3 3 0 0 0 6 0"/></svg>
  ),
  season: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>
  ),
  settings: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>
  ),
};

// ========================== TOPBAR ==========================

const Topbar = ({ profile, coins, page }) => {
  const xp = (
    <div className="topbar-stat topbar-stat--xp" key="xp">
      <div className="topbar-stat-label">XP · NEXT LV</div>
      <div className="topbar-stat-value">12,840 / 15,000</div>
      <div className="topbar-xp-bar"><div className="topbar-xp-fill" style={{ width: "85.6%" }}></div></div>
    </div>
  );
  const coin = (
    <div className="topbar-coin" key="coin">
      <div className="topbar-coin-icon">{Icon.coin(34)}</div>
      <div className="topbar-coin-val">{window.fmtScore(coins)}</div>
    </div>
  );
  const level = (
    <div className="topbar-stat" key="level">
      <div className="topbar-stat-label">LEVEL</div>
      <div className="topbar-stat-value">27</div>
    </div>
  );
  const divider = <div className="topbar-divider" key="div"></div>;
  const profileBlock = (
    <div className="topbar-profile" key="profile">
      <Avatar src={profile.avatar} size={72} ring />
      <div className="topbar-profile-text">
        <div className="topbar-name">{profile.name}</div>
        <div className="topbar-handle">@{profile.handle}</div>
      </div>
    </div>
  );

  return (
    <div className="topbar topbar--single">
      <div className="topbar-row topbar-row--single">
        <div className="topbar-logo">
          <div className="topbar-wordmark">JAMSESH</div>
        </div>
        <div className="topbar-top-right">
          {xp}
          {level}
          {coin}
          {divider}
          {profileBlock}
        </div>
      </div>
    </div>
  );
};

// ========================== NAVBAR ==========================

const Navbar = ({ current, onNav }) => {
  // Match the original Uiprototype navbar order:
  // Home · Social · Spaces · Play · Creator · Store · Season
  const items = [
    { id: "home",    label: "Home",    icon: NavIcon.home    },
    { id: "social",  label: "Bandmates", icon: NavIcon.social  },
    { id: "spaces",  label: "Spaces",  icon: NavIcon.spaces  },
    { id: "play",    label: "Perform", icon: NavIcon.play    },
    { id: "creator", label: "Creator", icon: NavIcon.creator },
    { id: "store",   label: "Store",   icon: NavIcon.store   },
    { id: "season",  label: "Season",  icon: NavIcon.season  },
  ];
  return (
    <div className="navbar">
      {items.map(it => (
        <button
          key={it.id}
          className={"nav-item " + (current === it.id ? "is-active" : "")}
          onClick={() => onNav(it.id)}
        >
          <div className="nav-icon">{it.icon}</div>
          <div className="nav-label">{it.label}</div>
        </button>
      ))}
    </div>
  );
};

window.JamUI = { Avatar, IconBtn, Icon, NavIcon, Topbar, Navbar };
