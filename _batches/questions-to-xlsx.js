/* ส่งออก questions.js (ปัจจุบัน) → questions.xlsx  (รันครั้งเดียวเพื่อสร้างไฟล์ Excel ตั้งต้น)
   ใช้: node _batches/questions-to-xlsx.js   (หรือ npm run data:export) */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const XLSX = require("xlsx");

const dir = path.resolve(__dirname, "..");
const sb = { window: {} };
vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(dir, "questions.js"), "utf8"), sb);
const W = sb.window;

// แผ่น core (ภาค ก) — answer เก็บเป็น 1-4 (อ่านง่ายกว่า 0-3)
const coreRows = (W.QUESTIONS || []).map((q) => ({
  subject: q.subject, topic: q.topic || "", year: q.year || "",
  predicted: q.predicted ? "yes" : "", hard: q.hard || "", passage: q.passage || "",
  question: q.question,
  choice1: q.choices[0], choice2: q.choices[1], choice3: q.choices[2], choice4: q.choices[3],
  answer: q.answer + 1, explanation: q.explanation, freq: q.freq || ""
}));

// แผ่น special (ภาค ข/ค)
const spRows = [];
(W.SPECIAL_BANK_ORDER || []).forEach((bank) => {
  (W.SPECIAL_BANKS[bank] || []).forEach((q) => spRows.push({
    bank: bank, topic: q.topic || "", predicted: q.predicted ? "yes" : "",
    question: q.question,
    choice1: q.choices[0], choice2: q.choices[1], choice3: q.choices[2], choice4: q.choices[3],
    answer: q.answer + 1, explanation: q.explanation, freq: q.freq || ""
  }));
});

// แผ่น banks (ข้อมูลคลังเฉพาะทาง — แก้ชื่อ/ไอคอน/ลำดับได้)
const bankRows = (W.SPECIAL_BANK_ORDER || []).map((b) => {
  const m = W.SPECIAL_BANK_META[b];
  return { bank: b, part: m.part, short: m.short, name: m.name, icon: m.icon };
});

const wb = XLSX.utils.book_new();
const sheet = (rows, cols) => { const ws = XLSX.utils.json_to_sheet(rows, { header: cols }); ws["!cols"] = cols.map((c) => ({ wch: c === "question" || c === "explanation" || c === "passage" ? 50 : (c.indexOf("choice") === 0 || c === "name" ? 24 : 12) })); return ws; };
XLSX.utils.book_append_sheet(wb, sheet(coreRows, ["subject", "topic", "year", "predicted", "hard", "passage", "question", "choice1", "choice2", "choice3", "choice4", "answer", "explanation", "freq"]), "core");
XLSX.utils.book_append_sheet(wb, sheet(spRows, ["bank", "topic", "predicted", "question", "choice1", "choice2", "choice3", "choice4", "answer", "explanation", "freq"]), "special");
XLSX.utils.book_append_sheet(wb, sheet(bankRows, ["bank", "part", "short", "name", "icon"]), "banks");
XLSX.writeFile(wb, path.join(dir, "questions.xlsx"));
console.log("สร้าง questions.xlsx แล้ว:", coreRows.length, "core +", spRows.length, "special +", bankRows.length, "banks");
