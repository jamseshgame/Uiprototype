# Hyperpop Visual Reskin — Design Spec

**Date:** 2026-06-01
**Status:** Approved (pending spec review)
**Scope:** Port the visual language (colours, fonts, styling, depth) of the `claudedesignui/` redesign onto the live `index.html` / `results.html` prototype — without breaking the working logic or the Unity/Vuplex integration in `C:\Users\Admin\Documents\GitHub\jamseshquest`.

---

## 1. Background & Problem

The live UI (`index.html`, ~19,900 lines, single-file) is the production prototype running in Vuplex WebView on Meta Quest. It is wired to Unity via element IDs, class names, function names, and `sendToUnity`/listener bridge messages. It was deliberately hardened for VR performance: on 2026-02-25 **all alpha transparency, `backdrop-filter`, `opacity<1`, `mix-blend-mode`, and shimmer were stripped** (they caused 98% CPU and flickering); translucent values were pre-baked to solid hex.

The redesign (`claudedesignui/`) is a separate Babel-in-browser React app built on the **exact techniques that were banned**: frosted glass (`backdrop-filter: blur(20px)`), `rgba` white-alpha surfaces, an SVG noise grain via `mix-blend-mode`, ambient colour orbs, and `color-mix(in oklab …)` — none of which are Chromium-91-safe or VR-perf-safe.

**Therefore the look must be *translated* into the live UI's opaque/flat system, not copied.**

## 2. Goals

- Adopt the redesign's **"Hyperpop" identity** (palette, fonts, radii, depth feel) as the new default look across the entire UI, in one pass.
- Preserve **per-page accent wayfinding** (re-tinted into the new palette family).
- Keep the UI **fully functional and Unity-compatible** — visual-only changes, layout tweaks allowed.
- Stay within the **VR performance rules** (no alpha-composited DOM, no blur, no blend modes).

## 3. Non-Goals

