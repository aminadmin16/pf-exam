/* รวมรอบ 4: เพิ่มข้อสอบ core + เก็ง 2569 + ภาค ค + bank ใหม่ (local, education)
   และคำนวณ freq (อัตราการออก 1-5 ดาว) ให้ทุกข้อ (ภาค ก/ข) */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const dir = "D:/02_Personal_Projects/PF Examination";
const bd = path.join(dir, "_batches");
const ALLOWED_YEARS = [2565, 2566, 2567, 2568, 2569];

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(dir, "questions.js"), "utf8"), sandbox);
const coreExisting = (sandbox.window.QUESTIONS || []).map((q) => ({ ...q }));
const banksExisting = sandbox.window.SPECIAL_BANKS || {};

const norm = (s) => String(s == null ? "" : s).replace(/\s+/g, " ").trim();
function validate(q, mode) {
  if (!Array.isArray(q.choices) || q.choices.length !== 4) return "choices!=4";
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) return "answer";
  if (!norm(q.question)) return "q-empty";
  if (!norm(q.explanation)) return "exp-empty";
  if (new Set(q.choices.map(norm)).size !== 4) return "dup-choice";
  if (mode === "core" && !["analytical", "english", "ethics"].includes(q.subject)) return "subject";
  return null;
}

/* ---- อัตราการออก (freq 1-5) ตามหัวข้อ ภาค ก ---- */
const FREQ_TOPIC = {
  "อนุกรมตัวเลข": 5, "เงื่อนไขสัญลักษณ์": 5, "การวิเคราะห์ข้อมูลจากตาราง": 4, "การวิเคราะห์ข้อมูล": 4,
  "อุปมาอุปไมย": 4, "เงื่อนไขภาษา": 4, "การสรุปเหตุผล": 4, "ตรรกศาสตร์": 4,
  "คณิตศาสตร์: ร้อยละ": 4, "คณิตศาสตร์: กำไร-ขาดทุน": 3, "คณิตศาสตร์: อัตราส่วน": 3,
  "คณิตศาสตร์: ห.ร.ม./ค.ร.น.": 3, "คณิตศาสตร์: สมการ/โจทย์ปัญหา": 4,
  "กำไร-ขาดทุน": 3, "ร้อยละ": 4, "อัตราส่วน": 3, "ค่าเฉลี่ย": 3, "อัตราเร็ว": 3, "โจทย์อายุ": 3,
  "ภาษาไทย: การจับใจความ": 5, "ภาษาไทย: การเรียงประโยค": 4, "ภาษาไทย: การใช้ภาษา": 3,
  "ภาษาไทย: คำและสำนวน": 4, "ภาษาไทย: การสะกดคำ": 3, "ภาษาไทย: สำนวน": 3,
  "Conversation": 4, "Vocabulary & Expression": 4, "Grammar & Structure": 5, "Reading Comprehension": 5,
  "Grammar: Tense": 4, "Grammar: Article": 3, "Grammar: Preposition": 4, "Grammar: Agreement": 4,
  "Grammar: Comparison": 3, "Grammar: Modal": 3, "Grammar: Question Word": 3,
  "Vocabulary: Synonym": 4, "Vocabulary: Antonym": 3,
  "พ.ร.บ.ระเบียบบริหารราชการแผ่นดิน": 5, "ระเบียบบริหารราชการแผ่นดิน": 5,
  "การบริหารกิจการบ้านเมืองที่ดี": 4, "พ.ร.ฎ.การบริหารกิจการบ้านเมืองที่ดี": 4,
  "มาตรฐานทางจริยธรรม": 5, "หลักธรรมาภิบาล": 4, "เศรษฐกิจพอเพียง": 4,
  "จริยธรรมและการเป็นข้าราชการที่ดี": 5, "ลักษณะข้าราชการที่ดี": 4,
  "วิธีปฏิบัติราชการทางปกครอง": 4, "พ.ร.บ.วิธีปฏิบัติราชการทางปกครอง": 4,
  "ประมวลกฎหมายอาญา: ความผิดต่อตำแหน่งหน้าที่": 3, "พ.ร.บ.ความรับผิดทางละเมิดของเจ้าหน้าที่": 3
};
const coreFreq = (q) => FREQ_TOPIC[q.topic] || 3;

