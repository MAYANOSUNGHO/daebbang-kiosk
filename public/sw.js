/* 홈 화면 앱을 인터넷 없이 열 수 있게 파일을 저장해 둡니다. 목록과 버전은 빌드할 때 채워집니다. */
const VERSION = "__SW_VERSION__";
const PRECACHE = "__SW_PRECACHE__";
const CACHE = `daebbang-kiosk-${VERSION}`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      if (Array.isArray(PRECACHE)) {
        const cache = await caches.open(CACHE);
        await Promise.all(
          PRECACHE.map((url) =>
            cache.add(new Request(url, { cache: "reload" })).catch(() => {
              /* 없는 파일은 건너뜁니다. */
            }),
          ),
        );
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  if (new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(CACHE);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cached = await caches.match(request);
          return cached || (await caches.match("./index.html")) || Response.error();
        }
      })(),
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      try {
        const fresh = await fetch(request);
        if (fresh.ok) {
          const cache = await caches.open(CACHE);
          cache.put(request, fresh.clone());
        }
        return fresh;
      } catch {
        return new Response("", { status: 504, statusText: "offline" });
      }
    })(),
  );
});