- No changes to application logic, navigation flow, data handling, or onboarding/demo behaviour.
- No renamed IDs / classes / function names that JS or Unity reference; no changed bridge messages.
- No port of `claudedesignui`'s React component structure or its CSS class architecture.
- No in-headset performance tuning beyond honouring the existing perf rules (final Quest validation is the user's).

## 4. Approach

**Re-token the existing CSS custom-property system** (chosen over a scoped theme class or a ground-up restyle). The live UI is already heavily variable-driven (`--bg-panel`, `--text-primary`, accent vars, `--radius-outer`/`--panel-radius`/`--radius-inner`, and a per-page `--btn-*` set swapped by `navigateTo()`). Redefining those values at the token layer reskins everything variable-driven in one move, confines risk to CSS + assets, and makes the per-page-accent requirement fall out naturally.

## 5. Design Detail

### 5.1 Palette (canonical Hyperpop — solid hex, zero alpha)

| Token | Value | Role |
|---|---|---|
| `--bg-deep` | `#100C1F` | page base |
| `--bg-1` | `#1B1638` | raised bg step |
| `--bg-2` | `#261F49` | raised bg step |
| `--accent` (lime) | `#E8FF3A` | primary action |
| `--accent-ink` | `#100C1F` | text on lime |
| `--accent-2` (magenta) | `#FF2E92` | secondary |
| `--accent-3` (lavender) | `#B0A6DF` | tertiary |
| `--accent-4` (teal) | `#00E5C7` | tertiary |
| `--text-1` | `#FFFFFF` | primary text |
| `--text-2` | `rgba(255,255,255,0.65)` | secondary text — kept as rgba (`color` is a paint op, allowed) |
| `--text-3` | `rgba(255,255,255,0.40)` | muted text — kept as rgba (`color` is a paint op, allowed) |

Note: `color` with alpha is explicitly safe (it does not create a compositing layer), so the redesign's text ramp values carry over unchanged. Only *background* alpha must be flattened (§5.2).

These map onto the live UI's existing variable names (`--bg-body`, `--bg-panel`, `--bg-surface`, `--text-primary`, `--text-secondary`, `--text-muted`, `--pink`/accent, etc.) — the live names stay; only their values change.

### 5.2 Surface flattening rule

Every translucent surface in the redesign is converted to solid hex against its **local opaque base** using:

```
result_channel = α · fg_channel + (1 − α) · base_channel
```

Example: `--surface = rgba(255,255,255,0.04)` over `#100C1F` → `#1A1628`. A single **canonical flattened-token table** is produced so the same surface reads identically everywhere. The redesign's topbar "glass" gradient (`linear-gradient(rgba(255,255,255,0.06), rgba(255,255,255,0.02))`) is likewise baked to an opaque two-stop gradient (bottom layer solid).

**Banned in the output (hard line):** `backdrop-filter`, `rgba()`/`hsla()` with alpha as a *background*, `opacity` < 1 on rendered elements, `mix-blend-mode`, `color-mix`, `oklab`. (rgba in `box-shadow`/`text-shadow`/`border-color`/`color` and in upper layers of a multi-layer background with an opaque bottom layer remain allowed — these are paint ops, per the VR perf notes.)

### 5.3 Fonts

Self-hosted woff2 copied from `claudedesignui/assets/fonts/` into a root `fonts/` folder (~56 KB total), with three `@font-face` blocks added to `index.html` and `results.html`:

| Font | Role | Replaces |
|---|---|---|
| **Monda** (400–700) | body text / metadata | Inter |
| **Bebas Neue** (400) | headings, labels, buttons | Chakra Petch |
| **Gasoek One** (400) | logo wordmark / hero display only | — |

**VR readability pass:** Bebas Neue is condensed; wherever a Bebas Neue element sits near the 16px VR floor, bump font-size and add letter-spacing so it stays legible in-headset. Maintain the global 16px minimum.

### 5.4 Radii

Retune to the redesign's scale (`lg 32 / md 22 / sm 14`) mapped onto the existing `--radius-outer` / `--panel-radius` / `--radius-inner` variables, preserving the nested-radius concentricity formula (`R_outer = R_inner + padding`). Circles (`50%`) and pills (`999px`) unchanged.

### 5.5 Per-page accent map (re-tinted)

`navigateTo()` already swaps the `--btn-*` accent set per page; only the source colours change. Mapping keeps each page's rough hue family while pulling from the Hyperpop palette and its three sibling palettes (sunset/y2k/bedroom):

| Page | Current accent | New accent |
|---|---|---|
| Main Stage (hero) | cyan | lime `#E8FF3A` (signature primary) |
| Home | purple | lavender `#B0A6DF` |
| Social | green | teal `#00E5C7` |
| Spaces | blue | periwinkle `#6B7AFF` |
| Creator | amber | amber `#FFCB6B` |
| Store | pink | magenta `#FF2E92` |
| Season | gold | violet `#C77DFF` |
| Profile | purple | lavender `#B0A6DF` |

Adjustable; this is a starting map.

### 5.6 Ambient backdrop — retune the existing particle canvas

The live UI already renders the ambient backdrop via a full-screen animated particle canvas (`drawParticles`, z-index 0), driven per-page by the `pageColorSchemes` object (`index.html` ~19760): each page has a 4-stop `grad` (canvas linear gradient), a `waves` colour set (glowing wave-lines), an `accent`, and particle tints (`pt`/`pb`). It is already perf-tuned ("single pass, no shadowBlur").

**Decision:** recolour `pageColorSchemes` per page to the Hyperpop palette (deep-purple gradients + lime/magenta/teal/lavender waves & particle tints) to achieve the ambient-orb mood. This keeps the animated glow, reuses already-safe machinery, and **adds no image assets and no generator**. The SVG noise grain from the redesign is **dropped entirely**.

(Supersedes the earlier baked-PNG approach — no `backdrops/` folder is created.)

### 5.7 Button-accent flattening (JS, styling-only)

`setPageColors()` (`index.html` ~19783, in the second/interaction-layer `<script>`) currently emits per-page button colours as `rgba(accent, α)` *backgrounds* (`--btn-tab`, `--btn-panel`, `--btn-primary`, …). Alpha *backgrounds* violate the VR perf rule (§5.2). Since these lines are edited anyway to apply the new accents, the values are **flattened to pre-computed solid hex** using the §5.2 formula (blending the accent over the panel base), keeping the same look without a compositing layer. This is a styling-only JS change — no IDs/handlers/bridge/flow are affected.

## 6. Rollout Sequence (single pass, ordered to surface regressions early)

1. Fonts + `@font-face` + global token redefinition + radii (reskins everything variable-driven).
2. Flatten and verify surfaces / buttons / borders / tiles against the perf guardrail.
3. Per-page accent map (incl. button-accent flattening §5.7) + retuned particle canvas (`pageColorSchemes` §5.6).
4. Screen-by-screen refinement where the redesign's **layout** genuinely differs (e.g. two-row topbar, setlist panel treatment) — within the change boundary (§7).
5. Apply the same token + font treatment to `results.html` (it duplicates the results look standalone).

## 7. Change Boundary ("without breaking anything")

- **Allowed:** CSS edits; new `fonts/` and `backdrops/` assets; styling-only wrapper elements/classes; element sizing/spacing/structure adjustments where the redesign's layout differs.
- **Forbidden:** renaming or removing any ID / class / function referenced by JS or the Unity bridge; changing bridge message names or payloads; altering logic, navigation, or flow; introducing any banned CSS property (§5.2).

## 8. Validation (Definition of Done)

- **Functional/visual walkthrough** in desktop Chromium for both `index.html` and `results.html`: every page, every popup, onboarding (legal/perms/tutorial), demo screens, `?host`/`?client` lobby flows, store tabs, creator flows, layout picker — nothing visually broken or unclickable.
- **Perf guardrail grep** over the diff: zero hits for `backdrop-filter`, alpha `rgba`/`hsla` backgrounds, `opacity:` <1, `oklab`, `color-mix`, `mix-blend-mode`.
- **Hook integrity:** diff confirms no renamed IDs/classes/functions referenced by JS or Unity, and no changed bridge messages.
- **Called-out gaps:** anything not verifiable on desktop (real in-headset font rendering, perf under load on Quest) is explicitly flagged for the user to test against `jamseshquest`.

## 9. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Reintroducing a banned CSS property by copying redesign CSS | Perf guardrail grep is part of DoD; flatten-by-formula, never paste rgba/blur. |
| Bebas Neue illegible at small VR sizes | Readability pass (§5.3); flag for in-headset check. |
| A styling change accidentally touches a Unity-referenced hook | Change boundary (§7) + hook-integrity diff in DoD. |
| Layout tweaks regress a flow | Sequenced rollout; full walkthrough in DoD. |
| Retuned canvas colours clash or read muddy | Canvas gradient/waves reviewed per page in the walkthrough; values adjustable in one object. |

## 10. Open Items

- Exact flattened-token hex table is produced during implementation (method fixed here in §5.2).