/* ---- 1) รวม core (เดิม + ใหม่ + เก็ง 2569 ใหม่) ---- */
let incoming = [];
["c2_analytical.json", "c2_ethics.json", "c2_english.json"].forEach((f) => {
  JSON.parse(fs.readFileSync(path.join(bd, f), "utf8")).forEach((q) => incoming.push(q));
});
["p3_analytical.json", "p3_mix.json"].forEach((f) => {
  JSON.parse(fs.readFileSync(path.join(bd, f), "utf8")).forEach((q) => { q.predicted = true; q.year = 2569; incoming.push(q); });
});

const issues = [];
const seen = new Set();
const core = [];
coreExisting.concat(incoming).forEach((q) => {
  const e = validate(q, "core");
  if (e) { issues.push("core " + e + ": " + norm(q.question).slice(0, 35)); return; }
  const k = q.subject + "|" + norm(q.question) + "|" + q.choices.map(norm).join("~");
  if (seen.has(k)) { issues.push("core ซ้ำ: " + norm(q.question).slice(0, 35)); return; }
  seen.add(k);
  let y = parseInt(q.year, 10); if (!ALLOWED_YEARS.includes(y)) y = 2566;
  const item = { id: 0, subject: q.subject, topic: q.topic || "", year: y, question: q.question, choices: q.choices, answer: q.answer, explanation: q.explanation, freq: coreFreq(q) };
  if (q.passage && norm(q.passage)) item.passage = q.passage;
  if (q.predicted) item.predicted = true;
  core.push(item);
});
core.forEach((q, i) => { q.id = i + 1; });

/* ---- 2) คลังเฉพาะทาง (ภาค ข/ค) ---- */
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
  local:        { name: "การปกครองส่วนท้องถิ่นและการกระจายอำนาจ", short: "ปกครองท้องถิ่น", icon: "🏘️", part: "ข" },
  education:    { name: "พ.ร.บ. การศึกษาแห่งชาติ พ.ศ. 2542", short: "การศึกษาแห่งชาติ 2542", icon: "🎓", part: "ข" },
  sjt_service:   { name: "สถานการณ์: การบริการและการทำงานเป็นทีม (SJT)", short: "SJT บริการ/ทีมงาน", icon: "🤝", part: "ค" },
  sjt_integrity: { name: "สถานการณ์: ความซื่อสัตย์ จริยธรรม และการแก้ปัญหา (SJT)", short: "SJT จริยธรรม/แก้ปัญหา", icon: "⚖️", part: "ค" },
  interview:     { name: "เตรียมสอบสัมภาษณ์ (ภาค ค)", short: "เตรียมสัมภาษณ์", icon: "🎤", part: "ค" }
};
const ORDER = ["constitution", "civilservant", "govemployee", "info", "pdpa", "procurement",
  "saraban", "finance", "strategy", "computer", "local", "education",
  "sjt_service", "sjt_integrity", "interview"];
const FREQ_BANK = { constitution: 4, civilservant: 4, govemployee: 3, info: 3, pdpa: 4, procurement: 3, saraban: 3, finance: 3, strategy: 3, computer: 3, local: 3, education: 3 };
const extraFiles = { sjt_service: ["s_sjt_service2.json"], sjt_integrity: ["s_sjt_integrity2.json"], interview: ["s_interview2.json"] };
const brandNew = { local: "s_local.json", education: "s_education.json" };

