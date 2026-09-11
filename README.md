# Klik Tech — PWA build

A trimmed-down, installable version of the Klik Tech desktop app, containing
**Monitor** (infrastructure status) and **Sequencer** (lightshow cues).

It's the exact same HTML/CSS/JS the desktop app uses (pulled straight from
the `.app` bundle) — nothing was rewritten. It logs into `api.klik.co` the
same way, over HTTPS, with your normal credentials.

## ⚠️ Do this first: check CORS

The desktop app ran inside a native WKWebView, which doesn't enforce the
same cross-origin rules a normal Safari tab does. Once this is hosted as a
plain website, your browser *will* enforce them. This is the one thing that
could stop the whole plan, so test it before doing anything else — it takes
two minutes.

1. Open Safari (desktop or iPad), go to any page on `github.io` (any page,
   doesn't need to be this one).
2. Open the JS console (or on iPad, use desktop Safari's Web Inspector
   connected to it) and run:

   ```js
   fetch('https://api.klik.co/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ client_id: 'zonetuner', grant_type: 'password',
       username: 'email:test@example.com', password: 'wrong-on-purpose' })
   }).then(r => console.log('status', r.status)).catch(e => console.log('BLOCKED', e));
   ```

3. **If you get a `status` printed (401/403/whatever)** — CORS is fine, the
   request reached the server and got a real HTTP response. You're good to
   deploy as-is.
4. **If you get `BLOCKED` / a `TypeError: Failed to fetch` / a CORS error
   in the console** — the API is rejecting the browser's cross-origin
   request outright. You'll need a small passthrough proxy (e.g. a
   Cloudflare Worker or Netlify function) that forwards requests to
   `api.klik.co` and adds `Access-Control-Allow-Origin` headers, then point
   `klik_api.js`'s `environments.prod.api` at that proxy instead. Ask me
   and I'll build that if you hit this.

## Deploy to GitHub Pages

1. Create a new GitHub repo (public or private — Pages works either way on
   a paid plan; public repos get it free).
2. Push the contents of this folder to the repo root:

   ```
   git init
   git add .
   git commit -m "Klik Tech PWA"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```

3. In the repo: **Settings → Pages → Source → Deploy from a branch →
   `main` / root**. Save.
4. Your app will be live at `https://<you>.github.io/<repo>/` within a
   minute or two.

## Add to Home Screen on iPad

1. Open the GitHub Pages URL in **Safari** (must be Safari, not Chrome —
   only Safari can install to the home screen on iPadOS).
2. Log in once so the session token is saved.
3. Tap the Share icon → **Add to Home Screen**.
4. Launch it from the home screen icon — it opens full-screen, no browser
   chrome, like a native app.

## What changed in this update

- **Credentials now survive wifi drops.** A network failure no longer wipes
  your stored login and forces a re-prompt — only a genuine bad-password
  response does that. A dropped connection shows a small "Offline — showing
  last known data" banner and reconnects automatically once back online.
- **Status bar fixed at the actual source.** The page was missing
  `viewport-fit=cover` in its viewport meta tag, which silently made every
  `env(safe-area-inset-top)` value resolve to zero — so the solid black
  patch from the last update existed but had no height. Fixed in
  `klik_app.js` itself, so it's correct on every page automatically.
- **Faster loading.** The service worker now precaches every JS/CSS file
  the app needs (~95 files) instead of a handful, so a second visit loads
  the whole app from the iPad's local storage rather than over the network.
- **Local data caching.** Event data (infrastructure, tags, etc.) is cached
  per-namespace to `localStorage`. On load, the last known data paints
  instantly while the real fetch happens underneath — the fresh result
  always overwrites it the moment it arrives, so you're never looking at
  stale data pretending to be current, just not a blank screen while
  waiting.
- **New: Map.** A third page, reusing the original app's Manager tool —
  which already has a real, working pinch-to-zoom canvas map with live
  tags and hubs. It's locked to **view-only**: every write method in
  `klik_api.js` (`set`/`add`/`delete`/pairing) checks a `KLIK_READ_ONLY`
  flag set at the top of `map.html` and refuses to contact the server if
  it's on — regardless of what button or drag gesture tries to trigger it.
  If something in the UI attempts a change, a small toast says so instead
  of silently doing nothing. I haven't been able to visually test this
  page (no browser available in my build environment) — if dragging a
  device visually appears to move it even though nothing saves, that's a
  cosmetic side-effect worth telling me about, not a data-safety issue.

## What changed in this update

- **Header icons no longer clipped.** Root cause: the toolbar sat at the
  very top edge (`top: 0`), and the status-bar patch from the last update
  — now correctly sized — was rendering on top of it at a higher layer,
  covering the top portion of the toolbar's icons. The toolbar now starts
  below the safe area instead of behind the patch, and page content shifts
  down to match.
- **Pinch-to-zoom fixed at the actual root cause.** This is 2019-era code
  that decides whether to listen for touch or mouse input by checking if
  the browser's ID string contains "iPad". Apple changed iPadOS Safari's
  default identification to look like desktop Mac Safari back in iOS 13,
  so that check has been silently failing on every modern iPad — the app's
  touch handlers (including pinch) were simply never being attached; mouse
  listeners were attached instead. Fixed with the standard modern check
  (Mac-reporting platform + actual touch support = a real iPad).
- **Map no longer starts fully zoomed in.** All of an event's maps live on
  one shared canvas, positioned side by side — the "only shows one map,
  can't switch" symptom was really the same touch bug: you were zoomed to
  100% on a corner of map #1 with no way to pinch out and pan to the
  others. With pinch/pan working again, the initial view now also
  calculates a proper fit-to-screen zoom instead of jumping straight to
  100% scale, so the first map you land on is visible in full immediately.
- **Load time:** the Map page is inherently the heaviest of the three (it's
  the original app's full canvas engine, ~6,200 lines plus ~13 extra
  support files) — I've made sure all of those extra files are in the
  service worker's precache list too, so a second visit should be
  meaningfully faster. First-visit load time is bounded by how many files
  have to come over the network at all, which I can't reduce further
  without trimming the engine itself.

## Cache versioning — important for future updates

Because the app shell is now cached aggressively for speed, any future
change to files in `lib/` or `app/` won't show up on the iPad until the
version string at the top of `sw.js` is bumped:

```js
const CACHE_NAME = 'klik-tech-shell-v4';
```

Bump the number, redeploy, and reload once on the iPad to pick it up. I'll
handle this automatically whenever I make further changes.

## Notes

- **Login persists** across Monitor and Sequencer via browser storage on the
  same origin — you won't have to log in on each one.
- You'll see a harmless failed connection attempt in the console to
  `ws://127.0.0.1:9000` on load — that's leftover code from the old
  desktop/local-hub setup, trying to reach a local Bluetooth bridge that
  doesn't exist in a browser context. It fails silently and doesn't affect
  anything; the actual infrastructure data comes from the `api.klik.co`
  REST API, not this socket.
- If you later want the manager/explorer or access-control pages too, they
  live in the original zip under `Klik Tech/Contents/Resources/html/app/klik/`
  — copy them into `app/klik/` here the same way these were, and add a
  module tile for them in `index.html` (copy one of the existing
  `<a class="module ...">` blocks and give it its own accent color).
- Icons were generated from the app's own `AppIcon.icns`.
