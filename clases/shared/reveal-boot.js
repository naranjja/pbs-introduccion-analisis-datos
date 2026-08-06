/**
 * Optional shared Reveal bootstrap helpers.
 * Include after Reveal, Lucide, Chart.js, Plotly as needed:
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
    margin: 0.08,
    controls: true,
    progress: true,
    center: false,
  };

  function boot(options = {}) {
    const { onReady, onSlideChanged, revealOptions = {}, plugins = [] } = options;
    const config = { ...defaults, ...revealOptions };

    if (plugins.length || (typeof RevealHighlight !== "undefined" && !config.plugins)) {
      config.plugins = plugins.length
        ? plugins
        : typeof RevealHighlight !== "undefined"
          ? [RevealHighlight]
          : [];
    }

    return Reveal.initialize(config).then(() => {
      if (typeof lucide !== "undefined") lucide.createIcons();
      if (typeof onReady === "function") onReady();

      Reveal.on("slidechanged", () => {
        if (typeof lucide !== "undefined") lucide.createIcons();
        if (typeof onSlideChanged === "function") onSlideChanged();
      });
    });
  }

  global.PBSReveal = { boot, defaults };
})(window);
