/* รวมรอบ 8: เพิ่มข้อเก็ง 2569 ภาค ข (ความรู้เฉพาะตำแหน่ง) จาก p6_partb_predicted.json
   - core (ภาค ก) คงเดิมทั้งหมด
   - คลังเฉพาะทาง: คงเดิม + ผนวกข้อเก็งใหม่ (predicted:true) ลงในแต่ละ bank
   - คง flag predicted ของรายการเดิมไว้ด้วย (rerun ได้ปลอดภัย) */
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

const norm = (s) => String(s == null ? "" : s).replace(/\s+/g, " ").trim();
function validate(q) {
  if (!Array.isArray(q.choices) || q.choices.length !== 4) return "choices!=4";
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) return "answer";
  if (!norm(q.question)) return "q-empty";
  if (!norm(q.explanation)) return "exp-empty";
  if (new Set(q.choices.map(norm)).size !== 4) return "dup-choice";
  return null;
}
const issues = [];

/* ---- core (ภาค ก): คงเดิม re-id ---- */
const core = coreExisting.map((q, i) => {
  const item = { id: i + 1, subject: q.subject, topic: q.topic || "", year: q.year, question: q.question, choices: q.choices, answer: q.answer, explanation: q.explanation, freq: q.freq };
  if (q.passage && norm(q.passage)) item.passage = q.passage;
  if (q.predicted) item.predicted = true;
  return item;
});

/* ---- ข้อเก็งใหม่ ภาค ข ---- */
const newPred = JSON.parse(fs.readFileSync(path.join(bd, "p6_partb_predicted.json"), "utf8"));
const predByBank = {};
newPred.forEach((q) => { (predByBank[q.bank] = predByBank[q.bank] || []).push(q); });

/* ---- คลังเฉพาะทาง: เดิม + เก็งใหม่ ---- */
const SPECIAL_BANKS = {};
let gid = core.length, addedPred = 0;
const seenSp = new Set();
ORDER.forEach((bank) => {
  const list = [];
  (banksExisting[bank] || []).forEach((q) => {
    const item = { id: ++gid, bank: bank, subject: "special_" + bank, topic: q.topic || META[bank].short, question: q.question, choices: q.choices, answer: q.answer, explanation: q.explanation };
    if (q.freq != null) item.freq = q.freq;
    if (q.predicted) item.predicted = true;
    seenSp.add(norm(q.question));
    list.push(item);
  });
  (predByBank[bank] || []).forEach((q) => {
    const e = validate(q);
    if (e) { issues.push(bank + " " + e + ": " + norm(q.question).slice(0, 30)); return; }
    if (seenSp.has(norm(q.question))) { issues.push(bank + " ซ้ำ: " + norm(q.question).slice(0, 30)); return; }
    seenSp.add(norm(q.question));
    list.push({ id: ++gid, bank: bank, subject: "special_" + bank, topic: q.topic || META[bank].short, question: q.question, choices: q.choices, answer: q.answer, explanation: q.explanation, predicted: true });
    addedPred++;
  });
  SPECIAL_BANKS[bank] = list;
  META[bank].count = list.length;
});

const totalSpecial = ORDER.reduce((s, b) => s + SPECIAL_BANKS[b].length, 0);
const out = `/* ============================================================
   คลังข้อสอบสอบราชการไทย ครบ ภาค ก / ข / ค + ข้อเก็ง 2569 + อัตราการออก (freq)
   เขียนขึ้นใหม่ทั้งหมด (original) | ภาค ก ${core.length} + เฉพาะทาง ${totalSpecial} = ${core.length + totalSpecial} ข้อ
   สร้างอัตโนมัติจาก _batches/assemble8.js
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

const predCore = core.filter((q) => q.predicted).length;
const predSpecial = ORDER.reduce((s, b) => s + SPECIAL_BANKS[b].filter((q) => q.predicted).length, 0);
console.log("CORE:", core.length, "(เก็ง:", predCore + ")");
console.log("SPECIAL:", totalSpecial, "(เก็งใหม่ที่เพิ่ม:", addedPred, "| เก็งรวมในเฉพาะทาง:", predSpecial + ")");
console.log("GRAND TOTAL:", core.length + totalSpecial);
console.log("ISSUES (" + issues.length + "):", issues.length ? "\n" + issues.join("\n") : "ไม่มี");
