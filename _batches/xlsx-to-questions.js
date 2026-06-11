/* อ่าน questions.xlsx → สร้าง questions.js (ใช้ตอน build/deploy)
   • แก้/เพิ่มข้อสอบใน questions.xlsx แล้วรันสคริปต์นี้ questions.js จะอัปเดตตาม
   • ถ้าไม่มีไฟล์ Excel หรืออ่านไม่ได้/ข้อมูลน้อยผิดปกติ → คง questions.js เดิมไว้ (กัน build พัง/ข้อมูลหาย)
   ใช้: node _batches/xlsx-to-questions.js   (หรือ npm run data) */
const fs = require("fs");
const path = require("path");
const dir = path.resolve(__dirname, "..");
const xlsxPath = path.join(dir, "questions.xlsx");
const outPath = path.join(dir, "questions.js");

if (!fs.existsSync(xlsxPath)) { console.log("ℹ️ ไม่พบ questions.xlsx — ใช้ questions.js เดิม"); process.exit(0); }
let XLSX, wb;
try { XLSX = require("xlsx"); wb = XLSX.readFile(xlsxPath); }
catch (e) { console.error("⚠️ อ่าน Excel ไม่ได้ — คง questions.js เดิม:", e.message); process.exit(0); }

const SUBJECTS = {
  analytical: { key: "analytical", no: 1, name: "วิชาความสามารถในการคิดวิเคราะห์", fullScore: 100, passPercent: { undergrad: 60, master: 65 }, color: "#1eaf5d" },
  ethics: { key: "ethics", no: 2, name: "วิชาความรู้และลักษณะการเป็นข้าราชการที่ดี", fullScore: 50, passPercent: { undergrad: 60, master: 60 }, color: "#2f80ed" },
  english: { key: "english", no: 3, name: "วิชาภาษาอังกฤษ", fullScore: 50, passPercent: { undergrad: 50, master: 50 }, color: "#eb5757" }
};
const SUBJECT_ORDER = ["analytical", "ethics", "english"];
const EXAM_BLUEPRINT = { analytical: 50, english: 25, ethics: 25 };
const FREQ_TOPIC = {
  "อนุกรมตัวเลข": 5, "เงื่อนไขสัญลักษณ์": 5, "การวิเคราะห์ข้อมูลจากตาราง": 4, "การวิเคราะห์ข้อมูล": 4,
  "อุปมาอุปไมย": 4, "เงื่อนไขภาษา": 4, "การสรุปเหตุผล": 4, "ตรรกศาสตร์": 4,
  "คณิตศาสตร์: ร้อยละ": 4, "คณิตศาสตร์: กำไร-ขาดทุน": 4, "คณิตศาสตร์: สมการ/โจทย์ปัญหา": 4,
  "ภาษาไทย: การจับใจความ": 5, "ภาษาไทย: การเรียงประโยค": 4, "ภาษาไทย: คำและสำนวน": 4,
  "Grammar & Structure": 5, "Reading Comprehension": 5, "Vocabulary & Expression": 4, "Conversation": 4
};
const FREQ_BANK = { constitution: 4, civilservant: 4, govemployee: 3, info: 3, pdpa: 4, procurement: 3, saraban: 3, finance: 3, strategy: 3, computer: 3, local: 3, education: 3 };

const norm = (s) => String(s == null ? "" : s).replace(/\s+/g, " ").trim();      // ใช้ทำ key/ตรวจซ้ำ (ยุบช่องว่างหมด)
const clean = (s) => String(s == null ? "" : s).replace(/\r\n?/g, "\n").trim();   // ใช้เก็บค่าจริง (คงบรรทัดใหม่ \n ไว้)
const rows = (name) => (wb.Sheets[name] ? XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: "" }) : []);
function parseAns(v) { const s = norm(v).toUpperCase(); if (/^[1-4]$/.test(s)) return +s - 1; const m = { A: 0, B: 1, C: 2, D: 3 }; return m[s] != null ? m[s] : NaN; }
function truthy(v) { return ["yes", "true", "1", "y", "ใช่"].indexOf(norm(v).toLowerCase()) !== -1; }
function checkRow(choices, ans, q, exp) {
  if (choices.some((c) => !c)) return "ตัวเลือกว่าง";
  if (new Set(choices).size !== 4) return "ตัวเลือกซ้ำกัน";
  if (!(ans >= 0 && ans <= 3)) return "ช่อง answer ต้องเป็น 1-4";
  if (!q) return "โจทย์ว่าง";
  if (!exp) return "เฉลย(อธิบาย)ว่าง";
  return null;
}
const issues = [];

/* ---- banks meta ---- */
const META = {}, ORDER = [];
rows("banks").forEach((r) => {
  const b = norm(r.bank); if (!b) return;
  META[b] = { name: norm(r.name) || b, short: norm(r.short) || b, icon: norm(r.icon) || "📘", part: norm(r.part) || "ข" };
  ORDER.push(b);
});