const SPECIAL_BANKS = {};
let gid = core.length;
ORDER.forEach((bank) => {
  let raw = [];
  if (banksExisting[bank]) raw = raw.concat(banksExisting[bank]);
  if (extraFiles[bank]) extraFiles[bank].forEach((f) => { raw = raw.concat(JSON.parse(fs.readFileSync(path.join(bd, f), "utf8"))); });
  if (brandNew[bank]) raw = raw.concat(JSON.parse(fs.readFileSync(path.join(bd, brandNew[bank]), "utf8")));

  const localSeen = new Set();
  const list = [];
  raw.forEach((q) => {
    const e = validate(q, "special");
    if (e) { issues.push(bank + " " + e + ": " + norm(q.question).slice(0, 35)); return; }
    const k = norm(q.question) + "|" + q.choices.map(norm).join("~");
    if (localSeen.has(k)) { issues.push(bank + " ซ้ำ: " + norm(q.question).slice(0, 35)); return; }
    localSeen.add(k);
    const item = { id: ++gid, bank: bank, subject: "special_" + bank, topic: q.topic || META[bank].short, question: q.question, choices: q.choices, answer: q.answer, explanation: q.explanation };
    if (META[bank].part === "ข") item.freq = FREQ_BANK[bank] || 3; // ภาค ค ไม่ใส่ freq
    list.push(item);
  });
  SPECIAL_BANKS[bank] = list;
  META[bank].count = list.length;
});

/* ---- 3) เขียน questions.js ---- */
const totalSpecial = ORDER.reduce((s, b) => s + SPECIAL_BANKS[b].length, 0);
const out = `/* ============================================================
   คลังข้อสอบสอบราชการไทย ครบ ภาค ก / ข / ค + ข้อเก็ง 2569 + อัตราการออก (freq)
   เขียนขึ้นใหม่ทั้งหมด (original) | ภาค ก ${core.length} + เฉพาะทาง ${totalSpecial} = ${core.length + totalSpecial} ข้อ
   สร้างอัตโนมัติจาก _batches/assemble4.js
   ============================================================ */

window.SUBJECTS = {
  analytical: { key: "analytical", no: 1, name: "วิชาความสามารถในการคิดวิเคราะห์", fullScore: 100, passPercent: { undergrad: 60, master: 65 }, color: "#1eaf5d" },
  ethics:     { key: "ethics",     no: 2, name: "วิชาความรู้และลักษณะการเป็นข้าราชการที่ดี", fullScore: 50, passPercent: { undergrad: 60, master: 60 }, color: "#2f80ed" },
  english:    { key: "english",    no: 3, name: "วิชาภาษาอังกฤษ", fullScore: 50, passPercent: { undergrad: 50, master: 50 }, color: "#eb5757" }
};
window.SUBJECT_ORDER = ["analytical", "ethics", "english"];
window.EXAM_BLUEPRINT = { analytical: 50, english: 25, ethics: 25 };

window.SPECIAL_BANK_META = ${JSON.stringify(META, null, 2)};
window.SPECIAL_BANK_ORDER = ${JSON.stringify(ORDER)};

window.QUESTIONS = ${JSON.stringify(core, null, 2)};

window.SPECIAL_BANKS = ${JSON.stringify(SPECIAL_BANKS, null, 2)};
`;
fs.writeFileSync(path.join(dir, "questions.js"), out, "utf8");

/* ---- 4) รายงาน ---- */
const bySub = {}, byYear = {}, pred = core.filter((q) => q.predicted).length;
core.forEach((q) => { bySub[q.subject] = (bySub[q.subject] || 0) + 1; byYear[q.year] = (byYear[q.year] || 0) + 1; });
console.log("CORE:", core.length, "(เก็ง 2569:", pred + ")", JSON.stringify(bySub), JSON.stringify(byYear));
console.log("ภาค ข:");
ORDER.filter((b) => META[b].part === "ข").forEach((b) => console.log("  " + SPECIAL_BANKS[b].length + "\t" + META[b].short));
console.log("ภาค ค:");
ORDER.filter((b) => META[b].part === "ค").forEach((b) => console.log("  " + SPECIAL_BANKS[b].length + "\t" + META[b].short));
console.log("SPECIAL:", totalSpecial, "| GRAND TOTAL:", core.length + totalSpecial);
console.log("ISSUES (" + issues.length + "):", issues.length ? "\n" + issues.join("\n") : "ไม่มี");
