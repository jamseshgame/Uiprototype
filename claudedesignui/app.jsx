/* global React, ReactDOM */
const { useState, useReducer, useEffect, useRef } = React;
const { Topbar, Navbar } = window.JamUI;
const { PlayScreen, OptionPicker, PickerScreen, GameScreen, ResultsScoreScreen, ResultsRewardsScreen, SocialScreen, SpacesScreen, CreatorScreen, HomeScreen, StoreScreen } = window.JamScreens;

// ── Palette presets ──
const PALETTES = {
  hyperpop: {
    name: "Hyperpop",
    accent:  "#E8FF3A",
    accent2: "#FF2E92",
    accent3: "#B0A6DF",
    accent4: "#00E5C7",
    accentInk: "#1A1430",
    bg: "#2A2447", bg1: "#37305C", bg2: "#463E73",
  },
  sunset: {
    name: "Sunset Strip",
    accent:  "#FF6F2E",
    accent2: "#FF2E92",
    accent3: "#7B5BFF",
    accent4: "#FFCB6B",
    accentInk: "#1A0A08",
    bg: "#160810", bg1: "#1F0D1A", bg2: "#27122B",
  },
  y2k: {
    name: "Y2K Chrome",
    accent:  "#9FB8FF",
    accent2: "#FF66CC",
    accent3: "#6B7AFF",
    accent4: "#C4FFE6",
    accentInk: "#06060E",
    bg: "#08070F", bg1: "#0F0D1E", bg2: "#16142C",
  },
  bedroom: {
    name: "Bedroom Pop",
    accent:  "#FFCB6B",
    accent2: "#C77DFF",
    accent3: "#82E0FF",
    accent4: "#B0EE7A",
    accentInk: "#1A1226",
    bg: "#1A1226", bg1: "#221A33", bg2: "#2A2240",
  },
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "hyperpop",
  "density": "regular",
  "ambient": true
}/*EDITMODE-END*/;

// ── Initial state ──
const PROFILE = {
  name:   "RAEL",
  handle: "rael.live",
  avatar: "assets/avatars/01.png",
};

const initialSetlist = [
  window.SONG_CATALOG[2],  // Glass Highway
  window.SONG_CATALOG[5],  // Burn Stairwell
  window.SONG_CATALOG[8],  // Microcassette
];

const initialState = {
  page: "home",
  mode: "solo",
  setlist: initialSetlist,
  activeIdx: 0,
  previewIdx: null,
  songInstruments: { 0: "guitar", 1: "drums", 2: "vocals" },
  songDiffs:       { 0: "Hard",   1: "Normal", 2: "Expert" },
  picker: null,
  toast: null,
};

function reducer(state, a) {
  switch (a.type) {
    case "PAGE":    return { ...state, page: a.page };
    case "MODE":    return { ...state, mode: a.mode };
    case "SELECT":  return { ...state, activeIdx: a.idx };
    case "PREVIEW": return { ...state, previewIdx: state.previewIdx === a.idx ? null : a.idx };
    case "REMOVE": {
      const sl = state.setlist.slice(); sl.splice(a.idx, 1);
      const si = { ...state.songInstruments }; const sd = { ...state.songDiffs };
      // rebuild keys
      const ns = {}, nd = {};
      sl.forEach((_, i) => { ns[i] = si[i >= a.idx ? i + 1 : i] || "guitar"; nd[i] = sd[i >= a.idx ? i + 1 : i] || "Normal"; });
      return { ...state, setlist: sl, songInstruments: ns, songDiffs: nd,
        activeIdx: Math.max(0, Math.min(state.activeIdx, sl.length - 1)),
        toast: { msg: "Removed from setlist" }
      };
    }
    case "ADD": {
      if (state.setlist.length >= 4) return { ...state, toast: { msg: "Setlist full (4 max)" } };
      const idx = state.setlist.length;
      return {
        ...state,
        setlist: [...state.setlist, a.song],
        songInstruments: { ...state.songInstruments, [idx]: "guitar" },
        songDiffs:       { ...state.songDiffs, [idx]: "Normal" },
        activeIdx: idx,
        toast: { msg: "Added · " + a.song.title }
      };
    }
    case "SWAP_AT": {
      const sl = state.setlist.slice(); sl[a.idx] = a.song;
      return { ...state, setlist: sl, toast: { msg: "Swapped · " + a.song.title } };
    }
    case "OPEN_PICKER":  return { ...state, picker: a.picker };
    case "CLOSE_PICKER": return { ...state, picker: null };
    case "SET_INSTRUMENT":
      return { ...state, songInstruments: { ...state.songInstruments, [state.activeIdx]: a.inst }, picker: null };
    case "SET_DIFFICULTY":
      return { ...state, songDiffs: { ...state.songDiffs, [state.activeIdx]: a.diff }, picker: null };
    case "APPLY_ALL": {
      const inst = state.songInstruments[state.activeIdx];
      const diff = state.songDiffs[state.activeIdx];
      const ns = {}, nd = {};
      state.setlist.forEach((_, i) => { ns[i] = inst; nd[i] = diff; });
      return { ...state, songInstruments: ns, songDiffs: nd, toast: { msg: "Applied to all tracks" } };
    }
    case "TOAST":   return { ...state, toast: { msg: a.msg } };
    case "DISMISS": return { ...state, toast: null };
    default: return state;
  }
}

