/* รวมรอบ 3: เพิ่มคลัง ภาค ข (อีก 4 ฉบับ) + ภาค ค (SJT/สัมภาษณ์ 3 ชุด)
   คงของเดิม (core 276 + 6 bank เดิม) แล้วเพิ่มใหม่ + ใส่ field part ให้ทุก bank */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const dir = "D:/02_Personal_Projects/PF Examination";
const bd = path.join(dir, "_batches");

/* ---- โหลดของเดิมจาก questions.js ---- */
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(dir, "questions.js"), "utf8"), sandbox);
const core = (sandbox.window.QUESTIONS || []).map((q) => ({ ...q }));
const existingBanks = sandbox.window.SPECIAL_BANKS || {};

const norm = (s) => String(s == null ? "" : s).replace(/\s+/g, " ").trim();
function validate(q) {
  if (!Array.isArray(q.choices) || q.choices.length !== 4) return "choices!=4";
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) return "answer";
  if (!norm(q.question)) return "q-empty";
  if (!norm(q.explanation)) return "exp-empty";
  if (new Set(q.choices.map(norm)).size !== 4) return "dup-choice";
  return null;
}

/* ---- ข้อมูล bank ทั้งหมด (เดิม 6 = ภาค ข, ใหม่ 4 = ภาค ข, ใหม่ 3 = ภาค ค) ---- */
const META = {
  constitution: { name: "รัฐธรรมนูญแห่งราชอาณาจักรไทย พ.ศ. 2560", short: "รัฐธรรมนูญ 2560", icon: "🏛️", part: "ข" },
  civilservant: { name: "พ.ร.บ. ระเบียบข้าราชการพลเรือน พ.ศ. 2551", short: "ข้าราชการพลเรือน 2551", icon: "👔", part: "ข" },
  govemployee:  { name: "ระเบียบสำนักนายกฯ ว่าด้วยพนักงานราชการ พ.ศ. 2547", short: "พนักงานราชการ 2547", icon: "🧑‍💼", part: "ข" },
  info:         { name: "พ.ร.บ. ข้อมูลข่าวสารของราชการ พ.ศ. 2540", short: "ข้อมูลข่าวสารฯ 2540", icon: "📂", part: "ข" },
  pdpa:         { name: "พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA) พ.ศ. 2562", short: "PDPA 2562", icon: "🔒", part: "ข" },
  procurement:  { name: "พ.ร.บ. การจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. 2560", short: "จัดซื้อจัดจ้าง 2560", icon: "🧾", part: "ข" },
  saraban:      { name: "ระเบียบสำนักนายกฯ ว่าด้วยงานสารบรรณ พ.ศ. 2526", short: "งานสารบรรณ 2526", icon: "📑", part: "ข" },
  finance:      { name: "พ.ร.บ. วินัยการเงินการคลังของรัฐ พ.ศ. 2561", short: "วินัยการเงินการคลัง 2561", icon: "💰", part: "ข" },
  strategy:     { name: "ยุทธศาสตร์ชาติ 20 ปี และแผนระดับชาติ", short: "ยุทธศาสตร์ชาติ 20 ปี", icon: "🧭", part: "ข" },
  computer:     { name: "พ.ร.บ. ว่าด้วยการกระทำความผิดเกี่ยวกับคอมพิวเตอร์", short: "พ.ร.บ.คอมพิวเตอร์", icon: "💻", part: "ข" },
  sjt_service:   { name: "สถานการณ์: การบริการและการทำงานเป็นทีม (SJT)", short: "SJT บริการ/ทีมงาน", icon: "🤝", part: "ค" },
  sjt_integrity: { name: "สถานการณ์: ความซื่อสัตย์ จริยธรรม และการแก้ปัญหา (SJT)", short: "SJT จริยธรรม/แก้ปัญหา", icon: "⚖️", part: "ค" },
  interview:     { name: "เตรียมสอบสัมภาษณ์ (ภาค ค)", short: "เตรียมสัมภาษณ์", icon: "🎤", part: "ค" }
};
const ORDER = ["constitution", "civilservant", "govemployee", "info", "pdpa", "procurement",
  "saraban", "finance", "strategy", "computer", "sjt_service", "sjt_integrity", "interview"];
