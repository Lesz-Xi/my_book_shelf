---
name: Structured Book Shelf
description: A wabi-sabi quiet room for books that keep changing the reader.
colors:
  primary-natural-oak: "#b99568"
  neutral-ivory: "#f1eee4"
  neutral-sumi: "#2b2620"
  surface-sage: "#989d87"
typography:
  display:
    fontFamily: "Zen Old Mincho, Yu Mincho, Hiragino Mincho ProN, serif"
    fontSize: "clamp(3.6rem, min(7.5vw, 11svh), 6rem)"
    fontWeight: 400
    lineHeight: 0.94
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Zen Old Mincho, Yu Mincho, Hiragino Mincho ProN, serif"
    fontSize: "clamp(3rem, 6vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.96
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Zen Old Mincho, Yu Mincho, Hiragino Mincho ProN, serif"
    fontSize: "clamp(1rem, 1.22vw, 1.18rem)"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Zen Kaku Gothic New, Hiragino Kaku Gothic ProN, Yu Gothic, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.09em"
rounded:
  square: "0"
spacing:
  frame: "clamp(1.25rem, 3.2vw, 3.5rem)"
  compact: "0.75rem"
  group: "1.5rem"
  section: "clamp(6rem, 12svh, 10rem)"
components:
  action-primary:
    backgroundColor: "{colors.primary-natural-oak}"
    textColor: "{colors.neutral-sumi}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0 1rem"
    height: "3.25rem"
  action-light:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-ivory}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0 1rem"
    height: "3.25rem"
---

# Design System: Structured Book Shelf

## Overview

**Creative North Star: "The Quiet Room for Books That Keep Thinking"**

Structured Book Shelf behaves like a small handcrafted room: vertical material panels, soft paper grain, and ink figures of books drawn once and left still. The visual system is wabi-sabi first — three honest materials (sage, ivory, natural oak), warm sumi ink, and near-still motion. Energy comes from texture, scale, and space, never from animation.

The interface is calm and handmade. Ivory gives reading space; sage carries each volume like a plastered wall; sumi is the ink and the one dark beat; oak does a single job — action fills and active index marks. Motion has one brief entry, one draw-once gesture per figure, and then the page sits still. Provenance, counts, labels, and measured facts use a quiet mono register so atmosphere never outruns truth.

**Key Characteristics:**

- Full-field material bands rather than card stacks.
- One Mincho reading register against one quiet mono register.
- Square geometry, hairline division, paper grain, and deliberately empty space.
- Hand-drawn ink volume figures as material cross-sections of the book — layers shown honestly, like joinery.
- Canonical labels, epistemic tags, and archive facts visible in the page's hierarchy; no real user filesystem paths on the page.
- Near-still motion: one entry parting, one ink drawing per figure, quiet fades. Nothing loops, nothing scrubs.

## Colors

The palette is three materials plus ink; alpha mixtures of sumi soften hierarchy, but they do not create additional color voices. `color-scheme` is light.

### Primary

- **Natural Oak** (`#b99568`): Owns the primary action fill and the active ridge tick. One job, held with restraint. Sumi text on oak measures roughly 5.4:1 — comfortably above the 4.5:1 bar.

### Supporting accent

- **Deep Oak** (`color-mix` of Natural Oak into Sumi): Used only as the Jung figure's accent, so the second volume carries a quieter, darker cut of the same wood.

### Neutral

- **Ivory** (`#f1eee4`): The page ground — opening, argument, and principle bands; warm, never clinical white.
- **Sage** (`#989d87`): The two full-bleed volume fields; grey-green plaster, the palette's large move.
- **Sumi** (`#2b2620`): Warm brown-black ink — foreground on ivory and sage, and the full field for method and footer. Never blue-black; scrims tint from ivory or sumi, never raw black.

**The Material Rule.** New hues do not enter the page to distinguish books or components. Volume identity comes from the sage field, ink depth, accent inversion, and figure geometry.

**The Oak Restraint Rule.** Oak marks what is actionable or active. It is never multiplied into gradients, wash backgrounds, badges, or ornamental noise.

## Typography

**Display Font:** Zen Old Mincho (400/700) with Yu Mincho / Hiragino Mincho ProN fallback.  
**Body Font:** Zen Old Mincho, 400.  
**Label/Instrument Font:** Zen Kaku Gothic New (400/500) with Hiragino Kaku Gothic ProN / Yu Gothic fallback.

