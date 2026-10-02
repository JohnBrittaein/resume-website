// The previous version of this site registered a cache-first service worker
// at this URL. This replacement clears those caches and unregisters itself so
// returning visitors always get the current site. Safe to delete in a year or so.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) await caches.delete(key);
      await self.registration.unregister();
      for (const client of await self.clients.matchAll({ type: "window" })) client.navigate(client.url);
    })()
  );
});
