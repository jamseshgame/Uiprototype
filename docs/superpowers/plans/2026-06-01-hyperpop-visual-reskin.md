# Hyperpop Visual Reskin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin the live `index.html` / `results.html` prototype to the redesign's "Hyperpop" visual identity (palette, fonts, radii, ambient feel) without changing logic or any Unity/Vuplex-facing hook.

**Architecture:** Approach A — re-token the existing CSS-variable system. The bulk of the reskin happens by changing *values* (the default theme object, `:root` tokens, `pageColorSchemes`, font-family declarations), not by rewriting selectors. New fonts are self-hosted via `@font-face`. The existing animated particle canvas is recoloured rather than replaced. All translucent *backgrounds* are pre-baked to solid hex to honour the VR perf rules.

**Tech Stack:** Single-file HTML/CSS/ES5 JS (Chromium 91 / Vuplex WebView). No build, no test framework.

---

## Testing model (read first)

There is **no unit-test framework** in this repo (CLAUDE.md: "no tests, no linter, no build step"). So the TDD "write a failing test" pattern is replaced by two concrete verifications, used as each task's pass/fail gate:

- **Perf-guardrail grep** — a command that must return zero hits for banned CSS in the diff.
- **Desktop visual check** — load via `npx browser-sync start --server --files "*.html" --port 3000 --no-open`, open `http://localhost:3000`, and confirm a stated expected result.

The reference for source values is `claudedesignui/styles.css` and `claudedesignui/app.jsx` (the `PALETTES` object).

**Branch:** all work is on `hyperpop-reskin` (already created). Commit after every task.

### Canonical palette (solid hex — memorise these)

```
--bg-deep #100C1F   --bg-1 #1B1638   --bg-2 #261F49
accent/lime #E8FF3A   accent-ink #100C1F
accent-2/magenta #FF2E92   accent-3/lavender #B0A6DF   accent-4/teal #00E5C7
sibling: periwinkle #6B7AFF   amber #FFCB6B   violet #C77DFF
```

### Surface-flattening formula

`channel = α·fg + (1−α)·base`, rounded. For white fg (`fg=255`) over `--bg-deep (16,12,31)`:
- `0.04` → `#1A1628` · `0.06` → `#1E1B2C` · `0.10` → `#282435`

`color`, `border-color`, `box-shadow`, and `text-shadow` with alpha are **allowed** (paint ops). Only *background* alpha, `backdrop-filter`, `opacity<1`, `mix-blend-mode`, `color-mix`, `oklab` are banned.

---

## Task 1: Self-host the three fonts (`@font-face`)

**Files:**
- Create: `fonts/monda-latin.woff2`, `fonts/bebas-neue-latin.woff2`, `fonts/gasoek-one-latin.woff2`
- Modify: `index.html` (top of `<style>`, after line 9)

- [ ] **Step 1: Copy the woff2 files into a root `fonts/` folder**

```bash
mkdir -p fonts
cp claudedesignui/assets/fonts/monda-latin.woff2 fonts/
cp claudedesignui/assets/fonts/bebas-neue-latin.woff2 fonts/
cp claudedesignui/assets/fonts/gasoek-one-latin.woff2 fonts/
ls -la fonts/
```

Expected: three `.woff2` files listed.

- [ ] **Step 2: Add `@font-face` blocks at the very top of the `<style>` block**

In `index.html`, immediately after `<style>` (line 9) and before the `*, *::before` reset (line 10), insert:

```css
  @font-face {
    font-family: 'Monda';
    font-style: normal; font-weight: 400 700; font-display: swap;
    src: url('fonts/monda-latin.woff2') format('woff2');
  }
  @font-face {
    font-family: 'Bebas Neue';
    font-style: normal; font-weight: 400; font-display: swap;
    src: url('fonts/bebas-neue-latin.woff2') format('woff2');
  }
  @font-face {
    font-family: 'Gasoek One';
    font-style: normal; font-weight: 400; font-display: swap;
    src: url('fonts/gasoek-one-latin.woff2') format('woff2');
  }
```

