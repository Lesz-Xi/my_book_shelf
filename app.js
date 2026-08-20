(() => {
  "use strict";

  const root = document.documentElement;
  const page = document.querySelector(".page");
  const content = document.querySelector(".scroll-content");
  const veil = document.querySelector(".entry-veil");
  const header = document.querySelector(".site-header");
  const ridge = document.querySelector(".ridge");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SCROLL_WEIGHT = 2;

  root.classList.remove("no-js");
  root.classList.add("js");

  function revealEverything() {
    root.classList.remove("motion-ready");
    root.classList.add("motion-fallback");
    document.querySelectorAll("[data-reveal-01], [data-reveal-02]").forEach((element) => {
      element.style.visibility = "visible";
      element.style.opacity = "1";
      element.style.transform = "none";
    });
    if (veil) {
      veil.style.display = "none";
    }
  }

  function librariesAvailable() {
    return Boolean(window.gsap && window.ScrollTrigger && window.SplitText);
  }

  function waitForLibraries(timeout = 2200) {
    const started = performance.now();

    return new Promise((resolve, reject) => {
      function inspect() {
        if (librariesAvailable()) {
          resolve();
          return;
        }
        if (performance.now() - started >= timeout) {
          reject(new Error("Motion libraries did not become available."));
          return;
        }
        window.setTimeout(inspect, 40);
      }
      inspect();
    });
  }

  function buildWeight(gsap, ScrollTrigger) {
    if (reducedMotion || !window.Lenis || !page || !content) {
      return {
        scrollTo(target) {
          if (target instanceof Element) {
            target.scrollIntoView({ block: "start" });
          } else {
            page.scrollTop = Number(target) || 0;
          }
        }
      };
    }

    const lenis = new window.Lenis({
      wrapper: page,
      content,
      duration: SCROLL_WEIGHT,
      smoothWheel: true,
      syncTouch: false
    });

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return {
      scrollTo(target) {
        lenis.scrollTo(target, { duration: SCROLL_WEIGHT });
      }
    };
  }

  function wireAnchors(scrollController) {
    document.querySelectorAll("[data-scroll-link]").forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");
        if (!href || !href.startsWith("#")) {
          return;
        }
        const target = document.querySelector(href);
        if (!target) {
          return;
        }
        event.preventDefault();
        scrollController.scrollTo(target);
        window.history.replaceState(null, "", href);
      });
    });
  }

  function playEntry(gsap) {
    if (!veil) {
      return;
    }

    if (reducedMotion) {
      veil.style.display = "none";
      return;
    }

    const timeline = gsap.timeline({
      defaults: { overwrite: "auto" },
      onComplete: () => {
        veil.style.display = "none";
      }
    });

    timeline
      .to(".veil-line", {
        scaleX: 1,
        duration: 0.42,
        ease: "expo.inOut"
      }, 0.06)
      .to(".veil-mark", {
        opacity: 0,
        y: -10,
        duration: 0.3,
        ease: "power2.out"
      }, 0.4)
      .to(".veil-panel-top", {
        yPercent: -101,
        duration: 0.75,
        ease: "power4.inOut"
      }, 0.44)
      .to(".veil-panel-bottom", {
        yPercent: 101,
        duration: 0.75,
        ease: "power4.inOut"
      }, 0.44)
      .to(".veil-line", {
        opacity: 0,
        duration: 0.16,
        ease: "power2.out"
      }, 0.5);
  }

  function buildTextReveals(gsap, ScrollTrigger, SplitText) {
    const splitInstances = [];

    document.querySelectorAll("[data-reveal-01]").forEach((element) => {
      const isOpening = Boolean(element.closest("#opening"));
      const split = new SplitText(element, {
        type: "lines",
        linesClass: "reveal-line",
        mask: "lines"
      });
      splitInstances.push(split);
      gsap.set(element, { visibility: "visible" });

      const config = {
        yPercent: 112,
        duration: 0.95,
        stagger: 0.09,
        ease: "power3.out",
        force3D: true
      };

      if (isOpening) {
        gsap.from(split.lines, { ...config, delay: reducedMotion ? 0 : 0.78 });
      } else {
        gsap.from(split.lines, {
          ...config,
          scrollTrigger: {
            trigger: element,
            scroller: page,
            start: "clamp(top 84%)",
            once: true
          }
        });
      }
    });

    document.querySelectorAll("[data-reveal-02]").forEach((element) => {
      const isOpening = Boolean(element.closest("#opening"));
      const split = new SplitText(element, {
        type: "words",
        wordsClass: "reveal-word"
      });
      splitInstances.push(split);
      gsap.set(element, { visibility: "visible" });

      const config = {
        opacity: 0,
        duration: 0.65,
        stagger: 0.014,
        ease: "power1.out",
        force3D: true
      };

      if (isOpening) {
        gsap.from(split.words, { ...config, delay: reducedMotion ? 0 : 0.95 });
      } else {
        gsap.from(split.words, {
          ...config,
          scrollTrigger: {
            trigger: element,
            scroller: page,
            start: "clamp(top 92%)",
            once: true
          }
        });
      }
    });

    return splitInstances;
  }

  function buildCoverReveals(gsap, ScrollTrigger) {
    document.querySelectorAll(".hero-cover, .volume-cover").forEach((cover) => {
      gsap.set(cover, { autoAlpha: 0, y: 14 });

      const show = () => {
        gsap.to(cover, {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: "power2.out"
        });
      };

      if (cover.closest("#opening")) {
        gsap.delayedCall(1.0, show);
        return;
      }

      ScrollTrigger.create({
        trigger: cover.closest(".section") || cover,
        scroller: page,
        start: "top 75%",
        once: true,
        onEnter: show
      });
    });
  }

  function buildBookDrag(gsap) {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }
    const clampPitch = gsap.utils.clamp(-70, 70);

    document.querySelectorAll(".book3d-object").forEach((object) => {
      const scene = object.closest(".book3d-scene");
      let rotY = -24;
      let rotX = 6;
      let velY = 0;
      let velX = 0;
      let dragging = false;
      let lastX = 0;
      let lastY = 0;

      const apply = () => {
        gsap.set(object, { rotationY: rotY, rotationX: rotX });
      };
      apply();

      const decay = () => {
        velY *= 0.94;
        velX *= 0.94;
        rotY += velY;
        rotX = clampPitch(rotX + velX);
        apply();
        if (Math.abs(velY) < 0.05 && Math.abs(velX) < 0.05) {
          gsap.ticker.remove(decay);
        }
      };

      scene.addEventListener("pointerdown", (event) => {
        dragging = true;
        velY = 0;
        velX = 0;
        lastX = event.clientX;
        lastY = event.clientY;
        gsap.ticker.remove(decay);
        scene.classList.add("is-dragging");
        scene.setPointerCapture(event.pointerId);
      });
      scene.addEventListener("pointermove", (event) => {
        if (!dragging) {
          return;
        }
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;
        velY = dx * 0.35;
        velX = -dy * 0.35;
        rotY += velY;
        rotX = clampPitch(rotX + velX);
        apply();
      });
      const release = () => {
        if (!dragging) {
          return;
        }
        dragging = false;
        scene.classList.remove("is-dragging");
        gsap.ticker.add(decay);
      };
      scene.addEventListener("pointerup", release);
      scene.addEventListener("pointercancel", release);
    });
  }

  function buildSectionState(ScrollTrigger) {
    const sections = [...document.querySelectorAll("[data-section-title]")];
    const links = [...document.querySelectorAll("[data-section-link]")];

    function activate(section) {
      const id = section.id;
      const onDark = section.dataset.theme === "dark";
      links.forEach((link) => {
        const active = link.dataset.sectionLink === id;
        link.classList.toggle("is-active", active);
        if (active) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
      header?.classList.toggle("on-dark", onDark);
      ridge?.classList.toggle("on-dark", onDark);
    }

    sections.forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        scroller: page,
        start: "top 54%",
        end: "bottom 54%",
        onEnter: () => activate(section),
        onEnterBack: () => activate(section)
      });
    });

    if (sections[0]) {
      activate(sections[0]);
    }
  }

  async function init() {
    if (reducedMotion) {
      revealEverything();
      wireAnchors({
        scrollTo(target) {
          target.scrollIntoView({ block: "start" });
        }
      });
      return;
    }

    try {
      await waitForLibraries();

      const { gsap, ScrollTrigger, SplitText } = window;
      gsap.registerPlugin(ScrollTrigger, SplitText);

      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      root.classList.add("motion-ready");
      ScrollTrigger.defaults({ scroller: page });

      const scrollController = buildWeight(gsap, ScrollTrigger);
      wireAnchors(scrollController);
      playEntry(gsap);
      buildTextReveals(gsap, ScrollTrigger, SplitText);
      buildCoverReveals(gsap, ScrollTrigger);
      buildBookDrag(gsap);
      buildSectionState(ScrollTrigger);

      const refresh = () => ScrollTrigger.refresh();
      requestAnimationFrame(refresh);
      window.addEventListener("resize", refresh, { passive: true });
    } catch (error) {
      console.warn("Structured Book Shelf motion fell back to the complete still page.", error);
      revealEverything();
      wireAnchors({
        scrollTo(target) {
          target.scrollIntoView({ block: "start" });
        }
      });
    }
  }

  init();
})();
