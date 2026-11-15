---
name: Pathway
description: International career matching that shows its arithmetic, set in International Typographic Style.
colors:
  paper: "#fafaf8"
  panel-white: "#ffffff"
  ink: "#15181e"
  muted: "#5a5e66"
  line: "#e1e1dc"
  neutral-wash: "#ecece7"
  neutral-stroke: "#c5c5bd"
  hatch-grey: "#9a9a91"
  field: "#1b2b48"
  field-deep: "#111d33"
  field-tint: "#edf0f5"
  on-field: "#ffffff"
  on-field-muted: "#bcc4d3"
  verify: "#9a6a1c"
  verify-tint: "#f5efe3"
  verify-ink: "#5c4012"
  blocked: "#9b3b34"
  blocked-tint: "#f5ebe9"
  met: "#2f6a4f"
  met-tint: "#eaf1ec"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3rem (mobile) / 4.5rem (sm and up)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.05em"
  score:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3rem (rows) / 4.5rem to 6rem (hero, detail)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.05em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem (mobile) / 3rem (sm and up)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.375
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "tnum"
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.33
    letterSpacing: "0.025em"
  ref-code:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.05em"
rounded:
  none: "0px"
  control: "2px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "32px"
  xl: "80px"
  2xl: "112px"
  target: "44px"
components:
  button-primary:
    backgroundColor: "{colors.field}"
    textColor: "{colors.on-field}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.field-deep}"
  button-on-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  button-on-field-hover:
    backgroundColor: "{colors.verify}"
  button-on-field-outline:
    textColor: "{colors.on-field}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  button-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.field}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  button-outline-hover:
    backgroundColor: "{colors.field-tint}"
  button-ghost:
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  input:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "44px"
  tag-band-strong:
    backgroundColor: "{colors.met}"
    textColor: "{colors.on-field}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "2px 8px"
  tag-band-partial:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "2px 8px"
  tag-band-weak:
    backgroundColor: "{colors.line}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "2px 8px"
  tag-band-critical:
    backgroundColor: "{colors.blocked}"
    textColor: "{colors.on-field}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "2px 8px"
  tag-eligibility-clear:
    backgroundColor: "{colors.met-tint}"
    textColor: "{colors.met}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "2px 8px"
  tag-eligibility-verify:
    backgroundColor: "{colors.verify}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "2px 8px"
  tag-eligibility-blocked:
    backgroundColor: "{colors.blocked-tint}"
    textColor: "{colors.blocked}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "2px 8px"
  flag-critical:
    backgroundColor: "{colors.blocked-tint}"
    textColor: "{colors.ink}"
    padding: "8px 12px"
  flag-verify:
    backgroundColor: "{colors.verify-tint}"
    textColor: "{colors.ink}"
    padding: "8px 12px"
  flag-missing:
    backgroundColor: "{colors.neutral-wash}"
    textColor: "{colors.ink}"
    padding: "8px 12px"
  fact-chip:
    backgroundColor: "{colors.neutral-wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "4px 8px"
  nav:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted}"
    height: "56px"
  score-strip-compact:
    backgroundColor: "{colors.line}"
    height: "10px"
  score-strip-full:
    backgroundColor: "{colors.line}"
    height: "20px"
---

> Palette revised 2026-11-15 after owner review: deep navy field, muted status colours used only in small tags and icons, no bright yellow.

# Design System: Pathway

## Overview

**Creative North Star: "The Departures Board"**

Pathway is built like international signage: one strict 12-column grid, heavy Archivo set tight, big tabular numerals, and colour that only ever carries meaning. A visitor reads it the way they read an airport board. Every role is a line with a reference code (CA-01, SG-01), a score, and a status, and every line uses the same scale so lines compare at a glance.

The surface is paper-white with ink type. One flat deep navy field owns the hero and the major statement bands on the landing page (Persuade). The working pages (Operate: matches, role detail, profile, shortlist, how it works) stay on paper and use the field only for primary action, the active nav marker and rank numerals. Status colour is a fixed vocabulary, never decoration: muted green = met, muted amber = verify, muted red = blocked, a neutral diagonal hatch = missing data. Each status always comes with a word or an icon.

Depth is absent by design. Structure comes from ink rules (2px above each row and section, 1px hairlines between items), flat colour bands, and 1px gap grids. The world rejects the category default: a centred headline over a row of identical feature cards with a blue accent. All rasters are code-drawn (the route mark is inline SVG, the score strip is CSS). There are no image assets.

