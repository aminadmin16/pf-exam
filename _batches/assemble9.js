/* รวมรอบ 9: เพิ่มข้อสอบ ภาค ข — ท้องถิ่น (p7_local_a/b) + กระจายตามกฎหมาย (p7_partb)
   - core (ภาค ก) คงเดิมทั้งหมด
   - คลังเฉพาะทาง: คงเดิม + ผนวกข้อใหม่ลงแต่ละ bank ตาม field "bank"
   - validate + dedup (normalize question) กันซ้ำทั้งกับของเดิมและในชุดใหม่ */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const dir = "D:/02_Personal_Projects/PF Examination";
const bd = path.join(dir, "_batches");

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(dir, "questions.js"), "utf8"), sandbox);
const W = sandbox.window;
const coreExisting = (W.QUESTIONS || []).map((q) => ({ ...q }));
const banksExisting = W.SPECIAL_BANKS || {};
const META = W.SPECIAL_BANK_META;
const ORDER = W.SPECIAL_BANK_ORDER;
const FREQ_BANK = { constitution: 4, civilservant: 4, govemployee: 3, info: 3, pdpa: 4, procurement: 3, saraban: 3, finance: 3, strategy: 3, computer: 3, local: 3, education: 3 };

const norm = (s) => String(s == null ? "" : s).replace(/\s+/g, " ").trim();
function validate(q) {
  if (!Array.isArray(q.choices) || q.choices.length !== 4) return "choices!=4";
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) return "answer";
  if (!norm(q.question)) return "q-empty";
  if (!norm(q.explanation)) return "exp-empty";
  if (new Set(q.choices.map(norm)).size !== 4) return "dup-choice";
  if (!ORDER.includes(q.bank)) return "bank?";
  return null;
}
const issues = [];

/* ---- core: คงเดิม re-id ---- */
const core = coreExisting.map((q, i) => {
  const item = { id: i + 1, subject: q.subject, topic: q.topic || "", year: q.year, question: q.question, choices: q.choices, answer: q.answer, explanation: q.explanation, freq: q.freq };
  if (q.passage && norm(q.passage)) item.passage = q.passage;
  if (q.predicted) item.predicted = true;
  return item;
});

/* ---- ข้อใหม่ ภาค ข ---- */
let incoming = [];
["p7_local_a.json", "p7_local_b.json", "p7_partb.json"].forEach((f) => {
  JSON.parse(fs.readFileSync(path.join(bd, f), "utf8")).forEach((q) => incoming.push(q));
});
const byBankNew = {};
incoming.forEach((q) => { (byBankNew[q.bank] = byBankNew[q.bank] || []).push(q); });

/* ---- คลังเฉพาะทาง: เดิม + ใหม่ ---- */
const SPECIAL_BANKS = {};
let gid = core.length, addedNew = 0;
const seenSp = new Set();
ORDER.forEach((bank) => {
  const list = [];
  (banksExisting[bank] || []).forEach((q) => {
    const item = { id: ++gid, bank: bank, subject: "special_" + bank, topic: q.topic || META[bank].short, question: q.question, choices: q.choices, answer: q.answer, explanation: q.explanation };
    if (q.freq != null) item.freq = q.freq;
    if (q.predicted) item.predicted = true;
    seenSp.add(bank + "|" + norm(q.question));
    list.push(item);
  });
  (byBankNew[bank] || []).forEach((q) => {
    const e = validate(q);
    if (e) { issues.push(bank + " " + e + ": " + norm(q.question).slice(0, 30)); return; }
    const k = bank + "|" + norm(q.question);
    if (seenSp.has(k)) { issues.push(bank + " ซ้ำ: " + norm(q.question).slice(0, 30)); return; }
    seenSp.add(k);
    list.push({ id: ++gid, bank: bank, subject: "special_" + bank, topic: q.topic || META[bank].short, question: q.question, choices: q.choices, answer: q.answer, explanation: q.explanation, freq: FREQ_BANK[bank] || 3 });
    addedNew++;
  });
  SPECIAL_BANKS[bank] = list;
  META[bank].count = list.length;
});

const totalSpecial = ORDER.reduce((s, b) => s + SPECIAL_BANKS[b].length, 0);
const out = `/* ============================================================
   คลังข้อสอบสอบราชการไทย ครบ ภาค ก / ข / ค + ข้อเก็ง 2569 + อัตราการออก (freq)
   เขียนขึ้นใหม่ทั้งหมด (original) | ภาค ก ${core.length} + เฉพาะทาง ${totalSpecial} = ${core.length + totalSpecial} ข้อ
   สร้างอัตโนมัติจาก _batches/assemble9.js
   ============================================================ */

window.SUBJECTS = ${JSON.stringify(W.SUBJECTS, null, 2)};
window.SUBJECT_ORDER = ${JSON.stringify(W.SUBJECT_ORDER)};
window.EXAM_BLUEPRINT = ${JSON.stringify(W.EXAM_BLUEPRINT)};

window.SPECIAL_BANK_META = ${JSON.stringify(META, null, 2)};
window.SPECIAL_BANK_ORDER = ${JSON.stringify(ORDER)};

window.QUESTIONS = ${JSON.stringify(core, null, 2)};

window.SPECIAL_BANKS = ${JSON.stringify(SPECIAL_BANKS, null, 2)};
`;
fs.writeFileSync(path.join(dir, "questions.js"), out, "utf8");

console.log("CORE:", core.length);
console.log("SPECIAL:", totalSpecial, "(เพิ่มใหม่:", addedNew + ")");
console.log("  local:", SPECIAL_BANKS.local.length, "ข้อ");
console.log("GRAND TOTAL:", core.length + totalSpecial);
console.log("ISSUES (" + issues.length + "):", issues.length ? "\n" + issues.join("\n") : "ไม่มี");
