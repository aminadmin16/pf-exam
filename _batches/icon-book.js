/* สร้างไอคอนแอปรูปหนังสือ (เปิดอยู่) พื้นเขียว — เรนเดอร์ SVG เป็น PNG ด้วย Playwright */
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const OUT = path.resolve(__dirname, "..", "icons");

function svg(size, rx) {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 512 512">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22c56e"/><stop offset="1" stop-color="#148a48"/></linearGradient></defs>' +
    '<rect width="512" height="512" rx="' + rx + '" fill="url(#g)"/>' +
    '<g fill="#ffffff">' +
    '<path d="M256 158 C 214 130 156 128 116 142 L 116 372 C 156 358 214 360 256 384 Z"/>' +
    '<path d="M256 158 C 298 130 356 128 396 142 L 396 372 C 356 358 298 360 256 384 Z"/>' +
    '</g>' +
    '<rect x="249" y="158" width="14" height="226" rx="7" fill="#bfe6cd"/>' +
    '<g stroke="#bfe6cd" stroke-width="9" stroke-linecap="round">' +
    '<line x1="150" y1="192" x2="232" y2="201"/><line x1="150" y1="228" x2="232" y2="237"/><line x1="150" y1="264" x2="232" y2="273"/>' +
    '<line x1="280" y1="201" x2="362" y2="192"/><line x1="280" y1="237" x2="362" y2="228"/><line x1="280" y1="273" x2="362" y2="264"/>' +
    '</g></svg>';
}

(async () => {
  const b = await chromium.launch();
  const targets = [["icon-192.png", 192, 110], ["icon-512.png", 512, 110], ["icon-maskable-512.png", 512, 0]];
  for (const t of targets) {
    const p = await b.newPage({ viewport: { width: t[1], height: t[1] } });
    await p.setContent('<!doctype html><html><head><style>*{margin:0;padding:0}html,body{width:' + t[1] + 'px;height:' + t[1] + 'px;overflow:hidden}</style></head><body>' + svg(t[1], t[2]) + '</body></html>');
    await p.screenshot({ path: path.join(OUT, t[0]), omitBackground: true });
    await p.close();
  }
  await b.close();
  console.log("book icons:", fs.readdirSync(OUT).filter((f) => f.endsWith(".png")).join(", "));
})().catch((e) => { console.error(e); process.exit(1); });
