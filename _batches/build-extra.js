/* นำ _extra.json (อังกฤษ 40 + เลข 3) ใส่ window.QUESTIONS (Part A) — ข้อสอบฝึกทั่วไป (ไม่ผูกปี)
   node build-extra.js preview            -> _extra-preview.json
   node build-extra.js apply [dropIdsCsv] -> ต่อท้าย window.QUESTIONS */
const fs = require("fs");
const path = require("path");
const QPATH = path.join(__dirname, "..", "questions.js");
const items = require("./_extra.json");

function currentMaxId() {
  const src = fs.readFileSync(QPATH, "utf8");
  let max = 0, m; const re = /"id":\s*(\d+)/g;
  while ((m = re.exec(src))) { const n = parseInt(m[1], 10); if (n > max) max = n; }
  return max;
}
const startId = currentMaxId() + 1;
let id = startId;
const objs = items.map((q) => ({ id: id++, subject: q.subject, topic: q.topic, question: q.question, choices: q.choices, answer: q.answer, explanation: q.explanation, freq: q.freq || 4 }));

const mode = process.argv[2] || "preview";
const drop = new Set((process.argv[3] || "").split(",").filter(Boolean).map(Number));

if (mode === "preview") {
  fs.writeFileSync(path.join(__dirname, "_extra-preview.json"), JSON.stringify(objs, null, 1), "utf8");
  console.log("preview:", objs.length, "questions · ids", startId, "-", startId + objs.length - 1);
} else if (mode === "apply") {
  const keep = objs.filter((o) => !drop.has(o.id));
  let src = fs.readFileSync(QPATH, "utf8");
  const aIdx = src.indexOf("window.SPECIAL_BANKS");
  const closeIdx = src.lastIndexOf("];", aIdx);
  const head = src.slice(0, closeIdx);
  const lastBrace = head.lastIndexOf("}");
  const block = keep.map((o) => "  " + JSON.stringify(o)).join(",\n");
  src = src.slice(0, lastBrace + 1) + ",\n" + block + "\n" + src.slice(lastBrace + 1);
  fs.writeFileSync(QPATH, src, "utf8");
  console.log("APPLIED", keep.length, "· skipped(drop):", objs.length - keep.length, "· ids", startId, "-", startId + objs.length - 1);
}
