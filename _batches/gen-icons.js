/* สร้างไอคอนแอป PNG (พื้นเขียวไล่เฉด + เครื่องหมายถูกขาว) — ไม่พึ่งไลบรารีภายนอก */
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

function crc32(buf) { let c = ~0; for (let i = 0; i < buf.length; i++) { c ^= buf[i]; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1)); } return (~c) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function png(w, h, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  const stride = w * 4; const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (stride + 1)] = 0; rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride); }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}
function makeIcon(size, maskable) {
  const buf = Buffer.alloc(size * size * 4);
  const g0 = [34, 197, 110], g1 = [21, 143, 75];
  const set = (x, y, r, g, b, a) => { if (x < 0 || y < 0 || x >= size || y >= size) return; const i = (y * size + x) * 4; buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = a; };
  const r = maskable ? 0 : Math.round(size * 0.20);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let inside = true;
    if (r > 0) { const cx = x < r ? r : (x > size - 1 - r ? size - 1 - r : x); const cy = y < r ? r : (y > size - 1 - r ? size - 1 - r : y); const dx = x - cx, dy = y - cy; if (dx * dx + dy * dy > r * r) inside = false; }
    if (inside) { const t = y / size; set(x, y, Math.round(g0[0] * (1 - t) + g1[0] * t), Math.round(g0[1] * (1 - t) + g1[1] * t), Math.round(g0[2] * (1 - t) + g1[2] * t), 255); }
    else set(x, y, 0, 0, 0, 0);
  }
  const thick = Math.max(2, Math.round(size * 0.075));
  const pts = [[size * 0.30, size * 0.53], [size * 0.44, size * 0.67], [size * 0.72, size * 0.35]];
  const line = (a, b) => { const steps = Math.round(Math.hypot(b[0] - a[0], b[1] - a[1])); for (let s = 0; s <= steps; s++) { const x = a[0] + (b[0] - a[0]) * s / steps, y = a[1] + (b[1] - a[1]) * s / steps; for (let oy = -thick; oy <= thick; oy++) for (let ox = -thick; ox <= thick; ox++) if (ox * ox + oy * oy <= thick * thick) set(Math.round(x + ox), Math.round(y + oy), 255, 255, 255, 255); } };
  line(pts[0], pts[1]); line(pts[1], pts[2]);
  return png(size, size, buf);
}
const out = path.join("D:/02_Personal_Projects/PF Examination", "icons");
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "icon-192.png"), makeIcon(192, false));
fs.writeFileSync(path.join(out, "icon-512.png"), makeIcon(512, false));
fs.writeFileSync(path.join(out, "icon-maskable-512.png"), makeIcon(512, true));
console.log("icons written:", fs.readdirSync(out).join(", "));