- [ ] **Step 3: Update the comment at line 8** from `<!-- Fonts loaded locally: Inter, Chakra Petch -->` to `<!-- Fonts self-hosted via @font-face: Monda, Bebas Neue, Gasoek One -->`.

- [ ] **Step 4: Verify the fonts load**

Run browser-sync, open `http://localhost:3000`. In DevTools console run:
```js
document.fonts.check("16px 'Bebas Neue'") && document.fonts.check("16px 'Monda'") && document.fonts.check("16px 'Gasoek One'")
```
Expected: `true` (after the page has loaded; fonts are `swap` so may briefly be false).

- [ ] **Step 5: Commit**

```bash
git add fonts/ index.html
git commit -m "feat(reskin): self-host Monda / Bebas Neue / Gasoek One fonts"
```

---

## Task 2: Swap the font hierarchy

**Files:**
- Modify: `index.html:80-138` (font-hierarchy CSS block + `body`)

- [ ] **Step 1: Repoint the body / base font from Inter to Monda**

At `index.html:136` change:
```css
    font-family: 'Inter', sans-serif;
```
to:
```css
    font-family: 'Monda', sans-serif;
```
(This is inside the `body { … }` rule beginning at line 131.)

- [ ] **Step 2: Repoint the "Logo / Accents" block (lines 81-87)**

Replace the rule:
```css
  .profile-name,
  .boot-logo-text,
  .home-banner-title {
    font-family: 'Chakra Petch', sans-serif;
    font-weight: 600;
  }
```
with two rules — wordmark/logo gets Gasoek One, the rest get Bebas Neue:
```css
  /* Logo wordmark — display face */
  .boot-logo-text {
    font-family: 'Gasoek One', sans-serif;
    font-weight: 400;
    letter-spacing: 0.04em;
  }
  /* Names / banner titles */
  .profile-name,
  .home-banner-title {
    font-family: 'Bebas Neue', sans-serif;
    font-weight: 400;
    letter-spacing: 0.02em;
  }
```

- [ ] **Step 3: Repoint the "Titles / Headings" block (lines 90-107)** — change the declaration only:
```css
    font-family: 'Chakra Petch', sans-serif;
    font-weight: 700;
```
to:
```css
    font-family: 'Bebas Neue', sans-serif;
    font-weight: 400;
    letter-spacing: 0.02em;
```
(Bebas Neue ships a single weight; `700` would synthesize-bold. Keep `400` + letter-spacing.)

- [ ] **Step 4: Repoint the "UI / Buttons" block (lines 110-129)** — change the declaration only:
```css
    font-family: 'Inter', sans-serif;
    font-weight: 500;
```
to:
```css
    font-family: 'Bebas Neue', sans-serif;
    font-weight: 400;
    letter-spacing: 0.04em;
```

- [ ] **Step 5: Visual check**

Reload `http://localhost:3000`. Expected: body copy renders in Monda; nav labels, buttons, section titles, page titles render in condensed Bebas Neue caps-style; the boot-splash logo (`?demo` → boot screen, or inspect `.boot-logo-text`) renders in heavy Gasoek One. No element falls back to default serif/sans.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat(reskin): swap font hierarchy to Monda/Bebas Neue/Gasoek One"
```

---

## Task 3: Re-token `:root` (palette + radii)

**Files:**
- Modify: `index.html:19-72`

- [ ] **Step 1: Replace the colour block (lines 20-37) with Hyperpop values**

Replace:
```css
    /* Colour scheme — purple / blue / pink / green */
    --pink: #7c3aed;
    --cyan: #d946a8;
    --orange: #e85d8a;
    --mint: #16a34a;
    --gold: #22c55e;
    --purple: #7c3aed;
    --bg-body: transparent;
    --bg-panel: rgba(255,255,255,0.04);
    --bg-surface: rgba(255,255,255,0.06);
    --bg-surface-hover: rgba(255,255,255,0.10);
    --text-primary: #f0ecf8;
    --text-secondary: rgba(240,236,248,0.6);
    --text-muted: rgba(255,255,255,0.5);
    --border-strong: rgba(255,255,255,0.12);
    --border-subtle: rgba(255,255,255,0.06);
    --overlay-light: rgba(255,255,255,0.05);
    --scrollbar-color: rgba(255,255,255,0.15);
    --glow-pink: 0 0 0 3px var(--pink), 0 0 20px var(--pink-40);
