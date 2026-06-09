/* รวมและตรวจสอบข้อสอบจากทุก batch + ของเดิม → เขียน questions.js ใหม่ */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const dir = "D:/02_Personal_Projects/PF Examination";
const batchDir = path.join(dir, "_batches");
const YEARS = [2565, 2566, 2567, 2568];

/* ---- 1) โหลดของเดิมจาก questions.js ---- */
const qsrc = fs.readFileSync(path.join(dir, "questions.js"), "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(qsrc, sandbox);
const existing = (sandbox.window.QUESTIONS || []).map((q) => ({ ...q }));

/* ---- 2) โหลด batch ทั้งหมด ---- */
const files = [
  "a1_math.json", "a2_series_table.json", "a3_symbol_analogy_lang.json", "a4_thai.json",
  "e1_conv_vocab.json", "e2_grammar_reading.json", "l1_admin_govern.json", "l2_criminal_ethics.json"
];
let incoming = [];
const loadReport = [];
for (const f of files) {
  try {
    const arr = JSON.parse(fs.readFileSync(path.join(batchDir, f), "utf8"));
    loadReport.push(`${f}: ${arr.length}`);
    incoming = incoming.concat(arr);
  } catch (e) {
    loadReport.push(`${f}: PARSE ERROR -> ${e.message}`);
  }
}

/* ---- 3) ใส่ year ให้ของเดิมที่ยังไม่มี (กระจายปี) ---- */
existing.forEach((q, i) => { if (!q.year) q.year = YEARS[i % 4]; });

/* ---- 4) รวม: ของเดิมก่อน (เชื่อถือได้) แล้วตามด้วยของใหม่ ---- */
const all = existing.concat(incoming);

/* ---- 5) ตรวจสอบ + ตัดซ้ำ ---- */
const norm = (s) => String(s == null ? "" : s).replace(/\s+/g, " ").trim();
const seen = new Set();
const valid = [];
const issues = [];

for (const q of all) {
  const subj = q.subject;
  const qshort = norm(q.question).slice(0, 45);
  if (!["analytical", "english", "ethics"].includes(subj)) { issues.push("subject ไม่ถูก: " + qshort); continue; }
  if (!Array.isArray(q.choices) || q.choices.length !== 4) { issues.push("ตัวเลือกไม่ครบ 4: " + qshort); continue; }
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) { issues.push("answer ไม่ถูก: " + qshort); continue; }
  if (!norm(q.question)) { issues.push("โจทย์ว่าง"); continue; }
  if (!norm(q.explanation)) { issues.push("เฉลยว่าง: " + qshort); continue; }
  const choiceset = new Set(q.choices.map(norm));
  if (choiceset.size !== 4) { issues.push("ตัวเลือกซ้ำกันในข้อ: " + qshort); continue; }

  const key = subj + "|" + norm(q.question) + "|" + q.choices.map(norm).join("~");
  if (seen.has(key)) { issues.push("ข้อซ้ำ (ตัดออก): " + qshort); continue; }
  seen.add(key);

  let y = parseInt(q.year, 10);
  if (!YEARS.includes(y)) y = YEARS[valid.length % 4];

  const item = {
    id: 0,
    subject: subj,
    topic: q.topic || "",
    year: y,
    question: q.question,       // คงรูปแบบเดิม (ช่องว่าง/บรรทัด สำคัญต่ออนุกรม)
    choices: q.choices,
    answer: q.answer,
    explanation: q.explanation
  };
  if (q.passage && norm(q.passage)) item.passage = q.passage;
  valid.push(item);
}

/* ---- 6) กำหนด id ใหม่เรียงลำดับ ---- */
valid.forEach((q, i) => { q.id = i + 1; });

/* ---- 7) สรุปสถิติ ---- */
const bySubject = {}, byYear = {}, byTopic = {};
valid.forEach((q) => {
  bySubject[q.subject] = (bySubject[q.subject] || 0) + 1;
  byYear[q.year] = (byYear[q.year] || 0) + 1;
  byTopic[q.topic] = (byTopic[q.topic] || 0) + 1;
});

/* ---- 8) เขียน questions.js ใหม่ ---- */
const header = `/* ============================================================
   คลังข้อสอบ (แนวข้อสอบ ก.พ. ภาค ก) — เขียนขึ้นใหม่ในแนวข้อสอบจริง
   ปี 2565–2568 ครบทั้ง 3 วิชา | รวม ${valid.length} ข้อ
   * เป็นข้อสอบที่เรียบเรียงขึ้นใหม่ (original) ไม่ได้คัดลอกจากข้อสอบจริง
   * ไฟล์นี้สร้างอัตโนมัติจาก _batches/assemble.js
   ============================================================ */

window.SUBJECTS = {
  analytical: { key: "analytical", no: 1, name: "วิชาความสามารถในการคิดวิเคราะห์", fullScore: 100, passPercent: { undergrad: 60, master: 65 }, color: "#1eaf5d" },
  ethics:     { key: "ethics",     no: 2, name: "วิชาความรู้และลักษณะการเป็นข้าราชการที่ดี", fullScore: 50, passPercent: { undergrad: 60, master: 60 }, color: "#2f80ed" },
  english:    { key: "english",    no: 3, name: "วิชาภาษาอังกฤษ", fullScore: 50, passPercent: { undergrad: 50, master: 50 }, color: "#eb5757" }
};

/* ลำดับวิชาในหน้าสรุปผล (ตรงกับรายงานผลของ ก.พ.) */
window.SUBJECT_ORDER = ["analytical", "ethics", "english"];

/* จำนวนข้อต่อ 1 ชุดสอบเสมือนจริง (ตามโครงสร้างจริง รวม 100 ข้อ) */
window.EXAM_BLUEPRINT = { analytical: 50, english: 25, ethics: 25 };

window.QUESTIONS = ${JSON.stringify(valid, null, 2)};
`;

fs.writeFileSync(path.join(dir, "questions.js"), header, "utf8");

/* ---- 9) รายงานผล ---- */
console.log("=== LOAD ===");
console.log(loadReport.join("\n"));
console.log("\n=== TOTAL VALID:", valid.length, "===");
console.log("by subject:", JSON.stringify(bySubject));
console.log("by year:", JSON.stringify(byYear));
console.log("\n=== TOPICS ===");
Object.keys(byTopic).sort().forEach((t) => console.log(`  ${byTopic[t]}\t${t}`));
console.log("\n=== ISSUES (" + issues.length + ") ===");
console.log(issues.length ? issues.join("\n") : "ไม่มี");