**Key Characteristics:**
- Paper ground, ink type, one flat deep navy field.
- Heavy display type (800) with negative tracking; numerals tabular everywhere.
- Rows separated by rules, not cards. No shadows anywhere.
- Square corners. Controls get a 2px radius; tags, chips, panels and bands get none.
- A fixed status vocabulary, always paired with a word or an icon.
- The score strip, one unbroken bar whose segment widths are the criterion weights, is the reusable signature.

## Colors

A warm paper-and-ink neutral system with one deep navy and three muted, fixed-meaning status hues.

### Primary
- **Signage Deep navy** (field): the hero field, statement bands, the CTA band, primary buttons, the "Your profile" nav button, the active nav underline, rank numerals, text links, the filled part of every score strip, and the global focus outline.
- **Deep Deep navy** (field-deep): the hover state of everything set in the field; the unfilled track of a score strip set on the field.
- **Deep navy Wash** (field-tint): the "Pathway" column of the comparison table, a "visa support offered" fact chip, and the outline-button hover.
- **On-Field White / On-Field Mist** (on-field, on-field-muted): primary and secondary text on the field. Mist also draws the outline of outline buttons and the hairline dividers inside field bands.

### Status (fixed meanings)
- **Met Green** (met), with **Met Wash** (met-tint): Strong band tag, "Right to work stated", "Met" criteria, check marks next to strengths, and the "Why it fits" heading.
- **Verify Yellow** (verify), with **Verify Wash** (verify-tint) and **Verify Umber** (verify-ink): "Eligibility to verify" tag, verification flags, the profile-completeness notice, the shortlist count badge, text selection, and the focus outline on the field. Yellow is a fill only. Text that has to read as "verify" is set in Verify Umber.
- **Blocked Red** (blocked), with **Blocked Wash** (blocked-tint): Critical-gap band tag, "You stated no right to work", "Not met" criteria, minus marks next to gaps, the "What to review" heading, the cap marker on a capped strip, and field errors.
- **Missing Hatch** (hatch-grey): a -45° stripe (2px line, 6px period) that fills the earned part of a strip segment that got neutral credit because data is missing. In flags and status text, missing data is neutral grey with a question icon.

### Neutral
- **Paper** (paper): page ground and the fill of on-field buttons.
- **Panel White** (panel-white): form fields, panels, the hero score card, and empty states, so these sit just above the paper.
- **Ink** (ink): body type, all rules, the Partial band tag, the dark button, the footer ground, and the selected filter.
- **Warm Graphite** (muted): secondary text, meta lines, table headers, and fact labels.
- **Hairline** (line): 1px dividers, panel borders, the strip track on paper, and the Weak band tag.
- **Stone Wash** (neutral-wash): fact chips, missing-data flags, and the "No local permit needed" tag.
- **Stone Stroke** (neutral-stroke): input and filter-chip borders.

### Named Rules
**The One Field Rule.** Deep navy is a flat field or a functional mark (action, link, focus, active state, the strip fill). It is never a gradient, never a decorative accent, and never a tint wash behind content for mood.

**The Fixed Meaning Rule.** Muted green means met, muted amber means verify, muted red means blocked, hatch means missing. These hues are never used for anything else, and none of them appears without its word or icon.

