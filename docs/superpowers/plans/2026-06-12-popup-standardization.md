# Popup Standardization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every in-scope popup an identical frame — fixed 1152×1152 square (1:1, 20% inset), a large top-right X close, and a centered row of equal-size CTA buttons.

**Architecture:** Add one shared CSS frame system (`.std-popup`, `.std-popup-header`, `.std-popup-body`, `.std-popup-footer`, `.std-popup-btn`) plus an upgraded `.popup-close-btn`. The frame uses `width/height: 1152px !important` so it overrides the many inline `panel.style.width='…'` JS overrides without editing each one. Then retrofit each of the 12 popups: add the `std-popup` class to its panel, ensure the X exists, convert its bottom buttons to a `.std-popup-footer` row, and delete Cancel/Back (X handles dismissal).

**Tech Stack:** Single-file `index.html`. **Chromium 91 / ES5 only** in the main `<script>` (no `let`/`const`/arrow/template literals). CSS in the one `<style>` block. No build, no tests — validation is manual in desktop Chromium against `http://localhost:3000` (browser-sync live-reloads on save).

**Reference spec:** `docs/superpowers/specs/2026-06-12-popup-standardization-design.md`

**Conventions for every task below:**
- "Verify" steps = load `http://localhost:3000`, open the popup, eyeball it. No automated tests exist.
- Commit after each task. Branch is `hyperpop-reskin`; commit there.
- Inner content box available to each popup ≈ **1040px wide × ~760px tall** (1152 − 56 padding ×2 − ~88 header − ~104 footer − gaps).

---

## Task 1: Shared frame CSS + upgraded close button

**Files:**
- Modify: `index.html` — the `<style>` block, near the existing `.popup-close-btn` rule (~line 2948) and `.option-picker-overlay` (~2296).

- [ ] **Step 1: Upgrade `.popup-close-btn` to the large standard**

Find (~line 2948):

```css
  .popup-close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 64px;
    height: 64px;
    border-radius: 50%;
```

Replace the four lines `top`/`right`/`width`/`height` and bump font-size. Final rule head:

```css
  .popup-close-btn {
    position: absolute;
    top: 32px;
    right: 32px;
    width: 80px;
    height: 80px;
    border-radius: 50%;
```

And change `font-size: 32px;` (a few lines down, still inside `.popup-close-btn`) to `font-size: 40px;`.

- [ ] **Step 2: Add the shared frame system**

Immediately AFTER the closing `}` of `.popup-close-btn:active` (~line 2975), insert:

```css
  /* ───────────────────────────────────────────────
     Standard popup frame — every content popup shares
     this footprint: 1152×1152 square (1:1, 20% inset),
     large X top-right, centered equal-size CTA row.
     `!important` on size defeats inline panel.style.width
     overrides set by JS-built pickers.
     ─────────────────────────────────────────────── */
  .std-popup {
    position: relative;
    width: 1152px !important;
    height: 1152px !important;
    max-width: 1152px !important;
    max-height: 1152px !important;
    box-sizing: border-box;
    padding: 56px !important;
    border-radius: var(--radius-outer);
    display: flex !important;
    flex-direction: column;
    gap: 24px;
    overflow: hidden;
  }
  .std-popup-header {
    flex-shrink: 0;
    min-height: 88px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .std-popup-body {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow: hidden;
  }
  .std-popup-footer {
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 24px;
  }
  .std-popup-btn {
    width: 440px;
    height: 104px;
    flex: 0 0 440px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--panel-radius);
    border: 1px solid var(--btn-primary-border);
    background: var(--btn-primary);
    color: #ffffff;
    font-size: 28px;
    font-weight: 700;
    font-family: 'Bebas Neue', sans-serif;
    cursor: pointer;
    transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
  }
  .std-popup-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.35); }
  .std-popup-btn:active { transform: scale(0.97); }
```

- [ ] **Step 3: Verify nothing broke**

