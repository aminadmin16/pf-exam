/* ============================================================
   ตัวนับผู้เข้าใช้งานเว็บ PF แนวข้อสอบ กพ — Google Apps Script (ฟรี)
   ============================================================
   วิธีติดตั้ง (ทำครั้งเดียว ~3 นาที):
   1) สร้าง Google Sheet ใหม่ (ชีตเปล่า ๆ) — ตั้งชื่ออะไรก็ได้ เช่น "PF Visit Counter"
   2) ในชีตนั้น เมนูบน → Extensions ›  Apps Script
   3) ลบโค้ดเดิมทิ้งทั้งหมด แล้ว "วางโค้ดทั้งไฟล์นี้" ลงไป → กดบันทึก (รูปแผ่นดิสก์)
   4) กด Deploy › New deployment
        - ไอคอนเฟือง (Select type) → Web app
        - Description: PF Visit Counter
        - Execute as: Me (อีเมลของคุณ)
        - Who has access: Anyone   ← สำคัญมาก!
        - กด Deploy → อนุญาต (Allow) ถ้ามีหน้าจอขอสิทธิ์
   5) คัดลอก "Web app URL" (ลงท้ายด้วย /exec)
   6) เปิดไฟล์ donate-config.js ของเว็บ → วาง URL ที่ window.VISIT_COUNTER_URL
        เช่น  window.VISIT_COUNTER_URL = "https://script.google.com/macros/s/AKfycb..../exec";
   7) commit + deploy เว็บ → ตัวเลขจะขึ้นบนหน้าแรกอัตโนมัติ

   • จำนวนรวมเก็บใน Script Properties (เร็ว ไม่บวมชีต) และมิเรอร์ลงเซลล์ B1 ให้ดูเองในชีต
   • อยากรีเซ็ตเลข: ลบค่า VISIT_COUNT ใน Project Settings › Script properties หรือเรียก ?reset=YOURSECRET
   ============================================================ */

var RESET_SECRET = "";   // ตั้งรหัสไว้ถ้าอยากรีเซ็ตผ่านลิงก์ เช่น "pf2569" แล้วเรียก ...exec?reset=pf2569

function doGet(e) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(5000); } catch (err) {}
  var props = PropertiesService.getScriptProperties();
  var p = (e && e.parameter) || {};

  if (RESET_SECRET && p.reset === RESET_SECRET) {
    props.setProperty("VISIT_COUNT", "0");
  }

  var count = parseInt(props.getProperty("VISIT_COUNT") || "0", 10);

  if (p.hit === "1") {                      // นับเฉพาะตอน hit=1 (1 ครั้งต่อ session ของผู้ใช้)
    count += 1;
    props.setProperty("VISIT_COUNT", String(count));
    try {                                   // มิเรอร์ลงชีตให้ดูเองได้ (อัปเดตเซลล์เดิม ไม่เพิ่มแถว)
      var sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
      sh.getRange("A1").setValue("ผู้เข้าใช้งานทั้งหมด (ครั้ง)");
      sh.getRange("B1").setValue(count);
      sh.getRange("A2").setValue("อัปเดตล่าสุด");
      sh.getRange("B2").setValue(new Date());
    } catch (e2) {}
  }

  try { lock.releaseLock(); } catch (err) {}
  return ContentService
    .createTextOutput(JSON.stringify({ count: count }))
    .setMimeType(ContentService.MimeType.JSON);
}