**The Warm Neutral Rule.** Neutrals are the warm stone scale (#f4f4f1 to #161612). They replace Tailwind's cool slate everywhere. A cool grey is a defect.

## Typography

**Display Font:** Archivo (variable, width axis loaded), with ui-sans-serif and system-ui as fallbacks
**Body Font:** Archivo
**Label/Mono Font:** Archivo; tabular figures do the work a mono face would do

**Character:** One grotesque in every role. Hierarchy comes from weight (800 for display and headline, 700 for titles and labels) and tight tracking at size, not from a second family.

### Hierarchy
- **Display** (800, 3rem to 4.5rem, line-height 0.95, -0.05em): the landing hero headline only, set on the field.
- **Score** (800, 3rem in rows, 4.5rem to 6rem in the hero and on detail, line-height 1, -0.05em): the 0–100 figure, followed by a small "/100" in Warm Graphite (or On-Field Mist on the field). Large step numerals on the landing page use the same style.
- **Headline** (800, 1.875rem to 3rem, -0.025em): landing section headings and page titles on Operate pages. Headings use balanced wrapping.
- **Title** (700, 1.25rem to 1.5rem, -0.025em): role titles, step titles, sidebar headings (1.125rem).
- **Body** (400, 1rem, line-height 1.55): paragraphs use pretty wrapping and stay at about 36–42rem wide (max-w-xl to max-w-2xl). Meta lines and table text are 0.875rem.
- **Label** (700, 0.75rem, +0.025em, uppercase): status tags, fact labels and table headers only.
- **Reference code** (700, 0.75rem, +0.05em, sentence case "Ref. CA-01"): sits on a 1px ink rule above it, under every role title.

### Named Rules
**The Tabular Rule.** All numerals are tabular (set on the body). Scores, weights, counts and points must line up in columns.

**The Weight-Not-Family Rule.** Hierarchy comes from weight and size in Archivo. Do not add a second display face or a serif.

## Layout

A single 12-column grid inside a 72rem (max-w-6xl) container with 16px gutters at the page edge. The landing hero splits 7/5 (field / live score card) from lg; landing sections split 4/8 (heading / content); match rows split 7/5 (identity / score); role detail splits 8/4 (content / sticky "About the role" sidebar, top 96px); page headers split 8/4 or 9/3. Below lg, every split stacks with the field first. Field bands bleed to the viewport edge on phones (-mx-4) and align to the container from sm.

Rhythm: landing sections are 80px apart (112px from sm). Operate pages use 32px between blocks. Rows use 16–20px of internal padding. Every interactive target is at least 44px tall; filter chips and the nav profile button are 40px. A 1px-gap grid on a Hairline (or on-field Mist at 40%) background draws cell borders for source lists, band definitions and the two-signals pair.

Containers query their own width. The full score strip shows its label row and per-segment points only at container width @xl (36rem) and above. Below that it shows a 2-column legend (criterion, then points/weight) under the bar.

## Elevation & Depth

Fully flat. There is no box-shadow anywhere in the build. Depth comes from three devices: the deep navy field as a flat plane, a 2px ink rule that opens every row, section and table, and the step from Paper to Panel White for inputs and panels. The sticky nav uses 95% paper with a light backdrop blur and an ink bottom rule, not a shadow.

### Named Rules
**The Flat Plane Rule.** Nothing casts a shadow. To separate something, use a rule, a flat field, or a 1px gap.

**The Rules Not Cards Rule.** Ranked roles, listings, shortlist items, FAQ entries and steps are rows opened by a 2px ink rule and closed by the next one. They are not boxed in cards. Bordered panels are kept for forms, the hero score card and empty states.

## Shapes

Square. Controls (buttons, inputs, selects) have a 2px radius, just enough to soften the edge. Status tags, fact chips, flags, panels, field bands and the score strip have no radius. The route mark is a square of field colour with a square-capped path. A strip segment is divided from the next by a 2px rule in the ground colour (paper, or field when the strip sits on the field). Accent rules: 2px ink for structure, 1px ink above reference codes, 3px field under the active nav item, and a 4px field rule on top of empty-state panels.

## Components

### Buttons
Direct, signage-like: compact, bold, square.
- **Shape:** near-square (2px), 44px tall, 16px side padding, 0.875rem semibold, 8px gap for an icon.
- **Primary:** field with white text; hover goes to Deep Deep navy. The saved state of the shortlist button uses it.
- **On field:** a paper button whose hover turns Verify Yellow, paired with an outline button (Mist border, white text, hover Deep Deep navy).
- **Dark:** ink with paper text ("View details" in every match row).
- **Secondary:** paper with a 1px ink border; on hover it inverts to ink.
- **Outline:** paper with a field border and field text; hover adds the Deep navy Wash. This is the unsaved shortlist button.
- **Ghost:** Warm Graphite text; hover adds Stone Wash and ink text.
- **Focus / disabled:** 2px field outline at 2px offset (white on the field). Disabled is 50% opacity. Colour transitions take 150ms.

### Status tags
- **Style:** uppercase label type, 2px by 8px padding, no radius, with a 14px icon where the meaning needs one.
- **Band tags:** Strong (green, white text), Partial (ink), Weak (Hairline, ink text), Critical gap (red, white text).
- **Eligibility tags:** stated (Met Wash, green text, check), to verify (Verify Wash, umber text, shield-question), stated no (Blocked Wash, red text, octagon-X), not required (Stone Wash, grey text, check). The eligibility tag always sits next to the score, never inside it.

### Flags
Full-width rows with 8px by 12px padding and no border: a 16px icon, a bold prefix ("Requirement not met." / "Verification required." / "Information missing."), then the message. Critical rows use Blocked Wash, verify rows Verify Wash, missing rows Stone Wash. Text stays ink; only the icon takes the status hue. The order is always critical, then verify, then missing.

### Status text
Inline semibold word plus a 14px icon: Met (green), Partial (umber), Not met (red), Not provided (grey).

### Fact chips
0.75rem semibold on Stone Wash with no radius: salary, visa support (Deep navy Wash when offered), relocation count.

### Inputs / Fields
- **Style:** Panel White, a 1px Stone Stroke border, 2px radius, 44px tall, 12px side padding. Text is 1rem on phones (no iOS zoom) and 0.875rem from sm.
- **Hover / focus:** the border darkens on hover; focus uses the global 2px field outline.
- **Error:** red border via aria-invalid, plus a red message below. The label is 0.875rem bold ink above the field; the hint is 0.75rem Warm Graphite.

### Filter chips
40px tall with no radius. Selected: ink fill, paper text, bold. Unselected: Panel White with a Stone Stroke border, which turns ink on hover. Each chip ends with a 70%-opacity tabular count.

### Navigation
A sticky paper bar with a 1px ink bottom rule. The left side holds the route mark and "Pathway" (extrabold, 1.25rem). Links are 0.875rem in Warm Graphite, 44px tall; the active link is bold ink with a 3px field underline. The shortlist link carries a count on an ink fill. "Your profile" is a field-filled button on the right, and turns ink when that page is current. On phones the links wrap to a horizontally scrolling second line, and "How matching works" becomes "How it works".

### Score Strip (signature)
One unbroken bar on a fixed 0–100 scale. Each segment's width is the criterion weight (30/20/15/15/10/10). Its fill is the share of points earned: field on paper, or paper on the field. The track is Hairline, or Deep Deep navy on the field. Segments are divided by 2px rules in the ground colour. Neutral credit for missing data is drawn with the hatch. A capped score shows a 2px red marker at 35, extending 4px above and below the bar, with a caption: "Raw N, capped at 35…". Compact rows use a 10px bar; the full variant uses 20px, with a bold 0.75rem label row and "points/weight" figures at @xl, and a 2-column legend below @xl. The strip reveals left to right once on first render (clip-path, 900ms, cubic-bezier(0.16, 1, 0.3, 1)). Reduced motion removes the reveal. Every strip on every surface uses the same scale.

### Match row
A 2px ink rule opens each row. Identity sits left (a field-coloured rank numeral, the title, the meta line, the ref code, fact chips). Score sits right (the score figure; the band tag stacked above the eligibility tag; the compact strip; skills coverage). Below a 1px Hairline come "Why it fits" (green, checks) and "What to review" (red, minus marks), then verify flags, then the Dark and Outline buttons.

## Do's and Don'ts

### Do:
- **Do** keep every score on the same 0–100 strip with segment widths equal to the weights (30/20/15/15/10/10).
- **Do** pair every status colour with its word or icon: muted green = met, muted amber = verify, muted red = blocked, hatch = missing.
- **Do** show eligibility as its own tag beside the score, never folded into it.
- **Do** open rows and sections with a 2px ink rule, and separate items with 1px Hairlines.
- **Do** keep status colours muted and small: tags and icons only, never large fills.
- **Do** switch the focus outline to white on the deep navy field.
- **Do** give every role its reference code (country code plus two digits) on a 1px ink rule.
- **Do** keep interactive targets at 44px or taller.

### Don't:
- **Don't** use box-shadow, gradients or glows; the system is flat.
- **Don't** round anything beyond 2px, and don't round tags, chips, flags, panels or strips at all.
- **Don't** use green, amber or red decoratively, or as the only signal of a status.
- **Don't** put roles in boxed cards; they are ruled rows.
- **Don't** introduce cool slate greys, a second typeface, or image assets; draw rasters in code.
- **Don't** build a centred headline over a row of identical feature cards with a blue accent.
