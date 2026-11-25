/* global React */
// ============================================================
// HI-FI · END OF SESSION SCREENS
// Transition · Solo Result · Band Result · Band Incomplete ·
// Rewards · End-of-Session Actions · Quest Toast
// ============================================================

const SCORE = (n) => n.toLocaleString('en-US');

// ============================================================
// SCREEN A — TRACK COMPLETE TRANSITION (1.5s beat)
// ============================================================
const TransitionScreen = () => (
  <div className="hifi-vp">
    <div className="tc-screen">
      <div className="tc-bg" style={{ backgroundImage: 'url(assets/art/03.jpg)' }}></div>
      <div className="tc-bg-shade"></div>
      <div className="tc-burst"></div>
      <div className="tc-body">
        <div className="tc-eyebrow">TRACK COMPLETE</div>
        <div className="tc-h">NICE<br/>SET.</div>
        <div className="tc-track-card">
          <div className="tc-track-art" style={{ backgroundImage: 'url(assets/art/03.jpg)' }}></div>
          <div className="tc-track-text">
            <div className="tc-track-title">GLASS HIGHWAY</div>
            <div className="tc-track-artist">Lunaris Velocity</div>
            <div className="tc-track-meta">
              <span>3:42</span>
              <span className="dot">·</span>
              <span>Pop-punk · 2024</span>
              <span className="dot">·</span>
              <span>Band of 4</span>
            </div>
          </div>
        </div>
        <div className="tc-spinner-row">
          <span>TALLYING RESULTS</span>
          <div className="tc-dots"><span></span><span></span><span></span></div>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================
// SCREEN B — SOLO RESULT (your score + leaderboard)
// (reuses .results-screen visuals but built inline for canvas)
// ============================================================
const SoloResultScreen = () => {
  const yourScore = 184720;
  const stats = [
    { label: "NOTES HIT", value: "412", sub: "of 438" },
    { label: "BEST STREAK", value: "87", sub: "notes" },
    { label: "ACCURACY", value: "94.1%", sub: "" },
    { label: "TOP MULT.", value: "×4", sub: "max" },
  ];
  return (
    <div className="hifi-vp">
      <div className="hifi-body">
        <div className="results-bg" style={{ backgroundImage: 'url(assets/art/05.jpg)', position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(72px) saturate(160%)', transform: 'scale(1.2)', zIndex: 0 }}></div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(16,12,31,0.78), rgba(16,12,31,0.94))', zIndex: 0 }}></div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 22, height: '100%' }}>
          <div className="results-head">
            <div className="results-eyebrow">SET COMPLETE · SOLO</div>
            <div className="results-h">Results.</div>
            <div className="results-sub">Glass Highway · Lunaris Velocity · Hard</div>
          </div>

          <div className="results-body results-body-1" style={{ display: 'grid', gridTemplateColumns: '760px 1fr', gap: 22, flex: 1, minHeight: 0 }}>
            <div className="results-left">
              <div className="results-art-wrap">
                <div className="results-art" style={{ backgroundImage: 'url(assets/art/05.jpg)' }}></div>
                <div className="results-grade" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>A</div>
              </div>
              <div className="results-score-tabs">
                <button className="rs-tab is-on">ME</button>
                <button className="rs-tab">GROUP</button>
              </div>
              <div className="results-score-big">
                <div className="rs-label">YOUR SCORE</div>
                <div className="rs-val">{SCORE(yourScore)}</div>
              </div>
              <div className="brc-stars">★ ★ ★ ★ <span className="off">★</span></div>
              <div className="results-stats">
                {stats.map(s => (
                  <div key={s.label} className="rs-stat">
                    <div className="rs-stat-label">{s.label}</div>
                    <div className="rs-stat-val">{s.value}</div>
                    {s.sub && <div className="rs-stat-sub">{s.sub}</div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="results-right">
              <div className="lb-head">
                <div className="lb-title">LEADERBOARD</div>
                <div className="lb-sub">Top 5 · this track · Hard difficulty</div>
              </div>
              <div className="lb-list">
                {[
                  { rank: 1, name: "kaiserwave", score: 254300, you: false, avatar: 'assets/avatars/02.jpg' },
                  { rank: 2, name: "nytefall",   score: 221800, you: false, avatar: 'assets/avatars/03.png' },
                  { rank: 3, name: "RAEL",       score: 184720, you: true,  avatar: 'assets/avatars/01.png' },
                  { rank: 4, name: "ghostlight", score: 173040, you: false, avatar: 'assets/avatars/05.jpg' },
                  { rank: 5, name: "abbie.fm",   score: 169100, you: false, avatar: 'assets/avatars/04.png' },
                ].map(row => (
                  <div key={row.rank} className={"lb-row " + (row.you ? "is-you" : "")}>
                    <div className="lb-rank">#{row.rank}</div>
                    <div className="avatar s72" style={{ backgroundImage: `url(${row.avatar})` }}></div>
                    <div className="lb-name-wrap">
                      <div className="lb-name">{row.name}{row.you && <span className="lb-tag">YOU</span>}</div>
                      <div className="lb-meta">Lv {37 - row.rank * 3} · Guitar · Hard</div>
                    </div>
                    <div className="lb-bar-wrap">
                      <div className="lb-bar"><div className="lb-bar-fill" style={{ width: ((1 - row.rank * 0.13) * 100) + "%" }}></div></div>
                    </div>
                    <div className="lb-score">{SCORE(row.score)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="results-actions" style={{ display: 'flex', gap: 14, height: 120 }}>
            <button className="action-btn">BACK TO SETLIST</button>
            <button className="start-btn results-next">
              <span className="start-btn-glow"></span>
              <span className="start-btn-label">CONTINUE</span>
              <span className="start-btn-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// SCREEN C — BAND RESULT (your score + band score)
// ============================================================
const BandResultScreen = () => (
  <div className="hifi-vp">
    <div className="hifi-body">
      <div className="results-bg" style={{ backgroundImage: 'url(assets/art/03.jpg)', position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(72px) saturate(160%)', transform: 'scale(1.2)', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(16,12,31,0.78), rgba(16,12,31,0.94))', zIndex: 0 }}></div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 22, height: '100%' }}>
        <div className="results-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div className="results-eyebrow">SET COMPLETE · VELOCITY · 4-PC</div>
            <div className="results-h">Crushed it.</div>
            <div className="results-sub">Glass Highway · Lunaris Velocity · Mixed difficulty</div>
          </div>
          <div className="tag-chip" style={{ fontSize: 18, padding: '10px 18px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 12px var(--accent)' }}></span>
            new band PB!
          </div>
        </div>

        <div className="band-result-grid">
          {/* LEFT — your individual score */}
          <div className="brc-self">
            <div className="brc-self-head">
              <div className="avatar s140" style={{ backgroundImage: 'url(assets/avatars/01.png)' }}></div>
              <div className="brc-self-headtext">
                <div className="brc-self-eyebrow">YOU · HOST</div>
                <div className="brc-self-name">RAEL</div>
                <div className="brc-self-instr">
                  <span className="brc-stat-pill">🎸 Guitar</span>
                  <span className="brc-stat-pill">Hard</span>
                  <span className="brc-stat-pill" style={{ color: 'var(--accent)', borderColor: 'color-mix(in oklab, var(--accent) 50%, transparent)' }}>MVP-2</span>
                </div>
              </div>
              <div className="brc-self-grade">A</div>
            </div>

            <div className="brc-self-score-block">
              <div className="brc-score-label">YOUR SCORE</div>
              <div className="brc-score-val">{SCORE(184720)}</div>
              <div className="brc-stars">★ ★ ★ ★ <span className="off">★</span></div>
            </div>

            <div className="brc-stats-grid">
              <div className="brc-mini"><div className="brc-mini-label">NOTES HIT</div><div className="brc-mini-val">412/438</div></div>
              <div className="brc-mini"><div className="brc-mini-label">BEST STREAK</div><div className="brc-mini-val">87</div></div>
              <div className="brc-mini"><div className="brc-mini-label">ACCURACY</div><div className="brc-mini-val">94.1%</div></div>
              <div className="brc-mini"><div className="brc-mini-label">BAND CONTRIB.</div><div className="brc-mini-val">29%</div></div>
            </div>
          </div>

          {/* RIGHT — band roster + total */}
          <div className="brc-band">
            <div className="brc-band-head">
              <div className="brc-band-title">VELOCITY</div>
              <div className="brc-band-tag">all 4 finished · ranked</div>
            </div>
            <div className="brc-band-list">
              <div className="brc-band-row is-host">
                <div className="avatar s72" style={{ backgroundImage: 'url(assets/avatars/01.png)' }}></div>
                <div>
                  <div className="brc-band-name">RAEL</div>
                  <div className="brc-band-instr">🎸 Guitar · Hard</div>
                </div>
                <div className="brc-band-stars">★★★★<span className="off">★</span></div>
                <div className="brc-band-pts">{SCORE(184720)}</div>
                <div className="brc-mvp is-2">MVP-2</div>
              </div>
              <div className="brc-band-row">
                <div className="avatar s72" style={{ backgroundImage: 'url(assets/avatars/03.png)' }}></div>
                <div>
                  <div className="brc-band-name">TED</div>
                  <div className="brc-band-instr">🥁 Drums · Normal</div>
                </div>
                <div className="brc-band-stars">★★★★★</div>
                <div className="brc-band-pts">{SCORE(201440)}</div>
                <div className="brc-mvp">MVP</div>
              </div>
              <div className="brc-band-row">
                <div className="avatar s72" style={{ backgroundImage: 'url(assets/avatars/02.jpg)' }}></div>
                <div>
                  <div className="brc-band-name">JOOLEENO</div>
                  <div className="brc-band-instr">🎤 Vocals · Expert</div>
                </div>
                <div className="brc-band-stars">★★★★<span className="off">★</span></div>
                <div className="brc-band-pts">{SCORE(172090)}</div>
                <div></div>
              </div>
              <div className="brc-band-row">
                <div className="avatar s72" style={{ backgroundImage: 'url(assets/avatars/04.png)' }}></div>
                <div>
                  <div className="brc-band-name">ABBIE</div>
                  <div className="brc-band-instr">🎹 Keys · Hard</div>
                </div>
                <div className="brc-band-stars">★★★<span className="off">★★</span></div>
                <div className="brc-band-pts">{SCORE(108990)}</div>
                <div></div>
              </div>
            </div>

            <div className="brc-total">
              <div>
                <div className="brc-total-label">BAND SCORE · VELOCITY</div>
                <div className="brc-total-sub">sum of all 4 finishers · ranked attempt</div>
              </div>
              <div className="brc-total-pb">
                <div className="brc-total-pb-label">BAND PB</div>
                <div className="brc-total-pb-val">612,400</div>
              </div>
              <div className="brc-total-now">
                <div className="brc-total-now-label">THIS RUN</div>
                <div className="brc-total-now-val">{SCORE(667240)}</div>
                <div className="brc-total-now-flag">↑ +54,840 · NEW PB</div>
              </div>
            </div>
          </div>
        </div>

        <div className="results-actions" style={{ display: 'flex', gap: 14, height: 120 }}>
          <button className="action-btn">BACK TO SETLIST</button>
          <button className="start-btn results-next">
            <span className="start-btn-glow"></span>
            <span className="start-btn-label">REWARDS</span>
            <span className="start-btn-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================
// SCREEN D — BAND INCOMPLETE (one member left mid-track)
// ============================================================
const BandIncompleteScreen = () => (
  <div className="hifi-vp">
    <div className="hifi-body">
      <div className="results-bg" style={{ backgroundImage: 'url(assets/art/09.jpg)', position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(72px) saturate(140%)', transform: 'scale(1.2)', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(16,12,31,0.82), rgba(16,12,31,0.95))', zIndex: 0 }}></div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 22, height: '100%' }}>
        <div className="results-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div className="results-eyebrow" style={{ color: 'var(--accent-3)' }}>SET COMPLETE · VELOCITY · INCOMPLETE</div>
            <div className="results-h">Run finished.</div>
            <div className="results-sub">Glass Highway · 3 of 4 finished · unranked attempt</div>
          </div>
          <div className="tag-chip" style={{ fontSize: 18, padding: '10px 18px', borderStyle: 'dashed', borderColor: 'var(--border-2)', color: 'var(--text-2)' }}>
            3 of 4 finished
          </div>
        </div>

        <div className="band-result-grid">
          {/* LEFT — your individual score (still tallies) */}
          <div className="brc-self">
            <div className="brc-self-head">
              <div className="avatar s140" style={{ backgroundImage: 'url(assets/avatars/01.png)' }}></div>
              <div className="brc-self-headtext">
                <div className="brc-self-eyebrow">YOU · HOST</div>
                <div className="brc-self-name">RAEL</div>
                <div className="brc-self-instr">
                  <span className="brc-stat-pill">🎸 Guitar</span>
                  <span className="brc-stat-pill">Hard</span>
                  <span className="brc-stat-pill" style={{ color: 'var(--accent)', borderColor: 'color-mix(in oklab, var(--accent) 50%, transparent)' }}>MVP-2</span>
                </div>
              </div>
              <div className="brc-self-grade">A</div>
            </div>

            <div className="brc-self-score-block">
              <div className="brc-score-label">YOUR SCORE</div>
              <div className="brc-score-val">{SCORE(184720)}</div>
              <div className="brc-stars">★ ★ ★ ★ <span className="off">★</span></div>
            </div>

            <div className="brc-stats-grid">
              <div className="brc-mini"><div className="brc-mini-label">NOTES HIT</div><div className="brc-mini-val">412/438</div></div>
              <div className="brc-mini"><div className="brc-mini-label">BEST STREAK</div><div className="brc-mini-val">87</div></div>
              <div className="brc-mini"><div className="brc-mini-label">ACCURACY</div><div className="brc-mini-val">94.1%</div></div>
              <div className="brc-mini"><div className="brc-mini-label">CONTRIB.</div><div className="brc-mini-val">37%</div></div>
            </div>

            <div style={{
              padding: '16px 20px', background: 'rgba(255,255,255,0.04)', border: '1px dashed var(--border-2)',
              borderRadius: 14, fontSize: 16, color: 'var(--text-2)', lineHeight: 1.4,
            }}>
              <span style={{ color: 'var(--accent-3)', fontWeight: 700, letterSpacing: '0.12em', fontSize: 13 }}>FAIRNESS NOTE</span><br/>
              Your personal score still counts. The band's PB doesn't move on an incomplete lineup.
            </div>
          </div>

          {/* RIGHT — band roster, Abbie greyed */}
          <div className="brc-band">
            <div className="brc-band-head">
              <div className="brc-band-title">VELOCITY</div>
              <div className="brc-band-tag">1 player left at 1:48 · unranked</div>
            </div>
            <div className="brc-band-list">
              <div className="brc-band-row is-host">
                <div className="avatar s72" style={{ backgroundImage: 'url(assets/avatars/01.png)' }}></div>
                <div>
                  <div className="brc-band-name">RAEL</div>
                  <div className="brc-band-instr">🎸 Guitar · Hard</div>
                </div>
                <div className="brc-band-stars">★★★★<span className="off">★</span></div>
                <div className="brc-band-pts">{SCORE(184720)}</div>
                <div className="brc-mvp is-2">MVP-2</div>
              </div>
              <div className="brc-band-row">
                <div className="avatar s72" style={{ backgroundImage: 'url(assets/avatars/03.png)' }}></div>
                <div>
                  <div className="brc-band-name">TED</div>
                  <div className="brc-band-instr">🥁 Drums · Normal</div>
                </div>
                <div className="brc-band-stars">★★★★★</div>
                <div className="brc-band-pts">{SCORE(201440)}</div>
                <div className="brc-mvp">MVP</div>
              </div>
              <div className="brc-band-row">
                <div className="avatar s72" style={{ backgroundImage: 'url(assets/avatars/02.jpg)' }}></div>
                <div>
                  <div className="brc-band-name">JOOLEENO</div>
                  <div className="brc-band-instr">🎤 Vocals · Expert</div>
                </div>
                <div className="brc-band-stars">★★★★<span className="off">★</span></div>
                <div className="brc-band-pts">{SCORE(172090)}</div>
                <div></div>
              </div>
              <div className="brc-band-row is-out">
                <div className="avatar s72" style={{ backgroundImage: 'url(assets/avatars/04.png)', filter: 'grayscale(0.8)' }}></div>
                <div>
                  <div className="brc-band-name" style={{ color: 'var(--text-3)' }}>ABBIE</div>
                  <div className="brc-band-instr">🎹 Keys · Hard · left at 1:48</div>
                </div>
                <div className="brc-band-stars" style={{ color: 'var(--text-3)' }}>— — — — —</div>
                <div className="brc-band-pts">not scored</div>
                <div><span className="brc-left-tag">⊘ LEFT EARLY</span></div>
              </div>
            </div>

            <div className="brc-total is-unranked">
              <div>
                <div className="brc-total-label">BAND SCORE · VELOCITY</div>
                <div className="brc-total-sub">sum of the 3 players who finished</div>
              </div>
              <div className="brc-total-pb">
                <div className="brc-total-pb-label">BAND PB</div>
                <div className="brc-total-pb-val">612,400</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.04em', marginTop: 4 }}>not eligible · incomplete lineup</div>
              </div>
              <div className="brc-total-now">
                <div className="brc-total-now-label" style={{ color: 'var(--text-3)' }}>THIS RUN</div>
                <div className="brc-total-now-val">{SCORE(558250)}</div>
                <div className="brc-total-now-flag">UNRANKED RUN</div>
              </div>
            </div>
          </div>
        </div>

        <div className="results-actions" style={{ display: 'flex', gap: 14, height: 120 }}>
          <button className="action-btn">BACK TO SETLIST</button>
          <button className="start-btn results-next">
            <span className="start-btn-glow"></span>
            <span className="start-btn-label">REWARDS</span>
            <span className="start-btn-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================
// SCREEN E — REWARDS REVEAL
// ============================================================
const RewardsScreen = () => (
  <div className="hifi-vp">
    <div className="hifi-body">
      <div className="results-bg" style={{ backgroundImage: 'url(assets/art/03.jpg)', position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(72px) saturate(160%)', transform: 'scale(1.2)', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(16,12,31,0.78), rgba(16,12,31,0.96))', zIndex: 0 }}></div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 18, height: '100%' }}>
        <div className="results-head">
          <div className="results-eyebrow">REWARDS EARNED</div>
          <div className="results-h">Stacked up.</div>
          <div className="results-sub">your payout + band payout · 2 badges · 1 unlock · 1 still locked</div>
        </div>

        {/* ─── ROW 1 — YOUR PAYOUT (SOLO/INDIVIDUAL) ─── */}
        <div className="rwd-section-label">
          <span className="rwd-section-bar"></span>
          <span className="rwd-section-eyebrow" style={{ color: 'var(--accent)' }}>YOUR PAYOUT · SOLO</span>
          <span className="rwd-section-tag">earned this run</span>
        </div>
        <div className="rewards-grid-hifi">
          {/* Hero — Picks haul */}
          <div className="rwd-hero">
            <div className="rwd-hero-eyebrow">YOUR PAYOUT</div>
            <div className="rwd-hero-title">+1,250<br/>PICKS</div>
            <div className="rwd-hero-sub">3× Trending bonus applied for a top-3 Velocity run on Glass Highway.</div>
            <div className="rwd-hero-pick">
              <div className="rwd-hero-pick-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-3 2-5 5-5 9 0 5 3 9 5 11 2-2 5-6 5-11 0-4-2-7-5-9z"/></svg>
              </div>
              <div className="rwd-hero-pick-text">
                <div className="rwd-hero-pick-name">PICK BALANCE</div>
                <div className="rwd-hero-pick-amt">16,070</div>
              </div>
            </div>
          </div>

          {/* XP + level */}
          <div className="rwd-tile rwd-c-xp">
            <div className="rwd-tile-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M11 21l-1-7H6l9-13-1 7h4z"/></svg>
            </div>
            <div className="rwd-tile-title">XP EARNED</div>
            <div className="rwd-tile-value">+3,420</div>
            <div className="rwd-tile-sub">Lv 27 → 28 · 920 to next</div>
            <div className="rwd-tile-bar"><div className="rwd-tile-bar-fill" style={{ width: '63%' }}></div></div>
          </div>

          {/* Badges */}
          <div className="rwd-tile rwd-c-badge">
            <div className="rwd-tile-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5l3.09 6.26L22 7.77l-5 4.87 1.18 6.88L12 16.27 5.82 19.52 7 12.64 2 7.77l6.91-1.01z"/></svg>
            </div>
            <div className="rwd-tile-title">2 NEW BADGES</div>
            <div className="rwd-tile-value">×2</div>
            <div className="rwd-tile-sub">Streak Master · 87-note streak<br/>Band Anchor · MVP-2 in a band run</div>
          </div>

          {/* Season pass */}
          <div className="rwd-tile rwd-c-season">
            <div className="rwd-tile-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M8 13l3 3 6-7"/></svg>
            </div>
            <div className="rwd-tile-title">SEASON PASS</div>
            <div className="rwd-tile-value">68%</div>
            <div className="rwd-tile-sub">Grammys · Week 4 · 2 days left</div>
            <div className="rwd-tile-bar"><div className="rwd-tile-bar-fill" style={{ width: '68%' }}></div></div>
            <div className="rwd-tile-meta">218 / 500 XP · keep your streak next track</div>
          </div>

          {/* Streak bonus */}
          <div className="rwd-tile rwd-c-streak">
            <div className="rwd-tile-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 0c-1.1 8.5-9.5 9-9.5 16.5C4 20.6 7.4 24 11.5 24S19 20.6 19 16.5c0-3.4-2-6.5-2-9 0-2 1-4 1-5l-4.5 1.5z"/></svg>
            </div>
            <div className="rwd-tile-title">DAILY STREAK</div>
            <div className="rwd-tile-value">DAY 12</div>
            <div className="rwd-tile-sub">+200 Picks bonus already in · keep it alive</div>
            <div className="rwd-tile-meta">next milestone: Day 14 → free pack</div>
          </div>

          {/* Locked */}
          <div className="rwd-tile" style={{ borderStyle: 'dashed', opacity: 0.7 }}>
            <div className="rwd-tile-icon" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-3)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M6 10V8a6 6 0 0112 0v2h1a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h1zm2 0h8V8a4 4 0 00-8 0v2z"/></svg>
            </div>
            <div className="rwd-tile-title" style={{ color: 'var(--text-2)' }}>HOLOGRAM SKIN</div>
            <div className="rwd-tile-value" style={{ color: 'var(--text-3)', fontSize: 38 }}>STILL LOCKED</div>
            <div className="rwd-tile-locked">⚿ 5-star Glass Highway on Expert</div>
          </div>
        </div>

        {/* ─── ROW 2 — VELOCITY · BAND PAYOUT ─── */}
        <div className="rwd-section-label">
          <span className="rwd-section-bar" style={{ background: 'var(--accent-2)' }}></span>
          <span className="rwd-section-eyebrow" style={{ color: 'var(--accent-2)' }}>VELOCITY · BAND PAYOUT</span>
          <span className="rwd-section-tag">splits the 4-piece haul · shared across the lineup</span>
        </div>
        <div className="rewards-band-grid">
          {/* Total Band Payout */}
          <div className="rwd-tile rwd-c-band rwd-band-tile">
            <div className="rwd-tile-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-3 2-5 5-5 9 0 5 3 9 5 11 2-2 5-6 5-11 0-4-2-7-5-9z"/></svg>
            </div>
            <div className="rwd-tile-title">TOTAL BAND PAYOUT</div>
            <div className="rwd-tile-value">+4,820 PICKS</div>
            <div className="rwd-tile-sub">band pot · split 4 ways → +1,205 ea. · band vault tops the rest</div>
            <div className="rwd-band-split">
              <div className="rwd-band-split-row">
                <div className="avatar s64" style={{ backgroundImage: 'url(assets/avatars/01.png)' }}></div>
                <div className="rwd-band-split-name">RAEL <span className="rwd-band-split-tag">YOU</span></div>
                <div className="rwd-band-split-val">+1,205</div>
              </div>
              <div className="rwd-band-split-row">
                <div className="avatar s64" style={{ backgroundImage: 'url(assets/avatars/03.png)' }}></div>
                <div className="rwd-band-split-name">TED</div>
                <div className="rwd-band-split-val">+1,205</div>
              </div>
              <div className="rwd-band-split-row">
                <div className="avatar s64" style={{ backgroundImage: 'url(assets/avatars/02.jpg)' }}></div>
                <div className="rwd-band-split-name">JOOLEENO</div>
                <div className="rwd-band-split-val">+1,205</div>
              </div>
              <div className="rwd-band-split-row">
                <div className="avatar s64" style={{ backgroundImage: 'url(assets/avatars/04.png)' }}></div>
                <div className="rwd-band-split-name">ABBIE</div>
                <div className="rwd-band-split-val">+1,205</div>
              </div>
            </div>
          </div>

          {/* Band Fame XP */}
          <div className="rwd-tile rwd-c-fame rwd-band-tile">
            <div className="rwd-tile-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13l4 4 8-8 4 4V3H3z"/></svg>
            </div>
            <div className="rwd-tile-title">BAND FAME XP</div>
            <div className="rwd-tile-value">+5,140</div>
            <div className="rwd-tile-sub">Band Lv 12 → 13 · unlocks Velocity tour-bus space</div>
            <div className="rwd-tile-bar"><div className="rwd-tile-bar-fill" style={{ width: '82%' }}></div></div>
            <div className="rwd-tile-meta">820 / 1,000 to Lv 13 · +25% new-PB multiplier</div>
            <div className="rwd-fame-stats">
              <div className="rwd-fame-stat">
                <div className="rwd-fame-stat-label">FANS GAINED</div>
                <div className="rwd-fame-stat-val">+118</div>
              </div>
              <div className="rwd-fame-stat">
                <div className="rwd-fame-stat-label">CHARTS</div>
                <div className="rwd-fame-stat-val">#14 ↑6</div>
              </div>
            </div>
          </div>

          {/* Band Badges */}
          <div className="rwd-tile rwd-c-bandbadge rwd-band-tile">
            <div className="rwd-tile-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5l3.09 6.26L22 7.77l-5 4.87 1.18 6.88L12 16.27 5.82 19.52 7 12.64 2 7.77l6.91-1.01z"/></svg>
            </div>
            <div className="rwd-tile-title">BAND BADGES</div>
            <div className="rwd-tile-value">2 EARNED</div>
            <div className="rwd-tile-sub">awarded to the whole lineup · live on every member's profile</div>
            <div className="rwd-band-badges">
              <div className="rwd-band-badge">
                <div className="rwd-band-badge-icon">★</div>
                <div className="rwd-band-badge-text">
                  <div className="rwd-band-badge-name">NEW BAND PB</div>
                  <div className="rwd-band-badge-sub">Glass Highway · 667,240</div>
                </div>
              </div>
              <div className="rwd-band-badge">
                <div className="rwd-band-badge-icon">⚡</div>
                <div className="rwd-band-badge-text">
                  <div className="rwd-band-badge-name">FULL LINEUP</div>
                  <div className="rwd-band-badge-sub">4-of-4 finish · ranked</div>
                </div>
              </div>
              <div className="rwd-band-badge is-locked">
                <div className="rwd-band-badge-icon">◇</div>
                <div className="rwd-band-badge-text">
                  <div className="rwd-band-badge-name">SET CONQUEROR</div>
                  <div className="rwd-band-badge-sub">5★ this track as a band</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================
// SCREEN F — END-OF-SESSION ACTIONS (Share / Replay / Play new)
// ============================================================
const EosActionsScreen = () => (
  <div className="hifi-vp">
    <div className="hifi-body">
      <div className="results-bg" style={{ backgroundImage: 'url(assets/art/03.jpg)', position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(72px) saturate(160%)', transform: 'scale(1.2)', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(16,12,31,0.80), rgba(16,12,31,0.96))', zIndex: 0 }}></div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 22, height: '100%' }}>
        <div className="results-head">
          <div className="results-eyebrow">WHAT'S NEXT</div>
          <div className="results-h">Run it back?</div>
          <div className="results-sub">share the highlight · replay same setup · or play a new track</div>
        </div>

        <div className="eos-grid">
          {/* SHARE — primary */}
          <div className="eos-card is-share">
            <div className="eos-icon-block">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
              </svg>
            </div>
            <div className="eos-card-title">SHARE<br/>THE CLIP</div>
            <div className="eos-card-sub">auto-generated highlight · drops onto the Quest home feed and your Vault</div>
            <div className="eos-clip-preview">
              <div className="eos-clip-art" style={{ backgroundImage: 'url(assets/art/03.jpg)' }}></div>
              <div className="eos-clip-shade"></div>
              <div className="eos-clip-play">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </div>
              <div className="eos-clip-meta">
                <span>VELOCITY · solo break · 0:14</span>
                <span className="eos-clip-len">9:16</span>
              </div>
            </div>
            <div className="eos-card-cta">
              <span>QUEST SHARE</span>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </div>
          </div>

          {/* REPLAY */}
          <div className="eos-card">
            <div className="eos-icon-block is-replay">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.41 3.59 8 8 8s8-3.59 8-8-3.59-8-8-8z"/>
              </svg>
            </div>
            <div className="eos-card-title">REPLAY</div>
            <div className="eos-card-sub">same track · same lineup · same loadouts · same difficulty. zero re-config.</div>
            <div style={{ marginTop: 24, padding: '20px 22px', background: 'rgba(0,0,0,0.35)', border: '1px solid var(--border)', borderRadius: 16 }}>
              <div style={{ fontSize: 13, letterSpacing: '0.24em', color: 'var(--text-3)', fontWeight: 700 }}>LOCKED-IN SETUP</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
                  <span>Glass Highway · Lunaris</span>
                  <span style={{ color: 'var(--text-3)' }}>3:42</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
                  <span>Velocity · 4-piece</span>
                  <span style={{ color: 'var(--text-3)' }}>4/4 ready</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
                  <span>You · 🎸 Guitar</span>
                  <span style={{ color: 'var(--text-3)' }}>Hard</span>
                </div>
              </div>
            </div>
            <div className="eos-card-cta">
              <span>RUN IT BACK</span>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </div>
          </div>

          {/* PLAY NEW */}
          <div className="eos-card">
            <div className="eos-icon-block is-new">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3l9 5-9 5-9-5 9-5zm9 9l-9 5-9-5"/>
              </svg>
            </div>
            <div className="eos-card-title">PLAY NEW<br/>TRACK / BAND</div>
            <div className="eos-card-sub">back to Perform with the same mode preselected · pick a different track or lineup</div>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 14 }}>
                <div style={{ width: 56, height: 56, borderRadius: 10, backgroundImage: 'url(assets/art/07.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Bebas Neue', fontSize: 22, lineHeight: 1, letterSpacing: '0.02em' }}>BURN STAIRWELL</div>
                  <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>up next · Iron Sundae</div>
                </div>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: '0.1em', color: 'var(--accent-3)' }}>SUGGESTED</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 14 }}>
                <div style={{ width: 56, height: 56, borderRadius: 10, backgroundImage: 'url(assets/art/11.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Bebas Neue', fontSize: 22, lineHeight: 1, letterSpacing: '0.02em' }}>MICROCASSETTE</div>
                  <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>in setlist · ON DECK</div>
                </div>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: '0.1em', color: 'var(--text-3)' }}>QUEUE</div>
              </div>
            </div>
            <div className="eos-card-cta">
              <span>PICK SOMETHING</span>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </div>
          </div>
        </div>

        {/* Track ref + secondary */}
        <div className="eos-footer">
          <div className="eos-footer-art" style={{ backgroundImage: 'url(assets/art/03.jpg)' }}></div>
          <div>
            <div className="eos-footer-title">JUST PLAYED · GLASS HIGHWAY</div>
            <div className="eos-footer-meta">Lunaris Velocity · Hard · final: 667,240 (band)</div>
          </div>
          <button className="eos-footer-secondary">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            BACK TO PERFORM
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================
// SCREEN G — QUEST SYSTEM HANDOFF (clip on headset)
// ============================================================
const QuestHandoffScreen = () => (
  <div className="hifi-vp">
    <div className="quest-screen">
      <div className="quest-bg-room" style={{
        background: 'radial-gradient(ellipse 60% 40% at 30% 50%, rgba(255,46,146,0.2), transparent 70%), linear-gradient(135deg, #1A0F36, #06060F)',
      }}></div>
      <div className="quest-shade"></div>

      <div className="quest-dock">
        <div className="quest-toast">
          <div className="quest-toast-icon">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.41 3.59 8 8 8s8-3.59 8-8-3.59-8-8-8z" transform="rotate(0)"/></svg>
          </div>
          <div className="quest-toast-text">
            <div className="quest-toast-app">JAMSESH · CLIP READY</div>
            <div className="quest-toast-title">Highlight saved to your Quest</div>
            <div className="quest-toast-sub">Glass_Highway_Velocity_Highlight_20260528.mp4 · 14s · ready to share</div>
          </div>
          <button className="quest-toast-btn">OPEN</button>
        </div>

        <div className="quest-preview" style={{ backgroundImage: 'url(assets/art/03.jpg)' }}>
          <div className="quest-preview-shade"></div>
          <div className="quest-preview-overlay">
            <div className="quest-preview-app-row">JAMSESH</div>
            <div className="quest-preview-title">Velocity · 87-streak break<br/>Glass Highway</div>
            <div className="quest-preview-meta">Today · 12:42 AM · 14s · 9:16</div>
          </div>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'grid', placeItems: 'center', boxShadow: '0 0 0 8px rgba(255,255,255,0.15)' }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="var(--bg-deep)"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 18 }}>
          <div className="quest-row">
            <div className="pill">⌂ HOME</div>
            <span>send to feed</span>
          </div>
          <div className="quest-row">
            <div className="pill">↗ SHARE</div>
            <span>route via Quest sharing</span>
          </div>
          <div className="quest-row">
            <div className="pill">⌄ GALLERY</div>
            <span>file naming: Track_Artist_Highlight_YYYYMMDD.mp4</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, {
  TransitionScreen,
  SoloResultScreen,
  BandResultScreen,
  BandIncompleteScreen,
  RewardsScreen,
  EosActionsScreen,
  QuestHandoffScreen,
});
