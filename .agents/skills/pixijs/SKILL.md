---
name: pixijs
description: >-
  Guide and best practices for building interactive 2D Canvas/WebGL mini-games
  with PixiJS v8 in LumiKids. Use when creating or updating PixiJS-powered
  game tabs, sprites, graphics, tickers, and touch interactions.
---

# PixiJS v8 Skill for LumiKids

Use this skill when building or maintaining PixiJS-based educational mini-games in LumiKids.

## 1. Loading PixiJS
- LumiKids is a zero-build ES Module PWA. Load PixiJS v8 via CDN in `index.html` before `js/app.js`:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/pixi.js@8.6.6/dist/pixi.min.js"></script>
  ```
- Access the global namespace via `window.PIXI` inside ES modules.

## 2. Application Lifecycle (`mount` / `unmount`)
- Always initialize `PIXI.Application` asynchronously using `await app.init({ resizeTo: stageEl, backgroundAlpha: 0, antialias: true, resolution: Math.min(window.devicePixelRatio || 1, 2), autoDensity: true })`.
- Guard against race conditions if the user switches tabs while `app.init()` is still resolving (`isActive` flag).
- On `unmount()`:
  - Clear any spawn intervals/timers.
  - Stop `app.ticker` or destroy the `PIXI.Application` (`app.destroy(true, { children: true })`) and clear the stage DOM so WebGL contexts are never leaked across tab switches.

## 3. Responsive Layout & Resize Handling
- Pass `resizeTo: stageElement` to `app.init(...)`.
- Listen to `app.renderer.on('resize', (width, height) => ...)` to recompute lane positions, road geometry, and boundaries dynamically.

## 4. Toddler-Friendly Touch & Pointer Interaction
- Set `container.eventMode = 'static'` and `container.cursor = 'pointer'` on interactive game objects.
- Listen to `pointerdown` (not just `click`) for instant, zero-delay response on mobile touchscreens.
- Guard each interactive object with a `popped` / `handled` boolean so rapid multi-finger taps never double-score.
- Keep hit areas generous (`hitArea` or large container bounds) for toddler fingers.

## 5. Text Readability & Visual Polish
- Use `'Nunito', sans-serif` for `PIXI.Text` to match the Duolingo-inspired LumiKids UI.
- Never mirror/flip text containers (`scale.x = -1`) when flipping a vehicle or character sprite; only flip the artwork sub-container so English words always read left-to-right.
- Use `app.ticker` with `ticker.deltaMS` (frame-rate independent delta time) for smooth animations, particle bursts, and floating score indicators.
