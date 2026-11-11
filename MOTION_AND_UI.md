# UI and motion: what we used and why

Scope: presentation only. No new features; every link, form and field matches the original 34-user-story build.

## 1. Motion (3 things only)

| Effect | Technique | Where |
|---|---|---|
| Page fades in on load (0.25 s) | CSS `@keyframes` + `animation` on `main` | `motion.css` |
| Cards get a soft shadow on hover | CSS `transition` on `box-shadow` / `border-color` | `site.css`, `motion.css` |
| Top bar gets a thin shadow after scrolling | 8 lines of JavaScript toggling a class on `scroll` | `motion.js` |
| Buttons, links, inputs change colour on hover/focus | CSS `transition` (0.15 s) and `:hover` / `:focus` | `site.css` |

- No JavaScript animation libraries, no animation loop, nothing bounces, scales or follows the mouse.
- `prefers-reduced-motion: reduce` switches all animation and transitions off (accessibility).

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