**Character:** Zen Old Mincho gives the room the aged, soft-edged voice of an old printed book — wabi-sabi through age and imperfection, not novelty; display tracking stays open at roughly −0.01 to −0.02em so the Mincho breathes. Zen Kaku Gothic New carries navigation, labels, and evidence in uppercase micro-labels tracked +0.08–0.14em — a quiet human hand, with the machine mono voice deliberately absent.

### Hierarchy

- **Display** (400, fluid to 6rem, ~0.94 line-height): first-view promises and terminal statements; two to three soft lines whenever width permits.
- **Headline** (400, fluid to 6rem, ~0.96 line-height): section arguments and volume titles.
- **Title** (400, approximately 1.4–2.5rem): method steps, principles, and quoted explanatory cores.
- **Body** (400, approximately 1–1.35rem, 1.46–1.55 line-height): explanatory paragraphs constrained to a comfortable measure beside artifacts.
- **Label** (400–500, approximately 0.48–0.75rem, positive tracking): canonical labels, counts, coverage, source horizons, section navigation, and epistemic status.

**The Notation Test.** Zen Kaku Gothic New is used when text helps the reader locate, compare, verify, or act. It remains quiet, small, and tracked; it never costumes ordinary prose as notation.

**The Soft-Line Rule.** Display statements resolve into a few complete lines. Never force a ladder of isolated one-word columns merely to make type look designed.

## Layout

The desktop system uses a twelve-column grid inside one nested full-height scroller. The masthead remains fixed to the viewport while opaque material bands move beneath it. The opening places the promise across seven columns and the two closed ink volumes across five; volume chapters use an even artifact/text split on sage fields; method and proof sections expand across the full frame through hairline ledgers rather than cards. The footer is a normal, full-height sumi section — no curtain, no rise.

Frame padding is fluid, and section padding expands with viewport height. Large fields are intentionally quiet before dense evidence rows appear. More space precedes a new argument than follows its heading.

At 1100px the desktop tick ridge disappears. At 820px, paired artifact/text compositions become one-column sequences, two- and four-column ledgers simplify, and the header reduces to the product identity. At 520px, ledgers become rows and actions become full-width while their source order remains intact.

The Reader retains its existing editorial structure until its own pass: a native-scroll chapter rail, a Lenis-weighted reading plane, and a chapter-index margin. The active article retains a narrow measure inside the wide plane; source status and canonical path occupy the margin rather than interrupting prose. Below 1280px the index margin disappears. Below 860px the chapter rail becomes a square-edged drawer and the reading plane becomes single-column.

**The Band Rule.** A section must behave like a material field, proof ledger, or authored artifact. Do not insert equal-size cards to consume empty space.

**The Reading-Plane Rule.** Long-form prose owns one central measure. Navigation, source status, and section orientation may flank it, but no panel may narrow the actual article below a comfortable reading line.

**The Quiet Footer Rule.** The footer is a plain section in flow. No sticky curtain, no rise wrapper motion; its weight comes from sumi and space.

## Elevation & Depth

The system is flat by default. Material fields, overlap, z-order, and hairlines express hierarchy. Nothing casts a shadow; nothing glows.

### Texture Vocabulary

- **Paper grain** (fractal-noise SVG data-URI at ~0.045 alpha, `mix-blend-mode: multiply`, one fixed overlay across the whole page): structural material honesty. It must stay below the threshold where text contrast measurably changes, and it shows no seams on sage or sumi.

**The Physical-Plane Rule.** No panel glow, floating card shadow, cursor aura, or ambient halo is permitted. Texture is allowed; theatrics are not.

## Shapes

The form language is rectangular and exact. Actions, rows, ledgers, and focus boundaries use zero radius. One-pixel hairlines organize evidence and section rhythm. Circular and elliptical geometry appears only inside the ink volume motifs, where it encodes an optimization target or a psyche/orbit relation rather than serving as generic UI decoration.

Ink volume figures are hand-drawn inline SVG: one-pixel non-scaling strokes, sumi at material-appropriate depth (deeper on sage), oak reserved for one key edge and a dot or two. Layers are grouped semantically — cover, page block — like a cross-section drawing.

**The Square Default Rule.** Radius is zero unless a future object's real construction requires a curve.

## Components

### Buttons

- **Shape:** Square, one-pixel boundary, 3.25rem minimum height, cleared UA appearance.
- **Primary:** Natural Oak field with Sumi label and one directional arrow.
- **Hover / Focus:** Bottom-up Sumi fill sweep and upward label roll; focus adds a visible one-pixel outline with external offset.
- **Light action:** Transparent on the sumi footer, becoming Ivory with Sumi text under the same movement grammar.

