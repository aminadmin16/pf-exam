/* นำผล workflow gen-hard-sets มาใส่ questions.js
   - chunk key ขึ้นต้น s1-/s2-/s3- → hard:1/2/3 (ชุดยาก AI)  · year 2569
   - chunk key ขึ้นต้น sym- → ข้อปกติเข้าแบงก์เงื่อนไขสัญลักษณ์ (predicted:true เพื่อไม่ปนแท็บปี)
   node build-hard.js <output.json path> preview|apply [dropIdsCsv] */
const fs = require("fs");
const path = require("path");
const QPATH = path.join(__dirname, "..", "questions.js");

const outPath = process.argv[2];
const mode = process.argv[3] || "preview";
const drop = new Set((process.argv[4] || "").split(",").filter(Boolean).map(Number));

const raw = fs.readFileSync(outPath, "utf8");
const parsed = JSON.parse(raw.slice(raw.indexOf("{")));
const res = parsed.result || parsed;

function currentMaxId() {
  const src = fs.readFileSync(QPATH, "utf8");
  let max = 0, m; const re = /"id":\s*(\d+)/g;
  while ((m = re.exec(src))) { const n = parseInt(m[1], 10); if (n > max) max = n; }
  return max;
}
const startId = currentMaxId() + 1;
let id = startId;
const objs = [];
const perKey = {};
(res.chunks || []).forEach((c) => {
  const setM = /^s([0-9])-/.exec(c.key);
  perKey[c.key] = (c.questions || []).length;
  (c.questions || []).forEach((q) => {
    const o = {
      id: id++, subject: q.subject, topic: q.topic, year: 2569,
      question: q.question, choices: q.choices, answer: q.answer,
      explanation: q.explanation, freq: 3,
    };
    if (q.passage) o.passage = q.passage;
    if (setM) o.hard = parseInt(setM[1], 10);
    else o.predicted = true;                      // แพ็คเงื่อนไขสัญลักษณ์ → เข้าคลังข้อเก็ง (ไม่ปนแท็บปี)
    objs.push(o);
  });
});

if (mode === "preview") {
  fs.writeFileSync(path.join(__dirname, "_hard-preview.json"), JSON.stringify(objs, null, 1), "utf8");
  const bySet = {};
  objs.forEach((o) => { const k = o.hard ? "hard" + o.hard : "normal-sym"; bySet[k] = (bySet[k] || 0) + 1; });
  console.log("total:", objs.length, "| ids", startId, "-", id - 1);
  console.log("by set:", JSON.stringify(bySet));
  console.log("per chunk:", JSON.stringify(perKey));
  // โครงสร้าง + เฉลยอ้างเนื้อหา
  let bad = [];
  objs.forEach((o) => {
    if (!Array.isArray(o.choices) || o.choices.length !== 4 || new Set(o.choices).size !== 4) bad.push(o.id + ":choices");
    if (!(o.answer >= 0 && o.answer <= 3)) bad.push(o.id + ":answer");
    if (!/^ตอบ/.test(o.explanation || "")) bad.push(o.id + ":exp");
    if (/(ตอบ|ข้อ|ตัวเลือก)\s+[A-Eกขคง](?![A-Za-z0-9ก-๛\/])/.test(o.explanation || "")) bad.push(o.id + ":letter-ref");
  });
  console.log("structural issues:", bad.length ? bad.slice(0, 30) : "NONE");
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
  console.log("APPLIED", keep.length, "· dropped:", objs.length - keep.length, "· ids", startId, "-", id - 1);
}
