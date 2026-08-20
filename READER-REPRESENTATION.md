# Structured Book Reader — Representation Decision

**Status:** Implemented and verified  
**Direction:** Wabi-sabi refined minimal — sage, ivory, natural oak; Zen Old Mincho + Zen Kaku Gothic New  
**Scroll:** House default, Lenis `2.0`, reading plane only  
**Trail line:** Off

## Real object of design

The Reader is not a file browser and not a long landing-page appendix. Its real object is the **chapter-level reading loop**:

```text
choose a book
→ locate a chapter
→ inspect the source-grounded dossier
→ enter the constructive distillation when it exists
→ retain the evidence boundary while reading
→ move to the adjacent chapter
```

The landing folio answers “What is this archive and why does it matter?” The Reader answers “What can I read now, and which interpretive layer am I in?” Keeping those operations on separate surfaces protects both.

## Inherited representation rejected

A generic documentation layout would make the Markdown available but collapse the product into a sidebar and content pane with no visible distinction between evidence and interpretation. A dashboard would make counts and statuses cheap but turn sustained reading into scanning. Folding all chapter text into the landing page would destroy its first-contact pacing and make chapter retrieval expensive.

## Chosen representation

A **quiet reading room** with one surface and two gestures:

1. **Paper reading plane** — one measure-wide column of text; the active dossier or distillation is the whole page.
2. **Chapter drawer** — books, chapters, and the active chapter's section map live in a single rail that rests closed while reading and opens in one gesture.
3. **Quiet disclosures** — the canonical source path and layer status sit behind a `Source & layer` disclosure at the chapter head; nothing instrument-like occupies the page uninvited.

Every chapter exists as static HTML in source order before JavaScript runs. JavaScript progressively enhances the folio into one active document with hash routing, layer changes, focus movement, adjacent-chapter navigation, and weighted scrolling. If JavaScript fails, all 25 readable documents remain present as one long source-grounded volume.

## User-visible transformation

```text
chapter files hidden in a memory tree
→ book and chapter visible in one rail
→ dossier readable as a measured document
→ interpretation entered deliberately, never silently substituted
→ unfinished distillation shown as unfinished
```

## Layer contract

### AI 2041

- 11 source-grounded dossiers are readable.
- Story and analysis remain paired but distinct.
- Book-era fact, prediction, inference, and current-status unknown remain inspectable.
- Chapter 1 alone exposes the completed constructive distillation, **The Metric That Cannot See You**.

### Modern Man in Search of a Soul

- Translator’s preface and 11 essay maps are readable.
- Every chapter map is labeled as an initial structural pass, not an exhaustive treatment.
- Text, inference, meaning-frame, Chief-link, and caution remain distinct.
- Chapter 1 alone exposes the completed Spiral Distillation, **The Night Messenger**.

## Seven-line craft brief

1. **Thesis:** The Reader is a quiet reading room — one measure-wide column of text; structure and sources stay one gesture away, never on the page uninvited.
2. **Signature gesture:** Entering a chapter commits to reading — the chapter rail rests closed as a drawer and the page is only the text.
3. **Page entry:** The requested chapter is complete and readable immediately; no veil delays reading.
4. **Section transition:** Chapter and layer changes return to the top, preserve book context, and move focus to the new title.
5. **Scroll instrument:** Lenis `2.0` governs only the reading plane; the chapter rail drawer remains native and the trail line remains off.
6. **Hover grammar:** Textual controls use the established upward label roll or a hairline emphasis, with no glow, pill, bounce, or second interaction language.
7. **Rest state:** Ivory paper, sumi ink, sage quiet, oak reserved for action, square geometry, a narrow Zen Old Mincho measure, and quiet Zen Kaku Gothic evidence provide a complete still reading environment.

## Cut

The first Reader deliberately excludes:

- editing and annotation;
- search and filters;
- reading-progress gamification;
- a source-PDF viewer;
- fabricated completion states;
- card grids, dashboards, and status widgets;
- a second entry veil or decorative reading motion;
- current-world updates to the 2021 AI claims without new research.

The cut keeps the operation singular: choose, read, distinguish, continue.

## Tradeoff

Embedding every dossier and both completed distillations produces a roughly one-megabyte standalone artifact and a long no-JavaScript fallback document. That cost is accepted because the result remains private, portable, source-complete, searchable by the browser in fallback form, and independent of a server or network.

The Reader does not solve archive-wide retrieval. When cross-book search, open-question discovery, or annotation becomes the dominant operation, that deserves a separate index or research workspace rather than another panel inside the reading plane.

## Acceptance test

- The landing’s primary action opens a real chapter rather than another marketing section.
- Both volumes are reachable without filesystem navigation.
- All 23 chapter maps are readable.
- Only the two completed distillations are offered as available.
- An unavailable distillation is labeled “not yet developed.”
- The active book, chapter, and layer remain visible; source range, status, reading measure, and canonical path sit behind the chapter head's `Source & layer` disclosure, one click away.
- A mid-chapter view shows one centered text column and at most three chrome elements (brand, location, Chapters).
- Hash routes survive refresh and browser back/forward.
- Mobile chapter selection closes the drawer and opens the requested document.
- Reduced motion disables Lenis and leaves the document complete.
- With JavaScript disabled, all 25 reading documents and all 23 chapter links remain visible.
- The standalone opens over `file://`, makes no network requests, and emits no console or page errors.
