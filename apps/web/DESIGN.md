---
name: District Ops
description: Japanese high-density institutional ops mosaic — hairline modules, utility-red tabs, stamped job status.
colors:
  utility-red: "#E60012"
  utility-red-deep: "#B8000E"
  ink: "#111111"
  paper: "#FFFFFF"
  field: "#F2F2F2"
  rule: "#E0E0E0"
  mute: "#7A7A7A"
  status-ok: "#0F7A3A"
  status-ok-bg: "#E8F6EE"
  status-warn: "#9A6700"
  status-warn-bg: "#FFF6E0"
  status-bad: "#B42318"
  status-bad-bg: "#FDECEB"
  status-run: "#0B4F6C"
  status-run-bg: "#E7F3F8"
typography:
  display:
    fontFamily: "Noto Sans JP, system-ui, sans-serif"
    fontSize: "clamp(1.35rem, 2vw, 1.75rem)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Noto Sans JP, system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Noto Sans JP, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "-0.01em"
  label:
    fontFamily: "Noto Sans JP, system-ui, sans-serif"
    fontSize: "0.68rem"
    fontWeight: 700
    letterSpacing: "0.04em"
  mono:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.7rem"
    fontWeight: 500
rounded:
  none: "0px"
  pulse: "999px"
spacing:
  xs: "0.3rem"
  sm: "0.55rem"
  md: "0.65rem"
  lg: "1rem"
  rail: "220px"
components:
  button-primary:
    backgroundColor: "{colors.utility-red}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "0.35rem 0.55rem"
    height: "2rem"
  button-primary-hover:
    backgroundColor: "{colors.utility-red-deep}"
    textColor: "{colors.paper}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.35rem 0.55rem"
    height: "2rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.15rem 0.25rem"
  input-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.35rem 0.55rem"
    height: "2rem"
  module-panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.65rem"
  tab-utility:
    backgroundColor: "{colors.utility-red}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "0 0.4rem"
    height: "1.15rem"
  stamp-status:
    backgroundColor: "{colors.status-ok-bg}"
    textColor: "{colors.status-ok}"
    rounded: "{rounded.none}"
    padding: "0.15rem 0.4rem"
  rail-link-active:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.55rem"
  tenant-chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.2rem 0.45rem"
---

# Design System: District Ops

## Overview

**Creative North Star: "The Institutional Ops Mosaic"**

District Ops is a packed Japanese high-density console: white ruled modules on a light field, ink type, and a scarce utility-red accent. Surfaces read as institutional tooling — hairline borders, square corners, numbered rail codes — not soft SaaS card stacks. Persona switching, ReBAC denials, and async job stamps are first-class visual product, not chrome around a demo.

Depth comes from tonal plates and inset rail accent, never drop shadows. Motion is short and utilitarian (120ms ease-out state changes; a single live pulse on in-flight stamps). Light theme only.

**Key Characteristics:**
- Hairline-ruled white modules on `#F2F2F2` field
- Utility-red (`#E60012`) reserved for tabs, primary actions, active rail code, brand mark
- Noto Sans JP + IBM Plex Mono; dense 13px body
- Depressed active rail (inset red bar + field fill)
- Status communicated by bordered stamps with tonal fills, not color alone

## Colors

Triad of paper, ink, and utility red; status tones are a separate semantic band for job/authz states.

### Primary
- **Utility Red** (`#E60012`): Module tabs, primary buttons, active rail code, brand mark bar, focus ring outer, selection tint. Rarity is intentional.
- **Utility Red Deep** (`#B8000E`): Primary button hover only.

### Neutral
- **Paper** (`#FFFFFF`): Module surfaces, rail, top band, inputs at rest.
- **Ink** (`#111111`): Primary text, control borders, active stage fill, tenant chip border.
- **Field** (`#F2F2F2`): Page background, module heads, table headers, idle stamp/stage chips, rail hover/active fill.
- **Rule** (`#E0E0E0`): Default 1px borders and dividers (`--ops-line`).
- **Mute** (`#7A7A7A`): Secondary copy, field labels, rail codes at rest, table column headers.

### Status (semantic)
- **Ok / Ok Bg** (`#0F7A3A` / `#E8F6EE`): Succeeded stamps; completed stage chips.
- **Warn / Warn Bg** (`#9A6700` / `#FFF6E0`): Retrying stamps; non-fatal job warnings.
- **Bad / Bad Bg** (`#B42318` / `#FDECEB`): Failed stamps; error alerts.
- **Run / Run Bg** (`#0B4F6C` / `#E7F3F8`): Running stamps.

**The Scarcity Rule.** Utility red appears on ≤ ~10% of any screen — tabs, one primary CTA, active code, brand mark. Never flood backgrounds or large fills with red.

**The Status-Not-Decoration Rule.** Ok/warn/bad/run colors exist only for job and alert semantics; do not restyle chrome with them.

## Typography

**Display Font:** Noto Sans JP (system-ui, sans-serif)
**Body Font:** Noto Sans JP (system-ui, sans-serif)
**Label/Mono Font:** IBM Plex Mono (ui-monospace, monospace)

**Character:** Dense institutional sans with tight tracking; mono for IDs, deny banners, and rail codes.