### Text Actions

Text actions use Zen Kaku Gothic New, a restrained underline that grows from the left, and the same upward label roll. They remain materially quieter than the filled primary action. The label roll is the one hover grammar on the page.

### Navigation

The masthead contains the three-plane shelf mark, product name, three restrained section links, and a quiet archive note (`Two volumes · open archive`). It inherits the active band's ink: sumi on ivory and sage, ivory on the sumi method and footer bands. Mobile keeps only the identity rather than adding a drawer that the page does not need.

The desktop ridge is a right-edge tick rail: short sumi hairlines; the active tick lengthens and warms to oak. Cardless tips reveal number, section name, and one-line description as plain type left of the rail. No numerals beside the rail — the tips carry the numbers.

### Evidence Ledgers

Inventory, source facts, method steps, and principles use border-separated rows or columns without container fills. Values and labels remain semantic pairs. On narrow screens, columns become rows instead of shrinking type or clipping evidence.

### Ink Volume Figures

Each volume is an original hand-drawn ink figure: an isometric cover plane with inset frame, title rules, and motif, plus a page block with edge lines — a material cross-section of the book, layers shown honestly like joinery. The AI 2041 figure carries oak accents; the Jung figure is the mirrored inverse in deeper ink with deep-oak accents. The figures are product proof, not interactive cards. Do not replace them with source-book jackets, stock 3D renders, or generic decoration.

### Draw-Once Gesture

The one handcrafted motion. When a figure's section crosses roughly the top-75% line, the figure draws itself once: every stroke runs its full `stroke-dashoffset` to zero in a staggered ~1.2-second pass, then the oak dots fade in, and the figure sits still forever. Hero figures draw shortly after the entry veil parts. The settled state is always the complete drawing; under reduced motion, JavaScript fallback, or no JavaScript the figures are simply fully drawn.

### Quiet Reveals

Two hushed registers, each fired once: statements use a masked slide-up softened to ~0.95 seconds with a gentle ease; ledes and meta use a simple word-level fade with no travel. Nothing loops, nothing replays, nothing is tied to scroll position.

### Entry Parting

The entry veil is the room's door: a thin sumi hairline draws across ivory, the shelf mark recedes, and two ivory leaves part in opposing directions. It plays once, completes in roughly 1.2 seconds, never captures pointer events, and disappears immediately under reduced motion or JavaScript fallback. The Reader does not repeat it; reading begins immediately.

### Reader Components

The Reader's chapter rail, reading layers, document chrome, and chapter turn are unchanged in structure and behavior: chapters grouped under two authored volume headings with dossier/distillation availability honestly marked; border-connected square layer controls; sticky chapter-status margin; terminal hairline chapter turns that never cross silently between interpretive layers. Their current skin is legacy and awaits the wabi-sabi pass; their contracts below remain binding.

## Do's and Don'ts

### Do:

- **Do** let an entire material field carry a volume's identity before adding component decoration.
- **Do** keep real counts, source horizons, page ranges, epistemic labels, and canonical labels close to the claim they qualify.
- **Do** use empty ivory to separate intellectual operations, then use hairlines to reveal their relation.
- **Do** preserve one label-roll hover grammar across navigation and actions.
- **Do** synchronize canonical Markdown before rebuilding the Reader standalone.
- **Do** rebuild and verify both self-contained standalone artifacts after every source change.
- **Do** preserve visibly unequal states for exhaustive dossiers, initial passes, completed distillations, and unfinished layers.
- **Do** keep the page fully legible with reduced motion, failed motion libraries, no JavaScript, or no network.

### Don't:

- **Don't** turn the room into a store, testimonial page, summary feed, dashboard, or equal-card catalogue.
- **Don't** copy Stripe Press branding, covers, logos, purchase rows, source markup, or scripts.
- **Don't** introduce scrub-driven motion, parallax, looping animation, character scrambles, glow, glass, neon, or cursor effects — the page is near-still by conviction.
- **Don't** use mono typography for ordinary prose or multiply oak into decorative accents.
- **Don't** animate layout properties or add a second signature gesture beyond the draw-once ink figures.
- **Don't** print real user filesystem paths on the page; use neutral canonical labels.
- **Don't** repeat the landing entry parting inside the Reader or animate prose merely because it entered the viewport.
- **Don't** turn the chapter rail into a filter dashboard or mix dossier and distillation content inside one unlabeled stream.
- **Don't** hide uncertainty, provenance, disagreement, or current-status boundaries behind atmosphere.