// ── Scaler — fits the 1920×1920 canvas inside any window ──
const Scaler = ({ children, palette, density, ambient, page }) => {
  const ref = useRef();
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => {
      const w = window.innerWidth, h = window.innerHeight;
      setScale(Math.min(w / 1920, h / 1920));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  const p = PALETTES[palette] || PALETTES.hyperpop;
  const cssVars = {
    "--accent":      p.accent,
    "--accent-2":    p.accent2,
    "--accent-3":    p.accent3,
    "--accent-4":    p.accent4,
    "--accent-ink":  p.accentInk,
    "--bg-deep":     p.bg,
    "--bg-1":        p.bg1,
    "--bg-2":        p.bg2,
  };
  return (
    <div className="scaler" style={cssVars}>
      <div
        ref={ref}
        className={"viewport density-" + density + (ambient ? "" : " no-ambient")}
        data-page={page}
        style={{ transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
};

// ── Toast ──
const Toast = ({ toast, onDone }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDone, 1600);
    return () => clearTimeout(t);
  }, [toast]);
  if (!toast) return null;
  return <div className="toast">{toast.msg}</div>;
};

// ── App ──
const App = () => {
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [pickerScreen, setPickerScreen] = useState(null);   // { kind: 'add' | 'swap', idx }
  const [route,        setRoute]        = useState("shell"); // 'shell' | 'picker' | 'game' | 'results1' | 'results2'
  const [gameResult,   setGameResult]   = useState({ score: 0, hits: { perfect: 0, good: 0, miss: 0 }, streak: 0 });
  const [previewId,    setPreviewId]    = useState(null);

  const openPicker = (kind, idx) => { setPickerScreen({ kind, idx: idx == null ? null : idx }); setRoute("picker"); };
  const closePicker = () => { setPickerScreen(null); setRoute("shell"); };

  const onAddSong  = (song) => { dispatch({ type: "ADD", song }); closePicker(); };
  const onSwapSong = (idx, song) => { dispatch({ type: "SWAP_AT", idx, song }); closePicker(); };

  const startGame = () => {
    if (state.setlist.length === 0) { dispatch({ type: "TOAST", msg: "Add at least one track" }); return; }
    setRoute("game");
  };

  const onGameFinish = (result) => {
    setGameResult(result);
    setRoute("results1");
  };

  // Decide content
  let content;
  if (route === "picker") {
    content = (
      <PickerScreen
        pickerIntent={pickerScreen}
        onClose={closePicker}
        onAdd={onAddSong}
        onSwap={onSwapSong}
        previewId={previewId}
        setPreviewId={setPreviewId}
      />
    );
  } else if (state.page === "social") {
    content = (
      <SocialScreen
        onCreate={() => dispatch({ type: "TOAST", msg: "Open create-band flow" })}
        onOpenGroup={(g) => dispatch({ type: "TOAST", msg: "Open · " + g.name })}
      />
    );
  } else if (state.page === "spaces") {
    content = (
      <SpacesScreen
        onEnter={(s) => dispatch({ type: "TOAST", msg: "Enter · " + s.name })}
      />
    );
  } else if (state.page === "creator") {
    content = (
      <CreatorScreen
        onCreate={(tab) => dispatch({ type: "TOAST", msg: "Create · " + tab })}
        onOpenTile={(t) => dispatch({ type: "TOAST", msg: "Open · " + t.title })}
      />
    );
  } else if (state.page === "play") {
    content = (
      <PlayScreen
        state={state}
        dispatch={dispatch}
        onStart={startGame}
        onOpenPicker={(kind, idx) => openPicker(kind, idx)}
        hideConfig={state.mode === "group"}
        startLabel={state.mode === "group" ? "Go to Studio" : "START"}
        startIcon={state.mode === "group" ? <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg> : undefined}
      />
    );
  } else if (state.page === "home") {
    content = (
      <HomeScreen
        onNav={(p) => { dispatch({ type: "PAGE", page: p }); setRoute("shell"); }}
        onToast={(msg) => dispatch({ type: "TOAST", msg })}
      />
    );
  } else if (state.page === "store") {
    content = <StoreScreen />;
  } else {
    const labels = {
      social:   { h: "Social",   sub: "Groups, friends, and DMs land here." },
      spaces:   { h: "Spaces",   sub: "Public hubs and your private rooms." },
      creator:  { h: "Creator",  sub: "Photos, art, and original tracks." },
      store:    { h: "Store",    sub: "Tracks, packs, items, and the collection." },
      season:   { h: "Season",   sub: "Grammys · Week 4 · 2 days left." },
    }[state.page] || { h: state.page, sub: "" };
    content = (
      <div className="content">
        <div className="placeholder">
          <div className="placeholder-h">{labels.h}</div>
          <div className="placeholder-sub">{labels.sub}</div>
        </div>
      </div>
    );
  }

  // Gameplay & results are full-bleed overlays inside the viewport
  const activeSong = state.setlist[state.activeIdx];
  const activeInst = state.songInstruments[state.activeIdx] || "guitar";
  const activeDiff = state.songDiffs[state.activeIdx] || "Normal";

  return (
    <Scaler palette={tweaks.palette} density={tweaks.density} ambient={tweaks.ambient} page={state.page}>
      {route !== "game" && route !== "results1" && route !== "results2" && (
        <div className="viewport-body">
          <Topbar profile={PROFILE} coins={5240} page={state.page} />
          <div className="content">{content}</div>
          <Navbar
            current={state.page}
            onNav={(p) => { dispatch({ type: "PAGE", page: p }); setRoute("shell"); }}
          />
        </div>
      )}

      {route === "game" && activeSong && (
        <GameScreen
          song={activeSong}
          instrument={activeInst}
          difficulty={activeDiff}
          onFinish={onGameFinish}
        />
      )}
      {route === "results1" && activeSong && (
        <ResultsScoreScreen
          song={activeSong}
          result={gameResult}
          onBack={() => setRoute("shell")}
          onNext={() => setRoute("results2")}
        />
      )}
      {route === "results2" && activeSong && (
        <ResultsRewardsScreen
          song={activeSong}
          onBack={() => setRoute("results1")}
          onContinue={() => setRoute("shell")}
        />
      )}

      <OptionPicker open={!!state.picker} type={state.picker} state={state} dispatch={dispatch} />
      <Toast toast={state.toast} onDone={() => dispatch({ type: "DISMISS" })} />

      <window.TweaksPanel>
        <window.TweakSection label="Palette" />
        <window.TweakRadio
          label="Direction"
          value={tweaks.palette}
          options={["hyperpop", "sunset", "y2k", "bedroom"]}
          onChange={(v) => setTweak("palette", v)}
        />
        <window.TweakSection label="Layout" />
        <window.TweakRadio
          label="Density"
          value={tweaks.density}
          options={["compact", "regular", "comfy"]}
          onChange={(v) => setTweak("density", v)}
        />
        <window.TweakToggle
          label="Ambient backdrop"
          value={tweaks.ambient}
          onChange={(v) => setTweak("ambient", v)}
        />
      </window.TweaksPanel>
    </Scaler>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