### Hierarchy
- **Display** (800, `clamp(1.35rem, 2vw, 1.75rem)`, 1.15): Page title in the top band.
- **Title** (800, `1.05rem`, 1.15): Rail product name “District Ops”.
- **Module title** (700, `0.78rem`): Module head titles beside the utility tab.
- **Body** (400, `13px`, 1.55): Default UI copy; slight negative tracking (`-0.01em`).
- **Meta** (400–700, `0.75–0.8rem`): Supporting copy in mute.
- **Label** (700, `0.62–0.68rem`, `0.04–0.06em`, uppercase): Field labels, table headers, utility tabs, stamps, stage chips, rail subtitle.
- **Mono** (500–600, `0.68–0.72rem`): Rail codes, job IDs, deny alerts, user IDs in tables.

**The Uppercase Label Rule.** Micro-labels (tabs, stamps, field captions, table heads, stage chips) are uppercase with letter-spacing; page and module titles stay sentence case and heavy weight.

## Layout

Fixed left rail (`220px`) + fluid main. Main uses a 12-column mosaic (`gap: 0.55rem`); modules span 3–12 columns via `span-*` classes. Top title band bleeds edge-to-edge of the main column (negative horizontal margin matching main padding). Module heads are gray field strips with hairline bottom rule; bodies pad `0.65rem`.

Below `960px`: rail stacks above main (horizontal 3-up nav), and all module spans collapse to 12.

**The Mosaic Rule.** Content lives in hairline-bordered modules on the field — never floating soft cards with radius or shadow. Pack modules tightly; prefer more modules over empty whitespace.

## Elevation & Depth

Flat system. No drop shadows. Hierarchy is paper-on-field, hairline rules, and one inset cue on the active rail (`inset 3px 0 0` utility red + 1px translate). Focus uses a double ring: white then red (`0 0 0 2px #FFF, 0 0 0 4px #E60012`). Table rows take a 4% red wash on hover only.

**The Flat Plate Rule.** Surfaces are paper rectangles on field. Depth is tonal or inset — never ambient shadow.

## Shapes

Square language throughout (`border-radius: 0`). Borders are 1px ink for interactive controls, 1px rule for modules/tables, or `currentColor` for stamps. The only round geometry is the live-pulse dot on in-flight stamps (`999px`).

**The Zero-Radius Rule.** No rounded cards, pills, or soft buttons. Square corners are the form language.

## Components

### Buttons
- **Shape:** Square; 1px border; min-height `2rem`.
- **Primary:** Utility red fill/border, paper text; hover → utility red deep.
- **Secondary:** Paper fill, ink border; hover → field fill.
- **Ghost:** Transparent, underline, compact padding — used for Refresh / Open job detail / Back.
- **Disabled:** `opacity: 0.4`.

### Tabs (module utility tabs)
- **Style:** Inline red slab (`height: 1.15rem`), paper uppercase micro-type; sits left of the module title in the gray head. Not navigation pills.

### Cards / Containers (modules)
- **Corner Style:** Square (`0`).
- **Background:** Paper body; field head.
- **Shadow Strategy:** None.
- **Border:** `1px solid #E0E0E0`.
- **Internal Padding:** Head `0.45rem 0.65rem`; body `0.65rem`.

### Inputs / Fields
- **Style:** Paper fill, ink border, square; labels uppercase mute above.
- **Focus:** Border shifts to utility red; focus-visible also gets the double ring.
- **Select:** Same chrome as text input.

### Navigation (rail)
- **Style:** White rail, red brand mark bar, product title + uppercase subtitle.
- **Links:** Two-column grid (mono code `01`–`03` + label); hover field fill.
- **Active:** Field fill, rule border, inset 3px red bar, 1px translate; code turns utility red.
- **Mobile:** Full-width rail with 3-column nav row.

### Status stamps
- **Style:** Bordered uppercase chip (`border: 1px solid currentColor`), tone classes set ink + fill; optional attempt meta; live jobs show a pulsing currentColor dot.

### Stage chips
- **Style:** Compact uppercase list chips on field; current = ink fill / paper text; done = ok tone.

### Alerts
- **Error / Warn:** Tonal fill + mixed border from status colors.
- **Deny:** Dashed ink border, paper fill, mono type; forced `DENIED · ReBAC` prefix in utility red.

### Tenant chip
- **Style:** Ink-bordered paper chip with solid ink square prefix; shows truncated tenant id in the top band.

### Tables
- **Style:** Ruled paper table; uppercase mute headers on field; row hover 4% red wash; status column uses stamps.

## Do's and Don'ts

### Do:
- **Do** compose screens as a 12-column mosaic of hairline modules with utility-red tabs in the module head.
- **Do** keep body at ~13px Noto Sans JP and use IBM Plex Mono for codes, IDs, and deny copy.
- **Do** show async state with status stamps (and live pulse when polling); show authz denial with the dashed mono deny alert.
- **Do** mark the active rail with inset utility-red bar + field fill — not a filled red block.
- **Do** use the double white/red focus ring for keyboard focus.

### Don't:
- **Don't** introduce rounded cards, soft shadows, or purple/indigo SaaS gradients.
- **Don't** flood large surfaces with utility red; reserve it for tabs, primary CTA, active code, and brand mark.
- **Don't** use status tones (ok/warn/bad/run) as decorative accent on chrome.
- **Don't** add dark mode or playful/gamified kid-facing visuals.
- **Don't** replace Noto Sans JP / IBM Plex Mono with Inter, Roboto, system UI as display, or decorative display faces.