```
with (note: `--bg-panel`/`--bg-surface`/`--bg-surface-hover` are flattened to solid hex; `--text-secondary`/`--text-muted` stay rgba because `color` alpha is a paint op; `--bg-body` stays `transparent` — the page background is empty space, which the perf notes explicitly allow):
```css
    /* Colour scheme — Hyperpop (deep purple / acid lime / magenta / teal) */
    --pink: #FF2E92;      /* global accent (magenta) — per-page accent overrides via setPageColors */
    --cyan: #00E5C7;      /* teal */
    --orange: #FFCB6B;    /* amber */
    --mint: #00E5C7;      /* teal */
    --gold: #C77DFF;      /* violet */
    --purple: #B0A6DF;    /* lavender */
    --lime: #E8FF3A;      /* signature primary */
    --bg-body: transparent;
    --bg-panel: #1A1628;          /* white .04 over #100C1F */
    --bg-surface: #1E1B2C;        /* white .06 over #100C1F */
    --bg-surface-hover: #282435;  /* white .10 over #100C1F */
    --text-primary: #f0ecf8;
    --text-secondary: rgba(240,236,248,0.65);
    --text-muted: rgba(255,255,255,0.45);
    --border-strong: rgba(255,255,255,0.18);
    --border-subtle: rgba(255,255,255,0.10);
    --overlay-light: rgba(255,255,255,0.05);
    --scrollbar-color: rgba(255,255,255,0.15);
    --glow-pink: 0 0 0 3px var(--pink), 0 0 20px var(--pink-40);
```

- [ ] **Step 2: Retune the radii (lines 42-44)**

Replace:
```css
    --radius-inner: 28px;
    --panel-radius: 28px;
    --radius-outer: 56px;
```
with (redesign scale lg32/md22/sm14, preserving outer = inner + pad concentricity, `--pad` is 32):
```css
    --radius-inner: 22px;
    --panel-radius: 22px;
    --radius-outer: 54px;
