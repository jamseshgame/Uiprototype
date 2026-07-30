/* global React */
const { useState, useEffect, useRef, useMemo, useCallback } = React;
const { Avatar, IconBtn, Icon } = window.JamUI;

// ========================== PLAY (SOLO) SCREEN ==========================

const ModeTabs = ({ mode, onChange }) => {
  const modes = [
    { id: "solo",   label: "Solo"   },
    { id: "group",  label: "Multiplayer"  },
    { id: "battle", label: "Battle" },
  ];
  return (
    <div className="mode-tabs">
      {modes.map(m => (
        <button
          key={m.id}
          className={"mode-tab " + (mode === m.id ? "is-active" : "")}
          onClick={() => onChange(m.id)}
        >
          <span>{m.label}</span>
          {mode === m.id && <div className="mode-tab-underline"></div>}
        </button>
      ))}
      <div className="mode-tabs-spacer"></div>
    </div>
  );
};

const SongCard = ({ song, idx, active, onSelect, onPreview, onSwap, onRemove, playing, instrument, difficulty }) => (
  <div
    className={"song-card " + (active ? "is-active " : "") + (playing ? "is-playing" : "")}
    onClick={() => onSelect(idx)}
  >
    <div className="song-card-art" style={{ backgroundImage: `url(${song.art})` }}>
      <div className="song-card-art-shade"></div>
      <div className="song-card-num">{String(idx + 1).padStart(2, "0")}</div>
      <div className="song-card-actions">
        <button
          className={"sc-act sc-act-play " + (playing ? "is-on" : "")}
          onClick={(e) => { e.stopPropagation(); onPreview(idx); }}
          title="Preview"
        >
          {playing ? Icon.pause(26) : Icon.play(26)}
        </button>
        <button className="sc-act sc-act-swap" onClick={(e) => { e.stopPropagation(); onSwap(idx); }} title="Swap">
          {Icon.swap(26)}
        </button>
        <button className="sc-act sc-act-remove" onClick={(e) => { e.stopPropagation(); onRemove(idx); }} title="Remove">
          {Icon.x(26)}
        </button>
      </div>
      <div className="song-card-meta-wrap">
        <div className="song-card-title">{song.title}</div>
        <div className="song-card-artist">{song.artist}</div>
        <div className="song-card-stats">
          <span>{window.fmtDuration(song.duration)}</span>
          <span className="dot">•</span>
          <span>{song.bpm} BPM</span>
          <span className="dot">•</span>
          <span>{song.genre}</span>
        </div>
      </div>
    </div>
  </div>
);

const AddCard = ({ onClick }) => (
  <div className="song-card song-card-add" onClick={onClick}>
    <div className="add-circle">{Icon.plus(56)}</div>
    <div className="add-text">Add Track</div>
    <div className="add-sub">Browse 100+ tracks</div>
  </div>
);

const OptionTile = ({ label, value, sub, image, onClick, accent }) => (
  <div className="opt-tile" onClick={onClick}>
    <div className="opt-label">{label}</div>
    <div className="opt-body">
      {image && <div className="opt-img" style={{ backgroundImage: `url(${image})` }}></div>}
      <div className="opt-text">
        <div className="opt-value" style={accent ? { color: "var(--accent)" } : null}>{value}</div>
        {sub && <div className="opt-sub">{sub}</div>}
      </div>
    </div>
  </div>
);

const ApplyTile = ({ onClick }) => (
  <div className="opt-tile opt-tile-apply" onClick={onClick}>
    <div className="opt-label">UTILITY</div>
    <div className="opt-body opt-body-apply">
      <div className="opt-apply-icon">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h12M4 12h12M4 18h12"/><path d="M19 9l3 3-3 3"/></svg>
      </div>
      <div className="opt-text">
        <div className="opt-value">Apply to all</div>
        <div className="opt-sub">Copy these settings</div>
      </div>
    </div>
  </div>
);

const PlayScreen = ({ state, dispatch, onStart, onOpenPicker, hideConfig = false, configOnly = false, startLabel = "START", startIcon }) => {
  const active = state.setlist[state.activeIdx];
  const totalSec = state.setlist.reduce((sum, s) => sum + (s.duration || 0), 0);

  const configSections = (
    <React.Fragment>
      <div className="setlist-panel">
        {state.mode === "battle" && (
          <div className="battle-banner">
            <span className="battle-banner-pulse"></span>
            <span className="battle-banner-text">Battle Mode Coming Soon</span>
          </div>
        )}
        <div className="setlist-header">
          <div className="setlist-header-left">
            <div className="setlist-eyebrow">Now Up</div>
            <div className="setlist-title">{active.title}</div>
            <div className="setlist-artist">{active.artist} · {window.fmtDuration(active.duration)} · {active.bpm} BPM</div>
          </div>
          <div className="setlist-header-right">
            <div className="setlist-meta">
              <div className="setlist-meta-label">SETLIST</div>
              <div className="setlist-meta-value">{state.setlist.length} tracks · {window.fmtDuration(totalSec)}</div>
            </div>
            <div className="setlist-progress">
              {state.setlist.map((_, i) => (
                <div key={i} className={"sp-dot " + (i === state.activeIdx ? "is-on" : "")}></div>
              ))}
            </div>
          </div>
        </div>
        <div className="setlist-row">
          {state.setlist.map((song, idx) => (
            <SongCard
              key={song.id + "-" + idx}
              song={song}
              idx={idx}
              active={idx === state.activeIdx}
              onSelect={(i) => dispatch({ type: "SELECT", idx: i })}
              onPreview={(i) => dispatch({ type: "PREVIEW", idx: i })}
              onSwap={(i) => onOpenPicker("swap", i)}
              onRemove={(i) => dispatch({ type: "REMOVE", idx: i })}
              playing={state.previewIdx === idx}
              instrument={state.songInstruments[idx] || "guitar"}
              difficulty={state.songDiffs[idx] || "Normal"}
            />
          ))}
          {state.setlist.length < 4 && <AddCard onClick={() => onOpenPicker("add")} />}
        </div>
      </div>

      <div className="opts-panel">
        <div className="opts-header">
          <div className="opts-eyebrow">Configure · <span style={{ color: "var(--accent)" }}>{active.title}</span></div>
        </div>
        <div className="opts-row">
          <OptionTile
            label="INSTRUMENT"
            value={(state.songInstruments[state.activeIdx] || "guitar").replace(/^./, c => c.toUpperCase())}
            sub="Your role"
            image={"assets/instruments/" + (state.songInstruments[state.activeIdx] || "guitar") + ".png"}
            accent
            onClick={() => dispatch({ type: "OPEN_PICKER", picker: "instrument" })}
          />
          <OptionTile
            label="DIFFICULTY"
            value={state.songDiffs[state.activeIdx] || "Normal"}
            sub="Note density"
            onClick={() => dispatch({ type: "OPEN_PICKER", picker: "difficulty" })}
          />
          <OptionTile
            label="VIBE"
            value="Neon Coliseum"
            sub="Stage · Gem · FX"
            onClick={() => dispatch({ type: "OPEN_PICKER", picker: "experience" })}
          />
          <OptionTile
            label="SETLIST"
            value="Save / Load"
            sub="Manage your setlists"
            onClick={() => dispatch({ type: "TOAST", msg: "Open Setlists" })}
          />
        </div>
      </div>
    </React.Fragment>
  );

  if (configOnly) {
    return <div className="play-screen play-screen--config">{configSections}</div>;
  }

  return (
    <div className="play-screen">
      <ModeTabs mode={state.mode} onChange={(m) => dispatch({ type: "MODE", mode: m })} />

      {state.mode === "group" && (
        <MultiplayerPanel
          onOpenBands={() => dispatch({ type: "PAGE", page: "social" })}
          dispatch={dispatch}
        />
      )}

      {!hideConfig && configSections}

      <div className="action-row">
        <div className="action-row-left">
        </div>
        <button className="start-btn" onClick={onStart}>
          <span className="start-btn-glow"></span>
          <span className="start-btn-label">{startLabel}</span>
          <span className="start-btn-icon">{startIcon || Icon.play(40)}</span>
        </button>
      </div>
    </div>
  );
};

