const fs = require("fs");
const out = "C:/Users/perap/AppData/Local/Temp/claude/D--02-Personal-Projects-PF-Examination/9b11dc0b-1bcd-40ca-bfb4-acca66f386d1/tasks/wm22dq1ic.output";
const raw = fs.readFileSync(out, "utf8");
const parsed = JSON.parse(raw.slice(raw.indexOf("{")));
const obj = parsed.result || parsed;
console.log("notes:", obj.notes.length);
fs.writeFileSync(__dirname + "/_laws.json", JSON.stringify(obj.notes, null, 1), "utf8");
obj.notes.forEach((n) => console.log(" -", n.bankId, "| points:", n.keyPoints.length, "| url:", n.sourceUrl ? "yes" : "NO"));
