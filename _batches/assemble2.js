/* รวมรอบ 2: เพิ่มข้อสอบเก็ง 2569 (predicted) + คลังกฎหมายเฉพาะทาง (SPECIAL_BANKS)
   เขียน questions.js ใหม่ทั้งหมด (คงของเดิม 240 + เพิ่มใหม่) */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const dir = "D:/02_Personal_Projects/PF Examination";
const batchDir = path.join(dir, "_batches");
const ALLOWED_YEARS = [2565, 2566, 2567, 2568, 2569];

/* ---- 1) โหลดของเดิมจาก questions.js (240 ข้อ) ---- */
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(dir, "questions.js"), "utf8"), sandbox);
const existing = (sandbox.window.QUESTIONS || []).map((q) => ({ ...q }));

const norm = (s) => String(s == null ? "" : s).replace(/\s+/g, " ").trim();

/* ตัวช่วยตรวจสอบ 1 ข้อ (โหมด core ต้องมี subject / โหมด special ต้องมี bank) */
function validate(q, mode) {
  if (!Array.isArray(q.choices) || q.choices.length !== 4) return "ตัวเลือกไม่ครบ 4";
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) return "answer ไม่ถูก";
  if (!norm(q.question)) return "โจทย์ว่าง";
  if (!norm(q.explanation)) return "เฉลยว่าง";
  if (new Set(q.choices.map(norm)).size !== 4) return "ตัวเลือกซ้ำกันในข้อ";
  if (mode === "core" && !["analytical", "english", "ethics"].includes(q.subject)) return "subject ไม่ถูก";
  return null;
}

/* ---- 2) โหลดข้อสอบเก็ง (predicted) แล้วรวมกับของเดิม ---- */
const predictedFiles = ["p1_analytical.json", "p2_ethics_english.json"];
let predicted = [];
predictedFiles.forEach((f) => {
  const arr = JSON.parse(fs.readFileSync(path.join(batchDir, f), "utf8"));
  arr.forEach((q) => { q.predicted = true; if (!ALLOWED_YEARS.includes(parseInt(q.year))) q.year = 2569; });
  predicted = predicted.concat(arr);
});

const coreAll = existing.concat(predicted);
const seen = new Set();
const core = [];
const issues = [];
coreAll.forEach((q) => {
  const err = validate(q, "core");
  if (err) { issues.push("CORE " + err + ": " + norm(q.question).slice(0, 40)); return; }
  const key = q.subject + "|" + norm(q.question) + "|" + q.choices.map(norm).join("~");
  if (seen.has(key)) { issues.push("CORE ซ้ำ: " + norm(q.question).slice(0, 40)); return; }
  seen.add(key);
  let y = parseInt(q.year, 10);
  if (!ALLOWED_YEARS.includes(y)) y = 2566;
  const item = {
    id: 0, subject: q.subject, topic: q.topic || "", year: y,
    question: q.question, choices: q.choices, answer: q.answer, explanation: q.explanation
  };
  if (q.passage && norm(q.passage)) item.passage = q.passage;
  if (q.predicted) item.predicted = true;
  core.push(item);
});
core.forEach((q, i) => { q.id = i + 1; });

/* ---- 3) โหลดคลังกฎหมายเฉพาะทาง (SPECIAL_BANKS) ---- */
const SPECIAL_META = {
  constitution: { name: "รัฐธรรมนูญแห่งราชอาณาจักรไทย พ.ศ. 2560", short: "รัฐธรรมนูญ 2560", icon: "🏛️" },
  civilservant: { name: "พ.ร.บ. ระเบียบข้าราชการพลเรือน พ.ศ. 2551", short: "ข้าราชการพลเรือน 2551", icon: "👔" },
  govemployee:  { name: "ระเบียบสำนักนายกฯ ว่าด้วยพนักงานราชการ พ.ศ. 2547", short: "พนักงานราชการ 2547", icon: "🧑‍💼" },
  info:         { name: "พ.ร.บ. ข้อมูลข่าวสารของราชการ พ.ศ. 2540", short: "ข้อมูลข่าวสารฯ 2540", icon: "📂" },
  pdpa:         { name: "พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA) พ.ศ. 2562", short: "PDPA 2562", icon: "🔒" },
  procurement:  { name: "พ.ร.บ. การจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. 2560", short: "จัดซื้อจัดจ้าง 2560", icon: "🧾" }
};
const SPECIAL_ORDER = ["constitution", "civilservant", "govemployee", "info", "pdpa", "procurement"];
const specialFiles = {
  constitution: "s_constitution.json", civilservant: "s_civilservant.json",
  govemployee: "s_govemployee.json", info: "s_info.json",
  pdpa: "s_pdpa.json", procurement: "s_procurement.json"
};

