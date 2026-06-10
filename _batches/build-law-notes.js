/* สร้างการ์ดสรุปกฎหมาย ภาค ข/ค จาก _laws.json แล้วต่อท้าย STUDY_NOTES ใน ../study-notes.js
   - ไฮไลต์คำสำคัญ (มาตรา/ตัวเลข/องค์กร) ด้วย ==...== ให้อ่านง่าย
   - ใส่บล็อกอ้างอิง (ชื่อกฎหมาย + ลิงก์แหล่งราชการ)
   node build-law-notes.js dry | apply */
const fs = require("fs");
const path = require("path");
const SPATH = path.join(__dirname, "..", "study-notes.js");
const notes = JSON.parse(fs.readFileSync(path.join(__dirname, "_laws.json"), "utf8"));

const META = {
  constitution: { icon: "⚖️", title: "รัฐธรรมนูญ 2560 — สรุป + ทริคจำ" },
  civilservant: { icon: "👔", title: "พ.ร.บ.ระเบียบข้าราชการพลเรือน 2551" },
  govemployee: { icon: "🧑‍💼", title: "พนักงานราชการ (ระเบียบ 2547)" },
  info: { icon: "📂", title: "พ.ร.บ.ข้อมูลข่าวสารของราชการ 2540" },
  pdpa: { icon: "🔐", title: "PDPA — คุ้มครองข้อมูลส่วนบุคคล 2562" },
  procurement: { icon: "🛒", title: "พ.ร.บ.จัดซื้อจัดจ้างฯ 2560" },
  saraban: { icon: "📑", title: "ระเบียบงานสารบรรณ 2526 (แก้ไข 2564)" },
  finance: { icon: "💰", title: "พ.ร.บ.วินัยการเงินการคลังของรัฐ 2561" },
  strategy: { icon: "🧭", title: "ยุทธศาสตร์ชาติ 20 ปี" },
  computer: { icon: "💻", title: "พ.ร.บ.คอมพิวเตอร์ 2550 (แก้ไข 2560)" },
  local: { icon: "🏛️", title: "การปกครองส่วนท้องถิ่น (อปท.)" },
  education: { icon: "🎓", title: "พ.ร.บ.การศึกษาแห่งชาติ 2542" },
};

// ไฮไลต์คำสำคัญแบบเบา ๆ (ไม่ให้ซ้อน ==)
function hl(s) {
  if (!s) return s;
  const pats = [
    /มาตรา\s*\d+(?:\s*[-/]\s*\d+)?/g,
    /หมวด\s*\d+/g,
    /\d+\s*(?:องค์กร|คน|ปี|วัน|ประเภท|สถาน|ระดับ|มาตรา|ข้อ|ฉบับ|มิติ|ด้าน|หมวด)/g,
    /\d+(?:,\d{3})*\s*มาตรา/g,
  ];
  const ranges = [];
  pats.forEach((re) => { let m; re.lastIndex = 0; while ((m = re.exec(s))) ranges.push([m.index, m.index + m[0].length]); });
  ranges.sort((a, b) => a[0] - b[0]);
  // รวมช่วงทับซ้อน
  const merged = [];
  ranges.forEach((r) => { if (merged.length && r[0] <= merged[merged.length - 1][1]) { merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], r[1]); } else merged.push(r.slice()); });
  let out = "", last = 0;
  merged.forEach((r) => { out += s.slice(last, r[0]) + "==" + s.slice(r[0], r[1]) + "=="; last = r[1]; });
  out += s.slice(last);
  return out;
}

const cards = notes.map((n) => {
  const m = META[n.bankId] || { icon: "📘", title: n.lawTitle };
  return {
    id: "law-" + n.bankId,
    icon: m.icon,
    title: m.title,
    tag: "ภาค ข/ค",
    blocks: [
      { h: "🎯 ประเด็นที่ออกสอบบ่อย", points: n.keyPoints.map(hl) },
      { trick: hl(n.trick) },
      { p: "📚 **อ้างอิง:** " + n.sourceCitation + (n.sourceUrl ? "\n🔗 " + n.sourceUrl : "") },
    ],
  };
});

const block = cards.map((c) => "  " + JSON.stringify(c)).join(",\n");

const mode = process.argv[2] || "dry";
if (mode === "dry") {
  console.log("cards:", cards.length);
  console.log("--- sample (constitution) ---");
  console.log(JSON.stringify(cards[0], null, 1).slice(0, 900));
} else if (mode === "apply") {
  let s = fs.readFileSync(SPATH, "utf8");
  const close = s.lastIndexOf("];");
  const before = s.slice(0, close);
  const lastBrace = before.lastIndexOf("}");
  const head = s.slice(0, lastBrace + 1);
  const tail = s.slice(lastBrace + 1);
  fs.writeFileSync(SPATH, head + ",\n\n  /* ===== สรุปกฎหมาย ภาค ข/ค (ค้นคว้า+อ้างอิงแหล่งราชการ) ===== */\n" + block + "\n" + tail, "utf8");
  console.log("applied", cards.length, "law cards to study-notes.js");
}
