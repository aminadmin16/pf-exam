/* นำผล workflow gen-position-blueprints → เขียน position-data.js
   node build-position-data.js <output.json path> [apply]
   - preview (ค่าเริ่มต้น): สรุปจำนวน + ตรวจโครงสร้าง/เฉลย ไม่เขียนไฟล์
   - apply: เขียน ../position-data.js */
const fs = require("fs");
const path = require("path");
const outPath = process.argv[2];
const mode = process.argv[3] || "preview";
const DEST = path.join(__dirname, "..", "position-data.js");

const raw = fs.readFileSync(outPath, "utf8");
const parsed = JSON.parse(raw.slice(raw.indexOf("{")));
const res = parsed.result || parsed;
const data = res.data || [];

const BLUE = {}, QS = {};
let id = 20000, bad = [];
data.forEach((p) => {
  if (!p || !p.posId) return;
  BLUE[p.posId] = { writtenTopics: p.writtenTopics || [] };
  QS[p.posId] = (p.questions || []).map((q) => {
    if (!Array.isArray(q.choices) || q.choices.length !== 4 || new Set(q.choices).size !== 4) bad.push(p.posId + ":choices");
    if (!(q.answer >= 0 && q.answer <= 3)) bad.push(p.posId + ":answer");
    if (!/^ตอบ/.test(q.explanation || "")) bad.push(p.posId + ":exp");
    if (/(ตอบ|ข้อ|ตัวเลือก)\s+[A-Eกขคง](?![A-Za-z0-9ก-๛\/])/.test(q.explanation || "")) bad.push(p.posId + ":letter-ref");
    return { id: ++id, subject: "special_pos", posExam: true, topic: q.topic || "", question: q.question, choices: q.choices, answer: q.answer, explanation: q.explanation };
  });
});

const posIds = Object.keys(BLUE);
const totalQ = posIds.reduce((s, k) => s + QS[k].length, 0);
console.log("positions:", posIds.length, "· totalQ:", totalQ);
console.log("topics range:", posIds.map((k) => BLUE[k].writtenTopics.length).sort((a, b) => a - b)[0] + "-" + posIds.map((k) => BLUE[k].writtenTopics.length).sort((a, b) => b - a)[0]);
console.log("structural issues:", bad.length ? bad.slice(0, 40) : "NONE");
const lowQ = posIds.filter((k) => QS[k].length < 12);
if (lowQ.length) console.log("positions with <12 q:", lowQ.map((k) => k + "(" + QS[k].length + ")"));

if (mode === "apply") {
  const out = `/* ============================================================
   ข้อมูลเฉพาะตำแหน่ง (แท็บ "ตามตำแหน่ง")
   *** สร้าง/อัปเดตโดย _batches/build-position-data.js จากผล AI — อย่าแก้ไฟล์นี้ตรง ๆ ***
   - POSITION_BLUEPRINTS[posId].writtenTopics : หัวข้อความรู้เฉพาะตำแหน่ง (ประเมินครั้งที่ 1 สอบข้อเขียน)
   - POSITION_QUESTIONS[posId] : แนวข้อสอบความรู้เฉพาะตำแหน่ง (ภาค ข)  ${totalQ} ข้อ / ${posIds.length} ตำแหน่ง
   ============================================================ */
window.POSITION_BLUEPRINTS = ${JSON.stringify(BLUE, null, 1)};
window.POSITION_QUESTIONS = ${JSON.stringify(QS, null, 1)};
`;
  fs.writeFileSync(DEST, out, "utf8");
  console.log("APPLIED -> position-data.js");
}
