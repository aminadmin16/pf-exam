/* ตรวจสอบ: (1) ไฟล์ parse ได้  (2) ทุกหมวด analytical ≥ 10  (3) เฉลยข้อใหม่ถูกต้อง */
const fs = require("fs");
const path = require("path");
const s = fs.readFileSync(path.join(__dirname, "..", "questions.js"), "utf8");
const win = {};
new Function("window", s)(win);

const A = win.QUESTIONS.filter((q) => q.subject === "analytical");
console.log("Part A total:", win.QUESTIONS.length, "| analytical:", A.length);

// (2) counts per topic
const counts = {};
A.forEach((q) => { counts[q.topic] = (counts[q.topic] || 0) + 1; });
const rows = Object.keys(counts).map((t) => [t, counts[t]]).sort((a, b) => b[1] - a[1]);
let under = 0;
console.log("\n== analytical topics (" + rows.length + ") ==");
rows.forEach(([t, c]) => { if (c < 10) under++; console.log((c < 10 ? "  ⚠ " : "    ") + c + "\t" + t); });
console.log(under === 0 ? "\n✅ ทุกหมวด ≥ 10 ข้อ" : "\n❌ ยังมี " + under + " หมวดที่ < 10");

// (3) verify the correct choice text for the new questions
const expect = {
  984: "75", 985: "100", 986: "27 ปี", 987: "65", 988: "16", 989: "34", 990: "6", 991: "60",
  992: "180", 993: "3", 994: "60", 995: "135", 996: "240", 997: "70", 998: "45", 999: "25",
  1000: "4", 1001: "2", 1002: "25", 1003: "2", 1004: "5",
  1005: "120", 1006: "30", 1007: "154", 1008: "125", 1009: "120",
  1010: "36", 1011: "12", 1012: "24", 1013: "12",
  1014: "40", 1015: "5", 1016: "8 : 15",
  1017: "ข ง ก ค", 1018: "มีโอกาสดีควรรีบทำหรือรีบใช้ให้เป็นประโยชน์",
  1019: "อนุญาต ลายเซ็น สังเกต", 1020: "พระภิกษุ 3 รูป", 1021: "เขาเดินทางกลับบ้าน"
};
const byId = {};
win.QUESTIONS.forEach((q) => { byId[q.id] = q; });
let bad = 0, checked = 0;
Object.keys(expect).forEach((id) => {
  const q = byId[id];
  if (!q) { console.log("❌ ไม่พบ id " + id); bad++; return; }
  checked++;
  const picked = q.choices[q.answer];
  const okLen = q.choices.length === 4;
  const okAns = picked === expect[id];
  if (!okAns || !okLen) { bad++; console.log("❌ id " + id + " answer=" + q.answer + " → '" + picked + "' (ควรเป็น '" + expect[id] + "')" + (okLen ? "" : " [choices≠4]")); }
});
console.log("\nตรวจเฉลยข้อใหม่: " + checked + " ข้อ, ผิด " + bad + (bad === 0 ? "  ✅ เฉลยถูกทุกข้อ" : "  ❌"));

// duplicate id check
const ids = win.QUESTIONS.map((q) => q.id);
const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
console.log("id ซ้ำ:", dup.length ? dup.join(",") : "ไม่มี");
