/* Two small jobs, no libraries and no animation loop:
   1. add "scrolled" to the top bar once the page is scrolled (motion.css draws the shadow)
   2. add "reveal" to cards and sections, then "in" when they enter the screen (IntersectionObserver),
      so motion.css can fade them up once. */
(() => {
  "use strict";
  const topbar = document.querySelector(".topbar");
  if (topbar) {
    const update = () => topbar.classList.toggle("scrolled", window.scrollY > 8);
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

  const targets = document.querySelectorAll(".result, .step, .tile, .fact, .section-head, .panel, .outcome, .confirm, .profile-card");
  const seen = new Map();                                   // position inside its parent -> small stagger
  const io = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("in");
    io.unobserve(entry.target);
  }), { rootMargin: "0px 0px -5% 0px" });

  targets.forEach((el) => {
    const i = seen.get(el.parentElement) || 0;
    seen.set(el.parentElement, i + 1);
    el.style.setProperty("--i", Math.min(i, 6));             // long lists never wait more than 0.3 s
    el.classList.add("reveal");
    io.observe(el);
  });
})();