Reload `http://localhost:3000`. Open the Store → buy a locked item → the purchase popup still appears (we haven't migrated it yet, but the bigger X should already show since `.popup-close-btn` is global). Confirm the X is now larger and sits ~32px from the top-right corner. No layout should be broken.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat(reskin): add shared std-popup frame system + larger close X"
```

---

## Task 2: Purchase popup

**Files:** Modify `index.html` HTML at ~line 10176.

- [ ] **Step 1: Replace the popup markup**

Find:

```html
  <div class="purchase-popup" onclick="event.stopPropagation()" style="position:relative">
    <button class="popup-close-btn" onclick="closePurchasePopup()">&#10005;</button>
    <div class="purchase-preview" id="purchase-preview"></div>
    <div class="purchase-title" id="purchase-title"></div>
    <div class="purchase-cost" id="purchase-cost"></div>
    <div class="purchase-balance" id="purchase-balance"></div>
    <div class="purchase-buttons">
      <button class="purchase-btn purchase-btn-cancel" onclick="closePurchasePopup()">Cancel</button>
      <button class="purchase-btn purchase-btn-confirm" id="purchase-confirm-btn" onclick="confirmPurchase()">Unlock</button>
    </div>
  </div>
```

Replace with:

```html
  <div class="purchase-popup std-popup" onclick="event.stopPropagation()">
    <button class="popup-close-btn" onclick="closePurchasePopup()">&#10005;</button>
    <div class="std-popup-header"><div class="purchase-title" id="purchase-title"></div></div>
    <div class="std-popup-body" style="align-items:center;justify-content:center">
      <div class="purchase-preview" id="purchase-preview"></div>
      <div class="purchase-cost" id="purchase-cost"></div>
      <div class="purchase-balance" id="purchase-balance"></div>
    </div>
    <div class="std-popup-footer">
      <button class="std-popup-btn jamsesh-signature" id="purchase-confirm-btn" onclick="confirmPurchase()">Unlock</button>
    </div>
  </div>
```

Note: title moves into the header; Cancel button deleted; Unlock becomes the single centered CTA.

- [ ] **Step 2: Verify**

Reload. Store → open a locked item's purchase popup. Confirm: 1152² square, X top-right, single centered "Unlock" CTA at the bottom, preview/cost/balance centered in the middle, no scrollbar.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(reskin): standardize purchase popup onto std-popup frame"
```

---

## Task 3: Save Setlist popup

**Files:** Modify `index.html` HTML at ~line 10247.

- [ ] **Step 1: Replace markup**

Find:

```html
  <div class="save-popup" onclick="event.stopPropagation()" style="position:relative">
    <button class="popup-close-btn" onclick="closeSaveOverlay()">&#10005;</button>
    <h2>Save Setlist</h2>
    <input class="save-input" id="save-setlist-input" type="text">
    <div class="save-buttons">
      <button class="save-btn-cancel" onclick="closeSaveOverlay()">Cancel</button>
      <button class="save-btn-confirm" onclick="confirmSaveSetlist()">Save</button>
    </div>
  </div>
```

Replace with:

```html
  <div class="save-popup std-popup" onclick="event.stopPropagation()">
    <button class="popup-close-btn" onclick="closeSaveOverlay()">&#10005;</button>
    <div class="std-popup-header"><h2>Save Setlist</h2></div>
    <div class="std-popup-body" style="justify-content:center">
      <input class="save-input" id="save-setlist-input" type="text">
    </div>
    <div class="std-popup-footer">
      <button class="std-popup-btn" onclick="confirmSaveSetlist()">Save</button>
    </div>
  </div>
```

- [ ] **Step 2: Verify**

Reload. Main Stage → options row → Save Setlist. Confirm 1152² square, X, single centered "Save" CTA, text input centered. Native keyboard still focuses the input (don't add `readonly`).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(reskin): standardize save setlist popup onto std-popup frame"
```

---

## Task 4: Referral code + referral help popups

**Files:** Modify `index.html` HTML at ~lines 10260 and 10275. Also remove the now-stale width override CSS at ~line 6357.

- [ ] **Step 1: Replace the referral-code popup markup**

Find (~10261):

```html
  <div class="save-popup referral-code-popup" onclick="event.stopPropagation()" style="position:relative">
    <button class="popup-close-btn" onclick="closeReferralCodePopup()">&#10005;</button>
    <h2>Enter Referral Code</h2>
    <div class="referral-code-popup-sub">Got a code from a friend? Enter it below &mdash; you <b>both</b> earn <b><span id="referral-code-popup-reward">500</span> Picks</b> when you finish your first jam.</div>
    <input class="save-input" id="referral-code-input" type="text" maxlength="12" placeholder="e.g. J4M-53SH">
    <div class="referral-code-error" id="referral-code-error"></div>
    <div class="save-buttons">
      <button class="save-btn-cancel" onclick="closeReferralCodePopup()">Cancel</button>
      <button class="save-btn-confirm" onclick="confirmReferralCode()">Submit</button>
    </div>
  </div>
```

Replace with:

```html
  <div class="save-popup referral-code-popup std-popup" onclick="event.stopPropagation()">
    <button class="popup-close-btn" onclick="closeReferralCodePopup()">&#10005;</button>
    <div class="std-popup-header"><h2>Enter Referral Code</h2></div>
    <div class="std-popup-body" style="justify-content:center">
      <div class="referral-code-popup-sub">Got a code from a friend? Enter it below &mdash; you <b>both</b> earn <b><span id="referral-code-popup-reward">500</span> Picks</b> when you finish your first jam.</div>
      <input class="save-input" id="referral-code-input" type="text" maxlength="12" placeholder="e.g. J4M-53SH">
      <div class="referral-code-error" id="referral-code-error"></div>
    </div>
    <div class="std-popup-footer">
      <button class="std-popup-btn" onclick="confirmReferralCode()">Submit</button>
    </div>
  </div>
```

- [ ] **Step 2: Replace the referral-help popup markup**

Find (~10276):

```html
  <div class="save-popup referral-code-popup" onclick="event.stopPropagation()" style="position:relative">
    <button class="popup-close-btn" onclick="closeReferralHelpPopup()">&#10005;</button>
    <h2>How Referrals Work</h2>
    <div class="referral-code-popup-sub" id="referral-help-text"></div>
    <div class="save-buttons">
      <button class="save-btn-confirm" onclick="closeReferralHelpPopup()">Got It</button>
    </div>
  </div>
```

Replace with:

```html
  <div class="save-popup referral-code-popup std-popup" onclick="event.stopPropagation()">
    <button class="popup-close-btn" onclick="closeReferralHelpPopup()">&#10005;</button>
    <div class="std-popup-header"><h2>How Referrals Work</h2></div>
    <div class="std-popup-body" style="justify-content:center">
      <div class="referral-code-popup-sub" id="referral-help-text"></div>
    </div>
    <div class="std-popup-footer">
      <button class="std-popup-btn" onclick="closeReferralHelpPopup()">Got It</button>
    </div>
  </div>
```

Note: "Got It" is an affirmative dismiss, kept as the single CTA (the X also dismisses).

- [ ] **Step 3: Remove the stale width override**

Find (~line 6356):

```css
  /* Doubled class beats .save-popup's later width:1600px declaration. */
  .save-popup.referral-code-popup { width: 980px; }
```

Delete both lines (the `std-popup` `!important` width now governs).

- [ ] **Step 4: Verify**

Reload. Profile → Referrals → "Enter a code" and "How it works". Confirm both are 1152² with X and a single centered CTA.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat(reskin): standardize referral code + help popups onto std-popup frame"
```

---

## Task 5: Create Space popup

**Files:** Modify `index.html` HTML at ~line 10377.

- [ ] **Step 1: Replace markup**

Find:

```html
  <div class="create-space-popup" onclick="event.stopPropagation()" style="position:relative">
    <button class="popup-close-btn" onclick="closeCreateSpace()">&#10005;</button>
    <h2 style="font-size:40px;font-weight:800;color:var(--text-primary);margin:0;text-align:center">Create Space</h2>
    <input class="save-input" id="create-space-name" type="text" placeholder="Space Name">
    <div class="create-space-toggle" id="create-space-toggle">
      <button class="create-space-toggle-btn active" onclick="setCreateSpaceType('public')">Public</button>
      <button class="create-space-toggle-btn" onclick="setCreateSpaceType('private')">Private</button>
    </div>
    <div class="create-space-env-grid" id="create-space-env-grid"></div>
    <div class="save-buttons">
      <button class="save-btn-cancel" onclick="closeCreateSpace()">Cancel</button>
      <button class="save-btn-confirm" onclick="confirmCreateSpace()">Create</button>
    </div>
  </div>
```

Replace with:

```html
  <div class="create-space-popup std-popup" onclick="event.stopPropagation()">
    <button class="popup-close-btn" onclick="closeCreateSpace()">&#10005;</button>
    <div class="std-popup-header"><h2 style="font-size:40px;font-weight:800;color:var(--text-primary);margin:0;text-align:center">Create Space</h2></div>
    <div class="std-popup-body">
      <input class="save-input" id="create-space-name" type="text" placeholder="Space Name" style="flex-shrink:0">
      <div class="create-space-toggle" id="create-space-toggle" style="flex-shrink:0">
        <button class="create-space-toggle-btn active" onclick="setCreateSpaceType('public')">Public</button>
        <button class="create-space-toggle-btn" onclick="setCreateSpaceType('private')">Private</button>
      </div>
      <div class="create-space-env-grid" id="create-space-env-grid" style="flex:1;min-height:0"></div>
    </div>
    <div class="std-popup-footer">
      <button class="std-popup-btn" onclick="confirmCreateSpace()">Create</button>
    </div>
  </div>
```

- [ ] **Step 2: Verify**

Reload. Spaces → "Create New". Confirm 1152² square, X, single centered "Create" CTA, env grid fits with no scrollbar (tiles may be smaller — expected).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(reskin): standardize create-space popup onto std-popup frame"
```

---

## Task 6: Create Group popup (two-column invite)

**Files:** Modify `index.html` HTML at ~line 10342.

- [ ] **Step 1: Replace markup**

Find:

```html
  <div class="create-group-popup" onclick="event.stopPropagation()" style="position:relative">
    <button class="popup-close-btn" onclick="closeCreateGroup()">&#10005;</button>
    <h2 style="font-size:40px;font-weight:800;color:var(--text-primary);margin:0;text-align:center">Create Group</h2>
    <div class="create-group-header">
      <div class="create-group-logo" id="create-group-logo" onclick="openLogoPicker()">
        <span class="logo-plus">+</span>
      </div>
      <input class="save-input" id="create-group-name" type="text" placeholder="Group Name" inputmode="none" onclick="requestKeyboardForInput('create-group-name')" style="flex:1">
    </div>
    <div class="create-group-columns">
      <div class="create-group-col">
        <div class="create-group-col-title">Available Friends</div>
        <div class="create-group-list" id="create-group-available"></div>
      </div>
      <div class="create-group-col">
        <div class="create-group-col-title">Group Members</div>
        <div class="create-group-list" id="create-group-members"></div>
      </div>
    </div>
    <div class="save-buttons">
      <button class="save-btn-cancel" onclick="closeCreateGroup()">Cancel</button>
      <button class="save-btn-confirm" onclick="confirmCreateGroup()">Create</button>
    </div>
  </div>
```

Replace with:

```html
  <div class="create-group-popup std-popup" onclick="event.stopPropagation()">
    <button class="popup-close-btn" onclick="closeCreateGroup()">&#10005;</button>
    <div class="std-popup-header"><h2 style="font-size:40px;font-weight:800;color:var(--text-primary);margin:0;text-align:center">Create Group</h2></div>
    <div class="std-popup-body">
      <div class="create-group-header" style="flex-shrink:0">
        <div class="create-group-logo" id="create-group-logo" onclick="openLogoPicker()">
          <span class="logo-plus">+</span>
        </div>
        <input class="save-input" id="create-group-name" type="text" placeholder="Group Name" inputmode="none" onclick="requestKeyboardForInput('create-group-name')" style="flex:1">
      </div>
      <div class="create-group-columns" style="flex:1;min-height:0">
        <div class="create-group-col">
          <div class="create-group-col-title">Available Friends</div>
          <div class="create-group-list" id="create-group-available"></div>
        </div>
        <div class="create-group-col">
          <div class="create-group-col-title">Group Members</div>
          <div class="create-group-list" id="create-group-members"></div>
        </div>
      </div>
    </div>
    <div class="std-popup-footer">
      <button class="std-popup-btn" onclick="confirmCreateGroup()">Create</button>
    </div>
  </div>
```

- [ ] **Step 2: Check the two columns scroll/fit**

The two `.create-group-list` columns may overflow inside the shorter body. Find the `.create-group-list` CSS rule (~line 7180 region; grep `\.create-group-list`). Ensure it has `overflow-y: auto; min-height: 0;` so each column scrolls internally rather than pushing the footer off. If those properties are absent, add them to the existing rule. (Per-column internal scroll is acceptable — the frame itself stays fixed and shows no outer scrollbar.)

- [ ] **Step 3: Verify**

Reload. Social → Groups → "Create New". Confirm 1152² square, X, single centered "Create" CTA, both invite columns fit inside the frame (columns may scroll internally; the popup frame does not).

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat(reskin): standardize create-group popup onto std-popup frame"
```

---

## Task 7: Logo Picker popup

**Files:** Modify `index.html` HTML at ~line 10369.

- [ ] **Step 1: Replace markup**

Find:

```html
  <div class="logo-picker-popup" onclick="event.stopPropagation()" style="position:relative">
    <button class="popup-close-btn" onclick="closeLogoPicker()">&#10005;</button>
    <h2 style="font-size:36px;font-weight:800;color:var(--text-primary);margin:0">Choose Logo</h2>
    <div class="logo-picker-grid" id="logo-picker-grid"></div>
  </div>
```

Replace with:

```html
  <div class="logo-picker-popup std-popup" onclick="event.stopPropagation()">
    <button class="popup-close-btn" onclick="closeLogoPicker()">&#10005;</button>
    <div class="std-popup-header"><h2 style="font-size:36px;font-weight:800;color:var(--text-primary);margin:0">Choose Logo</h2></div>
    <div class="std-popup-body"><div class="logo-picker-grid" id="logo-picker-grid" style="flex:1;min-height:0"></div></div>
  </div>
```

Note: this is a select-and-close picker (tap a logo → it applies and closes), so **no footer** — just the X.

- [ ] **Step 2: Verify**

Reload. Social → Create Group → tap the logo `+`. Confirm 1152² square, X top-right, logo grid fits, no footer/CTA row, tapping a logo still selects and closes.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(reskin): standardize logo picker popup onto std-popup frame"
```

---

## Task 8: Challenge reward popup

**Files:** Modify `index.html` HTML at ~line 10287.

- [ ] **Step 1: Replace markup**

Find:

```html
  <div class="challenge-panel" onclick="event.stopPropagation()">
    <button class="popup-close-btn" onclick="closeChallengePopup()">&#10005;</button>
    <div class="challenge-title" id="challenge-title"></div>
    <div class="challenge-reward-wrap">
      <div class="challenge-reward-grid" id="challenge-reward-grid"></div>
    </div>
    <div class="challenge-claim-msg" id="challenge-claim-msg"></div>
    <div class="challenge-cta-row">
      <div class="challenge-expiry" id="challenge-expiry"></div>
      <button class="challenge-action-btn jamsesh-signature" id="challenge-action-btn" onclick="challengeAction()">Rate Us</button>
      <div class="challenge-progress" id="challenge-progress"></div>
    </div>
    <button class="challenge-nav challenge-nav-prev" id="challenge-nav-prev" onclick="challengePrev()">&#9664;</button>
    <button class="challenge-nav challenge-nav-next" id="challenge-nav-next" onclick="challengeNext()">&#9654;</button>
  </div>
```

Replace with:

```html
  <div class="challenge-panel std-popup" onclick="event.stopPropagation()">
    <button class="popup-close-btn" onclick="closeChallengePopup()">&#10005;</button>
    <div class="std-popup-header"><div class="challenge-title" id="challenge-title"></div></div>
    <div class="std-popup-body" style="align-items:center;justify-content:center">
      <div class="challenge-reward-wrap">
        <div class="challenge-reward-grid" id="challenge-reward-grid"></div>
      </div>
      <div class="challenge-claim-msg" id="challenge-claim-msg"></div>
      <div class="challenge-expiry" id="challenge-expiry"></div>
      <div class="challenge-progress" id="challenge-progress"></div>
    </div>
    <div class="std-popup-footer">
      <button class="std-popup-btn jamsesh-signature" id="challenge-action-btn" onclick="challengeAction()">Rate Us</button>
    </div>
    <button class="challenge-nav challenge-nav-prev" id="challenge-nav-prev" onclick="challengePrev()">&#9664;</button>
    <button class="challenge-nav challenge-nav-next" id="challenge-nav-next" onclick="challengeNext()">&#9654;</button>
  </div>
```

Note: the action button (Rate Us / Claim) moves into the standard footer; expiry/progress text move into the body. The prev/next nav arrows stay as absolutely-positioned children of the frame.

- [ ] **Step 2: Check JS that toggles `challenge-action-btn`**

Grep `challenge-action-btn` and `challenge-cta-row` in the script. The button id is unchanged so existing `challengeAction()` / label-swap logic still works. If any JS references `.challenge-cta-row` for layout/measurement, update it to the new structure or remove the reference (null-guard per the codebase's "null guard on removed elements" pitfall). Confirm no JS throws on open.

- [ ] **Step 3: Verify**

Reload. Open the challenge/Rate-Us popup (Profile → the Rate Us challenge entry). Confirm 1152² square, X, single centered action CTA, prev/next arrows still work, claim message visible.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat(reskin): standardize challenge reward popup onto std-popup frame"
```

---

## Task 9: Load Setlist popup

**Files:** Modify `index.html` HTML at ~line 10310. This popup has no static panel wrapper and no X today — add both.

- [ ] **Step 1: Replace markup**

Find:

```html
<div class="load-overlay" id="load-overlay">
  <div class="load-title">Load Setlist</div>
  <div class="play-mode-tabs" id="load-tabs" style="flex-shrink:0">
    <button class="play-mode-tab active" onclick="switchLoadTab('my')">Personal</button>
    <button class="play-mode-tab" onclick="switchLoadTab('jamsesh')">Jamsesh</button>
    <button class="play-mode-tab" onclick="switchLoadTab('community')">Community</button>
  </div>
  <div class="load-list" id="load-list"></div>
  <div class="load-pagination" id="load-pagination"></div>
  <div style="display:flex;gap:var(--grid-gap);flex-shrink:0">
    <button class="play-bar-btn" style="flex:1" onclick="closeLoadOverlay()"><svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>Back</button>
  </div>
</div>
```

Replace with:

```html
<div class="load-overlay" id="load-overlay">
  <div class="std-popup" onclick="event.stopPropagation()">
    <button class="popup-close-btn" onclick="closeLoadOverlay()">&#10005;</button>
    <div class="std-popup-header"><div class="load-title">Load Setlist</div></div>
    <div class="std-popup-body">
      <div class="play-mode-tabs" id="load-tabs" style="flex-shrink:0">
        <button class="play-mode-tab active" onclick="switchLoadTab('my')">Personal</button>
        <button class="play-mode-tab" onclick="switchLoadTab('jamsesh')">Jamsesh</button>
        <button class="play-mode-tab" onclick="switchLoadTab('community')">Community</button>
      </div>
      <div class="load-list" id="load-list" style="flex:1;min-height:0;overflow-y:auto"></div>
      <div class="load-pagination" id="load-pagination" style="flex-shrink:0"></div>
    </div>
  </div>
</div>
```

Note: `load-overlay` itself is the flex-centering overlay (its CSS at ~7027 already centers). The new inner `.std-popup` becomes the frame. This is a select-and-close list, so **no footer** — the X replaces "Back". If `.load-overlay` CSS sets `flex-direction:column`/padding that assumed it WAS the panel, change it to a plain centering overlay: `display:flex; align-items:center; justify-content:center;` (check rule at ~7027 and adjust; remove any panel-like background/border/padding from `.load-overlay` and let `.std-popup` provide them, OR keep `.load-overlay` background as the dim backdrop).

- [ ] **Step 2: Verify**

Reload. Main Stage → options → Load Setlist. Confirm 1152² square, X top-right (no Back button), three tabs, list fits/scrolls internally, pagination visible.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(reskin): standardize load setlist popup onto std-popup frame"
```

---

## Task 10: Option picker (Instrument / Difficulty / Experience / Name)

**Files:** Modify `index.html` — static panel at ~10193, builder JS around 14513, 15151, 15258–15600, 16071. CSS `.option-picker-panel` at ~2305.

The option-picker reuses one panel (`#option-picker-panel`) for four pickers. Strategy: add `std-popup` to the panel element, add the X to the overlay, and make each builder emit a `.std-popup-header`/`.std-popup-body`/`.std-popup-footer` structure. The `!important` sizing neutralizes the inline `panel.style.width` lines, but we also clean them up.

- [ ] **Step 1: Add the persistent X to the overlay**

Find (~10193):

```html
<div class="option-picker-overlay" id="option-picker-overlay" style="display:none" onclick="closeOptionPicker()">
  <div class="option-picker-panel" id="option-picker-panel" onclick="event.stopPropagation()"></div>
</div>
```

Replace with:

```html
<div class="option-picker-overlay" id="option-picker-overlay" style="display:none" onclick="closeOptionPicker()">
  <div class="option-picker-panel std-popup" id="option-picker-panel" onclick="event.stopPropagation()">
    <button class="popup-close-btn" onclick="closeOptionPicker()">&#10005;</button>
  </div>
</div>
```

IMPORTANT: the builders set `panel.innerHTML = …`, which would wipe the X. So instead of relying on the static X, each builder must re-add it. Simpler: keep the static X out and have builders prepend it. **Use this approach instead** — leave the static panel empty:

```html
  <div class="option-picker-panel std-popup" id="option-picker-panel" onclick="event.stopPropagation()"></div>
```

…and in each builder's assembled HTML string, make the FIRST child:

```html
<button class="popup-close-btn" onclick="closeOptionPicker()">&#10005;</button>
```

- [ ] **Step 2: Neutralize inline width/height overrides**

Grep `panel.style.width` / `panel.style.maxHeight` inside the option-picker builders (lines ~14513-14514, ~15151-15152, ~15271-15272, ~15361-15362, ~15400-15401, ~16076-16077). Set each pair to the standard (or delete them, since `.std-popup` is `!important`). Replace each occurrence:

```javascript
    panel.style.width = '1400px';
    panel.style.maxHeight = '1500px';
```

with:

```javascript
    panel.style.width = '';
    panel.style.maxHeight = '';
```

(Leaving them empty lets the `.std-popup` CSS govern. Do this for all six occurrences, including the `1700px` name-picker at ~16076 and the `1200px` ones.)

- [ ] **Step 3: Wrap each builder's content into header/body/footer**

For each of the four pickers, the builder currently appends a title + content (+ for Experience, a Cancel/Accept row). Restructure each builder's output so it reads:

```
[X button] + [.std-popup-header with the title] + [.std-popup-body with the grid/list] + (optional [.std-popup-footer])
```

Concrete per picker:

- **Difficulty** (builder ~15400) and **Instrument** (builder ~15151/15271): select-and-close → **no footer**. Wrap the existing title in `<div class="std-popup-header">…</div>` and the existing grid/list in `<div class="std-popup-body">…</div>`. Prepend the X button.

- **Experience** (builder ~15258-15586, Cancel/Accept created ~15500-15526): wrap title in header, the tabbed grid in body, and replace the Cancel+Accept row with a `.std-popup-footer` containing only Accept:

  Find the JS that builds the cancel button (around 15500-15520, `cancelBtn.textContent = 'Cancel'`) and the accept button (`acceptBtn.textContent = 'Accept'`). Remove the Cancel button creation/append entirely. Put the Accept button inside a footer element with classes `std-popup-footer` (container) and give the accept button `std-popup-btn jamsesh-signature`. Keep its existing onclick (closeOptionPicker / commit).

- **Name picker** (`openCreatorNamePicker` ~16071): wrap title in header, the 3×3 name grid in body. Select-and-close → **no footer**. Prepend X.

Because these builders are bespoke, the executor should read each builder fully, then rewrap its output following the pattern above, keeping all existing ids/onclick handlers intact. Maintain **ES5** syntax (`var`, string concatenation, `function`).

- [ ] **Step 4: Verify each picker**

Reload. Main Stage → active song → open each: **Instrument**, **Difficulty**, **Experience**, and (Creator → Art → name) **Name**. For each confirm: 1152² square, X top-right, content fits. Experience shows a single centered "Accept" CTA and no Cancel. Instrument/Difficulty/Name select-and-close with no footer. Confirm Accept still commits and X/closeOptionPicker reverts (experience snapshot behavior unchanged).

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat(reskin): standardize option pickers (instrument/difficulty/experience/name) onto std-popup frame"
```

---

## Task 11: Solo popup

**Files:** Modify `index.html` — static panel ~10190, builder `openSoloPopup` ~12430.

- [ ] **Step 1: Add the frame class**

Find (~10190):

```html
<div class="solo-popup-overlay" id="solo-popup-overlay" onclick="closeSoloPopup()">
  <div class="solo-popup" id="solo-popup" onclick="event.stopPropagation()"></div>
</div>
```

Replace with:

```html
<div class="solo-popup-overlay" id="solo-popup-overlay" onclick="closeSoloPopup()">
  <div class="solo-popup std-popup" id="solo-popup" onclick="event.stopPropagation()"></div>
</div>
```

- [ ] **Step 2: Restructure the builder output**

Read `openSoloPopup` (~12430). It sets `#solo-popup` innerHTML and already creates a `.popup-close-btn` (grep confirmed `closeBtn.className = 'popup-close-btn'` at ~12439/12506). Rework the assembled HTML so it is: the X button, then `<div class="std-popup-header">` with the popup title, then `<div class="std-popup-body">` with the options/content, then — if the popup has an affirmative action button — a `<div class="std-popup-footer">` with that button given `std-popup-btn`. If it is purely a select-and-close list, omit the footer. Remove any Cancel/Back button. Keep all ids/handlers; maintain **ES5**.

- [ ] **Step 3: Verify**

Reload. Trigger the solo popup (the per-song quick options — open from a Main Stage song tile path that calls `openSoloPopup`). Confirm 1152² square, X, content fits, footer only if there's an affirmative CTA, no Cancel.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat(reskin): standardize solo popup onto std-popup frame"
```

---

## Task 12: Loadout popup

**Files:** Modify `index.html` — static panel ~10243, builder `openLoadoutPopup` ~12617.

- [ ] **Step 1: Add the frame class**

Find (~10243):

```html
<div class="loadout-overlay" id="loadout-overlay" onclick="closeLoadoutPopup(event)">
  <div class="loadout-popup" id="loadout-popup" onclick="event.stopPropagation()"></div>
</div>
```

Replace with:

```html
<div class="loadout-overlay" id="loadout-overlay" onclick="closeLoadoutPopup(event)">
  <div class="loadout-popup std-popup" id="loadout-popup" onclick="event.stopPropagation()"></div>
</div>
```

- [ ] **Step 2: Restructure the builder output**

Read `openLoadoutPopup` (~12617). Rework its assembled innerHTML to: X button (add a `.popup-close-btn` with `onclick="closeLoadoutPopup()"` if not present), then `<div class="std-popup-header">` title, then `<div class="std-popup-body">` content, then optional `<div class="std-popup-footer">` with the affirmative CTA (`std-popup-btn`). Remove Cancel/Back. Keep ids/handlers; **ES5**.

- [ ] **Step 3: Verify**

Reload. Open the loadout popup from its trigger. Confirm 1152² square, X, content fits, standardized footer (or none), no Cancel.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat(reskin): standardize loadout popup onto std-popup frame"
```

---

## Task 13: Cross-popup consistency pass

**Files:** `index.html` (touch-ups only as needed).

- [ ] **Step 1: Open all 12 popups in sequence and compare**

Reload. Open, in order: purchase, save, referral-code, referral-help, create-space, create-group, logo-picker, challenge, load, instrument, difficulty, experience, name, solo, loadout. For each confirm against the standard:
- Identical 1152×1152 footprint, centered.
- X at 80px, top-right, consistent inset.
- Footer (when present) centered, buttons 440×104, equal size.
- No outer scrollbars; content fits.
- No `Cancel`/`Back` text buttons remain.

- [ ] **Step 2: Theme + page-color spot check**

Open one picker from **Main Stage** (cyan) and one from **Store** (pink) — confirm buttons/accents adopt the page color. Switch to **Nebula** and **Wireframe** themes and reopen one popup each — confirm the frame holds and wireframe strips color/shimmer as expected.

- [ ] **Step 3: Fix any stragglers**

Note any popup whose internal content rule still forces an old fixed width/height or overflows. Apply minimal `min-height:0` / `overflow` / font-size fixes to make it fit. Keep changes minimal and ES5/CSS-only.

- [ ] **Step 4: Final commit**

```bash
git add index.html
git commit -m "feat(reskin): cross-popup consistency pass for std-popup frame"
```

---

## Self-Review notes (for the implementer)

- **Spec coverage:** Tasks 2–12 cover all 12 in-scope popups from spec §3; Task 1 builds the frame/X/footer from §2; Task 13 is the §6 validation pass. Out-of-scope items (§4) are untouched.
- **ES5:** Tasks 10–12 modify JS builders — keep `var`/`function`/string-concat, no arrow/template literals (the main `<script>` is ES5).
- **`!important` rationale:** the inline `panel.style.width` overrides (six in option-picker, plus others) are defeated by `.std-popup`'s `!important` sizing; Task 10 also clears them for cleanliness.
- **Null-guard pitfall:** Task 8 removes `.challenge-cta-row` — verify no JS measures it without a guard.
- **Hidden measurement pitfall:** any builder measuring `offsetHeight` must do so after `.active` — unchanged by these edits, but don't introduce measurement before visibility.
