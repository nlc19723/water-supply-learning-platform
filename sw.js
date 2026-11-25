/* 供水学习平台 - Service Worker
 * 双缓存分层（发版后图片零重下）：
 *   APP_CACHE    = 版本资源（HTML/CSS/JS/数据/manifest），随版本号更新
 *   ASSETS_CACHE = 图标 + 运行时图片（images/*、icons/*、favicon），按图标内容指纹命名
 *                  → 发版只换 APP_CACHE，ASSETS_CACHE 保留，图片继续命中缓存不再下载
 *
 * 为什么图片能跨版本安全复用：图片文件名自带内容哈希（名称.哈希.jpg），
 * 内容变了文件名就变、URL 就变，缓存自然 miss 拿新图；内容没变则 URL 不变、命中缓存。
 */
const APP_CACHE = 'water-learn-v2.26.44';
// XXXXXXXX 由 release.sh 根据 favicon + icons 内容指纹注入；图标不变则此名不变
const ASSETS_CACHE = 'water-learn-assets-0e8c2d8b';

// 版本相关资源：随发版更新，必须进版本缓存
const APP_CORE = [
  './',
  './index.html',
  './manifest.json',
  './version.json',
  './calc.html',
  './slang.html',
  './flange.html',
  './term.html',
  './static/app.a73abab08c.css',
  './static/app.ac63eea982.js',
  './static/curriculum.ad941a8930.js',
  './static/materials.1ff2e1adf0.js',
  './static/slang-data.js',
  './static/flange-data.js',
  './static/term-data.js'
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

// 全部材料/安装图片预缓存（内容哈希命名，安全进长期资产缓存，离线可用）
const IMAGE_CORE = [
  './images/AB胶（管道修补剂）.9f24729f5a.jpg',
  './images/NB-IoT智能水表.1aace0507f.jpg',
  './images/PE三通.59cfee7bf4.jpg',
  './images/PE内丝弯头.51ff8ac74e.jpg',
  './images/PE内丝直接.1387fd730e.jpg',
  './images/PE分水器.1681ab2499.jpg',
  './images/PE外丝弯头.472ab07aae.jpg',
  './images/PE外丝直接.379b8dad2c.jpg',
  './images/PE大小头（异径管）.accac5a6d2.jpg',
  './images/PE弯头.8dd5ac6b85.jpg',
  './images/PE法兰头片.5adf6276c4.jpg',
  './images/PE直接.641238a8c7.jpg',
  './images/PE管帽（堵头）.38f80b7af3.jpg',
  './images/PE给水管.72ec71b30d.jpg',
  './images/PPR三通.a4dd73fc52.jpg',
  './images/PPR内丝直接.19871c1415.jpg',
  './images/PPR外丝直接.7968cccfaf.jpg',
  './images/PPR异径管（大小头）.516c58b7d4.jpg',
  './images/PPR弯头.e630b75578.jpg',
  './images/PPR法兰（法兰转换）.1270da7797.jpg',
  './images/PPR活接头（内丝外丝直接）.2cb6700325.jpg',
  './images/PPR直接.e55014e321.jpg',
  './images/PPR管帽（堵头）.327998afd1.jpg',
  './images/PPR给水管.3bb0c28e6f.jpg',
  './images/gallery/PE管道带压开孔分支安装.b3f019334a.png',
  './images/gallery/PE管道带压开孔分支安装.b3f019334a.thumb.jpg',
  './images/gallery/室外地上式消火栓安装总成.489bba585f.png',
  './images/gallery/室外地上式消火栓安装总成.489bba585f.thumb.jpg',
  './images/gallery/室外水表井安装总成.5294bb762c.png',
  './images/gallery/室外水表井安装总成.5294bb762c.thumb.jpg',
  './images/gallery/水表井立管自动排气阀组.4f003489e2.png',
  './images/gallery/水表井立管自动排气阀组.4f003489e2.thumb.jpg',
  './images/gallery/水表组安装总成.4e2f200319.png',
  './images/gallery/水表组安装总成.4e2f200319.thumb.jpg',
  './images/三盘三通.4c4d1e83bf.jpg',
  './images/不锈钢户表控制箱.165313fab7.jpg',
  './images/中线（软密封）蝶阀.810adfde95.jpg',
  './images/低阻力倒流防止器.14c77efbfe.jpg',
  './images/偏心蝶阀.8dbe56af89.jpg',
  './images/先导式减压阀.b5c97e7399.jpg',
  './images/光电直读远传水表.c5d0ebe720.jpg',
  './images/六角头螺栓（半丝全丝）.fb498e3d65.jpg',
  './images/减压型倒流防止器.6954998f1c.jpg',
  './images/加密闸阀.b343f7ea5b.jpg',
  './images/升降式止回阀.d45258ad45.jpg',
  './images/压力表.f49edada07.jpg',
  './images/压力表弯（缓冲弯冷凝弯）.6753e71609.jpg',
  './images/双承短管.1980ec6162.jpg',
  './images/双止回阀型倒流防止器.693e062ec8.jpg',
  './images/双盘异径管（渐缩管）.93ef1e315b.jpg',
  './images/双盘弯头.062d961230.jpg',
  './images/双盘短管.4935cfbd2b.jpg',
  './images/可曲挠式橡胶接头.8c60aa06cb.jpg',
  './images/哈夫节（堵漏器）.60e0513c61.jpg',
  './images/地上式消火栓.05c142f897.jpg',
  './images/地下式消火栓.600ad317a5.jpg',
  './images/复合井盖（给水消防）.5fd53dfd49.jpg',
  './images/复合式排气阀.c2d1338235.jpg',
  './images/多功能法兰连接器（防脱法兰伸缩法兰接头）.409335a263.jpg',
  './images/对夹碟式止回阀.3c2a03b545.jpg',
  './images/小口径黄铜自动排气阀.670a3e55c8.jpg',
  './images/弹性座封闸阀（明杆式）.d14a993466.jpg',
  './images/弹性座封闸阀（暗杆式）.30ad4ef859.jpg',
  './images/微量排气阀（黄铜自动排气阀）.c17aa88ae7.jpg',
  './images/快速排气阀（高速排气阀）.e16c70aa24.jpg',
  './images/承插三通.384845583f.jpg',
  './images/承插异径管（渐缩管）.db93f06110.jpg',
  './images/承插弯头.4cbfc8acdc.jpg',
  './images/承插盘三通.b7e6f279c1.jpg',
  './images/插入式超声波流量计.91e5bb0ff4.jpg',
  './images/旋启式止回阀（金属瓣橡胶瓣）.948a723bdf.jpg',
  './images/旋翼式机械水表（湿式干式液封）.5d6e24b061.jpg',
  './images/水平螺翼机械水表.877361423c.jpg',
  './images/沟槽三通.dd5f18d9d3.jpg',
  './images/沟槽卡箍（刚性柔性）.c325f6f9a9.jpg',
  './images/沟槽异径管（大小头）.838e830ff7.jpg',
  './images/沟槽弯头.d517a8331c.jpg',
  './images/沟槽法兰.10a1158d8a.jpg',
  './images/法兰Y型过滤器.9fe573ba02.jpg',
  './images/浮动球阀.d81b5b0665.jpg',
  './images/球墨盲板（法兰盲板）.973949a6b3.jpg',
  './images/球墨铸铁井盖（给水消防）.7406c309ce.jpg',
  './images/球墨铸铁伸缩节（限位型传力型）.ea7f412511.jpg',
  './images/球墨铸铁管.89f182a9d3.jpg',
  './images/生料带（聚四氟乙烯密封带）.7e5a5184d7.jpg',
  './images/电动蝶阀.668742b5c5.jpg',
  './images/电磁流量计.6c83aafbd4.jpg',
  './images/盘承短管.701c26b42b.jpg',
  './images/盘插短管.8a5442f394.jpg',
  './images/直动式减压阀.387e8206ac.jpg',
  './images/直缝焊接钢管.37b123dab9.jpg',
  './images/胶圈（球墨管承插密封圈）.85db26bae8.jpg',
  './images/胶垫（法兰橡胶垫片）.9df1061590.jpg',
  './images/螺旋缝焊接钢管.999abae3d2.jpg',
  './images/螺纹Y型过滤器.b63962b9b8.jpg',
  './images/衬塑丝接三通.52a57e5a46.jpg',
  './images/衬塑丝接异径管（大小头）.eaf27a5ebb.jpg',
  './images/衬塑丝接弯头.ab3b17fd5b.jpg',
  './images/衬塑内外丝补芯（变径补芯）.8d68e24c08.jpg',
  './images/衬塑双内丝直接.d0e2675cbd.jpg',
  './images/衬塑双外丝直接.2f5c8b076c.jpg',
  './images/衬塑堵头.af0d327339.jpg',
  './images/衬塑复合管.3720389654.jpg',
  './images/衬塑活接头.1b48d7e192.jpg',
  './images/超声波水表.23fc5cea73.jpg',
  './images/轴向型波纹管补偿器.02aeb986b5.jpg',
  './images/钢异径管（同心偏心）.1e6b198f44.jpg',
  './images/钢法兰盲板.d8b9ce4dd7.jpg',
  './images/钢法兰（平焊对焊）.eef8817377.jpg',
  './images/钢焊接三通.1a5825dcfb.jpg',
  './images/钢焊接弯头.a59c2ce563.jpg',
  './images/镁合金牺牲阳极.bf0aeadca8.jpg',
  './images/静音式（缓闭）止回阀.af7b265102.jpg',
  './images/鞍型管件（马鞍三通）.7ce83e498d.jpg',
  './images/黄铜内螺纹浮动球阀.6606a55ccd.jpg',
  './images/黄铜加密闸阀.53d9c8a50b.jpg',
  './images/黄铜立式卧式止回阀.8f6c1d8a92.jpg',
  './images/黄铜闸阀.56c6806ee1.jpg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    Promise.all([
      caches.open(APP_CACHE).then((c) =>
        Promise.all(APP_CORE.map((u) => c.add(u).catch(() => {})))),
      caches.open(ASSETS_CACHE).then(async (c) => {
        const all = ASSET_CORE.concat(IMAGE_CORE);
        await Promise.all(all.map(async (u) => {
          try {
            const req = new Request(u);
            if (!(await c.match(req))) await c.add(req);  // 已缓存跳过，发版零重下
          } catch (e) {}
        }));
      })
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
