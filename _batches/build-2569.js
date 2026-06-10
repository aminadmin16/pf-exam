/* Build: _batches/y2569-add.js -> question objects (ปี 2569) + กระจายตำแหน่งคำตอบ + ใส่ id ต่อท้าย
   node build-2569.js preview  -> _batches/_2569-preview.json
   node build-2569.js apply    -> ต่อท้าย window.QUESTIONS ใน ../questions.js */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const QPATH = path.join(ROOT, "questions.js");
const items = require("./y2569-add.js");

function currentMaxId() {
  const src = fs.readFileSync(QPATH, "utf8");
  let max = 0, m; const re = /"id":\s*(\d+)/g;
  while ((m = re.exec(src))) { const n = parseInt(m[1], 10); if (n > max) max = n; }
  return max;
}
function rotate(choices, oldIdx, target) {
  const r = ((target - oldIdx) % 4 + 4) % 4;
  const out = new Array(4);
  for (let i = 0; i < 4; i++) out[(i + r) % 4] = choices[i];
  return { choices: out, answer: target };
}
function build(startId) {
  const objs = []; let id = startId;
  items.forEach((q, g) => {
    const target = g % 4;
    const { choices, answer } = rotate(q.c, q.a, target);
    const o = {
      id: id++, subject: q.subject, topic: q.topic, year: q.year || 2569,
      question: q.q, choices, answer, explanation: q.e, freq: q.freq || 4,
    };
    if (q.passage) o.passage = q.passage;
    objs.push(o);
  });
  return objs;
}

const mode = process.argv[2] || "preview";
const startId = currentMaxId() + 1;
const objs = build(startId);

if (mode === "preview") {
  fs.writeFileSync(path.join(__dirname, "_2569-preview.json"), JSON.stringify(objs, null, 2), "utf8");
  const dist = [0, 0, 0, 0]; objs.forEach((o) => dist[o.answer]++);
  console.log("preview:", objs.length, "questions, ids", startId, "-", startId + objs.length - 1);
  console.log("answer index distribution:", dist);
} else if (mode === "apply") {
  let src = fs.readFileSync(QPATH, "utf8");
  const aIdx = src.indexOf("window.SPECIAL_BANKS");
  if (aIdx < 0) throw new Error("no SPECIAL_BANKS");
  const closeIdx = src.lastIndexOf("];", aIdx);
  const before = src.slice(0, closeIdx);
  const lastBrace = before.lastIndexOf("}");
  const head = src.slice(0, lastBrace + 1);
  const tail = src.slice(lastBrace + 1);
  const block = objs.map((o) => "  " + JSON.stringify(o)).join(",\n");
  fs.writeFileSync(QPATH, head + ",\n" + block + "\n" + tail, "utf8");
  console.log("applied:", objs.length, "questions. ids", startId, "-", startId + objs.length - 1);
}
