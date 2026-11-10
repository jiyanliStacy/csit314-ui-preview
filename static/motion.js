/* Motion layer for the Interior Design Platform.
 *
 * Small, separate classes; each one only reacts to what the user does (pointer, scroll, hover, click).
 * - Everything is skipped when the system asks for reduced motion.
 * - Magnetic buttons and parallax are skipped on touch screens.
 */
(() => {
  "use strict";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  /* ---------- one shared animation loop; components register a tick and say when they are idle */
  class Loop {
    constructor() { this.items = new Set(); this.running = false; this.frame = this.frame.bind(this); }
    add(item) { this.items.add(item); this.wake(); }
    wake() { if (!this.running) { this.running = true; requestAnimationFrame(this.frame); } }
    frame() {
      let busy = false;
      for (const item of this.items) busy = item.tick() || busy;
      if (busy) requestAnimationFrame(this.frame); else this.running = false;   // stop when nothing moves
    }
  }
  const loop = new Loop();

  /* ---------- parallax: follows the pointer with easing and drifts back to rest when it leaves.
     Writes two CSS variables (-1..1) on the element; motion.css decides what moves and how far. */
  class Parallax {
    constructor(area, target, vx = "--mx", vy = "--my", ease = 0.08) {
      Object.assign(this, { area, target, vx, vy, ease, x: 0, y: 0, tx: 0, ty: 0 });
      area.addEventListener("pointermove", (e) => {
        const r = area.getBoundingClientRect();
        this.tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
        this.ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
        loop.wake();
      }, { passive: true });
      area.addEventListener("pointerleave", () => { this.tx = this.ty = 0; loop.wake(); });
      loop.add(this);
    }
    tick() {
      if (this.x === this.tx && this.y === this.ty) return false;            // at rest: no style writes
      this.x = lerp(this.x, this.tx, this.ease); this.y = lerp(this.y, this.ty, this.ease);
      if (Math.abs(this.x - this.tx) + Math.abs(this.y - this.ty) < 0.001) { this.x = this.tx; this.y = this.ty; }
      this.target.style.setProperty(this.vx, this.x.toFixed(4));
      this.target.style.setProperty(this.vy, this.y.toFixed(4));
      return this.x !== this.tx || this.y !== this.ty;
    }
  }

  /* ---------- magnetic buttons: lean a few pixels towards the pointer, spring back on leave */
  class Magnetic {
    constructor(el, strength = 0.22, max = 8) {
      Object.assign(this, { el, strength, max, x: 0, y: 0, tx: 0, ty: 0 });
      el.classList.add("magnetic");
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        this.tx = clamp((e.clientX - (r.left + r.width / 2)) * strength, -max, max);
        this.ty = clamp((e.clientY - (r.top + r.height / 2)) * strength, -max, max);
        loop.wake();
      }, { passive: true });
      el.addEventListener("pointerleave", () => { this.tx = this.ty = 0; loop.wake(); });
      loop.add(this);
    }
    tick() {
      if (this.x === this.tx && this.y === this.ty) return false;
      this.x = lerp(this.x, this.tx, 0.15); this.y = lerp(this.y, this.ty, 0.15);
      if (Math.abs(this.x - this.tx) + Math.abs(this.y - this.ty) < 0.05) { this.x = this.tx; this.y = this.ty; }
      this.el.style.translate = `${this.x.toFixed(2)}px ${this.y.toFixed(2)}px`;
      return this.x !== this.tx || this.y !== this.ty;
    }
  }

  /* ---------- sliding highlight behind the top-bar links */
  class NavPill {
    constructor(nav) {
      this.nav = nav;
      this.pill = Object.assign(document.createElement("span"), { className: "nav-pill" });
      nav.prepend(this.pill);
      nav.querySelectorAll("a").forEach((a) => a.addEventListener("pointerenter", () => this.to(a)));
      nav.addEventListener("pointerleave", () => nav.classList.remove("pill-on"));
    }
    to(a) {
      if (a.classList.contains("active")) { this.nav.classList.remove("pill-on"); return; }
      const first = !this.nav.classList.contains("pill-on");
      if (first) this.pill.style.transition = "none";                        // appear in place, then slide
      Object.assign(this.pill.style, { width: a.offsetWidth + "px", height: a.offsetHeight + "px", transform: `translate(${a.offsetLeft}px, ${a.offsetTop}px)` });
      if (first) { this.pill.offsetWidth; this.pill.style.transition = ""; }
      this.nav.classList.add("pill-on");
    }
  }

  /* ---------- reveal on scroll, staggered inside each group; numbers count up once they are seen */
  class Reveal {
    constructor(selector) {
      const els = [...document.querySelectorAll(selector)];
      const groups = new Map();
      els.forEach((el) => {
        const i = groups.get(el.parentElement) || 0;
        groups.set(el.parentElement, i + 1);
        el.style.setProperty("--i", Math.min(i % 12, 8));      // long lists don't wait forever
        el.classList.add("reveal");
      });
      const io = new IntersectionObserver((entries) => entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        en.target.querySelectorAll("[data-count]").forEach(countUp);
        io.unobserve(en.target);
      }), { rootMargin: "0px 0px -6% 0px" });
      els.forEach((el) => io.observe(el));
    }
  }
  function countUp(el) {
    const end = parseInt(el.dataset.count, 10), start = performance.now(), dur = 1100;
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur), eased = 1 - Math.pow(2, -10 * t);   // ease-out expo
      el.textContent = t < 1 ? Math.round(end * eased) : el.dataset.text;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- start */
  function init() {
    const topbar = document.querySelector(".topbar");
    const onScroll = () => topbar && topbar.classList.toggle("scrolled", scrollY > 8);
    addEventListener("scroll", onScroll, { passive: true }); onScroll();

    if (reduced) return;

    // numbers that count up: whole-number tiles and home stats only
    document.querySelectorAll(".stats strong, .tile .num").forEach((el) => {
      const text = el.textContent.trim();
      if (/^\d{1,6}$/.test(text) && +text > 0) { el.dataset.count = text; el.dataset.text = text; el.textContent = "0"; }
    });
    new Reveal(".result, .step, .tile, .fact, .hero-inner > div:first-child, .stats, .section-head, .panel, .outcome, .confirm, .profile-card");

    if (!finePointer) return;
    document.querySelectorAll(".topbar nav").forEach((nav) => new NavPill(nav));
    document.querySelectorAll(".btn, .button, .searchbar button, main.narrow button").forEach((el) => new Magnetic(el));
    document.querySelectorAll(".result").forEach((card) => {
      const cover = card.querySelector(".cover");
      if (cover) new Parallax(card, cover, "--mx", "--my", 0.1);
    });
    const hero = document.querySelector(".hero"), collage = document.querySelector(".collage");
    if (hero && collage) {
      new Parallax(hero, collage, "--hx", "--hy", 0.05);
      collage.querySelectorAll(".cover").forEach((c) => new Parallax(hero, c, "--mx", "--my", 0.06));
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
