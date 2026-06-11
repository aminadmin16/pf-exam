/* กู้ผลงานจาก workflow transcript: อ่าน agent-*.jsonl → ดึง StructuredOutput (questions)
   จัดหมวดจาก prompt + แจกชุด s1/s2/s3 ตามลำดับ → เขียน _hard-raw.json (รูปแบบเดียวกับ workflow result) */
const fs = require("fs");
const path = require("path");
const DIR = "C:/Users/perap/.claude/projects/D--02-Personal-Projects-PF-Examination/43c740f6-3ae6-42a7-af0b-771852645d27/subagents/workflows/wf_6fde3046-16a";

const CATS = [
  { cat: "series-math", probe: "อนุกรมยากมาก 5 ข้อ", perSet: true },
  { cat: "table-analogy", probe: "ตารางวิเคราะห์ข้อมูลยาก 5 ข้อ", perSet: true },
  { cat: "symbol", probe: "เงื่อนไขสัญลักษณ์ยากที่สุด 10 ข้อ", perSet: true },
  { cat: "verbal-order", probe: "เงื่อนไขภาษายากมาก 5 ข้อ", perSet: true },
  { cat: "thairead", probe: "บทความภาษาไทยยาก 10 ข้อ", perSet: true },
  { cat: "eng-cgv", probe: "ภาษาอังกฤษยาก 15 ข้อ", perSet: true },
  { cat: "eng-read", probe: "English Reading ยาก 10 ข้อ", perSet: true },
  { cat: "ethics-a", probe: "ข้าราชการที่ดียาก 13 ข้อ", perSet: true },
  { cat: "ethics-b", probe: "ข้าราชการที่ดียาก 12 ข้อ", perSet: true },
  { cat: "sym-var", probe: "สองโซ่เชื่อมตัวแปรร่วม", perSet: false },
  { cat: "sym-frac", probe: "คูณไขว้/ทำส่วนให้เท่า", perSet: false },
];

const files = fs.readdirSync(DIR).filter((f) => /^agent-.*\.jsonl$/.test(f));
const found = [];   // { cat, file, questions, mtime }
files.forEach((f) => {
  const p = path.join(DIR, f);
  const txt = fs.readFileSync(p, "utf8");
  // หา cat จาก prompt (อยู่ช่วงต้นไฟล์)
  const head = txt.slice(0, 20000);
  const cat = CATS.find((c) => head.indexOf(c.probe) !== -1);
  if (!cat) { console.log("SKIP (no cat):", f); return; }
  // หา StructuredOutput ตัวสุดท้าย
  let qs = null;
  txt.split("\n").forEach((line) => {
    if (line.indexOf("StructuredOutput") === -1) return;
    try {
      const obj = JSON.parse(line);
      const content = obj.message && obj.message.content;
      if (!Array.isArray(content)) return;
      content.forEach((c) => {
        if (c.type === "tool_use" && c.name === "StructuredOutput" && c.input && Array.isArray(c.input.questions)) qs = c.input.questions;
      });
    } catch (e) {}
  });
  if (!qs) { console.log("NO OUTPUT:", f, "(cat " + cat.cat + ")"); return; }
  found.push({ cat: cat.cat, perSet: cat.perSet, file: f, questions: qs, mtime: fs.statSync(p).mtimeMs });
});

// แจกชุด: หมวด perSet ควรมี 3 agents → s1/s2/s3 ตามลำดับเวลา
const chunks = [];
CATS.forEach((c) => {
  const list = found.filter((x) => x.cat === c.cat).sort((a, b) => a.mtime - b.mtime);
  if (c.perSet) {
    list.forEach((x, i) => chunks.push({ key: "s" + (i + 1) + "-" + c.cat, questions: x.questions }));
    if (list.length !== 3) console.log("WARN:", c.cat, "expected 3 agents, got", list.length);
  } else {
    list.forEach((x) => chunks.push({ key: c.cat, questions: x.questions }));
    if (list.length !== 1) console.log("WARN:", c.cat, "expected 1 agent, got", list.length);
  }
});

let total = 0; chunks.forEach((c) => { total += c.questions.length; });
fs.writeFileSync(path.join(__dirname, "_hard-raw.json"), JSON.stringify({ result: { total, chunks } }, null, 1), "utf8");
console.log("RECOVERED:", total, "questions in", chunks.length, "chunks ->_hard-raw.json");
chunks.forEach((c) => console.log("  " + c.key + ": " + c.questions.length));
