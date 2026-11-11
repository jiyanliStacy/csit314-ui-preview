# UI and motion: what we used and why

Scope: presentation only. No new features; every link, form and field matches the original 34-user-story build.

## 1. Motion (small and calm)

One easing curve (`cubic-bezier(.22,.61,.36,1)`, ease-out with no overshoot) and short durations (0.15 to 0.6 s), so nothing bounces.

| Effect | Technique | File |
|---|---|---|
| Page fades in; hero text rises in one after another | CSS `@keyframes` + `animation-delay` | `motion.css` |
| Cards lift 3 px with a shadow on hover; photo zooms 4 % | CSS `transition` on `transform` / `box-shadow` | `motion.css` |
| Cards and sections fade up once when scrolled into view | `IntersectionObserver` adds class `in`; CSS does the fade | `motion.js` + `motion.css` |
| Buttons lift 1 px on hover; nav links get a growing underline | CSS `transition`, `::after` pseudo-element | `motion.css` |
| Top bar shadow after scrolling | `scroll` listener toggles a class | `motion.js` |
| Colour change on hover / focus for links and inputs | CSS `transition` (0.15 s) | `site.css` |

- Only `transform` and `opacity` are animated, which the browser can run smoothly on the GPU.
- No animation libraries and no animation loop.
- `prefers-reduced-motion: reduce` turns every animation and transition off (accessibility).

## 2. Layout and look

- **Design tokens**: colours, spacing, radius and shadows defined once as CSS variables (`:root` in `site.css`), so the whole site stays consistent.
- **Typography**: Fraunces (headings) + Inter (body) from Google Fonts.
- **Layout**: CSS Grid for card lists and the hero, Flexbox for the top bar and forms, `max-width` page wrapper, responsive breakpoints for phones.
- **Templates**: Jinja `base.html` (shared layout) and `_ui.html` macros (badge, project card, cover, avatar) so every page reuses the same components.
- **Real room photos**: Pexels photos stored locally, chosen by room keyword (kitchen, bedroom, bathroom, living); a drawn cover is the fallback if an image fails to load.
- **Cursor**: normal arrow and hand shapes as inline SVG data-URIs in the site colour.

## 3. Checks

- 304 automated tests pass; database file unchanged.
- A Playwright script compared links, forms and fields on 39 pages across all roles against the original: identical.

References: see `REFERENCES.md`.
