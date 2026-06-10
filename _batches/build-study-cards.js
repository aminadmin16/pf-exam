/* รวมการ์ดสรุป ภาค ก ใหม่ (จาก _studycards.json) เข้า ../study-notes.js
   - แปลง blocks {kind,text,heading,points} -> {p}|{h,points}|{trick}
   - จัดเรียงตามผังสอบ + เก็บการ์ดเดิมที่ต้องการ + ตัดการ์ดรวมเก่าที่ซ้ำออก
   - เขียน study-notes.js ใหม่ทั้งไฟล์ (header + JSON)
   node build-study-cards.js dry | apply */
const fs = require("fs");
const path = require("path");
const SPATH = path.join(__dirname, "..", "study-notes.js");

global.window = {};
require(SPATH);
const existing = window.STUDY_NOTES;
const byId = {};
existing.forEach((n) => { if (n.id) byId[n.id] = n; });

const newCards = JSON.parse(fs.readFileSync(path.join(__dirname, "_studycards.json"), "utf8"));

function toBlocks(blocks) {
  return blocks.map((b) => {
    if (b.kind === "p") return { p: b.text || "" };
    if (b.kind === "trick") return { trick: b.text || "" };
    if (b.kind === "h") return { h: b.heading || "", points: b.points || [] };
    return { p: b.text || "" };
  });
}
const newById = {};
newCards.forEach((c) => {
  newById[c.topicKey] = {
    id: "ga-" + c.topicKey, icon: c.icon, title: c.title, tag: c.tag,
    blocks: toBlocks(c.blocks),
  };
});

// ลำดับสุดท้ายที่ต้องการ
const ORDER = [
  byId["overview"], byId["blueprint"],
  newById["series"], newById["mathgen"], byId["hrm-krn"], newById["table"],
  newById["analogy"], newById["symbol"], newById["verbal"], newById["order"], newById["thairead"],
  newById["conversation"], newById["grammar"], newById["vocab"], newById["reading"],
  byId["law"], byId["interview"],
];
// ต่อด้วยการ์ดกฎหมาย law-* (ภาค ข/ค) ตามลำดับเดิม
existing.filter((n) => n.id && /^law-/.test(n.id)).forEach((n) => ORDER.push(n));

const finalArr = ORDER.filter(Boolean);
const removed = existing.filter((n) => !finalArr.includes(n)).map((n) => n.id);
const missingNew = ["series", "mathgen", "table", "analogy", "symbol", "verbal", "order", "thairead", "conversation", "grammar", "vocab", "reading"].filter((k) => !newById[k]);

console.log("final cards:", finalArr.length, "| removed old:", removed, "| missing new:", missingNew.length ? missingNew : "none");

const mode = process.argv[2] || "dry";
if (mode === "apply") {
  if (missingNew.length) { console.log("ABORT: missing new cards", missingNew); process.exit(1); }
  const header = "/* ชุดอ่านก่อนสอบ — สรุปสั้น + ทริคจำง่าย\n   มาร์กอัป: ==ไฮไลต์==  **ตัวหนา**   {trick:\"...\"} = กล่องทริค */\n";
  fs.writeFileSync(SPATH, header + "window.STUDY_NOTES = " + JSON.stringify(finalArr, null, 2) + ";\n", "utf8");
  console.log("WROTE study-notes.js:", finalArr.length, "cards");
}