/* ---- core (ภาค ก) ---- */
const core = [], seenC = new Set();
rows("core").forEach((r, i) => {
  const choices = [r.choice1, r.choice2, r.choice3, r.choice4].map(clean);
  const ans = parseAns(r.answer), subject = norm(r.subject);
  const e = checkRow(choices, ans, clean(r.question), clean(r.explanation));
  if (e) { issues.push("core แถว " + (i + 2) + ": " + e); return; }
  if (SUBJECT_ORDER.indexOf(subject) === -1) { issues.push("core แถว " + (i + 2) + ": subject ไม่ถูก (" + subject + ")"); return; }
  const k = subject + "|" + norm(r.question) + "|" + norm(r.passage) + "|" + choices.map(norm).join("~");   // รวม passage — ข้อเงื่อนไขสัญลักษณ์ใช้โจทย์กลางเหมือนกันแต่เงื่อนไขต่างกันใน passage
  if (seenC.has(k)) { issues.push("core แถว " + (i + 2) + ": ซ้ำ"); return; }
  seenC.add(k);
  const item = { id: 0, subject, topic: norm(r.topic), year: parseInt(r.year, 10) || 2566, question: clean(r.question), choices, answer: ans, explanation: clean(r.explanation), freq: parseInt(r.freq, 10) || FREQ_TOPIC[norm(r.topic)] || 3 };
  if (clean(r.passage)) item.passage = clean(r.passage);
  if (truthy(r.predicted)) item.predicted = true;
  const hd = parseInt(r.hard, 10); if (hd >= 1) item.hard = hd;   // ชุดข้อสอบยาก (AI) — 1/2/3, ว่าง = ข้อปกติ
  core.push(item);
});
core.forEach((q, i) => { q.id = i + 1; });

/* ---- special (ภาค ข/ค) ---- */
const SPECIAL_BANKS = {}; ORDER.forEach((b) => { SPECIAL_BANKS[b] = []; });
let gid = core.length; const seenS = new Set();
rows("special").forEach((r, i) => {
  const bank = norm(r.bank);
  if (!META[bank]) { issues.push("special แถว " + (i + 2) + ": bank ไม่รู้จัก (" + bank + ")"); return; }
  const choices = [r.choice1, r.choice2, r.choice3, r.choice4].map(clean);
  const ans = parseAns(r.answer);
  const e = checkRow(choices, ans, clean(r.question), clean(r.explanation));
  if (e) { issues.push("special แถว " + (i + 2) + ": " + e); return; }
  const k = bank + "|" + norm(r.question);
  if (seenS.has(k)) { issues.push("special แถว " + (i + 2) + ": ซ้ำ"); return; }
  seenS.add(k);
  const item = { id: ++gid, bank, subject: "special_" + bank, topic: norm(r.topic) || META[bank].short, question: clean(r.question), choices, answer: ans, explanation: clean(r.explanation) };
  const fr = parseInt(r.freq, 10) || (META[bank].part === "ข" && !truthy(r.predicted) ? (FREQ_BANK[bank] || 3) : 0);
  if (fr) item.freq = fr;
  if (truthy(r.predicted)) item.predicted = true;
  SPECIAL_BANKS[bank].push(item);
});
ORDER.forEach((b) => { META[b].count = SPECIAL_BANKS[b].length; });

const totalSpecial = ORDER.reduce((s, b) => s + SPECIAL_BANKS[b].length, 0);

/* ---- เซฟตี้: ข้อมูลน้อยผิดปกติ = ไม่เขียนทับ (กันข้อมูลหายตอน deploy) ---- */
if (core.length < 50 || totalSpecial < 50 || ORDER.length < 3) {
  console.error("⚠️ ข้อมูลจาก Excel น้อยผิดปกติ (core=" + core.length + " special=" + totalSpecial + " banks=" + ORDER.length + ") — ไม่เขียนทับ questions.js เดิม");
  if (issues.length) console.error(issues.slice(0, 20).join("\n"));
  process.exit(0);
}

const out = `/* ============================================================
   คลังข้อสอบสอบราชการไทย ครบ ภาค ก / ข / ค
   *** สร้างอัตโนมัติจาก questions.xlsx โดย _batches/xlsx-to-questions.js — อย่าแก้ไฟล์นี้ตรง ๆ ***
   แก้ข้อสอบที่ questions.xlsx แล้วรัน  npm run data
   ภาค ก ${core.length} + เฉพาะทาง ${totalSpecial} = ${core.length + totalSpecial} ข้อ
   ============================================================ */

window.SUBJECTS = ${JSON.stringify(SUBJECTS, null, 2)};
window.SUBJECT_ORDER = ${JSON.stringify(SUBJECT_ORDER)};
window.EXAM_BLUEPRINT = ${JSON.stringify(EXAM_BLUEPRINT)};

window.SPECIAL_BANK_META = ${JSON.stringify(META, null, 2)};
window.SPECIAL_BANK_ORDER = ${JSON.stringify(ORDER)};

window.QUESTIONS = ${JSON.stringify(core, null, 2)};

window.SPECIAL_BANKS = ${JSON.stringify(SPECIAL_BANKS, null, 2)};
`;
fs.writeFileSync(outPath, out, "utf8");
console.log("✅ สร้าง questions.js จาก Excel:", core.length, "core +", totalSpecial, "special =", core.length + totalSpecial, "ข้อ");
console.log("ปัญหา (" + issues.length + "):", issues.length ? "\n" + issues.slice(0, 30).join("\n") : "ไม่มี");
