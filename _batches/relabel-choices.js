/* Relabel Thai option letters (ก/ข/ค/ง/จ) -> A/B/C/D/E in explanations so they match the UI labels.
   ขอบเขต: เฉพาะ bank sjt_service / sjt_integrity / interview (id 863-968) + แก้เฉพาะจุด id971, id980
   วิธีเขียนกลับ: แทนที่ JSON.stringify(oldExp) ด้วย JSON.stringify(newExp) แบบตรงตัวในไฟล์ (ปลอดภัย)
   โหมด:  node relabel-choices.js dry   |   node relabel-choices.js apply  */
const fs = require("fs");
const path = require("path");
const QPATH = path.join(__dirname, "..", "questions.js");

global.window = {};
require(QPATH);
const SB = window.SPECIAL_BANKS;

const MAP = { "ก": "A", "ข": "B", "ค": "C", "ง": "D", "จ": "E" };
function relabel(s) {
  s = s.replace(/ตอบ\s+ข้อ\s+([กขคงจ])(?![ก-๛])/g, (m, c) => "ตอบ ข้อ " + MAP[c]);
  s = s.replace(/ตอบ\s+([กขคงจ])(?![ก-๛])/g, (m, c) => "ตอบ ข้อ " + MAP[c]);
  s = s.replace(/ข้อ\s+([กขคงจ])(?![ก-๛])/g, (m, c) => "ข้อ " + MAP[c]);
  s = s.replace(/ตัวเลือก\s+([กขคงจ])(?![ก-๛])/g, (m, c) => "ตัวเลือก " + MAP[c]);
  return s;
}

// build edit list: {kind:'exp'|'choice', id, old, neu}
const edits = [];
["sjt_service", "sjt_integrity", "interview"].forEach((b) => {
  (SB[b] || []).forEach((q) => {
    const neu = relabel(q.explanation);
    if (neu !== q.explanation) edits.push({ kind: "exp", id: q.id, bank: b, old: q.explanation, neu });
  });
});

// id971 — relabel the bare option run "ข้อ ข ค ง" -> "ข้อ B C D"
(function () {
  const q = (SB["constitution"] || []).concat(window.QUESTIONS).find((x) => x.id === 971) || window.QUESTIONS.find((x) => x.id === 971);
  if (q) {
    const neu = q.explanation.replace("ส่วนข้อ ข ค ง", "ส่วนข้อ B C D");
    if (neu !== q.explanation) edits.push({ kind: "exp", id: 971, bank: "ethics", old: q.explanation, neu });
  }
})();

// id980 — choice text + explanation: "ถูกทั้งข้อ ก. และ ข." -> "ถูกทั้งข้อ A และ B"
(function () {
  const q = window.QUESTIONS.find((x) => x.id === 980);
  if (q) {
    const oldChoice = "ถูกทั้งข้อ ก. และ ข.";
    const newChoice = "ถูกทั้งข้อ A และ B";
    if (q.choices.includes(oldChoice)) edits.push({ kind: "choice", id: 980, old: oldChoice, neu: newChoice });
    const neuExp = q.explanation.replace("ถูกทั้งข้อ ก. และ ข.", "ถูกทั้งข้อ A และ B");
    if (neuExp !== q.explanation) edits.push({ kind: "exp", id: 980, bank: "ethics", old: q.explanation, neu: neuExp });
  }
})();

const mode = process.argv[2] || "dry";
let raw = fs.readFileSync(QPATH, "utf8");

// verify each old appears exactly once (as JSON string) and check leftovers
let problems = [];
let leftover = [];
edits.forEach((e) => {
  const needle = JSON.stringify(e.old);
  const count = raw.split(needle).length - 1;
  if (count !== 1) problems.push("id" + e.id + " (" + e.kind + ") JSON match count=" + count);
  if (e.kind === "exp") {
    const m = e.neu.match(/(ตอบ|ข้อ|ตัวเลือก)\s+[กขคงจ](?![ก-๛])/g);
    if (m) leftover.push("id" + e.id + " leftover: " + m.join(", "));
  }
});

console.log("edits planned:", edits.length, "(exp:" + edits.filter((e) => e.kind === "exp").length + ", choice:" + edits.filter((e) => e.kind === "choice").length + ")");
console.log("JSON-match problems:", problems.length ? problems : "NONE");
console.log("relabel leftovers:", leftover.length ? leftover : "NONE");

console.log("\n--- sample before/after (3) ---");
edits.filter((e) => e.kind === "exp").slice(0, 3).forEach((e) => {
  console.log("id" + e.id + " OLD:", JSON.stringify(e.old.split("\n")[0]));
  console.log("id" + e.id + " NEW:", JSON.stringify(e.neu.split("\n")[0]));
  const oldBody = e.old.split("\n").slice(2).join(" ").slice(0, 120);
  const newBody = e.neu.split("\n").slice(2).join(" ").slice(0, 120);
  if (oldBody !== newBody) { console.log("   body OLD:", oldBody); console.log("   body NEW:", newBody); }
});

if (mode === "apply") {
  if (problems.length || leftover.length) { console.log("\nABORT: fix problems/leftovers first."); process.exit(1); }
  edits.forEach((e) => { raw = raw.replace(JSON.stringify(e.old), JSON.stringify(e.neu)); });
  fs.writeFileSync(QPATH, raw, "utf8");
  console.log("\nAPPLIED", edits.length, "edits to questions.js");
}
