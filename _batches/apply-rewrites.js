/* นำผลรีไรต์เฉลย (content-based) มาแทนที่ใน questions.js แบบตรงตัว (ปลอดภัย)
   input: _batches/_rewrites.json = [{ id, newExplanation }]
   วิธี: หา object ตาม id ใน questions.js แล้วแทน JSON.stringify(oldExp) -> JSON.stringify(newExp)
   โหมด: node apply-rewrites.js dry | apply */
const fs = require("fs");
const path = require("path");
const QPATH = path.join(__dirname, "..", "questions.js");

global.window = {};
require(QPATH);
const byId = {};
window.QUESTIONS.forEach((q) => (byId[q.id] = q));
(window.SPECIAL_BANK_ORDER || []).forEach((b) => (window.SPECIAL_BANKS[b] || []).forEach((q) => (byId[q.id] = q)));

const rewrites = JSON.parse(fs.readFileSync(path.join(__dirname, "_rewrites.json"), "utf8"));
let raw = fs.readFileSync(QPATH, "utf8");

let problems = [], leftoverRefs = [], applied = 0;
const reRef = /(?:ข้อ|ตัวเลือก|ตอบ)\s+(?:ข้อ\s+)?[A-Eกขคง](?![A-Za-zก-๛])/;

rewrites.forEach((r) => {
  const q = byId[r.id];
  if (!q) { problems.push("id" + r.id + " not found"); return; }
  const oldNeedle = JSON.stringify(q.explanation);
  const count = raw.split(oldNeedle).length - 1;
  if (count !== 1) { problems.push("id" + r.id + " old-explanation match count=" + count); return; }
  // sanity: new explanation must start with "ตอบ " and contain the correct choice text
  const correct = q.choices[q.answer];
  if (!/^ตอบ\s/.test(r.newExplanation)) problems.push("id" + r.id + " new not starting with ตอบ");
  if (r.newExplanation.indexOf(correct) < 0 && correct.length < 60) leftoverRefs.push("id" + r.id + " new missing correct-choice text");
});

console.log("rewrites:", rewrites.length, "| problems:", problems.length ? problems.slice(0, 30) : "NONE", "| warnings:", leftoverRefs.length ? leftoverRefs.slice(0, 30) : "NONE");

const mode = process.argv[2] || "dry";
if (mode === "apply") {
  if (problems.length) { console.log("ABORT due to problems."); process.exit(1); }
  rewrites.forEach((r) => {
    const q = byId[r.id];
    raw = raw.replace(JSON.stringify(q.explanation), JSON.stringify(r.newExplanation));
    applied++;
  });
  fs.writeFileSync(QPATH, raw, "utf8");
  console.log("APPLIED", applied, "rewrites.");
}
