/* ถอดข้อสอบชุดยาก (q.hard) ทั้งหมดออกจาก questions.js (คงข้ออื่นไว้ครบ รวมแพ็คเงื่อนไขสัญลักษณ์ปกติ)
   ใช้ก่อนใส่ชุดยากเวอร์ชันใหม่ด้วย build-hard.js   ·   node remove-hard.js */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const dir = path.resolve(__dirname, "..");
const QPATH = path.join(dir, "questions.js");

const sb = { window: {} };
vm.createContext(sb);
vm.runInContext(fs.readFileSync(QPATH, "utf8"), sb);
const W = sb.window;

const before = W.QUESTIONS.length;
const kept = W.QUESTIONS.filter((q) => !q.hard);
const removed = before - kept.length;
const totalSpecial = W.SPECIAL_BANK_ORDER.reduce((s, b) => s + W.SPECIAL_BANKS[b].length, 0);

const out = `/* ============================================================
   คลังข้อสอบสอบราชการไทย ครบ ภาค ก / ข / ค
   *** สร้างอัตโนมัติจาก questions.xlsx โดย _batches/xlsx-to-questions.js — อย่าแก้ไฟล์นี้ตรง ๆ ***
   แก้ข้อสอบที่ questions.xlsx แล้วรัน  npm run data
   ภาค ก ${kept.length} + เฉพาะทาง ${totalSpecial} = ${kept.length + totalSpecial} ข้อ
   ============================================================ */

window.SUBJECTS = ${JSON.stringify(W.SUBJECTS, null, 2)};
window.SUBJECT_ORDER = ${JSON.stringify(W.SUBJECT_ORDER)};
window.EXAM_BLUEPRINT = ${JSON.stringify(W.EXAM_BLUEPRINT)};

window.SPECIAL_BANK_META = ${JSON.stringify(W.SPECIAL_BANK_META, null, 2)};
window.SPECIAL_BANK_ORDER = ${JSON.stringify(W.SPECIAL_BANK_ORDER)};

window.QUESTIONS = ${JSON.stringify(kept, null, 2)};

window.SPECIAL_BANKS = ${JSON.stringify(W.SPECIAL_BANKS, null, 2)};
`;
fs.writeFileSync(QPATH, out, "utf8");
console.log("removed hard:", removed, "· kept core:", kept.length, "· special:", totalSpecial, "· grand:", kept.length + totalSpecial);
