# Structured Book Shelf

A source-grounded wabi-sabi reading room and offline chapter Reader for a living archive of book schematics.

Structured Book Shelf begins where an ordinary reading archive usually ends. It keeps the source book separate and recoverable, measures its structure, maps each chapter, marks where interpretation begins, and creates constructive distillations only as a distinct, corrigible layer.

## Open the finished surfaces

Run the dev server — it serves the folio and the Reader with automatic browser reload on every source change:

```bash
python3 serve.py
```

This opens `http://127.0.0.1:8000/` (first free port from 8000). Use `--port N` to pin a port and `--no-open` to skip launching a browser tab.

For a shareable offline artifact, the standalone builds remain available:

```text
structured-book-shelf-standalone.html
structured-book-reader-standalone.html
```

The folio’s `Enter the shelf` action and both volume actions open real Reader routes. Both standalone files contain their CSS, fonts, motion libraries, application code, and required content. They work offline over `file://`; no local server or network connection is required.

## Current shelf

Verified on 2026-08-20:

- 2 source-book schematics
- 23 chapter maps
- 31 structured Markdown artifacts
- 2 constructive-distillation pilots

The canonical archive lives outside this presentation layer:

```text
/Users/lesz/.twin-sparrow/agent/memory/Book Schematics
├── AI_2041
└── Modern_Man_in_Search_of_a_Soul
```

Raw books remain separate under `memory/Books`.

## Build

When the canonical Markdown changes, synchronize the Reader first:

```bash
python3 sync-reader-content.py
```

Then rebuild both standalone artifacts (only needed when an offline, shareable file is wanted — day-to-day work happens through the dev server):

```bash
python3 build-standalone.py
```

The synchronization script reads the 23 canonical chapter dossiers and two completed distillations from `/Users/lesz/.twin-sparrow/agent/memory/Book Schematics`, converts them through the locally installed Pandoc, writes compact route metadata to `reader-data.js`, and regenerates the static chapter regions in `reader.html`.

The source pages are served by the dev server, which auto-reloads the browser whenever an HTML, CSS, JS, or asset file changes:

```bash
python3 serve.py
```

Final verification runs against the served page; verify the standalone artifact with `verify-standalone.mjs` only when one has been built for distribution.

## Project structure

```text
Structured_Book_Shelf/
├── index.html
├── styles.css
├── app.js
├── reader.html
├── reader.css
├── reader.js
├── reader-data.js
├── sync-reader-content.py
├── serve.py
├── build-standalone.py
├── structured-book-shelf-standalone.html
├── structured-book-reader-standalone.html
├── PRODUCT.md
├── REPRESENTATION.md
├── READER-REPRESENTATION.md
├── DESIGN.md
├── FINISH-REVIEW.md
├── READER-FINISH-REVIEW.md
├── PROMPT.md
├── verify-standalone.mjs
├── verify-reader.mjs
├── assets/
│   ├── fonts/
│   └── vendor/
├── screenshots/
├── reader-screenshots/
├── .impeccable/
│   ├── design.json
│   └── surfaces/
│       ├── index-html.md
│       └── reader-html.md
└── press.stripe.com--2026-08-20-0017/
```

The Stripe Press capture is design evidence only. Its `source.html`, origin scripts, modules, analytics, stylesheets, fonts, and brand assets are never used as the recreation shell.

## Behavior contract

Shared:

- The landing folio and the Reader share one wabi-sabi three-palette voice (sage, ivory, natural oak, Zen Old Mincho + Zen Kaku Gothic New) with near-still handcrafted motion.
- House scroll weight: Lenis `2.0` on wheel and trackpad.
- Touch, keyboard, and reduced-motion scrolling remain native.
- Trail line: off.
- One hover grammar: upward label roll plus a hairline/ink attention shift.
- The still page and JavaScript-failure page remain complete.

Folio:

- One entry gesture: a quiet parting of ivory leaves, once.
- One draw-once gesture per volume: the ink figure draws itself, then sits still.
- No parallax, no scrub, no looping motion.

Reader:

- Immediate chapter entry with no veil.
- One measure-wide reading column; the chapter rail is a drawer that rests closed while reading, holding books, chapters, and the active chapter's section map.
- Source path and layer status sit behind a quiet `Source & layer` disclosure at the chapter head.
- One quiet chapter-leaf crossfade.
- Lenis applies only to the reading plane; the chapter rail drawer stays native.
- Hash routes preserve book, chapter, and layer.
- No JavaScript exposes all 25 reading documents as static HTML rather than hiding the archive.

## Design decisions

Read [`REPRESENTATION.md`](REPRESENTATION.md) for the landing-folio representation and [`READER-REPRESENTATION.md`](READER-REPRESENTATION.md) for the chapter-level reading instrument, progressive-enhancement model, cuts, tradeoff, and acceptance tests.

The page deliberately rejects:

- a decorative 3D demo shelf;
- an e-commerce publisher catalogue;
- a generic archive dashboard;
- fabricated testimonials or usage claims;
- story, prediction, or interpretation presented as fact.

Its real object is a **living schematic folio**: the authored unity of a book with the source path, mechanism, and epistemic boundaries made visible.