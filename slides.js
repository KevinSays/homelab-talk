// Tiny dependency-free slide engine.
// Read mode (default) = scrolling page for attendees. Present mode (?present or P) = full-screen slides.
// Keys: →/Space/PgDn next · ←/PgUp prev · Home/End · F fullscreen · T theme · N notes · P/Esc toggle mode
(function () {
  "use strict";

  var root = document.documentElement;
  var slides = Array.prototype.slice.call(document.querySelectorAll(".deck > section"));
  var counter = document.getElementById("counter");
  var bar = document.getElementById("progress-bar");
  var current = 0;

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  // ---- Theme ----
  var savedTheme = store("theme");
  if (savedTheme === "light" || savedTheme === "dark") root.dataset.theme = savedTheme;

  function toggleTheme() {
    var isDark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = isDark ? "light" : "dark";
    store("theme", root.dataset.theme);
  }

  // ---- URL state: ?present for mode, #N for slide ----
  function slideFromHash() {
    var n = parseInt(location.hash.slice(1), 10);
    return isNaN(n) ? 0 : Math.min(Math.max(n - 1, 0), slides.length - 1);
  }

  function writeUrl() {
    var search = isPresenting() ? "?present" : "";
    history.replaceState(null, "", location.pathname + search + "#" + (current + 1));
  }

  function isPresenting() { return root.classList.contains("present"); }

  // ---- Slides ----
  function show(n) {
    current = Math.min(Math.max(n, 0), slides.length - 1);
    slides.forEach(function (s, i) { s.classList.toggle("active", i === current); });
    counter.textContent = (current + 1) + " / " + slides.length;
    bar.style.width = ((current + 1) / slides.length * 100) + "%";
    writeUrl();
  }

  function setMode(present) {
    root.classList.toggle("present", present);
    if (present) {
      show(current);
    } else {
      slides.forEach(function (s) { s.classList.remove("active"); });
      if (document.fullscreenElement) document.exitFullscreen();
      writeUrl();
      slides[current].scrollIntoView({ block: "start" });
    }
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (root.requestFullscreen) root.requestFullscreen();
  }

  // In read mode, keep the hash pointing at the section in view so shared links land there.
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      if (isPresenting()) return;
      entries.forEach(function (e) {
        if (e.isIntersecting) { current = slides.indexOf(e.target); writeUrl(); }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    slides.forEach(function (s) { io.observe(s); });
  }

  // ---- Input ----
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var key = e.key;

    if (key === "t" || key === "T") { toggleTheme(); return; }
    if (key === "n" || key === "N") { root.classList.toggle("show-notes"); return; }
    if (key === "p" || key === "P") { setMode(!isPresenting()); return; }
    if (!isPresenting()) return;

    switch (key) {
      case "ArrowRight": case "ArrowDown": case "PageDown": case " ": case "Enter":
        show(current + 1); break;
      case "ArrowLeft": case "ArrowUp": case "PageUp": case "Backspace":
        show(current - 1); break;
      case "Home": show(0); break;
      case "End": show(slides.length - 1); break;
      case "f": case "F": toggleFullscreen(); break;
      case "Escape": if (!document.fullscreenElement) setMode(false); break;
      default: return;
    }
    e.preventDefault();
  });

  // Click right two-thirds = next, left third = previous (links still work).
  document.querySelector(".deck").addEventListener("click", function (e) {
    if (!isPresenting() || e.target.closest("a, button")) return;
    show(e.clientX < window.innerWidth / 3 ? current - 1 : current + 1);
  });

  // Swipe on touch screens.
  var touchX = null;
  document.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (!isPresenting() || touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(dx < 0 ? current + 1 : current - 1);
    touchX = null;
  });

  window.addEventListener("hashchange", function () { if (isPresenting()) show(slideFromHash()); });

  document.getElementById("btn-present").addEventListener("click", function () { setMode(true); });
  document.getElementById("btn-theme").addEventListener("click", toggleTheme);

  // Show a placeholder for the QR code and photos until the image files exist.
  document.querySelectorAll("#qr, .photo img").forEach(function (img) {
    function missing() { img.parentElement.classList.add("missing"); }
    if (img.complete && img.naturalWidth === 0) missing();
    img.addEventListener("error", missing);
  });

  // ---- Boot ----
  current = slideFromHash();
  if (new URLSearchParams(location.search).has("present")) {
    setMode(true);
  } else if (location.hash) {
    slides[current].scrollIntoView({ block: "start" });
  }
})();
