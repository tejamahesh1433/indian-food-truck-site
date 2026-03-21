/**
 * Indian Food Truck — Service Worker
 *
 * Caching strategy:
 *  - App shell (HTML pages): Network-first, fall back to cache, then /offline
 *  - Static assets (JS, CSS, fonts, images): Cache-first with 30-day TTL
 *  - API routes & admin pages: Network-only (always fresh, never cached)
 */

const CACHE_VERSION = "v2";
const STATIC_CACHE  = `ift-static-${CACHE_VERSION}`;
const PAGES_CACHE   = `ift-pages-${CACHE_VERSION}`;

/** Pages to pre-cache at install time (the "app shell") */
const PRECACHE_PAGES = ["/", "/menu", "/catering", "/offline"];

/** Static asset extensions that get cached indefinitely */
const STATIC_EXTENSIONS = /\.(js|css|woff2?|ttf|otf|eot|svg|png|jpg|jpeg|gif|webp|avif|ico)$/i;

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PAGES_CACHE).then((cache) =>
      cache.addAll(PRECACHE_PAGES).catch(() => {
        // Silently ignore pre-cache failures (e.g. page is dynamic and requires auth)
      })
    ).then(() => self.skipWaiting())
  );
});

// ── Activate — purge old caches ───────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== PAGES_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests; ignore cross-origin (analytics, Stripe, etc.)
  if (url.origin !== self.location.origin) return;

  // Never cache: API routes, admin panel, NextAuth, Stripe webhooks
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/truckadmin") ||
    url.pathname.startsWith("/_next/webpack-hmr")
  ) {
    return; // Let the browser handle it normally
  }

  // Static assets — Cache-first
  if (STATIC_EXTENSIONS.test(url.pathname) || url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // HTML pages — Network-first
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }
});

// ── Strategies ────────────────────────────────────────────────────────────────

/** Cache-first: return cached response immediately; fetch and update in background. */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Asset unavailable offline", { status: 503 });
  }
}

/**
 * Network-first: try the network; on failure serve from cache.
 * If nothing is cached, serve the /offline page.
 */
async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(PAGES_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Serve the offline fallback page
    const offline = await caches.match("/offline");
    return offline || new Response("<h1>You are offline</h1>", {
      headers: { "Content-Type": "text/html" },
      status: 503,
    });
  }
}
