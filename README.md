# Klik Tech — PWA build

A trimmed-down, installable version of the Klik Tech desktop app, containing
just the infrastructure pages: **Monitor**, **Manager**, **Explorer**.

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

## Notes

- **Login persists** across the three pages (Monitor/Manager/Explorer) via
  browser storage on the same origin — you won't have to log in on each one.
- You'll see a harmless failed connection attempt in the console to
  `ws://127.0.0.1:9000` on load — that's leftover code from the old
  desktop/local-hub setup, trying to reach a local Bluetooth bridge that
  doesn't exist in a browser context. It fails silently and doesn't affect
  anything; the actual infrastructure data comes from the `api.klik.co`
  REST API, not this socket.
- If you later want the lightshow/sequencer or access-control pages too,
  they live in the original zip under
  `Klik Tech/Contents/Resources/html/app/klik/` — copy them into
  `app/klik/` here the same way these three were, and add a tile for them
  in `index.html`.
- Icons were generated from the app's own `AppIcon.icns`.
