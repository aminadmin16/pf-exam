/* Service Worker — CACHE-FIRST
   เก็บไฟล์แอป + คลังข้อสอบไว้ในเครื่องของผู้ใช้ → โหลดครั้งแรกครั้งเดียว
   หลังจากนั้นเปิดเร็วทันใจ ใช้ได้ออฟไลน์ และแทบไม่ยิงโหลดจากเซิร์ฟเวอร์อีกเลย (host เบาสุด)
   *** อัปเดตเนื้อหา: เปลี่ยนเลขเวอร์ชัน CACHE ด้านล่าง แล้ว SW จะดึงของใหม่ให้รอบเดียว *** */
const CACHE = "kp-exam-v18";
const CORE = [
  "./", "./index.html", "./styles.css", "./app.js", "./questions.js",
  "./donate-config.js", "./study-notes.js", "./manifest.json",
  "./vendor/qrcode-generator.js", "./assets/donate-qr.png",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png"
];

// ติดตั้ง: ดึงทุกไฟล์มาเก็บในเครื่องทันที แล้วใช้งานเลย
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(CORE.map((u) => c.add(u).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

// เปิดใช้งาน: ลบแคชเวอร์ชันเก่าทิ้ง แล้วคุมทุกแท็บทันที
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ดึงข้อมูล: เอาจากแคชในเครื่องก่อนเสมอ (เร็ว + ไม่กวนเซิร์ฟเวอร์)
// ถ้ายังไม่มีในเครื่อง ค่อยโหลดจากเน็ตแล้วเก็บไว้ใช้ครั้งหน้า
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return; // ข้ามไฟล์ข้ามโดเมน (เช่นฟอนต์ CDN) ให้เบราว์เซอร์จัดการ
  if (url.pathname.endsWith(".apk")) return; // ไม่แคชไฟล์ติดตั้ง .apk (ใหญ่ + เป็นไฟล์ดาวน์โหลด)
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached; // มีในเครื่องแล้ว → เสิร์ฟทันที
      return fetch(e.request).then((resp) => {
        if (resp && resp.ok && resp.type === "basic") {
          const cp = resp.clone();
          caches.open(CACHE).then((c) => c.put(e.request, cp)).catch(() => {});
        }
        return resp;
      }).catch(() => (e.request.mode === "navigate" ? caches.match("./index.html") : undefined));
    })
  );
});
