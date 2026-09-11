// Klik Tech PWA — service worker.
//
// Two jobs:
// 1. Precache the app shell — including all ~90 of the JS/CSS modules the
//    app loads one-by-one on every boot — so repeat visits load from disk
//    instantly instead of re-fetching each file over the network.
// 2. Live infrastructure data (api.klik.co) is never cached here — that's
//    handled in klik_http_requests.js instead, which caches per-namespace
//    to localStorage and repaints instantly with the last known data while
//    always fetching and displaying the fresh result underneath.

const CACHE_NAME = 'klik-tech-shell-v5';

const SHELL_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './app/klik/infrastructure_monitor.html',
  './app/klik/lightshow_sequencer.html',
  './app/klik/map.html',
  './lib/klik_app.css',
  './lib/klik_app.js',
  './lib/klik_loading.js',
  './lib/jquery-1.12.4.min.js',
  './lib/jquery-ui-1.12.1.min.js',
  './lib/klik_module.js',
  './lib/klik_dmx_constants.js',
  './lib/klik_utils.js',
  './lib/klik_array.js',
  './lib/klik_agent.js',
  './lib/klik_api.js',
  './lib/klik_api_chatbot.js',
  './lib/klik_api_hub.js',
  './lib/klik_canvas.js',
  './lib/klik_colors.js',
  './lib/klik_coords.js',
  './lib/klik_controller.js',
  './lib/klik_controller_pro.js',
  './lib/klik_controller_ble.js',
  './lib/klik_controller_model_s.js',
  './lib/klik_counters.js',
  './lib/klik_csv.js',
  './lib/klik_data.js',
  './lib/klik_decoder_functions.js',
  './lib/klik_decoder.js',
  './lib/klik_device.js',
  './lib/klik_dimmer.js',
  './lib/klik_dmx.js',
  './lib/klik_dmx_interface.js',
  './lib/klik_dmx_monitor.js',
  './lib/klik_dmx_table.js',
  './lib/klik_dmx_editor.js',
  './lib/klik_generator.js',
  './lib/klik_highlight.js',
  './lib/klik_hit_tests.js',
  './lib/klik_http_requests.js',
  './lib/klik_hub.js',
  './lib/klik_icons.js',
  './lib/klik_interactions.js',
  './lib/klik_interactions_manager.js',
  './lib/klik_interface.js',
  './lib/klik_interfaces.js',
  './lib/klik_interval.js',
  './lib/klik_load.js',
  './lib/klik_log.js',
  './lib/klik_map.js',
  './lib/klik_map_constants.js',
  './lib/klik_map_drawing.js',
  './lib/klik_map_drawing_functions.js',
  './lib/klik_menus.js',
  './lib/klik_modal.js',
  './lib/klik_mouse.js',
  './lib/klik_node_editor.js',
  './lib/klik_parsers.js',
  './lib/klik_payloads.js',
  './lib/klik_protos.js',
  './lib/klik_priority.js',
  './lib/klik_queries.js',
  './lib/klik_rssi.js',
  './lib/klik_save.js',
  './lib/klik_send.js',
  './lib/klik_sequencer.js',
  './lib/klik_sorting.js',
  './lib/klik_storage.js',
  './lib/klik_sms_table.js',
  './lib/klik_sms_devices.js',
  './lib/klik_tags.js',
  './lib/klik_theme.js',
  './lib/klik_toolbar.js',
  './lib/klik_touch.js',
  './lib/klik_ui.js',
  './lib/klik_power.js',
  './lib/klik_websocket.js',
  './lib/klik_time.js',
  './lib/external/aes-js/index.js',
  './lib/external/colorpicker/color-picker.js',
  './lib/spectrum/spectrum.js',
  './lib/klik_xy_pad.js',
  './lib/klik_dmx_player.js',
  './lib/klik_dmx_universe.js',
  './lib/klik_dmx_fixture.js',
  './lib/klik_dmx_sliders.js',
  './lib/klik_dmx_preset.js',
  './lib/klik_pad_target.js',
  './lib/klik_rainbow_player.js',
  './lib/klik_wand.js',
  './lib/klik_calibration.js',
  './lib/klik_database.js',
  './lib/klik_models.js',
  './lib/klik_polygon.js',
  './lib/klik_rendering.js',
  './lib/klik_style_manager.css',
  './lib/klik_style_tagger.css',
  './lib/klik_style_toolbar.css',
  './lib/klik_style_img.css',
  './lib/klik_style_dmx.css',
  './lib/klik_style_wand.css',
  './lib/klik_modal.css',
  './lib/klik_node_editor.css',
  './lib/spectrum/spectrum.css',
  './lib/external/colorpicker/color-picker.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_FILES))
      .catch((err) => console.log('precache failed', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET requests on our own origin (the static app shell).
  // Everything else — API calls to api.klik.co, POSTs, auth, live data —
  // is left completely alone and goes straight to the network.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      // cache-first for the shell: instant load, and it's versioned by
      // CACHE_NAME so a new deploy (bump the version above) replaces it
      const fetchPromise = fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
