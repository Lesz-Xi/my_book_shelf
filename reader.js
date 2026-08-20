(() => {
  "use strict";

  const root = document.documentElement;
  const library = window.READER_LIBRARY;
  const page = document.querySelector("#reader-page");
  const scrollContent = document.querySelector(".reader-scroll-content");
  const documents = [...document.querySelectorAll("[data-document]")];
  const rail = document.querySelector("#chapter-rail");
  const railScrim = document.querySelector("#rail-scrim");
  const menuButton = document.querySelector("#chapter-menu");
  const locationLabel = document.querySelector("#reader-location");
  const toc = document.querySelector("#article-toc");
  const chapterTurn = document.querySelector("#chapter-turn");
  const previousLink = chapterTurn?.querySelector(".turn-previous");
  const nextLink = chapterTurn?.querySelector(".turn-next");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SCROLL_WEIGHT = 2;

  root.classList.remove("no-js");
  root.classList.add("js");

  if (!library || !page || !scrollContent || documents.length === 0) {
    root.classList.add("motion-fallback");
    return;
  }

  const documentByRoute = new Map(documents.map((document) => [document.dataset.route, document]));
  const chapterEntries = library.books.flatMap((book) => book.chapters.map((chapter) => ({ book, chapter })));
  const chapterByRoute = new Map();
  const routeMetadata = new Map();

  chapterEntries.forEach(({ book, chapter }) => {
    ["dossier", "distillation"].forEach((layer) => {
      const value = chapter[layer];
      if (!value) return;
      routeMetadata.set(value.route, { book, chapter, layer, value });
      chapterByRoute.set(value.route, { book, chapter });
    });
  });

  let activeRoute = "";
  let activeDocument = null;
  let transition = null;
  let scrollController = null;
  let tocAbort = null;

  function buildScrollController() {
    if (reducedMotion || !window.Lenis || !window.gsap) {
      return {
        top(immediate = true) {
          page.scrollTop = 0;
          if (!immediate) page.dispatchEvent(new Event("scroll"));
        },
        to(target) {
          target.scrollIntoView({ block: "start" });
        },
        resize() {}
      };
    }

    const lenis = new window.Lenis({
      wrapper: page,
      content: scrollContent,
      duration: SCROLL_WEIGHT,
      smoothWheel: true,
      syncTouch: false
    });

    if (window.ScrollTrigger) {
      lenis.on("scroll", window.ScrollTrigger.update);
    }
    window.gsap.ticker.add((time) => lenis.raf(time * 1000));
    window.gsap.ticker.lagSmoothing(0);

    return {
      top(immediate = true) {
        lenis.scrollTo(0, { immediate });
      },
      to(target) {
        lenis.scrollTo(target, { duration: SCROLL_WEIGHT, offset: -22 });
      },
      resize() {
        lenis.resize();
      }
    };
  }

  function routeFromLocation() {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (routeMetadata.has(hash)) return hash;
    if (hash.startsWith("doc-")) {
      const document = document.getElementById(hash);
      if (document?.dataset.route && routeMetadata.has(document.dataset.route)) {
        return document.dataset.route;
      }
    }
    return library.books[0].chapters[0].dossier.route;
  }

  function setMenu(open) {
    if (!rail || !railScrim || !menuButton) return;
    rail.classList.toggle("is-open", open);
    railScrim.classList.toggle("is-visible", open);
    menuButton.setAttribute("aria-expanded", String(open));
    railScrim.tabIndex = open ? 0 : -1;
  }

  function setActiveLinks(route) {
    const { book, chapter } = routeMetadata.get(route);
    const chapterRoute = chapter.dossier.route;
    let activeChapterLink = null;

    document.querySelectorAll("[data-route]").forEach((link) => {
      const isChapterLink = link.classList.contains("chapter-link");
      const active = isChapterLink ? link.dataset.route === chapterRoute : link.dataset.route === route;
      link.classList.toggle("is-active", active);
      if (isChapterLink) {
        if (active) {
          link.setAttribute("aria-current", "location");
          activeChapterLink = link;
        } else {
          link.removeAttribute("aria-current");
        }
      }
    });

    document.querySelectorAll("[data-book-group]").forEach((group) => {
      group.classList.toggle("is-current-book", group.dataset.bookGroup === book.id);
    });

    if (activeChapterLink && rail) {
      const target = activeChapterLink.offsetTop - Math.max(0, (rail.clientHeight - activeChapterLink.offsetHeight) / 2);
      rail.scrollTo({ top: Math.max(0, target), behavior: reducedMotion ? "auto" : "smooth" });
    }
  }

  function buildToc(document) {
    if (!toc) return;
    tocAbort?.abort();
    tocAbort = new AbortController();
    toc.replaceChildren();

    const headings = [...document.querySelectorAll(".markdown-body h2")];
    if (headings.length === 0) {
      const empty = document.createElement?.("span");
      if (empty) empty.textContent = "No section map";
      return;
    }

    headings.forEach((heading, index) => {
      if (!heading.id) heading.id = `${document.id}--section-${index + 1}`;
      const link = window.document.createElement("a");
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent.replace(/^\d+\.?\s*/, "");
      if (index === 0) link.classList.add("is-current");
      link.addEventListener("click", (event) => {
        event.preventDefault();
        toc.querySelectorAll("a").forEach((item) => item.classList.toggle("is-current", item === link));
        scrollController.to(heading);
        setMenu(false);
      }, { signal: tocAbort.signal });
      toc.append(link);
    });
  }

  function configureTurn(meta) {
    if (!chapterTurn || !previousLink || !nextLink) return;
    const chapterIndex = chapterEntries.findIndex(({ book, chapter }) => book.id === meta.book.id && chapter.id === meta.chapter.id);
    const previous = chapterEntries[chapterIndex - 1] || null;
    const next = chapterEntries[chapterIndex + 1] || null;

    function configure(link, entry, direction) {
      if (!entry) {
        link.hidden = true;
        link.removeAttribute("data-route");
        return;
      }
      link.hidden = false;
      const route = entry.chapter.dossier.route;
      link.dataset.route = route;
      link.href = `#${entry.chapter.dossier.anchor}`;
      const label = link.querySelector("span");
      const title = link.querySelector("strong");
      label.textContent = direction;
      title.textContent = `${entry.book.title} · ${entry.chapter.number} · ${entry.chapter.title}`;
    }

    configure(previousLink, previous, "Previous chapter");
    configure(nextLink, next, "Next chapter");
    chapterTurn.hidden = !previous && !next;
  }

  function updateContext(meta, document) {
    const layerName = meta.layer === "dossier" ? "Chapter dossier" : "Constructive distillation";
    locationLabel.textContent = `${meta.book.title} · ${meta.chapter.number} · ${layerName}`;
    document.title = `${meta.chapter.title} — ${layerName} — Structured Book Shelf`;
    setActiveLinks(meta.value.route);
    buildToc(document);
    configureTurn(meta);
  }

  function finishNavigation(route, document, meta, focusTitle) {
    documents.forEach((item) => {
      item.hidden = item !== document;
      item.style.removeProperty("opacity");
      item.style.removeProperty("transform");
    });
    activeRoute = route;
    activeDocument = document;
    scrollController.top(true);
    scrollController.resize();
    updateContext(meta, document);
    setMenu(false);
    window.ScrollTrigger?.refresh();
    if (focusTitle) {
      window.setTimeout(() => document.querySelector("h1")?.focus({ preventScroll: true }), 40);
    }
  }

  function navigate(route, { history = "push", focusTitle = true, animate = true } = {}) {
    const document = documentByRoute.get(route);
    const meta = routeMetadata.get(route);
    if (!document || !meta) return;

    if (history === "push" && route !== activeRoute) {
      window.history.pushState({ route }, "", `#${route}`);
    } else if (history === "replace") {
      window.history.replaceState({ route }, "", `#${route}`);
    }

    if (route === activeRoute) {
      scrollController.top(false);
      setMenu(false);
      return;
    }

    transition?.kill();
    transition = null;

    const canAnimate = animate && !reducedMotion && window.gsap && activeDocument;
    if (!canAnimate) {
      finishNavigation(route, document, meta, focusTitle);
      return;
    }

    transition = window.gsap.timeline({
      defaults: { overwrite: "auto" },
      onComplete: () => {
        finishNavigation(route, document, meta, focusTitle);
        transition = null;
      }
    });
    transition
      .to(activeDocument, { opacity: 0, y: -8, duration: 0.18, ease: "power1.in" })
      .add(() => {
        activeDocument.hidden = true;
        document.hidden = false;
        scrollController.top(true);
        scrollController.resize();
        updateContext(meta, document);
      })
      .fromTo(document, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: "expo.out" });
  }

  function wireRoutes() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest("[data-route]");
      if (!link || !routeMetadata.has(link.dataset.route)) return;
      event.preventDefault();
      navigate(link.dataset.route);
    });

    window.addEventListener("popstate", () => {
      navigate(routeFromLocation(), { history: "none", focusTitle: true });
    });
  }

  function wireMenu() {
    menuButton?.addEventListener("click", () => {
      setMenu(menuButton.getAttribute("aria-expanded") !== "true");
    });
    railScrim?.addEventListener("click", () => setMenu(false));
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setMenu(false);
        menuButton?.focus();
      }
    });
  }

  function failOpen(error) {
    console.warn("Structured Book Reader fell back to its complete static document.", error);
    transition?.kill();
    documents.forEach((document) => {
      document.hidden = false;
      document.style.removeProperty("opacity");
      document.style.removeProperty("transform");
    });
    root.classList.remove("motion-ready");
    root.classList.add("motion-fallback");
    setMenu(false);
  }

  try {
    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      window.ScrollTrigger.defaults({ scroller: page });
      root.classList.add("motion-ready");
    } else {
      root.classList.add("motion-fallback");
    }

    scrollController = buildScrollController();
    wireRoutes();
    wireMenu();
    navigate(routeFromLocation(), { history: "replace", focusTitle: false, animate: false });

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        scrollController.resize();
        window.ScrollTrigger?.refresh();
      });
    }
    window.addEventListener("resize", () => {
      if (window.innerWidth > 860) setMenu(false);
      scrollController.resize();
      window.ScrollTrigger?.refresh();
    }, { passive: true });
  } catch (error) {
    failOpen(error);
  }
})();
