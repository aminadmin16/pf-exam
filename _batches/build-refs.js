/* แปลงบล็อกอ้างอิง {p:"📚..."} ของการ์ดกฎหมาย -> {ref:{cite,by,url}}
   cite=ชื่อกฎหมาย+ราชกิจจาฯ (ปกติ), by=หน่วยงานแหล่งอ้างอิง (ตัวหนา), url=ลิงก์
   node build-refs.js dry | apply */
const fs = require("fs");
const path = require("path");
const SPATH = path.join(__dirname, "..", "study-notes.js");
global.window = {};
require(SPATH);

const MAP = {
  constitution: { cite: "รัฐธรรมนูญแห่งราชอาณาจักรไทย พุทธศักราช 2560 (ราชกิจจานุเบกษา เล่ม 134 ตอนที่ 40 ก · 6 เม.ย. 2560)", by: "สำนักงานเลขาธิการสภาผู้แทนราษฎร / สำนักงานคณะกรรมการกฤษฎีกา" },
  civilservant: { cite: "พระราชบัญญัติระเบียบข้าราชการพลเรือน พ.ศ. 2551 (ราชกิจจานุเบกษา เล่ม 125 ตอนที่ 22 ก · 25 ม.ค. 2551)", by: "สำนักงานคณะกรรมการข้าราชการพลเรือน (สำนักงาน ก.พ. / OCSC)" },
  govemployee: { cite: "ระเบียบสำนักนายกรัฐมนตรีว่าด้วยพนักงานราชการ พ.ศ. 2547 (และที่แก้ไขเพิ่มเติม ฉบับที่ 2 พ.ศ. 2560)", by: "สำนักงาน ก.พ. (OCSC)" },
  info: { cite: "พระราชบัญญัติข้อมูลข่าวสารของราชการ พ.ศ. 2540", by: "สำนักงานคณะกรรมการข้อมูลข่าวสารของราชการ (สขร.) สำนักงานปลัดสำนักนายกรัฐมนตรี" },
  pdpa: { cite: "พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (ราชกิจจานุเบกษา เล่ม 136 ตอนที่ 69 ก · 27 พ.ค. 2562)", by: "สำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล (สคส./PDPC) กระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม" },
  procurement: { cite: "พระราชบัญญัติการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. 2560 (ราชกิจจานุเบกษา 24 ก.พ. 2560 · บังคับใช้ 23 ส.ค. 2560)", by: "กรมบัญชีกลาง กระทรวงการคลัง / สำนักงานคณะกรรมการกฤษฎีกา" },
  saraban: { cite: "ระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. 2526 และที่แก้ไขเพิ่มเติม (ฉบับที่ 4) พ.ศ. 2564 (ราชกิจจานุเบกษา เล่ม 138 ตอนพิเศษ 113 ง · 25 พ.ค. 2564)", by: "สำนักนายกรัฐมนตรี" },
  finance: { cite: "พระราชบัญญัติวินัยการเงินการคลังของรัฐ พ.ศ. 2561 (ราชกิจจานุเบกษา 19 เม.ย. 2561 · บังคับใช้ 20 เม.ย. 2561)", by: "สำนักงานการตรวจเงินแผ่นดิน / สำนักงานคณะกรรมการกฤษฎีกา / สำนักงานเศรษฐกิจการคลัง กระทรวงการคลัง" },
  strategy: { cite: "ประกาศ เรื่อง ยุทธศาสตร์ชาติ (พ.ศ. 2561-2580) ราชกิจจานุเบกษา เล่ม 135 ตอนพิเศษ 82 ก · 13 ต.ค. 2561 (ออกตาม พ.ร.บ.การจัดทำยุทธศาสตร์ชาติ พ.ศ. 2560)", by: "สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ (สศช.)" },
  computer: { cite: "พระราชบัญญัติว่าด้วยการกระทำความผิดเกี่ยวกับคอมพิวเตอร์ พ.ศ. 2550 และ (ฉบับที่ 2) พ.ศ. 2560 (ราชกิจจานุเบกษา เล่ม 134 ตอนที่ 10 ก · 24 ม.ค. 2560)", by: "สำนักงานพัฒนาธุรกรรมทางอิเล็กทรอนิกส์ (ETDA) และสำนักงานคณะกรรมการกฤษฎีกา" },
  local: { cite: "พ.ร.บ.อบจ. 2540 · เทศบาล 2496 · สภาตำบลและ อบต. 2537 · ระเบียบบริหารราชการ กทม. 2528 · เมืองพัทยา 2542 (และที่แก้ไขเพิ่มเติม)", by: "กรมส่งเสริมการปกครองท้องถิ่น / สำนักงานคณะกรรมการกฤษฎีกา" },
  education: { cite: "พระราชบัญญัติการศึกษาแห่งชาติ พ.ศ. 2542 (แก้ไขเพิ่มเติม ฉบับที่ 2-4 · พ.ศ. 2545/2553/2562) ราชกิจจานุเบกษา เล่ม 116 ตอนที่ 74 ก · 19 ส.ค. 2542", by: "กระทรวงศึกษาธิการ" },
};

let raw = fs.readFileSync(SPATH, "utf8");
let problems = [], plans = [];
window.STUDY_NOTES.filter((n) => /^law-/.test(n.id || "")).forEach((n) => {
  const bankId = n.id.replace("law-", "");
  const m = MAP[bankId];
  if (!m) { problems.push(bankId + ": no map"); return; }
  const oldBlock = n.blocks.find((b) => b.p && /อ้างอิง/.test(b.p));
  if (!oldBlock) { problems.push(bankId + ": no ref block"); return; }
  const url = (oldBlock.p.split("\n🔗 ")[1] || "").trim();
  const newBlock = { ref: { cite: m.cite, by: m.by, url: url } };
  const oldStr = JSON.stringify(oldBlock), newStr = JSON.stringify(newBlock);
  const cnt = raw.split(oldStr).length - 1;
  if (cnt !== 1) { problems.push(bankId + ": match count=" + cnt); return; }
  plans.push({ bankId, oldStr, newStr });
});

console.log("law cards to convert:", plans.length, "| problems:", problems.length ? problems : "NONE");
const mode = process.argv[2] || "dry";
if (mode === "apply") {
  if (problems.length) { console.log("ABORT"); process.exit(1); }
  plans.forEach((p) => { raw = raw.replace(p.oldStr, p.newStr); });
  fs.writeFileSync(SPATH, raw, "utf8");
  console.log("APPLIED", plans.length, "reference blocks");
}
