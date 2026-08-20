# Structured Book Shelf — Build and Extension Prompt

Use this contract when extending the page with an agent.

```text
Build or extend Structured Book Shelf as a source-grounded living schematic folio.

PRODUCT
Structured Book Shelf turns completed books into re-readable cognitive instruments. It preserves the source book, measured structure, chapter dossiers, epistemic labels, interpretations, open questions, and constructive distillations without collapsing them into one authority.

CANONICAL CONTENT
/Users/lesz/.twin-sparrow/agent/memory/Book Schematics

Raw books remain separate under:
/Users/lesz/.twin-sparrow/agent/memory/Books

REPRESENTATION
Do not represent the product as a bookstore, review feed, summary app, source-PDF viewer, file dashboard, or decorative 3D shelf. The landing surface is a living schematic folio: book identity remains primary while source structure and provenance become inspectable. The Reader is a separate source-aware reading folio: book → chapter → dossier → completed distillation. Never absorb long-form chapter text into the landing page or collapse dossier and distillation into one unlabeled layer.

DIRECTION
Editorial / magazine is primary; Luxury / refined minimal is seasoning. The Stripe Press capture in press.stripe.com--2026-08-20-0017/ is evidence for asymmetric reading space, full-field color chapters, book-object presence, narrow measures, and hairline action rows. Do not copy its brand, logo, covers, exact composition, purchase grammar, testimonial layout, scripts, fonts, or source.html.

TASTE
- proof before pitch
- mechanism before atmosphere
- instrument over dashboard
- material warmth under technical rigor
- calm density
- source and interpretation remain distinct
- beauty reveals structure rather than hiding it

MOTION
- landing: one signature gesture, aperture entry, once
- Reader: immediate entry, no veil; one quiet chapter-leaf crossfade
- Lenis scroll weight 2.0 on wheel/trackpad; Reader applies it only to the reading plane
- no trail line
- landing: one parallax handoff and one inner-rise footer reveal; never translate the outer sticky footer plate
- landing: two reveal registers maximum; Reader does not animate prose on viewport entry
- one label-roll/hairline hover grammar
- no loops
- reduced motion disables Lenis and resolves every surface to its complete still state

VISUAL SYSTEM
- one muted schematic-yellow accent with warm mineral paper, sumi-like ink, and deep yellow only where contrast requires it
- Shippori Mincho for display and long-form reading
- Zen Kaku Gothic New for evidence, paths, labels, measurements, navigation, and controls
- Japanese restraint is structural: quiet hierarchy, hairlines, ma, and exact spacing—not decorative motifs
- square geometry
- hairlines and space over cards and elevation
- physical shadows only beneath actual book objects
- no generic AI glow, glass, pill interfaces, or purple-pink gradients

CONTENT DISCIPLINE
- use real archive counts and source paths
- mark historical/book-era facts, prediction, inference, meaning-frame, and current unknowns correctly
- never invent testimonials, customers, metrics, prices, or completion status
- a new book must derive its own epistemic grammar rather than mechanically copying AI 2041 or Jung
- every added section must supply a missing form of conviction and replace or compress weaker explanation

ENGINEERING
- folio source: index.html, styles.css, app.js
- Reader source: reader.html, reader.css, reader.js, generated reader-data.js
- sync-reader-content.py compiles canonical Markdown through local Pandoc and regenerates static Reader regions
- dependencies live under assets/vendor/; never use a CDN or captured-origin script
- fonts live under assets/fonts/ with licenses
- build-standalone.py emits both structured-book-shelf-standalone.html and structured-book-reader-standalone.html with CSS, JS, fonts, libraries, and Reader content inlined
- both standalone artifacts must work offline over file://
- every interactive element is keyboard-reachable with visible focus
- the folio remains usable if GSAP, SplitText, ScrollTrigger, or Lenis fails
- the Reader exposes all 25 documents if JavaScript fails
- hide production scrollbars while preserving scroll

VERIFICATION
- synchronize canonical Reader content before rebuilding when Markdown changes
- rebuild after every source change
- verify both standalone artifacts, not only the source pages
- capture landing entry/middle/end and Reader dossier/distillation/mobile states over file://
- confirm zero console errors and zero network requests
- confirm the landing first viewport contains the full promise, real artifact, and primary action
- confirm all 23 dossiers, exactly 2 completed distillations, reduced motion, mobile chapter selection, and the 25-document no-JavaScript fallback
- confirm no accidental one-word headline columns
- confirm no source/interpretation collapse
```

Before adding a third volume, read `PRODUCT.md`, `REPRESENTATION.md`, `READER-REPRESENTATION.md`, and `DESIGN.md`. If the shelf grows until retrieval becomes the primary job, add a separate archive-index surface rather than turning the landing folio or Reader into a dashboard grid.