const newFiles = {
  saraban: "s_saraban.json", finance: "s_finance.json", strategy: "s_strategy.json", computer: "s_computer.json",
  sjt_service: "s_sjt_service.json", sjt_integrity: "s_sjt_integrity.json", interview: "s_interview.json"
};

const SPECIAL_BANKS = {};
const issues = [];
let gid = core.length;

ORDER.forEach((bank) => {
  let list = [];
  if (existingBanks[bank]) {
    existingBanks[bank].forEach((q) => {
      list.push({ id: ++gid, bank: bank, subject: "special_" + bank, topic: q.topic || META[bank].short, question: q.question, choices: q.choices, answer: q.answer, explanation: q.explanation });
    });
  } else if (newFiles[bank]) {
    const arr = JSON.parse(fs.readFileSync(path.join(bd, newFiles[bank]), "utf8"));
    const seen = new Set();
    arr.forEach((q) => {
      const e = validate(q);
      if (e) { issues.push(bank + " " + e + ": " + norm(q.question).slice(0, 40)); return; }
      const k = norm(q.question) + "|" + q.choices.map(norm).join("~");
      if (seen.has(k)) { issues.push(bank + " ซ้ำ: " + norm(q.question).slice(0, 40)); return; }
      seen.add(k);
      list.push({ id: ++gid, bank: bank, subject: "special_" + bank, topic: q.topic || META[bank].short, question: q.question, choices: q.choices, answer: q.answer, explanation: q.explanation });
    });
  }
  SPECIAL_BANKS[bank] = list;
  META[bank].count = list.length;
});

/* ---- เขียน questions.js ใหม่ ---- */
const totalSpecial = ORDER.reduce((s, b) => s + SPECIAL_BANKS[b].length, 0);
const out = `/* ============================================================
   คลังข้อสอบสอบราชการไทย ครบ ภาค ก / ข / ค — เขียนขึ้นใหม่ทั้งหมด (original)
   ภาค ก (core) ${core.length} ข้อ | ภาค ข+ค (เฉพาะทาง) ${totalSpecial} ข้อ | รวม ${core.length + totalSpecial} ข้อ
   สร้างอัตโนมัติจาก _batches/assemble3.js
   ============================================================ */

window.SUBJECTS = {
  analytical: { key: "analytical", no: 1, name: "วิชาความสามารถในการคิดวิเคราะห์", fullScore: 100, passPercent: { undergrad: 60, master: 65 }, color: "#1eaf5d" },
  ethics:     { key: "ethics",     no: 2, name: "วิชาความรู้และลักษณะการเป็นข้าราชการที่ดี", fullScore: 50, passPercent: { undergrad: 60, master: 60 }, color: "#2f80ed" },
  english:    { key: "english",    no: 3, name: "วิชาภาษาอังกฤษ", fullScore: 50, passPercent: { undergrad: 50, master: 50 }, color: "#eb5757" }
};
window.SUBJECT_ORDER = ["analytical", "ethics", "english"];
window.EXAM_BLUEPRINT = { analytical: 50, english: 25, ethics: 25 };

/* คลังเฉพาะทาง: ภาค ข (ความรู้เฉพาะตำแหน่ง) + ภาค ค (ความเหมาะสมกับตำแหน่ง) */
window.SPECIAL_BANK_META = ${JSON.stringify(META, null, 2)};
window.SPECIAL_BANK_ORDER = ${JSON.stringify(ORDER)};

window.QUESTIONS = ${JSON.stringify(core, null, 2)};

window.SPECIAL_BANKS = ${JSON.stringify(SPECIAL_BANKS, null, 2)};
`;
fs.writeFileSync(path.join(dir, "questions.js"), out, "utf8");

/* ---- รายงาน ---- */
console.log("CORE:", core.length);
console.log("ภาค ข:");
ORDER.filter((b) => META[b].part === "ข").forEach((b) => console.log("  " + SPECIAL_BANKS[b].length + "\t" + META[b].short));
console.log("ภาค ค:");
ORDER.filter((b) => META[b].part === "ค").forEach((b) => console.log("  " + SPECIAL_BANKS[b].length + "\t" + META[b].short));
console.log("SPECIAL total:", totalSpecial, "| GRAND TOTAL:", core.length + totalSpecial);
console.log("ISSUES (" + issues.length + "):", issues.length ? "\n" + issues.join("\n") : "ไม่มี");
