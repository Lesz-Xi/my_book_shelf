# Structured Book Shelf

A source-grounded, wabi-sabi **reading room on the web** — a living archive that turns finished books into measured, chapter-level instruments for re-reading, explanation, and responsible thought.

Structured Book Shelf begins where an ordinary reading archive usually ends. It keeps the source book separate and recoverable, measures its structure, maps each chapter, marks where interpretation begins, and creates constructive distillations only as a distinct, corrigible layer — never silently blended into the evidence.

## What it is

Two surfaces, one voice:

- **The folio (`index.html`)** — a quiet landing that presents the shelf as two physical volumes. Each book is a draggable CSS-3D cuboid (jacket, cloth spine, page block) you can pick up and turn with a pointer. Near-still, handcrafted motion: one entry gesture, draw-once ink figures, no loops.
- **The Reader (`reader.html`)** — a single-column reading room. One measure-wide column of text; books, chapters, and the active chapter's section map rest in a drawer that stays closed while you read. Source paths and layer status sit behind a quiet `Source & layer` disclosure — structure is one gesture away, never on the page uninvited.

Both speak the same wabi-sabi dialect: sage, ivory, and natural oak; Zen Old Mincho for the reading measure, Zen Kaku Gothic New for evidence and labels; square geometry, no cards, no dashboards.

## Current shelf

Verified on 2026-08-20:

- 2 source-book schematics — *AI 2041* (Lee & Chen) and *Modern Man in Search of a Soul* (Jung)
- 23 chapter maps
- 31 structured Markdown artifacts
- 2 constructive-distillation pilots, kept visibly separate from their source dossiers

## Principles

- **Evidence and interpretation never mix silently.** Every chapter dossier is source-grounded with page addresses; distillations are labeled, corrigible, and entered deliberately.
- **The still page is complete.** Reduced-motion and no-JavaScript states are the same discipline seen two ways — with JS disabled, all 25 reading documents remain present as one long static volume.
- **One motion language.** Lenis `2.0` weighted scroll on the reading plane only, a single hover grammar (upward label roll / hairline emphasis), and motion that settles instead of looping.
- **Offline-first artifacts.** Standalone builds inline CSS, fonts, vendored motion libraries, and content into single HTML files that open over `file://` with zero network requests.

## Quick start

Requires only Python 3 (standard library) for serving; [Pandoc](https://pandoc.org) is needed solely for re-syncing content from the canonical archive.

```bash
python3 serve.py
```

Opens `http://127.0.0.1:8000/` (first free port from 8000) with automatic browser reload on every source change. Use `--port N` to pin a port and `--no-open` to skip launching a browser tab.

Prefer a double-clickable file? Open the standalone builds directly:

```text
structured-book-shelf-standalone.html   # the folio
structured-book-reader-standalone.html  # the reading room
```

## How it's built

The canonical Markdown archive lives outside this presentation layer; this repo is the instrument that renders it.

```bash
python3 sync-reader-content.py   # canonical Markdown → reader-data.js + reader.html regions (via Pandoc)
python3 build-standalone.py      # inline CSS/JS/fonts/assets → the two standalone files
```

`sync-reader-content.py` converts the 23 chapter dossiers and 2 distillations through Pandoc, writes compact route metadata, and regenerates the marked regions of `reader.html` — hand-edits inside those regions are wiped by design.

Verification is headless-Chrome over raw CDP (no Playwright dependency):

```bash
node verify-standalone.mjs   # folio checks + screenshots
node verify-reader.mjs       # reader routing, drawer, reduced-motion, and no-JS checks
```

Both assert zero network requests, zero console/page errors, and a complete no-JS fallback, and exit non-zero on any failure.

## Project structure

```text
├── index.html  styles.css  app.js        # the folio
├── reader.html reader.css  reader.js     # the reading room
├── reader-data.js                        # generated route + content metadata
├── sync-reader-content.py                # canonical Markdown → reader pipeline
├── serve.py                              # dev server with SSE live reload
├── build-standalone.py                   # offline single-file builds
├── verify-standalone.mjs  verify-reader.mjs
├── assets/fonts/  assets/vendor/         # self-hosted fonts, vendored GSAP/ScrollTrigger/Lenis
├── REPRESENTATION.md                     # folio design decision record
├── READER-REPRESENTATION.md              # reader design decision record
├── PRODUCT.md  DESIGN.md  PROMPT.md      # product framing and design briefs
└── FINISH-REVIEW.md  READER-FINISH-REVIEW.md
```

The design decision records are the real documentation: they state the inherited representations that were rejected, the cuts, the tradeoffs, and the acceptance tests each surface is held to.

## What it deliberately refuses

- a decorative 3D demo shelf or e-commerce catalogue;
- a generic archive dashboard with counts and status widgets;
- search, annotation, or reading-progress gamification (so far — see the tradeoff notes);
- story, prediction, or interpretation presented as fact.

Its real object is a **living schematic folio**: the authored unity of a book, with its source path, mechanism, and epistemic boundaries kept visible.