```

- [ ] **Step 3: Update the solid html backdrop (line 78)** from `html { background: #0d0a16; }` to `html { background: #0A0816; }` (matches the redesign's `--bg-deep` surround).

- [ ] **Step 4: Perf-guardrail grep (scoped to the edited block has no new background-alpha)**

```bash
git diff index.html | grep -nE '^\+' | grep -iE 'background[^;]*rgba\([^)]*0\.[0-9]|backdrop-filter|mix-blend-mode|color-mix|oklab|opacity:\s*0?\.[0-9]'
```
Expected: **no output** (the only added rgba are on `color`/`border`/shadow tokens, not backgrounds).

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat(reskin): re-token :root palette and radii to Hyperpop"
```

---

## Task 4: Make Hyperpop the default theme

The default look is set at load by `applyTheme(currentTheme)` (line 19505) with `currentTheme = 'light-mode'` (line 17071), which overrides `--bg-body/-panel/-surface/-surface-hover/--pink` and the accent vars. So `:root` alone is not enough — add a Hyperpop theme and make it the default.

**Files:**
- Modify: `index.html:17048` (themes array), `index.html:17071` (currentTheme), `index.html:17216-17227` (applyTheme accent fallbacks)

- [ ] **Step 1: Add a `hyperpop` theme object as the first entry of `themes[]`**

Immediately after `var themes = [` (line 17048), insert:
```javascript
  { id: 'hyperpop', name: 'Hyperpop', bg: '#100C1F', panel: '#1A1628', tile: '#1E1B2C', tileHover: '#282435', accent: '#FF2E92' },
```

- [ ] **Step 2: Set it as the default** — change line 17071:
```javascript
var currentTheme = 'light-mode';
```
to:
```javascript
var currentTheme = 'hyperpop';
```

- [ ] **Step 3: Update applyTheme's accent fallbacks (lines 17216-17220)** so the non-light branch matches the Hyperpop family. Replace:
```javascript
  root.style.setProperty('--cyan', light ? '#d946a8' : '#f472b6');
  root.style.setProperty('--gold', light ? '#22c55e' : '#4ade80');
  root.style.setProperty('--orange', light ? '#e85d8a' : '#f9a8d4');
  root.style.setProperty('--mint', light ? '#16a34a' : '#34d399');
  root.style.setProperty('--purple', light ? '#7c3aed' : '#a78bfa');
```
with:
```javascript
  root.style.setProperty('--cyan', light ? '#d946a8' : '#00E5C7');
  root.style.setProperty('--gold', light ? '#22c55e' : '#C77DFF');
  root.style.setProperty('--orange', light ? '#e85d8a' : '#FFCB6B');
  root.style.setProperty('--mint', light ? '#16a34a' : '#00E5C7');
  root.style.setProperty('--purple', light ? '#7c3aed' : '#B0A6DF');
```

- [ ] **Step 4: Visual check**

Reload. Expected: the whole app loads on the deep-purple Hyperpop background with magenta/teal/lavender accents (not the old purple `light-mode`). Open Settings → Themes; confirm "Hyperpop" appears in the picker and selecting other themes still works (switch to one and back).

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat(reskin): add Hyperpop theme and make it the default"
```

---

## Task 5: Re-tint per-page accents + canvas (`pageColorSchemes`)

**Files:**
- Modify: `index.html:19760-19770` (`pageColorSchemes`)

- [ ] **Step 1: Replace the `pageColorSchemes` object body (lines 19761-19769)** with Hyperpop-family values per the §5.5 accent map. `accent` is `[r,g,b]`; `waves` is 5 RGB sets; `grad` is the canvas 4-stop gradient (deep-purple base → page tint); `pt`/`pb` are particle tints.

```javascript
  home:    { accent: [176,166,223], waves: [[176,166,223],[199,125,255],[150,140,210],[120,100,200],[200,180,255]], grad: ["#100C1F","#171234","#211A45","#2A1E55"], pt: [176,166,223], pb: [199,125,255] },
  social:  { accent: [0,229,199],   waves: [[0,229,199],[52,211,153],[16,200,170],[100,255,230],[20,180,160]],     grad: ["#0A1410","#0E2620","#0F3A30","#11463A"], pt: [0,229,199], pb: [100,255,230] },
  spaces:  { accent: [107,122,255], waves: [[107,122,255],[123,91,255],[96,140,250],[150,160,255],[80,100,220]],   grad: ["#0C0E2A","#121640","#1A1E55","#222866"], pt: [107,122,255], pb: [150,160,255] },
  play:    { accent: [232,255,58],  waves: [[232,255,58],[0,229,199],[255,46,146],[200,230,40],[120,255,200]],     grad: ["#100C1F","#1A1A18","#26280E","#2E3410"], pt: [232,255,58], pb: [0,229,199] },
  creator: { accent: [255,203,107], waves: [[255,203,107],[255,175,40],[255,111,46],[255,200,140],[220,150,60]],   grad: ["#1A1408","#2A1E0A","#3A280E","#4A3210"], pt: [255,203,107], pb: [255,175,40] },
  store:   { accent: [255,46,146],  waves: [[255,46,146],[244,114,182],[199,125,255],[255,100,170],[200,50,140]],  grad: ["#1A0A1A","#2E0E28","#401238","#501648"], pt: [255,46,146], pb: [244,114,182] },
  season:  { accent: [199,125,255], waves: [[199,125,255],[176,166,223],[232,255,58],[210,150,255],[180,120,240]], grad: ["#160A28","#221040","#2E1452","#3A1860"], pt: [199,125,255], pb: [232,255,58] },
  career:  { accent: [176,166,223], waves: [[176,166,223],[199,125,255],[150,140,210],[124,90,255],[200,180,255]], grad: ["#100C1F","#171234","#211A45","#2A1E55"], pt: [176,166,223], pb: [199,125,255] },
  settings:{ accent: [176,166,223], waves: [[176,166,223],[199,125,255],[150,140,210],[124,90,255],[200,180,255]], grad: ["#100C1F","#171234","#211A45","#2A1E55"], pt: [176,166,223], pb: [199,125,255] }
```

- [ ] **Step 2: Update the home-default canvas init (lines 19800-19813)** so the pre-`setPageColors` first paint matches home. Replace the `waveColors` array (19800-19806) values with `[[176,166,223],[199,125,255],[150,140,210],[120,100,200],[200,180,255]]` and the four `bgGrad.addColorStop` colours (19810-19813) with `"#100C1F"`, `"#171234"`, `"#211A45"`, `"#2A1E55"`.

- [ ] **Step 3: Visual check — walk every page**

Reload. Click each navbar tab (Home, Social, Spaces, Main Stage, Creator, Store, Season). Expected: each page's animated backdrop + button accents shift to its mapped Hyperpop colour (Main Stage = lime, Home = lavender, Social = teal, Spaces = periwinkle, Creator = amber, Store = magenta, Season = violet). No page renders muddy/black.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat(reskin): re-tint per-page accents and particle canvas to Hyperpop"
```

---

## Task 6: Flatten `setPageColors()` button backgrounds to solid hex

`setPageColors()` (lines 19783-19796) emits `rgba(accent, α)` *backgrounds* for `--btn-*`, which violates the VR alpha rule. Flatten them in JS against the panel base `#1A1628 (26,22,40)`.

**Files:**
- Modify: `index.html:19784-19796`

- [ ] **Step 1: Replace the body of the accent-to-button mapping (lines 19784-19796)** with a solid-hex blend:

```javascript
  // Set button CSS variables from page accent — flattened to solid hex (no bg alpha; VR perf rule)
  var a = scheme.accent;
  var r = document.documentElement;
  // blend accent over panel base #1A1628 = (26,22,40)
  function mix(al) {
    function ch(i, base) { var v = Math.round(al * a[i] + (1 - al) * base); return (v < 16 ? '0' : '') + v.toString(16); }
    return '#' + ch(0,26) + ch(1,22) + ch(2,40);
  }
  r.style.setProperty('--btn-tab',           mix(0.15));
  r.style.setProperty('--btn-tab-hover',     mix(0.28));
  r.style.setProperty('--btn-tab-border',    'rgba(' + a[0]+','+a[1]+','+a[2] + ',0.45)'); /* border alpha = paint op, allowed */
  r.style.setProperty('--btn-panel',         mix(0.10));
  r.style.setProperty('--btn-panel-hover',   mix(0.20));
  r.style.setProperty('--btn-panel-border',  'rgba(' + a[0]+','+a[1]+','+a[2] + ',0.40)');
  r.style.setProperty('--btn-primary',       mix(0.30));
  r.style.setProperty('--btn-primary-hover', mix(0.45));
  r.style.setProperty('--btn-primary-border','rgba(' + a[0]+','+a[1]+','+a[2] + ',0.55)');
  r.style.setProperty('--btn-primary-glow',  'rgba(' + a[0]+','+a[1]+','+a[2] + ',0.40)'); /* used in box-shadow = paint op */
```

Note: `--btn-*-border` and `--btn-primary-glow` keep alpha intentionally — borders and the glow feed `border-color`/`box-shadow`, which are paint ops (allowed). Only the `background` vars (`--btn-tab`, `--btn-panel`, `--btn-primary` and their hovers) are flattened.

- [ ] **Step 2: Confirm `--btn-primary-glow` and `--btn-*-border` are only consumed by box-shadow / border-color**

```bash
grep -nE 'var\(--btn-primary-glow\)|var\(--btn-(tab|panel|primary)-border\)' index.html
```
Expected: every hit is inside a `box-shadow:` or `border`/`border-color:` declaration (not `background:`). If any feeds a `background`, flatten that one too.

- [ ] **Step 3: Visual check**

Reload, hover/click buttons on several pages. Expected: button fills are solid (no see-through), accents still match the page, hover states still lighten. No flicker.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "fix(reskin): flatten per-page button backgrounds to solid hex (VR perf)"
```

---

## Task 7: Full perf-guardrail audit of the diff

Catch any banned property introduced across Tasks 1-6 before screen refinement.

**Files:** none (verification only)

- [ ] **Step 1: Run the full guardrail over every added line**

```bash
git diff main...hyperpop-reskin -- index.html | grep -nE '^\+' \
  | grep -iE 'background[^;]*(rgba|hsla)\([^)]*,[^)]*0?\.[0-9]|backdrop-filter|mix-blend-mode|color-mix|oklab|opacity:\s*0?\.[0-9]' \
  | grep -viE '^\+\s*/\*|--text-|--border|box-shadow|--scrollbar|--overlay'
```
Expected: **no output.** Any hit is a background-alpha / blur / blend / sub-1 opacity that must be flattened or removed. (The trailing `grep -v` excludes comment lines and the intentionally-rgba `color`/`border`/`shadow` tokens.)

- [ ] **Step 2: Confirm no `@font-face` regressions and fonts still referenced**

```bash
grep -cE "Chakra Petch|'Inter'" index.html
```
Expected: `0` (all references swapped). If non-zero, list and swap the stragglers to Bebas Neue (headings/labels) or Monda (body).

- [ ] **Step 3: Commit (only if Step 1/2 required fixes)**

```bash
git add index.html
git commit -m "fix(reskin): resolve perf-guardrail findings"
```

---

## Task 8: Screen-by-screen layout refinement

The token swap reskins colour/typography globally; this task brings the *layout* of high-visibility screens closer to the redesign where it meaningfully differs, within the change boundary (no renamed IDs/handlers/bridge, no logic edits). Work one screen at a time; after each, run the guardrail grep from Task 7 Step 1 and a visual check, then commit.

Reference the corresponding component in `claudedesignui/styles.css` + `claudedesignui/screens.jsx` for each.

- [ ] **Step 1: Topbar** — compare `.topbar` in `index.html` against the redesign's two-row topbar (`claudedesignui/styles.css:137-180`: logo+wordmark / divider / profile on top row, stat row below). Adjust spacing, the wordmark treatment (Gasoek One gradient-clip text — `background:linear-gradient(...);-webkit-background-clip:text;color:transparent` is a paint op, allowed), and row layout via CSS only. Do **not** rename `.topbar*` classes or the stat-ticker hooks. Guardrail grep → visual check → `git commit -m "style(reskin): topbar layout to match redesign"`.

- [ ] **Step 2: Main Stage / setlist panel** — align the setlist panel + options row + Start button styling (radii, surface colour, the lime `jamsesh-signature` Start treatment) to `claudedesignui` `PlayScreen`. CSS/spacing only. Commit `style(reskin): main stage panel`.

- [ ] **Step 3: Navbar** — match nav-item sizing, active-state underline/glow, and Bebas Neue labels to the redesign. CSS only; keep `data-page` attributes and `onclick="navigateTo(...)"` intact. Commit `style(reskin): navbar`.

- [ ] **Step 4: Home grid tiles** — align tile radii, title typography, and glow to the redesign. The home tiles use PNG backgrounds (`home_tiles/`) — do not change the image-assignment JS, only the tile chrome CSS. Commit `style(reskin): home tiles`.

- [ ] **Step 5: Remaining screens spot-pass** — Social, Spaces, Creator, Store, Results 1/2, popups (option-picker, purchase, save/load, create-group/space). For each: open it, confirm tokens/fonts read correctly, and fix only obvious mismatches (a hard-coded old hex, a stale radius). Search for hard-coded legacy colours that bypass the tokens:
```bash
grep -nE '#7c3aed|#d946a8|#e85d8a|#16a34a|#22c55e|#0d0a16|#f0ecf8' index.html
```
Expected after fixes: only `:root`/theme definitions and intentional cases remain; component-level hard-codes are replaced with the matching `var(--…)`. Commit `style(reskin): screen spot-pass`.

---

## Task 9: Apply tokens + fonts to `results.html`

`results.html` is standalone (no theme system / no `pageColorSchemes`) and duplicates the results look. It needs the same `@font-face`, palette, and radii applied directly.

**Files:**
- Modify: `results.html` (its `<style>` block; copy the three woff2 are already in `fonts/`)

- [ ] **Step 1: Add the same three `@font-face` blocks** (identical to Task 1 Step 2) at the top of `results.html`'s `<style>`. Confirm the `src` path `fonts/…woff2` resolves relative to `results.html` (same root folder — it does).

- [ ] **Step 2: Apply palette + radii + fonts** — set `results.html`'s background to `#100C1F`, its panel/surface colours to `#1A1628`/`#1E1B2C`, accents to the Hyperpop family, radii to 22/54, and swap any `Inter`/`Chakra Petch` font-family to Monda (body) / Bebas Neue (headings, labels, buttons). Match the values used in `index.html` Tasks 2-3.

- [ ] **Step 3: Perf-guardrail grep on results.html**

```bash
git diff main...hyperpop-reskin -- results.html | grep -nE '^\+' \
  | grep -iE 'background[^;]*(rgba|hsla)\([^)]*,[^)]*0?\.[0-9]|backdrop-filter|mix-blend-mode|color-mix|oklab|opacity:\s*0?\.[0-9]' \
  | grep -viE '^\+\s*/\*|color:|border|box-shadow'
```
Expected: no output.

- [ ] **Step 4: Visual check** — open `http://localhost:3000/results.html`. Expected: Hyperpop palette + fonts, matches `index.html`'s results screens.

- [ ] **Step 5: Commit**

```bash
git add results.html
git commit -m "feat(reskin): apply Hyperpop tokens + fonts to results.html"
```

---

## Task 10: Final validation (Definition of Done)

**Files:** none (verification only)

- [ ] **Step 1: Hook-integrity diff** — confirm no Unity/JS-facing identifiers changed:

```bash
git diff main...hyperpop-reskin -- index.html results.html \
  | grep -nE '^[-+]' \
  | grep -iE "id=\"|getElementById|querySelector|sendToUnity\(|addEventListener\(|onclick=|data-page=|function [a-zA-Z]" \
  | grep -vE '^\+.*(font-family|background|color|border|radius|--)'
```
Expected: review every line — there should be **no removed/renamed** IDs, function names, `data-page` values, `onclick` handlers, or `sendToUnity` message names. Pure-styling additions (a new class on an element) are acceptable; renames/removals are not.

- [ ] **Step 2: Full functional walkthrough** in desktop Chromium. Tick each:
  - Home grid renders + tiles clickable
  - Every navbar tab opens its page
  - Main Stage: add/remove songs, open instrument/difficulty/experience pickers, Start
  - Song picker: paging, filters, add-to-setlist
  - `?host` and `?client` lobby flows render the roster + Ready button
  - Onboarding: `?onboard&demo` → legal → perms → tutorial (and `?demo` boot/store/quest screens)
  - Store tabs (Songs/Packs/Items/Vault), Creator tabs, Social/Spaces tabs
  - Theme picker switches themes and back to Hyperpop; banner/frame pickers
  - Results 1 & 2 (reach via Start → gameplay → click) and `results.html` standalone

  Expected: nothing visually broken, clipped, unreadable, or unclickable.

- [ ] **Step 3: Final guardrail sweep** — re-run Task 7 Step 1 over the whole branch diff. Expected: no output.

- [ ] **Step 4: Document what could not be verified on desktop** — append a short note to the PR/branch description listing the in-headset checks the user must do in `jamseshquest`: (a) real Bebas Neue / Monda / Gasoek One rendering at VR distance, (b) CPU/perf under load, (c) passthrough see-through check (every panel opaque).

- [ ] **Step 5: Final commit (if any Step-1/3 fixes)** and stop for review.

```bash
git add -A && git commit -m "chore(reskin): final validation fixes"
```

---

## Self-review notes (coverage map)

- Spec §5.1 palette → Task 3, 4. §5.2 flattening/banned props → Tasks 3,6,7,9 grep gates. §5.3 fonts → Tasks 1,2,9. §5.4 radii → Tasks 3,9. §5.5 per-page accents → Task 5. §5.6 canvas retune → Task 5. §5.7 button flattening → Task 6. §6 rollout order → Tasks 1-9 in sequence. §7 change boundary → Task 10 Step 1. §8 validation → Tasks 7,10. `results.html` → Task 9.
