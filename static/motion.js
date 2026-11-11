/* The only script for motion: adds the class "scrolled" to the top bar once the page is scrolled,
   so motion.css can show a thin shadow under it. No libraries, no animation loop. */
(() => {
  "use strict";
  const topbar = document.querySelector(".topbar");
  if (!topbar) return;
  const update = () => topbar.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", update, { passive: true });
  update();
})();
