/* 供水学习平台 - Service Worker
 * 双缓存分层（发版后图片零重下）：
 *   APP_CACHE    = 版本资源（HTML/CSS/JS/数据/manifest），随版本号更新
 *   ASSETS_CACHE = 图标 + 运行时图片（images/*、icons/*、favicon），按图标内容指纹命名
 *                  → 发版只换 APP_CACHE，ASSETS_CACHE 保留，图片继续命中缓存不再下载
 *
 * 为什么图片能跨版本安全复用：图片文件名自带内容哈希（名称.哈希.jpg），
 * 内容变了文件名就变、URL 就变，缓存自然 miss 拿新图；内容没变则 URL 不变、命中缓存。
 */
const APP_CACHE = 'water-learn-v2.26.7';
// XXXXXXXX 由 release.sh 根据 favicon + icons 内容指纹注入；图标不变则此名不变
const ASSETS_CACHE = 'water-learn-assets-0e8c2d8b';

// 版本相关资源：随发版更新，必须进版本缓存
const APP_CORE = [
  './',
  './index.html',
  './manifest.json',
  './version.json',
  './static/app.a73abab08c.css',
  './static/app.aa67b093b6.js',
  './static/curriculum.ad941a8930.js',
  './static/materials.2c1c27dad0.js'
];

// 图标资源：进长期资产缓存（内容指纹命名）
const ASSET_CORE = [
  './favicon.png',
  './icons/icon-72.png',
  './icons/icon-96.png',
  './icons/icon-128.png',
  './icons/icon-144.png',
  './icons/icon-152.png',
  './icons/icon-192.png',
  './icons/icon-256.png',
  './icons/icon-384.png',
  './icons/icon-512.png',
  './icons/icon-192-maskable.png',
  './icons/icon-256-maskable.png',
  './icons/icon-512-maskable.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    Promise.all([
      caches.open(APP_CACHE).then((c) =>
        Promise.all(APP_CORE.map((u) => c.add(u).catch(() => {})))),
      caches.open(ASSETS_CACHE).then((c) =>
        Promise.all(ASSET_CORE.map((u) => c.add(u).catch(() => {}))))
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    // 只删除既不是当前版本缓存、也不是当前资产缓存的旧缓存。
    // 图标指纹不变 → ASSETS_CACHE 名不变 → 图片缓存跨版本存活（零重下）。
    caches.keys().then((keys) =>
      Promise.all(keys
        .filter((k) => k !== APP_CACHE && k !== ASSETS_CACHE)
        .map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // 版本探测：始终走网络、不写缓存。带 ?_=timestamp 的请求若入缓存会无限膨胀。
  if (url.pathname.endsWith('/version.json')) {
    e.respondWith(fetch(req).catch(() => caches.match('./version.json')));
    return;
  }

  // 图片/图标类资源 → 长期资产缓存；其余 → 版本缓存
  const isAsset = /\/(images|icons)\//.test(url.pathname) || url.pathname.endsWith('/favicon.png');
  const target = isAsset ? ASSETS_CACHE : APP_CACHE;

  // 导航请求：网络优先，失败回退缓存首页；仅成功的基础响应才写缓存，
  // 避免错误页/带凭据响应被固化为统一 key './index.html' 造成串号。
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(APP_CACHE).then((c) => c.put('./index.html', copy));
        }
        return res;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // 其余资源：缓存优先（全局匹配，跨缓存命中），未命中则网络获取并写入对应缓存
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(target).then((c) => c.put(req, copy));
      }
      return res;
    }))
  );
});