const SPECIAL_BANKS = {};
let gid = core.length;
SPECIAL_ORDER.forEach((bank) => {
  const arr = JSON.parse(fs.readFileSync(path.join(batchDir, specialFiles[bank]), "utf8"));
  const localSeen = new Set();
  const list = [];
  arr.forEach((q) => {
    const err = validate(q, "special");
    if (err) { issues.push(bank + " " + err + ": " + norm(q.question).slice(0, 40)); return; }
    const key = norm(q.question) + "|" + q.choices.map(norm).join("~");
    if (localSeen.has(key)) { issues.push(bank + " ซ้ำ: " + norm(q.question).slice(0, 40)); return; }
    localSeen.add(key);
    list.push({
      id: ++gid, bank: bank, subject: "special_" + bank, topic: q.topic || SPECIAL_META[bank].short,
      question: q.question, choices: q.choices, answer: q.answer, explanation: q.explanation
    });
  });
  SPECIAL_BANKS[bank] = list;
  SPECIAL_META[bank].count = list.length;
});

/* ---- 4) เขียน questions.js ใหม่ ---- */
const totalSpecial = SPECIAL_ORDER.reduce((s, b) => s + SPECIAL_BANKS[b].length, 0);
const out = `/* ============================================================
   คลังข้อสอบ (แนวข้อสอบ ก.พ. ภาค ก + ข้อสอบเก็ง 2569 + คลังกฎหมายเฉพาะทาง)
   เขียนขึ้นใหม่ทั้งหมด (original) ไม่ได้คัดลอกข้อสอบจริง
   core ${core.length} ข้อ (รวมเก็ง 2569) + เฉพาะทาง ${totalSpecial} ข้อ = ${core.length + totalSpecial} ข้อ
   สร้างอัตโนมัติจาก _batches/assemble2.js
   ============================================================ */

window.SUBJECTS = {
  analytical: { key: "analytical", no: 1, name: "วิชาความสามารถในการคิดวิเคราะห์", fullScore: 100, passPercent: { undergrad: 60, master: 65 }, color: "#1eaf5d" },
  ethics:     { key: "ethics",     no: 2, name: "วิชาความรู้และลักษณะการเป็นข้าราชการที่ดี", fullScore: 50, passPercent: { undergrad: 60, master: 60 }, color: "#2f80ed" },
  english:    { key: "english",    no: 3, name: "วิชาภาษาอังกฤษ", fullScore: 50, passPercent: { undergrad: 50, master: 50 }, color: "#eb5757" }
};
window.SUBJECT_ORDER = ["analytical", "ethics", "english"];
window.EXAM_BLUEPRINT = { analytical: 50, english: 25, ethics: 25 };

/* คลังกฎหมายเฉพาะทาง (สำหรับสอบตามตำแหน่ง/พนักงานราชการ) */
window.SPECIAL_BANK_META = ${JSON.stringify(SPECIAL_META, null, 2)};
window.SPECIAL_BANK_ORDER = ${JSON.stringify(SPECIAL_ORDER)};

window.QUESTIONS = ${JSON.stringify(core, null, 2)};

window.SPECIAL_BANKS = ${JSON.stringify(SPECIAL_BANKS, null, 2)};
`;
fs.writeFileSync(path.join(dir, "questions.js"), out, "utf8");

/* ---- 5) รายงาน ---- */
const bySub = {}, byYear = {}, pred = core.filter((q) => q.predicted).length;
core.forEach((q) => { bySub[q.subject] = (bySub[q.subject] || 0) + 1; byYear[q.year] = (byYear[q.year] || 0) + 1; });
console.log("CORE total:", core.length, "(predicted 2569:", pred + ")");
console.log("  bySubject:", JSON.stringify(bySub));
console.log("  byYear:", JSON.stringify(byYear));
console.log("SPECIAL banks:");
SPECIAL_ORDER.forEach((b) => console.log("  " + SPECIAL_BANKS[b].length + "\t" + b + " — " + SPECIAL_META[b].short));
console.log("SPECIAL total:", totalSpecial);
console.log("GRAND TOTAL:", core.length + totalSpecial);
console.log("ISSUES (" + issues.length + "):", issues.length ? "\n" + issues.join("\n") : "ไม่มี");
