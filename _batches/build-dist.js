/* รวมไฟล์เว็บที่ใช้รันจริงไปไว้ใน dist/ (ใช้เป็น webDir ของ Capacitor)
   รันก่อน cap copy ทุกครั้งที่แก้ไฟล์เว็บ */
const fs = require("fs");
const path = require("path");

const src = path.resolve(__dirname, "..");
const dist = path.join(src, "dist");
const files = ["index.html", "styles.css", "app.js", "questions.js", "donate-config.js", "study-notes.js", "sw.js", "manifest.json"];
const dirs = ["vendor", "assets", "icons"];

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
files.forEach((f) => fs.copyFileSync(path.join(src, f), path.join(dist, f)));
dirs.forEach((d) => fs.cpSync(path.join(src, d), path.join(dist, d), { recursive: true }));
// หน้าดาวน์โหลด (landing) + ไฟล์ APK → ไปอยู่ที่ dist/landing/ สำหรับ deploy บนเว็บ
const landing = path.join(src, "landing");
if (fs.existsSync(landing)) fs.cpSync(landing, path.join(dist, "landing"), { recursive: true });
console.log("dist/ rebuilt:", files.length + dirs.length + (fs.existsSync(landing) ? 1 : 0), "items");
