/* Build script: แปลง _batches/english-reading-add.js -> question objects พร้อม id + กระจายตำแหน่งคำตอบ
   โหมด:
     node build-eng-reading.js preview   -> เขียน _batches/_eng-built-preview.json (ไว้ตรวจ)
     node build-eng-reading.js apply      -> ต่อท้าย window.QUESTIONS ใน ../questions.js
   การหมุนตัวเลือก: ปลอดภัยเพราะคำอธิบายอ้างถึง "เนื้อหาตัวเลือก" ไม่ใช่ตำแหน่ง */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const QPATH = path.join(ROOT, "questions.js");
const sets = require("./english-reading-add.js");

// อ่าน max id ปัจจุบันจาก questions.js
function currentMaxId() {
  const src = fs.readFileSync(QPATH, "utf8");
  let max = 0;
  const re = /"id":\s*(\d+)/g;
  let m;
  while ((m = re.exec(src))) { const n = parseInt(m[1], 10); if (n > max) max = n; }
  return max;
}

function rotate(choices, oldIdx, target) {
  const r = ((target - oldIdx) % 4 + 4) % 4;
  const out = new Array(4);
  for (let i = 0; i < 4; i++) out[(i + r) % 4] = choices[i];
  return { choices: out, answer: target };
}

function buildObjects(startId) {
  const objs = [];
  let id = startId;
  let g = 0; // ดัชนีคำถามรวม สำหรับกระจายตำแหน่งคำตอบ
  for (const s of sets) {
    for (const q of s.questions) {
      const target = g % 4;
      const { choices, answer } = rotate(q.c, q.a, target);
      objs.push({
        id: id++,
        subject: "english",
        topic: "Reading Comprehension",
        year: s.year,
        question: q.q,
        choices,
        answer,
        explanation: q.e,
        freq: s.freq,
        passage: s.passage
      });
      g++;
    }
  }
  return objs;
}

const mode = process.argv[2] || "preview";
const startId = currentMaxId() + 1;
const objs = buildObjects(startId);

if (mode === "preview") {
  fs.writeFileSync(path.join(__dirname, "_eng-built-preview.json"), JSON.stringify(objs, null, 2), "utf8");
  const dist = [0, 0, 0, 0];
  objs.forEach((o) => dist[o.answer]++);
  console.log("preview written:", objs.length, "questions, ids", startId, "-", startId + objs.length - 1);
  console.log("answer index distribution [0,1,2,3]:", dist);
} else if (mode === "apply") {
  let src = fs.readFileSync(QPATH, "utf8");
  // หาตำแหน่งปิดอาเรย์ window.QUESTIONS = [ ... ];  ก่อน window.SPECIAL_BANKS
  const anchor = "window.SPECIAL_BANKS";
  const aIdx = src.indexOf(anchor);
  if (aIdx < 0) throw new Error("ไม่พบ window.SPECIAL_BANKS");
  // ถอยหาเครื่องหมาย ]; ที่ปิด QUESTIONS (ตัวสุดท้ายก่อน anchor)
  const closeIdx = src.lastIndexOf("];", aIdx);
  if (closeIdx < 0) throw new Error("ไม่พบจุดปิด array QUESTIONS");
  // หาตำแหน่ง '}' ของ object สุดท้ายก่อน ];
  const before = src.slice(0, closeIdx);
  const lastBrace = before.lastIndexOf("}");
  const head = src.slice(0, lastBrace + 1);
  const tail = src.slice(lastBrace + 1); // ตั้งแต่ก่อน ];
  const block = objs.map((o) => "  " + JSON.stringify(o)).join(",\n");
  const newSrc = head + ",\n" + block + "\n" + tail;
  fs.writeFileSync(QPATH, newSrc, "utf8");
  console.log("applied:", objs.length, "questions appended. ids", startId, "-", startId + objs.length - 1);
} else {
  console.log("unknown mode:", mode);
}
