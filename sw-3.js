const CACHE = "remesur-v10";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  // 新 SW 安装完立刻生效
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    // 删除旧缓存
    const keys = await caches.keys();
    await Promise.all(
      keys.map((k) => (k !== CACHE ? caches.delete(k) : null))
    );
    // 立即接管页面
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // HTML 页面优先从网络获取，防止旧首页被锁死
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // 其它资源走缓存
  event.respondWith(
    caches.match(req).then((r) => r || fetch(req))
  );
});
