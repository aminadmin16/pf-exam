/* นำข้อสอบ ภาค ข ที่สร้าง (_partb.json) มาใส่แต่ละ bank ใน ../questions.js
   - assign id ต่อจาก global max, bank=bankId, subject="special_"+bankId
   - explanation เป็น content-based อยู่แล้ว (แอปสุ่มสลับตัวเลือก ไม่ต้องหมุน)
   node build-partb.js preview            -> _partb-preview.json (ไว้ตรวจ)
   node build-partb.js apply [dropIdsCsv] -> แทรกเข้าแต่ละ bank (ข้าม id ใน dropIds) */
const fs = require("fs");
const path = require("path");
const QPATH = path.join(__dirname, "..", "questions.js");
const banks = JSON.parse(fs.readFileSync(path.join(__dirname, "_partb.json"), "utf8"));

function currentMaxId() {
  const src = fs.readFileSync(QPATH, "utf8");
  let max = 0, m; const re = /"id":\s*(\d+)/g;
  while ((m = re.exec(src))) { const n = parseInt(m[1], 10); if (n > max) max = n; }
  return max;
}
function buildObjects(startId) {
  const out = {}; let id = startId;
  banks.forEach((b) => {
    out[b.bankId] = (b.questions || []).map((q) => ({
      id: id++, bank: b.bankId, subject: "special_" + b.bankId,
      topic: q.topic, question: q.question, choices: q.choices,
      answer: q.answer, explanation: q.explanation, freq: q.freq || 3,
    }));
  });
  return out;
}
function findBankArrayEnd(src, bankId) {
  const sbStart = src.indexOf("window.SPECIAL_BANKS");   // ค้นเฉพาะใน SPECIAL_BANKS (ไม่ใช่ META)
  if (sbStart < 0) return -1;
  let i = src.indexOf('"' + bankId + '":', sbStart); if (i < 0) return -1;
  i = src.indexOf("[", i); if (i < 0) return -1;
  let depth = 0, inStr = false, esc = false;
  for (let j = i; j < src.length; j++) {
    const c = src[j];
    if (inStr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true; else if (c === "[") depth++; else if (c === "]") { depth--; if (depth === 0) return j; }
  }
  return -1;
}

const mode = process.argv[2] || "preview";
const drop = new Set((process.argv[3] || "").split(",").filter(Boolean).map(Number));
const startId = currentMaxId() + 1;
const byBank = buildObjects(startId);

if (mode === "preview") {
  const flat = [];
  Object.values(byBank).forEach((arr) => arr.forEach((o) => flat.push(o)));
  fs.writeFileSync(path.join(__dirname, "_partb-preview.json"), JSON.stringify(flat, null, 1), "utf8");
  console.log("preview:", flat.length, "questions, ids", startId, "-", startId + flat.length - 1);
  Object.keys(byBank).forEach((b) => console.log("  " + b + ":", byBank[b].length));
} else if (mode === "apply") {
  let src = fs.readFileSync(QPATH, "utf8");
  let applied = 0, skipped = 0;
  Object.keys(byBank).forEach((bankId) => {
    const objs = byBank[bankId].filter((o) => !drop.has(o.id));
    skipped += byBank[bankId].length - objs.length;
    if (!objs.length) return;
    const end = findBankArrayEnd(src, bankId);
    if (end < 0) throw new Error("bank array not found: " + bankId);
    const head = src.slice(0, end);
    const lastBrace = head.lastIndexOf("}");
    const block = objs.map((o) => "    " + JSON.stringify(o)).join(",\n");
    src = src.slice(0, lastBrace + 1) + ",\n" + block + "\n  " + src.slice(end);
    applied += objs.length;
  });
  fs.writeFileSync(QPATH, src, "utf8");
  console.log("APPLIED", applied, "questions ·  skipped(drop):", skipped);
}
