/**
 * Shared Reveal.js bootstrap for every class.
 *
 * Hard rule: slides are 16:9 (1280×720). Do not change width/height
 * independently — keep the aspect ratio.
 *
 * Nav chrome (controls + progress + slide number) has a fixed footprint.
 * That band is not usable. Content is laid out above --nav-reserve.
 *
 *   <script src="../shared/reveal-boot.js"></script>
 *   <script>
 *     PBSReveal.boot({
 *       onReady() { initCharts(); },
 *       onSlideChanged() { resizeCharts(); },
 *     });
 *   </script>
 */
(function (global) {
  const defaults = {
    hash: true,
    slideNumber: "c/t",
    transition: "fade",
    backgroundTransition: "fade",
    width: 1280,
    height: 720,
    margin: 0.07,
    minScale: 0.2,
    maxScale: 2,
    controls: true,
    progress: true,
    center: false,
  };

  /** Floor in slide-px. Nav chrome height is constant in the viewport. */
  const NAV_RESERVE_MIN = 56;

  function wrapSlides() {
    document.querySelectorAll(".reveal .slides section").forEach((section) => {
      if (section.querySelector(":scope > .slide-fit")) return;
      const shell = document.createElement("div");
      shell.className = "slide-fit";
      while (section.firstChild) shell.appendChild(section.firstChild);
      section.appendChild(shell);
    });
  }

  function navElements(root) {
    return [...root.querySelectorAll(".controls, .progress, .slide-number")].filter(
      (el) => el.getBoundingClientRect().height > 0
    );
  }

  function syncNavReserve() {
    const root = document.querySelector(".reveal");
    const slide = typeof Reveal !== "undefined" ? Reveal.getCurrentSlide() : null;
    if (!root) return NAV_RESERVE_MIN;

    const scale = (typeof Reveal !== "undefined" && Reveal.getScale()) || 1;
    const rootRect = root.getBoundingClientRect();
    const slideRect = slide ? slide.getBoundingClientRect() : rootRect;

    let chromeFromViewportBottom = 0;
    let overlapIntoSlide = 0;

    navElements(root).forEach((el) => {
      const r = el.getBoundingClientRect();
      chromeFromViewportBottom = Math.max(chromeFromViewportBottom, rootRect.bottom - r.top);
      overlapIntoSlide = Math.max(overlapIntoSlide, slideRect.bottom - r.top);
    });

    const reserve = Math.ceil(
      Math.max(chromeFromViewportBottom, overlapIntoSlide, NAV_RESERVE_MIN * scale) / scale
    ) + 4;

    root.style.setProperty("--nav-reserve", `${reserve}px`);
    return reserve;
  }

  function resetFit(shell) {
    shell.style.transform = "";
    shell.style.width = "";
  }

  function fitSlide(section) {
    if (!section) return;
    const shell = section.querySelector(":scope > .slide-fit");
    if (!shell) return;

    resetFit(shell);

    const reserve = parseFloat(getComputedStyle(section).paddingBottom) || 0;
    const safe = section.clientHeight - reserve;
    const used = shell.scrollHeight;
    if (used <= safe + 1 || safe <= 0) return;

    const fit = Math.max(0.8, safe / used);
    shell.style.transformOrigin = "top left";
    shell.style.width = `${100 / fit}%`;
    shell.style.transform = `scale(${fit})`;
  }

  function layoutDeck() {
    syncNavReserve();
    if (typeof Reveal !== "undefined") fitSlide(Reveal.getCurrentSlide());
  }

  function boot(options = {}) {
    const { onReady, onSlideChanged, revealOptions = {}, plugins = [] } = options;
    const config = { ...defaults, ...revealOptions };

    if (config.width / config.height !== 16 / 9) {
      console.warn("PBSReveal: slide canvas must stay 16:9 (1280×720).");
    }

    if (plugins.length || (typeof RevealHighlight !== "undefined" && !config.plugins)) {
      config.plugins = plugins.length
        ? plugins
        : typeof RevealHighlight !== "undefined"
          ? [RevealHighlight]
          : [];
    }

    wrapSlides();

    return Reveal.initialize(config).then(() => {
      if (typeof lucide !== "undefined") lucide.createIcons();
      if (typeof onReady === "function") onReady();

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          layoutDeck();
          if (typeof onSlideChanged === "function") onSlideChanged();
        });
      });

      Reveal.on("slidechanged", () => {
        if (typeof lucide !== "undefined") lucide.createIcons();
        layoutDeck();
        if (typeof onSlideChanged === "function") onSlideChanged();
      });

      Reveal.on("resize", () => {
        layoutDeck();
        if (typeof onSlideChanged === "function") onSlideChanged();
      });
    });
  }

  global.PBSReveal = { boot, defaults, syncNavReserve, layoutDeck };
})(window);