// ========================== OPTION PICKER MODAL ==========================

const OptionPicker = ({ open, type, state, dispatch }) => {
  if (!open) return null;
  let body = null;
  if (type === "instrument") {
    body = (
      <div className="picker-grid picker-grid--inst">
        {window.INSTRUMENTS.map(inst => (
          <button
            key={inst.id}
            className={"inst-card " + (inst.soon ? "is-soon " : "") + ((state.songInstruments[state.activeIdx] || "guitar") === inst.id ? "is-selected" : "")}
            disabled={inst.soon}
            onClick={() => dispatch({ type: "SET_INSTRUMENT", inst: inst.id })}
          >
            <div className="inst-card-img" style={{ backgroundImage: `url(${inst.icon})` }}></div>
            <div className="inst-card-name">{inst.name}</div>
            {inst.soon && <div className="inst-card-soon">Coming Soon</div>}
          </button>
        ))}
      </div>
    );
  } else if (type === "difficulty") {
    body = (
      <div className="picker-grid picker-grid--diff">
        {window.DIFFICULTIES.map(d => (
          <button
            key={d}
            className={"diff-card " + ((state.songDiffs[state.activeIdx] || "Normal") === d ? "is-selected" : "")}
            onClick={() => dispatch({ type: "SET_DIFFICULTY", diff: d })}
          >
            <div className="diff-card-dots">
              {[0,1,2,3].map(i => (
                <span key={i} className={"dd " + (i <= ["Easy","Normal","Hard","Expert"].indexOf(d) ? "on" : "")}></span>
              ))}
            </div>
            <div className="diff-card-name">{d}</div>
            <div className="diff-card-sub">
              {d === "Easy" ? "Forgiving timing" : d === "Normal" ? "Standard density" : d === "Hard" ? "Faster, more chords" : "All notes, no mercy"}
            </div>
          </button>
        ))}
      </div>
    );
  } else if (type === "experience") {
    const items = [
      { id: "neon", name: "Neon Coliseum", sub: "Stadium scale · 80K capacity", img: "assets/art/04.jpg" },
      { id: "abandoned", name: "Abandoned Garage", sub: "Intimate · 14 capacity", img: "assets/art/13.jpg" },
      { id: "cathedral", name: "Glass Cathedral", sub: "Acoustic · 600 capacity", img: "assets/art/16.jpg" },
      { id: "club", name: "Velvet Club", sub: "Underground · 250 capacity", img: "assets/art/09.jpg" },
    ];
    body = (
      <div className="picker-grid picker-grid--exp">
        {items.map(it => (
          <button key={it.id} className="exp-card">
            <div className="exp-card-img" style={{ backgroundImage: `url(${it.img})` }}>
              <div className="exp-card-shade"></div>
              <div className="exp-card-text">
                <div className="exp-card-name">{it.name}</div>
                <div className="exp-card-sub">{it.sub}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  }
  return (
    <div className="modal-scrim" onClick={() => dispatch({ type: "CLOSE_PICKER" })}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">
            {type === "instrument" ? "Choose your instrument" :
             type === "difficulty" ? "Pick a difficulty" :
             "Choose your venue"}
          </div>
          <div className="modal-sub">
            For "{state.setlist[state.activeIdx].title}"
          </div>
          <button className="modal-close" onClick={() => dispatch({ type: "CLOSE_PICKER" })}>{Icon.x(28)}</button>
        </div>
        <div className="modal-body">{body}</div>
      </div>
    </div>
  );
};

// ========================== SONG PICKER SCREEN ==========================

const PickerTile = ({ song, onPreview, playing, onAdd, intent }) => (
  <div className="picker-tile">
    <div className="picker-tile-art" style={{ backgroundImage: `url(${song.art})` }}>
      <div className="picker-tile-shade"></div>
      <div className="picker-tile-actions">
        <button
          className={"sc-act sc-act-play " + (playing ? "is-on" : "")}
          onClick={() => onPreview(song.id)}
        >
          {playing ? Icon.pause(22) : Icon.play(22)}
        </button>
        <button className="sc-act sc-act-add" onClick={() => onAdd(song)}>
          {intent === "swap" ? Icon.swap(22) : Icon.plus(22)}
        </button>
      </div>
      <div className="picker-tile-text">
        <div className="picker-tile-title">{song.title}</div>
        <div className="picker-tile-artist">{song.artist}</div>
      </div>
    </div>
    <div className="picker-tile-stats">
      <span>{song.genre}</span>
      <span className="dot">•</span>
      <span>{window.fmtDuration(song.duration)}</span>
      <span className="dot">•</span>
      <span>{song.bpm} BPM</span>
      <span className="picker-tile-plays">{song.plays} plays</span>
    </div>
  </div>
);

const PickerScreen = ({ pickerIntent, onClose, onAdd, onSwap, previewId, setPreviewId }) => {
  const [filterGenre, setFilterGenre]   = useState("All");
  const [filterDecade, setFilterDecade] = useState("All");
  const [sort, setSort]                 = useState("Trending");
  const [page, setPage] = useState(0);
  const PER = 9;

  const filtered = useMemo(() => {
    let s = window.SONG_CATALOG.slice();
    if (filterGenre !== "All")  s = s.filter(x => x.genre === filterGenre);
    if (filterDecade !== "All") s = s.filter(x => x.decade === filterDecade);
    if (sort === "BPM \u2191") s.sort((a, b) => a.bpm - b.bpm);
    if (sort === "BPM \u2193") s.sort((a, b) => b.bpm - a.bpm);
    if (sort === "A–Z")        s.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "Newest")     s.sort((a, b) => (b.decade > a.decade ? 1 : -1));
    return s;
  }, [filterGenre, filterDecade, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const pageSongs = filtered.slice(page * PER, (page + 1) * PER);

  useEffect(() => { setPage(0); }, [filterGenre, filterDecade, sort]);

  const handleAdd = (song) => {
    if (pickerIntent && pickerIntent.kind === "swap") onSwap(pickerIntent.idx, song);
    else onAdd(song);
  };

  return (
    <div className="picker-screen">
      <div className="picker-header">
        <div className="picker-header-left">
          <button className="picker-back" onClick={onClose}>
            {Icon.arrowLeft(28)}
            <span>Back to Setlist</span>
          </button>
          <div className="picker-title">
            <div className="picker-eyebrow">Browse</div>
            <div className="picker-h">All Tracks <span className="picker-count">{filtered.length}</span></div>
          </div>
        </div>
        <div className="picker-search">
          {Icon.search(22)}
          <span className="picker-search-placeholder">Search title, artist…</span>
        </div>
      </div>

      <div className="picker-filters">
        <div className="filter-group">
          <div className="filter-label">Genre</div>
          <div className="filter-chips">
            {window.GENRES.map(g => (
              <button
                key={g}
                className={"chip " + (filterGenre === g ? "is-on" : "")}
                onClick={() => setFilterGenre(g)}
              >{g}</button>
            ))}
          </div>
        </div>
        <div className="filter-divider"></div>
        <div className="filter-group">
          <div className="filter-label">Decade</div>
          <div className="filter-chips">
            {window.DECADES.map(d => (
              <button
                key={d}
                className={"chip " + (filterDecade === d ? "is-on" : "")}
                onClick={() => setFilterDecade(d)}
              >{d}</button>
            ))}
          </div>
        </div>
        <div className="filter-divider"></div>
        <div className="filter-group">
          <div className="filter-label">Sort</div>
          <div className="filter-chips">
            {window.SORTS.map(s => (
              <button
                key={s}
                className={"chip " + (sort === s ? "is-on" : "")}
                onClick={() => setSort(s)}
              >{s}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="picker-body">
        <div className="picker-grid-area">
          <div className="picker-grid">
            {pageSongs.map(song => (
              <PickerTile
                key={song.id}
                song={song}
                playing={previewId === song.id}
                onPreview={(id) => setPreviewId(previewId === id ? null : id)}
                onAdd={handleAdd}
                intent={pickerIntent ? pickerIntent.kind : "add"}
              />
            ))}
            {pageSongs.length < PER && Array.from({ length: PER - pageSongs.length }).map((_, i) => (
              <div key={"empty-" + i} className="picker-tile picker-tile--empty"></div>
            ))}
          </div>
        </div>
        <div className="picker-pager">
          <button
            className="pager-btn"
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
          >{Icon.arrowLeft(36)}</button>
          <div className="pager-readout">
            <div className="pager-num">{page + 1}</div>
            <div className="pager-sep">/</div>
            <div className="pager-total">{pages}</div>
          </div>
          <button
            className="pager-btn"
            disabled={page >= pages - 1}
            onClick={() => setPage(p => Math.min(pages - 1, p + 1))}
          >{Icon.arrowRight(36)}</button>
        </div>
      </div>
    </div>
  );
};

// ========================== GAMEPLAY SCREEN ==========================

const GameScreen = ({ song, instrument, difficulty, onFinish }) => {
  const TRAVEL_MS = 1500;
  const SPAWN_MS  = 360;
  const DURATION_MS = 9000;

  // Refs for live game state (mutated in rAF)
  const startRef       = useRef(performance.now());
  const lastSpawnRef   = useRef(performance.now());
  const seqRef         = useRef(0);
  const notesRef       = useRef([]);   // {id, lane, spawnAt}
  const finishedRef    = useRef(false);
  const scoreRef       = useRef(0);
  const streakRef      = useRef(0);
  const multRef        = useRef(1);
  const hitsRef        = useRef({ perfect: 0, good: 0, miss: 0 });
  const flashRef       = useRef(null);  // {lane, kind, at}

  // Force-render tick (incremented each frame)
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let raf;
    const loop = () => {
      const now = performance.now();
      const elapsed = now - startRef.current;

      // Spawn
      while (now - lastSpawnRef.current > SPAWN_MS) {
        notesRef.current.push({
          id: seqRef.current++,
          lane: Math.floor(Math.random() * 5),
          spawnAt: lastSpawnRef.current + SPAWN_MS,
        });
        lastSpawnRef.current += SPAWN_MS;
      }

      // Resolve notes that have crossed the hit line
      const remaining = [];
      for (let i = 0; i < notesRef.current.length; i++) {
        const n = notesRef.current[i];
        const t = (now - n.spawnAt) / TRAVEL_MS;
        if (t >= 1) {
          const r = Math.random();
          const outcome = r < 0.84 ? "perfect" : r < 0.96 ? "good" : "miss";
          hitsRef.current = { ...hitsRef.current, [outcome]: hitsRef.current[outcome] + 1 };
          if (outcome === "miss") {
            streakRef.current = 0;
            multRef.current = 1;
          } else {
            const pts = outcome === "perfect" ? 1200 : 600;
            scoreRef.current += pts * multRef.current;
            streakRef.current += 1;
            multRef.current = streakRef.current >= 30 ? 4
                            : streakRef.current >= 20 ? 3
                            : streakRef.current >= 10 ? 2 : 1;
            flashRef.current = { lane: n.lane, kind: outcome, at: now };
          }
        } else {
          remaining.push(n);
        }
      }
      notesRef.current = remaining;

      setTick(t => t + 1);

      if (elapsed >= DURATION_MS && !finishedRef.current) {
        finishedRef.current = true;
        cancelAnimationFrame(raf);
        onFinish({
          score:  scoreRef.current,
          hits:   hitsRef.current,
          streak: streakRef.current,
        });
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); finishedRef.current = true; };
  }, []);

  const now      = performance.now();
  const elapsed  = now - startRef.current;
  const progress = Math.max(0, Math.min(1, elapsed / DURATION_MS));
  const score    = scoreRef.current;
  const streak   = streakRef.current;
  const mult     = multRef.current;
  const hits     = hitsRef.current;
  const flash    = flashRef.current;

  // Lane colors — match the hyperpop palette
  const laneColors = ["#E8FF3A", "#FF2E92", "#B0A6DF", "#00E5C7", "#FF6F2E"];

  return (
    <div className="game-screen">
      <div className="game-bg" style={{ backgroundImage: `url(${song.art})` }}>
        <div className="game-bg-shade"></div>
      </div>

      <div className="game-hud-top">
        <button className="game-back" onClick={() => onFinish({ score, hits, streak })}>{Icon.arrowLeft(26)}</button>
        <div className="game-song">
          <div className="game-song-art" style={{ backgroundImage: `url(${song.art})` }}></div>
          <div>
            <div className="game-song-title">{song.title}</div>
            <div className="game-song-artist">{song.artist} · {instrument}</div>
          </div>
        </div>
        <div className="game-progress-wrap">
          <div className="game-progress-track">
            <div className="game-progress-fill" style={{ width: (progress * 100) + "%" }}></div>
          </div>
          <div className="game-progress-times">
            <span>{window.fmtDuration(Math.floor(progress * song.duration))}</span>
            <span>{window.fmtDuration(song.duration)}</span>
          </div>
        </div>
        <div className="game-score-mini">
          <div className="game-score-label">SCORE</div>
          <div className="game-score-val">{window.fmtScore(score)}</div>
        </div>
      </div>

      <div className="highway">
        <div className="highway-perspective">
          {laneColors.map((c, i) => (
            <div key={i} className="lane" style={{ "--lane-color": c }}>
              <div className="lane-glow"></div>
            </div>
          ))}
          {notesRef.current.map(n => {
            const t = (now - n.spawnAt) / TRAVEL_MS;
            return (
              <div
                key={n.id}
                className="note"
                style={{
                  "--lane": n.lane,
                  "--t": t,
                  "--lane-color": laneColors[n.lane],
                }}
              ></div>
            );
          })}
          <div className="hit-line">
            <div className="hit-line-bar"></div>
            {laneColors.map((c, i) => (
              <div key={i} className="hit-zone" style={{ background: c }}>
                {flash && flash.lane === i && now - flash.at < 240 && (
                  <div className={"hit-flash hit-" + flash.kind}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="game-hud-bottom">
        <div className="hud-card">
          <div className="hud-card-label">STREAK</div>
          <div className="hud-card-val">{streak}</div>
          <div className="hud-card-sub">notes in a row</div>
        </div>
        <div className="hud-card hud-card-mult">
          <div className="hud-card-label">MULTIPLIER</div>
          <div className="hud-card-val hud-card-val-mult">×{mult}</div>
          <div className="hud-mult-pips">
            {[1,2,3,4].map(p => (
              <span key={p} className={"pip " + (p <= mult ? "on" : "")}></span>
            ))}
          </div>
        </div>
        <div className="hud-card hud-card-tally">
          <div className="hud-tally-row"><span className="tally-dot tally-perf"></span><span>Perfect</span><span className="tally-n">{hits.perfect}</span></div>
          <div className="hud-tally-row"><span className="tally-dot tally-good"></span><span>Good</span><span className="tally-n">{hits.good}</span></div>
          <div className="hud-tally-row"><span className="tally-dot tally-miss"></span><span>Miss</span><span className="tally-n">{hits.miss}</span></div>
        </div>
      </div>
    </div>
  );
};

// ========================== RESULTS — SCORE ==========================

const grade = (score) => {
  if (score > 1300000) return { letter: "S", color: "var(--accent)" };
  if (score > 1000000) return { letter: "A", color: "#22c55e" };
  if (score > 700000)  return { letter: "B", color: "#facc15" };
  if (score > 400000)  return { letter: "C", color: "#fb923c" };
  return { letter: "D", color: "#ef4444" };
};

const ResultsScoreScreen = ({ song, result, onBack, onNext }) => {
  const [tab, setTab] = useState("you");
  const yourScore = result.score || 1162300;
  const g = grade(yourScore);
  const stats = [
    { label: "Notes Hit",   value: window.fmtScore(result.hits ? result.hits.perfect + result.hits.good : 412), sub: "of 438" },
    { label: "Best Streak", value: window.fmtScore(result.streak || 87), sub: "notes" },
    { label: "Accuracy",    value: "94.1%", sub: "" },
    { label: "Top Mult.",   value: "×4", sub: "max streak" },
  ];
  return (
    <div className="results-screen">
      <div className="results-bg" style={{ backgroundImage: `url(${song.art})` }}><div className="results-bg-shade"></div></div>
      <div className="results-head">
        <div className="results-eyebrow">SET COMPLETE</div>
        <div className="results-h">Results</div>
        <div className="results-sub">{song.title} · {song.artist}</div>
      </div>
      <div className="results-body results-body-1">
        <div className="results-left">
          <div className="results-art-wrap">
            <div className="results-art" style={{ backgroundImage: `url(${song.art})` }}></div>
            <div className="results-grade" style={{ color: g.color, borderColor: g.color }}>{g.letter}</div>
          </div>
          <div className="results-score-tabs">
            <button className={"rs-tab " + (tab === "you" ? "is-on" : "")} onClick={() => setTab("you")}>Me</button>
            <button className={"rs-tab " + (tab === "group" ? "is-on" : "")} onClick={() => setTab("group")}>Group</button>
          </div>
          <div className="results-score-big">
            <div className="rs-label">YOUR SCORE</div>
            <div className="rs-val">{window.fmtScore(yourScore)}</div>
          </div>
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
            <div className="lb-title">Leaderboard</div>
            <div className="lb-sub">Top 5 · this track · all difficulties</div>
          </div>
          <div className="lb-list">
            {window.LEADERBOARD.map(row => (
              <div key={row.rank} className={"lb-row " + (row.you ? "is-you" : "")}>
                <div className="lb-rank">#{row.rank}</div>
                <Avatar src={row.avatar} size={72} />
                <div className="lb-name-wrap">
                  <div className="lb-name">{row.name}{row.you && <span className="lb-tag">YOU</span>}</div>
                  <div className="lb-meta">Lv {37 - row.rank * 3} · Guitar · Hard</div>
                </div>
                <div className="lb-bar-wrap">
                  <div className="lb-bar"><div className="lb-bar-fill" style={{ width: ((1 - row.rank * 0.13) * 100) + "%" }}></div></div>
                </div>
                <div className="lb-score">{window.fmtScore(row.score)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="results-actions">
        <button className="action-btn" onClick={onBack}>Back to Setlist</button>
        <button className="start-btn results-next" onClick={onNext}>
          <span className="start-btn-glow"></span>
          <span className="start-btn-label">Continue</span>
          <span className="start-btn-icon">{Icon.arrowRight(36)}</span>
        </button>
      </div>
    </div>
  );
};

// ========================== RESULTS — REWARDS ==========================

const RewardCard = ({ title, sub, value, icon, accent }) => (
  <div className="reward-card" style={accent ? { boxShadow: `inset 0 0 0 1px ${accent}40, 0 0 60px ${accent}30` } : null}>
    <div className="reward-icon" style={accent ? { background: accent + "26", color: accent } : null}>{icon}</div>
    <div className="reward-body">
      <div className="reward-title">{title}</div>
      <div className="reward-value">{value}</div>
      <div className="reward-sub">{sub}</div>
    </div>
    <div className="reward-shimmer"></div>
  </div>
);

const ResultsRewardsScreen = ({ song, onBack, onContinue }) => (
  <div className="results-screen">
    <div className="results-bg" style={{ backgroundImage: `url(${song.art})` }}><div className="results-bg-shade"></div></div>
    <div className="results-head">
      <div className="results-eyebrow">REWARDS EARNED</div>
      <div className="results-h">Nice set.</div>
      <div className="results-sub">You leveled up + unlocked 2 new items.</div>
    </div>
    <div className="results-body results-body-2">
      <div className="rewards-grid">
        <RewardCard
          title="JamPicks"
          value="+1,250"
          sub="3× Trending bonus applied"
          accent="var(--accent)"
          icon={<svg width="56" height="56" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-3 2-5 5-5 9 0 5 3 9 5 11 2-2 5-6 5-11 0-4-2-7-5-9z"/></svg>}
        />
        <RewardCard
          title="Badges"
          value="2 New"
          sub="Streak Master · Encore Stage"
          accent="#facc15"
          icon={Icon.star(56)}
        />
        <RewardCard
          title="XP"
          value="+3,420"
          sub="Lv 27 → 28 (920 to next)"
          accent="#22c55e"
          icon={Icon.bolt(56)}
        />
        <RewardCard
          title="Season Pass"
          value="68%"
          sub="Grammys · Week 4 · 2 days left"
          accent="#3b82f6"
          icon={
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"/><path d="M8 13l3 3 6-7"/></svg>
          }
        />
      </div>
    </div>
    <div className="results-actions">
      <button className="action-btn" onClick={onBack}>Back to Setlist</button>
      <button className="start-btn results-next" onClick={onContinue}>
        <span className="start-btn-glow"></span>
        <span className="start-btn-label">Done</span>
        <span className="start-btn-icon">{Icon.check(36)}</span>
      </button>
    </div>
  </div>
);

// ========================== SOCIAL SCREEN ==========================

const GROUPS = [
  { id: "velocity",   name: "Velocity",       members: 8,  cap: 10, art: "assets/bands/01.jpg", tagline: "Pop-punk · est. 2024", live: true,  member: true,  role: "Lead Guitar",  onlineNow: 4 },
  { id: "lunaris",    name: "Neon Phantoms",  members: 10, cap: 10, art: "assets/logos/neon-phantoms.png", tagline: "K-pop · 2.4k plays this wk" },
  { id: "iron",       name: "Iron Eclipse",   members: 6,  cap: 10, art: "assets/bands/03.jpg", tagline: "Metalcore · 14 tour stops",                  member: true,  role: "Rhythm Guitar", onlineNow: 2 },
  { id: "arcane",     name: "Arcane Ritual",  members: 9,  cap: 10, art: "assets/bands/04.jpg", tagline: "Doom · weekly jams Thu", live: true },
  { id: "cyberpulse", name: "Cyber-Pulse",    members: 7,  cap: 10, art: "assets/bands/05.png", tagline: "Synth-industrial" },
  { id: "bass",       name: "Bass Bandits",   members: 5,  cap: 10, art: "assets/bands/06.png", tagline: "Funk · grooves only" },
  { id: "ghost",      name: "Velvet Crush",   members: 10, cap: 10, art: "assets/bands/07.png", tagline: "Folk-rock · Atlantic tour",                   member: true,  role: "Bass",          onlineNow: 1 },
];

const FRIENDS = [
  { id: "jooleeno", name: "Jooleeno", avatar: "assets/avatars/02.jpg", lv: 41, status: "playing",  detail: "Jamming · Glass Highway · Vocals" },
  { id: "ted",      name: "Ted",      avatar: "assets/avatars/03.png", lv: 33, status: "online",   detail: "In the Velvet Club lobby" },
  { id: "abbie",    name: "Abbie",    avatar: "assets/avatars/04.png", lv: 47, status: "playing",  detail: "Battle · Iron Sundae · Drums" },
  { id: "arthen",   name: "Arthen",   avatar: "assets/avatars/05.jpg", lv: 22, status: "online",   detail: "Browsing the Store" },
  { id: "mira",     name: "Mira",     avatar: "assets/avatars/04.png", lv: 18, status: "offline",  detail: "Last seen 2h ago" },
  { id: "kai",      name: "Kai",      avatar: "assets/avatars/03.png", lv: 29, status: "offline",  detail: "Last seen yesterday" },
];

const GroupCard = ({ group, onOpen }) => (
  <div className="grp-card" onClick={onOpen}>
    <div className="grp-card-art" style={{ backgroundImage: `url(${group.art})` }}>
      <div className="grp-card-shade"></div>
      {group.live && (
        <div className="grp-card-live">
          <span className="grp-live-dot"></span>
          <span>LIVE NOW</span>
        </div>
      )}
      <div className="grp-card-foot">
        <div className="grp-card-name">{group.name}</div>
        <div className="grp-card-tag">{group.tagline}</div>
        <div className="grp-card-meta">
          <div className="grp-card-members">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            <span>{group.members}<span className="grp-card-cap">/{group.cap}</span></span>
          </div>
          <div className="grp-card-cta">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CreateGroupCard = ({ onClick }) => (
  <div className="grp-card grp-card-new" onClick={onClick}>
    <div className="grp-card-new-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
    </div>
    <div className="grp-card-new-text">Start a Band</div>
    <div className="grp-card-new-sub">Pick a logo, invite friends, jam</div>
  </div>
);

const StatusPill = ({ status }) => {
  const map = {
    playing: { label: "JAMMING", cls: "playing" },
    online:  { label: "ONLINE",  cls: "online"  },
    offline: { label: "OFFLINE", cls: "offline" },
  };
  const m = map[status] || map.offline;
  return (
    <div className={"fr-status fr-status-" + m.cls}>
      <span className="fr-status-dot"></span>
      <span>{m.label}</span>
    </div>
  );
};

const FriendRow = ({ friend }) => (
  <div className="fr-row">
    <Avatar src={friend.avatar} size={84} />
    <div className="fr-text">
      <div className="fr-row-top">
        <div className="fr-name">{friend.name}</div>
        <StatusPill status={friend.status} />
      </div>
      <div className="fr-meta">Lv {friend.lv} · {friend.detail}</div>
    </div>
    <div className="fr-actions">
      {friend.status === "playing" && (
        <button className="fr-btn fr-btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z"/></svg>
          Spectate
        </button>
      )}
      {friend.status === "online" && (
        <button className="fr-btn fr-btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M3 14l9 5 9-5"/></svg>
          Invite
        </button>
      )}
      <button className="fr-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
        Chat
      </button>
    </div>
  </div>
);

const MultiplayerPanel = ({ onOpenBands, dispatch }) => {
  const myBands = GROUPS.filter(g => g.member);
  const friendsOnline = FRIENDS.filter(f => f.status !== "offline");
  const totalOnline = myBands.reduce((s, b) => s + (b.onlineNow || 0), 0);
  return (
    <div className="mp-panel">
      <div className="mp-panel-head">
        <div className="mp-panel-head-left">
          <div className="mp-eyebrow">Multiplayer · Your Crew</div>
          <div className="mp-title">Who are you jamming with?</div>
        </div>
        <div className="mp-panel-head-right">
          <div className="mp-summary-pill">
            <span className="mp-summary-dot mp-summary-dot--jam"></span>
            <span><strong>{totalOnline}</strong> bandmates online</span>
          </div>
          <div className="mp-summary-pill">
            <span className="mp-summary-dot mp-summary-dot--on"></span>
            <span><strong>{friendsOnline.length}</strong> friends online</span>
          </div>
          <button className="mp-summary-cta" onClick={onOpenBands}>
            <span>Full Bandmates</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
          </button>
        </div>
      </div>

      <div className="mp-panel-body">
        <div className="mp-col mp-col-friends">
          <div className="mp-col-head">
            <div className="mp-col-h">Friends Online</div>
            <div className="mp-col-sub">{friendsOnline.length} ready to play · invite to this session</div>
          </div>
          <div className="mp-friend-list">
            {friendsOnline.map(f => (
              <div key={f.id} className="mp-friend-row">
                <Avatar src={f.avatar} size={56} />
                <div className="mp-friend-text">
                  <div className="mp-friend-top">
                    <div className="mp-friend-name">{f.name}</div>
                    <div className={"mp-friend-status mp-friend-status--" + (f.status === "playing" ? "jam" : "on")}>
                      <span className="mp-friend-status-dot"></span>
                      <span>{f.status === "playing" ? "JAMMING" : "ONLINE"}</span>
                    </div>
                  </div>
                  <div className="mp-friend-meta">Lv {f.lv} · {f.detail}</div>
                </div>
                <button
                  className={"mp-friend-btn " + (f.status === "playing" ? "is-secondary" : "is-primary")}
                  onClick={() => dispatch({ type: "TOAST", msg: (f.status === "playing" ? "Spectating · " : "Invited · ") + f.name })}
                >
                  {f.status === "playing" ? "Spectate" : "Invite"}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mp-col mp-col-bands">
          <div className="mp-col-head">
            <div className="mp-col-h">Your Bands</div>
            <div className="mp-col-sub">{myBands.length} bands · pick one to jam with</div>
          </div>
          <div className="mp-band-row">
            {myBands.map(b => (
              <div
                key={b.id}
                className={"mp-band-card " + (b.live ? "is-live" : "")}
                onClick={() => dispatch({ type: "TOAST", msg: "Selected · " + b.name })}
              >
                <div className="mp-band-art" style={{ backgroundImage: `url(${b.art})` }}>
                  <div className="mp-band-shade"></div>
                  {b.live && (
                    <div className="mp-band-live">
                      <span className="mp-band-live-dot"></span>
                      <span>LIVE</span>
                    </div>
                  )}
                </div>
                <div className="mp-band-info">
                  <div className="mp-band-name">{b.name}</div>
                  <div className="mp-band-role">Your role · {b.role}</div>
                  <div className="mp-band-meta">
                    <div className="mp-band-online">
                      <span className="mp-band-online-dot"></span>
                      <span><strong>{b.onlineNow}</strong> of {b.members} online</span>
                    </div>
                    <div className="mp-band-cta">Jam →</div>
                  </div>
                </div>
              </div>
            ))}
            <div
              className="mp-band-card mp-band-card-new"
              onClick={() => dispatch({ type: "TOAST", msg: "Open create-band flow" })}
            >
              <div className="mp-band-new-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              </div>
              <div className="mp-band-new-text">Start a Band</div>
              <div className="mp-band-new-sub">Invite friends, jam</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SocialScreen = ({ onCreate, onOpenGroup }) => {
  const [tab, setTab] = useState("groups");
  const onlineCount = FRIENDS.filter(f => f.status !== "offline").length;
  const jammingCount = FRIENDS.filter(f => f.status === "playing").length;
  return (
    <div className="social-screen">
      <div className="social-header">
        <div className="social-tabs">
          <button className={"social-tab " + (tab === "friends" ? "is-on" : "")} onClick={() => setTab("friends")}>
            <span>Friends</span>
            <span className="social-tab-count">{FRIENDS.length}</span>
          </button>
          <button className={"social-tab " + (tab === "groups" ? "is-on" : "")} onClick={() => setTab("groups")}>
            <span>Bands</span>
            <span className="social-tab-count">{GROUPS.length}</span>
          </button>
        </div>
        <div className="social-summary">
          <div className="social-summary-pill">
            <span className="social-summary-dot social-summary-dot--jam"></span>
            <span><strong>{jammingCount}</strong> jamming</span>
          </div>
          <div className="social-summary-pill">
            <span className="social-summary-dot social-summary-dot--on"></span>
            <span><strong>{onlineCount}</strong> online</span>
          </div>
          <button className="social-summary-cta">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>
            <span>Add Friend</span>
          </button>
        </div>
      </div>

      {tab === "groups" && (
        <div className="grp-grid">
          <CreateGroupCard onClick={onCreate} />
          {GROUPS.map(g => <GroupCard key={g.id} group={g} onOpen={() => onOpenGroup && onOpenGroup(g)} />)}
        </div>
      )}

      {tab === "friends" && (
        <div className="fr-panel">
          <div className="fr-section-head">
            <div className="fr-section-h">Now Jamming</div>
            <div className="fr-section-sub">{jammingCount} friends mid-session</div>
          </div>
          <div className="fr-list">
            {FRIENDS.filter(f => f.status === "playing").map(f => <FriendRow key={f.id} friend={f} />)}
          </div>
          <div className="fr-section-head">
            <div className="fr-section-h">Online</div>
            <div className="fr-section-sub">{FRIENDS.filter(f => f.status === "online").length} ready to play</div>
          </div>
          <div className="fr-list">
            {FRIENDS.filter(f => f.status === "online").map(f => <FriendRow key={f.id} friend={f} />)}
          </div>
          <div className="fr-section-head fr-section-muted">
            <div className="fr-section-h">Offline</div>
            <div className="fr-section-sub">{FRIENDS.filter(f => f.status === "offline").length} away</div>
          </div>
          <div className="fr-list fr-list-muted">
            {FRIENDS.filter(f => f.status === "offline").map(f => <FriendRow key={f.id} friend={f} />)}
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================
   SPACES SCREEN — three tiles
   ============================================================ */

const SPACES = [
  {
    id: "personal-studio",
    name: "Personal Studio",
    tag: "Your warehouse · solo or invite",
    slotId: "spaces-personal-studio",
    slotSrc: "assets/spaces/personal-studio.png",
    slotPlaceholder: "Drop a warehouse studio shot",
    occupants: "1",
    mood: "PRIVATE",
  },
  {
    id: "retro-90s-room",
    name: "Retro 90s Room",
    tag: "Cassette decks · CRT glow",
    slotId: "spaces-retro-90s",
    slotPlaceholder: "Drop a 90s bedroom shot",
    occupants: "4",
    mood: "HANGOUT",
  },
  {
    id: "k-pop-forever",
    name: "K-Pop Forever",
    tag: "Stage lights · idol energy",
    slotId: "spaces-k-pop",
    slotPlaceholder: "Drop a K-pop stage shot",
    occupants: "12",
    mood: "LIVE",
  },
];

const SpaceCard = ({ space, onEnter }) => (
  <div className="space-card" onClick={onEnter}>
    <div className="space-card-art">
      <image-slot
        id={space.slotId}
        src={space.slotSrc}
        shape="rect"
        placeholder={space.slotPlaceholder}
        style={{ width: "100%", height: "100%", display: "block" }}
      ></image-slot>
    </div>
    <div className="space-card-shade"></div>
    <div className="space-card-mood">{space.mood}</div>
    <div className="space-card-foot">
      <div className="space-card-name">{space.name}</div>
      <div className="space-card-tag">{space.tag}</div>
      <div className="space-card-meta">
        <div className="space-card-occupants">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>
          <span>{space.occupants} inside</span>
        </div>
        <div className="space-card-cta">
          <span>ENTER</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
        </div>
      </div>
    </div>
  </div>
);

const SpacesScreen = ({ onEnter }) => (
  <div className="spaces-screen">
    <div className="spaces-grid">
      {SPACES.map(s => <SpaceCard key={s.id} space={s} onEnter={() => onEnter && onEnter(s)} />)}
    </div>
  </div>
);

/* ============================================================
   CREATOR SCREEN — tabs + tiles
   ============================================================ */

const CREATOR_CONTENT = {
  clips: {
    addLabel: "Record Clip",
    tiles: [
      { id: "clip-1", title: "Solo Riff",        meta: "0:42 · 4 likes",   slotId: "creator-clip-1" },
      { id: "clip-2", title: "Bridge Drop",      meta: "0:18 · 12 likes",  slotId: "creator-clip-2" },
      { id: "clip-3", title: "Bedroom Take",     meta: "1:04 · 31 likes",  slotId: "creator-clip-3" },
      { id: "clip-4", title: "Live · The Collection", meta: "2:11 · 88 likes",  slotId: "creator-clip-4" },
      { id: "clip-5", title: "Late Night Jam",   meta: "0:55 · 7 likes",   slotId: "creator-clip-5" },
    ],
  },
  "band-art": {
    addLabel: "New Artwork",
    tiles: [
      { id: "art-1", title: "Velvet Static",     meta: "Cover · Single",    slotId: "creator-art-1" },
      { id: "art-2", title: "Glass Highway",     meta: "Cover · EP",        slotId: "creator-art-2" },
      { id: "art-3", title: "Tour Flyer 03",     meta: "Poster · A2",       slotId: "creator-art-3" },
      { id: "art-4", title: "Logo Mark",         meta: "Brand · Primary",   slotId: "creator-art-4" },
      { id: "art-5", title: "Merch Sketch",      meta: "Tee · Front",       slotId: "creator-art-5" },
    ],
  },
  "my-tracks": {
    addLabel: "New Track",
    tiles: [
      { id: "trk-1", title: "Neon Bloom",        meta: "3:24 · Original",   slotId: "creator-trk-1" },
      { id: "trk-2", title: "Static Heart",      meta: "2:48 · Demo",       slotId: "creator-trk-2" },
      { id: "trk-3", title: "Bedroom Ghosts",    meta: "4:02 · Mixed",      slotId: "creator-trk-3" },
      { id: "trk-4", title: "Patchwork Sky",     meta: "3:11 · Mastered",   slotId: "creator-trk-4" },
      { id: "trk-5", title: "Slow Burn",         meta: "5:33 · WIP",        slotId: "creator-trk-5" },
    ],
  },
};

const CREATOR_TABS = [
  { id: "clips",     label: "Clips" },
  { id: "band-art",  label: "Band Art" },
  { id: "my-tracks", label: "My Tracks" },
];

const CreateTile = ({ label, onClick }) => (
  <div className="cr-tile cr-tile-new" onClick={onClick}>
    <div className="cr-tile-new-icon">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
    </div>
    <div className="cr-tile-new-text">{label}</div>
  </div>
);

const CreatorTile = ({ tile, onOpen }) => (
  <div className="cr-tile" onClick={onOpen}>
    <div className="cr-tile-art">
      <image-slot
        id={tile.slotId}
        shape="rect"
        placeholder="Drop image"
        style={{ width: "100%", height: "100%", display: "block" }}
      ></image-slot>
    </div>
    <div className="cr-tile-shade"></div>
    <div className="cr-tile-foot">
      <div className="cr-tile-title">{tile.title}</div>
      <div className="cr-tile-meta">{tile.meta}</div>
    </div>
  </div>
);

const CreatorScreen = ({ onCreate, onOpenTile }) => {
  const [tab, setTab] = useState("clips");
  const data = CREATOR_CONTENT[tab];
  return (
    <div className="creator-screen">
      <div className="cr-tabs">
        {CREATOR_TABS.map(t => (
          <button
            key={t.id}
            className={"cr-tab " + (tab === t.id ? "is-on" : "")}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="cr-grid">
        <CreateTile label={data.addLabel} onClick={() => onCreate && onCreate(tab)} />
        {data.tiles.map(tile => (
          <CreatorTile key={tile.id} tile={tile} onOpen={() => onOpenTile && onOpenTile(tile)} />
        ))}
      </div>
    </div>
  );
};

/* ============================================================
   HOME SCREEN — hero + 3 promo tiles
   ============================================================ */

const HomeScreen = ({ onNav, onToast }) => {
  const tiles = [
    {
      id: "store",
      kicker: "STORE",
      title: "Golden Stratocaster",
      sub: "10,000 Picks · 7 days left",
      slot: "home-tile-store",
      placeholder: "Featured gear",
      page: "store",
    },
    {
      id: "vault",
      kicker: "COLLECTION",
      title: "2 New Items Unlocked",
      sub: "Check out your new gear",
      slot: "home-tile-vault",
      placeholder: "Collection preview",
      badge: "2",
      page: "store",
    },
    {
      id: "creator",
      kicker: "CREATOR",
      title: "Your Creations",
      sub: "Build and share content",
      slot: "home-tile-creator",
      placeholder: "Band / creator art",
      page: "creator",
    },
  ];

  return (
    <div className="home-screen">
      <div
        className="home-hero"
        onClick={() => onNav && onNav("play")}
      >
        <div className="home-hero-art">
          <image-slot
            id="home-hero"
            shape="rect"
            placeholder="Main Stage hero image"
            style={{ width: "100%", height: "100%", display: "block" }}
          ></image-slot>
        </div>
        <div className="home-hero-shade"></div>
        <div className="home-hero-glow"></div>
        <div className="home-hero-foot">
          <div className="home-hero-kicker">
            <span className="home-hero-pulse"></span>
            <span>LIVE NOW</span>
          </div>
          <div className="home-hero-title">Perform Now</div>
          <div className="home-hero-sub">Head to the Main Stage</div>
        </div>
        <div className="home-hero-cta">
          {Icon.play(48)}
        </div>
      </div>

      <div className="home-tiles">
        {tiles.map(t => (
          <div
            key={t.id}
            className={"home-tile home-tile-" + t.id}
            onClick={() => onNav && onNav(t.page)}
          >
            <div className="home-tile-art">
              <image-slot
                id={t.slot}
                shape="rect"
                placeholder={t.placeholder}
                style={{ width: "100%", height: "100%", display: "block" }}
              ></image-slot>
            </div>
            <div className="home-tile-shade"></div>
            {t.badge && <div className="home-tile-badge">{t.badge}</div>}
            <div className="home-tile-foot">
              <div className="home-tile-kicker">{t.kicker}</div>
              <div className="home-tile-title">{t.title}</div>
              <div className="home-tile-sub">{t.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ========================== STORE SCREEN ==========================

const priceFor = (track) => {
  const plays = parseFloat(track.plays || "0");
  const M = track.plays && track.plays.endsWith("M") ? plays : plays / 1000;
  if (M >= 10) return "£3.99";
  if (M >= 5)  return "£3.49";
  if (M >= 2)  return "£2.99";
  if (M >= 1)  return "£2.49";
  return "£1.99";
};

const StoreTracks = () => {
  const [query, setQuery] = useState("");
  const listRef = useRef(null);
  const scrollDown = () => {
    const el = listRef.current;
    if (!el) return;
    const row = el.querySelector(".store-row");
    const step = row ? (row.getBoundingClientRect().height + 8) * 3 : el.clientHeight * 0.6;
    el.scrollBy({ top: step, behavior: "smooth" });
  };
  const catalog = window.SONG_CATALOG || [];
  const hero = catalog[0];
  const featured = [catalog[1], catalog[2]];
  const featuredIds = new Set([hero?.id, featured[0]?.id, featured[1]?.id]);
  const rest = catalog.filter(t => !featuredIds.has(t.id));
  const filtered = rest.filter(t => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q);
  });

  if (!hero) return null;

  return (
    <div className="store-tracks">
      <div className="store-col store-col--left">
        <div className="store-hero" style={{ backgroundImage: `url(${hero.art})` }}>
          <div className="store-hero-shade"></div>
          <div className="store-hero-body">
            <div className="store-hero-eyebrow">FEATURED TRACK</div>
            <div className="store-hero-title">{hero.title}</div>
            <div className="store-hero-artist">{hero.artist}</div>
            <div className="store-hero-meta">
              <span>{hero.genre}</span>
              <span className="dot">•</span>
              <span>{window.fmtDuration(hero.duration)}</span>
              <span className="dot">•</span>
              <span>{hero.bpm} BPM</span>
              <span className="dot">•</span>
              <span>{hero.plays} plays</span>
            </div>
            <div className="store-hero-cta-row">
              <button className="store-hero-buy">
                <span className="store-hero-price">{priceFor(hero)}</span>
                <span className="store-hero-buy-label">Buy Track</span>
              </button>
              <button className="store-hero-preview">{Icon.play(26)}<span>Preview</span></button>
            </div>
          </div>
          <div className="store-hero-tag">NEW</div>
        </div>
        <div className="store-feat-row">
          {featured.map((t, i) => t && (
            <div key={t.id} className={"store-feat-card " + (i === 0 ? "is-special" : "")} style={{ backgroundImage: `url(${t.art})` }}>
              <div className="store-feat-shade"></div>
              {i === 0 && (
                <div className="store-feat-tag">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.5 2a1.5 1.5 0 0 0-1.06.44L2.44 10.44a1.5 1.5 0 0 0 0 2.12l9 9a1.5 1.5 0 0 0 2.12 0l8-8a1.5 1.5 0 0 0 .44-1.06V3.5A1.5 1.5 0 0 0 20.5 2zM17 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>
                  <span>SPECIAL</span>
                </div>
              )}
              <div className="store-feat-body">
                <div className="store-feat-title">{t.title}</div>
                <div className="store-feat-artist">{t.artist}</div>
                <div className="store-feat-foot">
                  <span className="store-feat-meta">{t.genre} · {window.fmtDuration(t.duration)}</span>
                  {i === 0 ? (
                    <span className="store-feat-price-group">
                      <span className="store-feat-price-was">{priceFor(t)}</span>
                      <span className="store-feat-price store-feat-price--sale">£0.99</span>
                    </span>
                  ) : (
                    <span className="store-feat-price">{priceFor(t)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="store-col store-col--right">
        <div className="store-search">
          <span className="store-search-icon">{Icon.search ? Icon.search(22) : "⌕"}</span>
          <input
            className="store-search-input"
            placeholder="Search tracks or artists"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className="store-search-clear" onClick={() => setQuery("")} aria-label="Clear">×</button>
          )}
        </div>
        <div className="store-list-wrap">
          <div className="store-list" ref={listRef}>
            {filtered.map(t => (
              <div key={t.id} className="store-row">
                <div className="store-row-art" style={{ backgroundImage: `url(${t.art})` }}></div>
                <div className="store-row-text">
                  <div className="store-row-title">{t.title}</div>
                  <div className="store-row-artist">{t.artist} · {t.genre} · {window.fmtDuration(t.duration)}</div>
                </div>
                <div className="store-row-price">{priceFor(t)}</div>
                <button className="store-row-buy">Buy</button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="store-list-empty">No tracks match "{query}"</div>
            )}
          </div>
          <button className="store-list-arrow" onClick={scrollDown} aria-label="Scroll down">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const StorePacks = () => {
  const art = (n) => `assets/art/${String(n).padStart(2, "0")}.jpg`;
  const rows = [
    {
      label: "Albums",
      eyebrow: "Buy the whole record",
      items: [
        { id: "alb-1", title: "Static Bloom",       sub: "Neon Atlas · 11 tracks",      art: art(1),  price: "£8.99" },
        { id: "alb-2", title: "Honey Dial Tone",    sub: "Saturn Field · 9 tracks",     art: art(5),  price: "£7.49" },
        { id: "alb-3", title: "Mid-Atlantic Suite", sub: "Helen Truthe · 12 tracks",    art: art(11), price: "£9.99" },
      ],
    },
    {
      label: "By Genre",
      eyebrow: "Sorted by sound",
      items: [
        { id: "gen-1", title: "Pop Picks",      sub: "24 tracks",   art: art(13), price: "£12.99" },
        { id: "gen-2", title: "Rock Essentials",sub: "18 tracks",   art: art(4),  price: "£11.49" },
        { id: "gen-3", title: "Hip-Hop Heat",   sub: "15 tracks",   art: art(17), price: "£10.99" },
      ],
    },
    {
      label: "By Theme",
      eyebrow: "Curated by mood",
      items: [
        { id: "thm-1", title: "Sad Bangers",  sub: "Cry on the dance floor · 16 tracks", art: art(8),  price: "£9.99" },
        { id: "thm-2", title: "Pop Princess", sub: "Tiara-energy hits · 14 tracks",      art: art(2),  price: "£9.99" },
        { id: "thm-3", title: "Boy Bands",    sub: "Harmony attack · 12 tracks",         art: art(18), price: "£9.99" },
      ],
    },
  ];

  return (
    <div className="store-packs">
      {rows.map(row => (
        <div key={row.label} className="store-packs-row">
          <div className="store-packs-row-head">
            <div className="store-packs-eyebrow">{row.eyebrow}</div>
            <div className="store-packs-label">{row.label}</div>
          </div>
          <div className="store-packs-grid">
            {row.items.map(it => (
              <div key={it.id} className="pack-card" style={{ backgroundImage: `url(${it.art})` }}>
                <div className="pack-card-shade"></div>
                <div className="pack-card-body">
                  <div className="pack-card-title">{it.title}</div>
                  <div className="pack-card-sub">{it.sub}</div>
                  <div className="pack-card-foot">
                    <span className="pack-card-price">{it.price}</span>
                    <button className="pack-card-buy">Buy</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const StagingRow = ({ row }) => {
  const ref = useRef(null);
  const scrollRight = () => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector(".pack-card");
    const step = card ? card.getBoundingClientRect().width + 18 : el.clientWidth * 0.5;
    el.scrollBy({ left: step, behavior: "smooth" });
  };
  return (
    <div className="store-packs-row">
      <div className="store-packs-row-head">
        <div className="store-packs-eyebrow">{row.eyebrow}</div>
        <div className="store-packs-label">{row.label}</div>
      </div>
      <div className="store-packs-scroller-wrap">
        <div className="store-packs-scroller" ref={ref}>
          {row.items.map(it => (
            <div key={it.id} className="pack-card pack-card--noart pack-card--scroll">
              <div className="pack-card-shade"></div>
              <div className="pack-card-body">
                <div className="pack-card-title">{it.title}</div>
                <div className="pack-card-sub">{it.sub}</div>
                <div className="pack-card-foot">
                  <span className="pack-card-price">{it.price}</span>
                  <button className="pack-card-buy">Buy</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="store-packs-arrow" onClick={scrollRight} aria-label="Scroll right">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
        </button>
      </div>
    </div>
  );
};

const StoreStaging = () => {
  const rows = [
    {
      label: "Instruments and Gear",
      eyebrow: "Play your way",
      items: [
        { id: "ig-1", title: "Custom Guitar",     sub: "Headless · 6-string",      price: "£14.99" },
        { id: "ig-2", title: "Studio Drum Kit",   sub: "5-piece + 3 cymbals",      price: "£19.99" },
        { id: "ig-3", title: "Tour Mic Bundle",   sub: "Wireless + boom stand",    price: "£9.99"  },
        { id: "ig-4", title: "Bass · Thunderhead",sub: "Active P-bass · neon",     price: "£16.99" },
        { id: "ig-5", title: "Synth · Aurora 88", sub: "88-key · 8 voices",        price: "£24.99" },
        { id: "ig-6", title: "Pedalboard XL",     sub: "12 slots · MIDI sync",     price: "£13.49" },
      ],
    },
    {
      label: "Skins",
      eyebrow: "Dress the part",
      items: [
        { id: "sk-1", title: "Holo Suit",         sub: "Iridescent · animated",    price: "£7.99"  },
        { id: "sk-2", title: "Vintage Denim",     sub: "Stage-worn · 70s cut",     price: "£5.49"  },
        { id: "sk-3", title: "Stardust Cape",     sub: "Trailing particle FX",     price: "£8.49"  },
        { id: "sk-4", title: "Chrome Couture",    sub: "Liquid-mirror fit",        price: "£9.99"  },
        { id: "sk-5", title: "Streetwear Bundle", sub: "Hoodie · cargo · sneaks",  price: "£6.49"  },
        { id: "sk-6", title: "Cyber Knight",      sub: "Plated · LED runes",       price: "£11.49" },
      ],
    },
    {
      label: "Stage Effects",
      eyebrow: "Bring the show",
      items: [
        { id: "fx-1", title: "Laser Storm",       sub: "Sync to BPM · 24 emitters",price: "£11.99" },
        { id: "fx-2", title: "Confetti Cannon",   sub: "Crowd-launch · 4 colors",  price: "£6.99"  },
        { id: "fx-3", title: "Smoke & Mirrors",   sub: "Low-fog + chrome rig",     price: "£9.49"  },
        { id: "fx-4", title: "Pyro Pillars",      sub: "8 columns · safe-mode",    price: "£14.99" },
        { id: "fx-5", title: "Holo Backdrop",     sub: "4K · scrollable scenes",   price: "£18.49" },
        { id: "fx-6", title: "Drone Swarm",       sub: "32 micro-drones · sync",   price: "£21.99" },
      ],
    },
  ];

  return (
    <div className="store-packs store-packs--staging">
      {rows.map(row => <StagingRow key={row.label} row={row} />)}
    </div>
  );
};

const StoreScreen = () => {
  const [tab, setTab] = useState("tracks");
  const tabs = [
    { id: "tracks",     label: "Tracks" },
    { id: "packs",      label: "Packs" },
    { id: "staging",    label: "Staging" },
    { id: "collection", label: "My Collection" },
  ];
  return (
    <div className="store-screen">
      <div className="mode-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={"mode-tab " + (tab === t.id ? "is-active" : "")}
            onClick={() => setTab(t.id)}
          >
            <span>{t.label}</span>
            {tab === t.id && <div className="mode-tab-underline"></div>}
          </button>
        ))}
        <div className="mode-tabs-spacer"></div>
      </div>
      <div className="store-body">
        {tab === "tracks" && <StoreTracks />}
        {tab === "packs"  && <StorePacks />}
        {tab === "staging" && <StoreStaging />}
        {tab === "collection" && (
          <div className="placeholder">
            <div className="placeholder-h">My Collection</div>
            <div className="placeholder-sub">Everything you own — tracks, packs, and items.</div>
          </div>
        )}
      </div>
    </div>
  );
};

window.JamScreens = {
  PlayScreen, OptionPicker, PickerScreen, GameScreen, ResultsScoreScreen, ResultsRewardsScreen,
  SocialScreen,
  SpacesScreen,
  CreatorScreen,
  HomeScreen,
  StoreScreen,
};
