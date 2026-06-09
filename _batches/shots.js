/* แคปรูปหน้าจอแอป (Playwright) → เซฟไฟล์ PNG ที่ screenshots/ */
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const OUT = path.resolve(__dirname, "..", "screenshots");
fs.mkdirSync(OUT, { recursive: true });
const URL = "http://localhost:5500/index.html";

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#screen-home.active", { timeout: 15000 });
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
  await page.waitForTimeout(900); // โหลดฟอนต์

  const shot = async (name) => { await page.waitForTimeout(400); await page.screenshot({ path: path.join(OUT, name) }); console.log("saved", name); };

  // 1) หน้าแรก
  await shot("01-home.png");

  // 2) อ่านก่อน — การ์ดสรุปจำนวนข้อสอบ
  await page.click('[data-nav="study"]');
  await page.waitForFunction(() => { const e = document.getElementById("lib-total"); return e && e.textContent !== "0"; }, { timeout: 8000 });
  await shot("02-study-stats.png");

  // 3) สอบตามตำแหน่ง — 6 กลุ่ม
  await page.click('[data-nav="positions"]');
  await page.waitForSelector(".pos-group");
  await shot("03-positions.png");

  // 4) รายละเอียดตำแหน่ง — ภาค ข + ค (ไม่มี ภาค ก)
  await page.click(".pos-card");
  await page.waitForSelector("#pd-start");
  await shot("04-position-detail.png");
  await page.click("#posdetail-back");
  await page.waitForSelector("#screen-positions.active");
  await page.click('[data-nav="home"]');
  await page.waitForSelector("#screen-home.active");

  // 5) ทำข้อสอบ (ฝึกเร็ว 10 ข้อ) + ตอบ 1 ข้อ ให้เห็นปุ่มเฉลยปลดล็อก
  await page.click('[data-action="quick"]');
  await page.waitForSelector("#screen-quiz.active");
  await page.evaluate(() => document.querySelector("#choices .choice").click());
  await shot("05-quiz.png");

  // 6) ป๊อปอัปตรวจคำตอบก่อนส่ง (ยังไม่ครบ → ส่งไม่ได้)
  await page.evaluate(() => {
    const total = parseInt(document.getElementById("q-total").textContent, 10);
    for (let i = 0; i < total - 1; i++) document.getElementById("btn-next-top").click();
    document.getElementById("btn-next").click();
  });
  await page.waitForSelector("#check-modal.show");
  await shot("06-check.png");
  await page.evaluate(() => document.getElementById("check-modal").classList.remove("show"));

  // 7) สรุปผล — ตอบครบทุกข้อแล้วส่ง
  await page.evaluate(() => {
    const total = parseInt(document.getElementById("q-total").textContent, 10);
    for (let i = 0; i < total; i++) document.getElementById("btn-prev").click();
    for (let i = 0; i < total; i++) { const c = document.querySelector("#choices .choice"); if (c) c.click(); if (i < total - 1) document.getElementById("btn-next-top").click(); }
    document.getElementById("btn-next").click();
  });
  await page.waitForSelector("#ck-submit");
  await page.click("#ck-submit");
  await page.waitForSelector("#screen-summary.active");
  await shot("07-summary.png");

  // 8) บริจาค + ลิงก์ Facebook ผู้พัฒนา
  await page.evaluate(() => {
    if (!window.DONATE.developerFacebookName) { window.DONATE.developerFacebookName = "Satja Chaiseanpha"; window.DONATE.developerFacebookUrl = "https://www.facebook.com/search/top?q=Satja%20Chaiseanpha"; }
    document.querySelector('[data-action="donate"]').click();
  });
  await page.waitForSelector("#donate-modal.show");
  await page.waitForTimeout(700);
  await shot("08-donate.png");

  await browser.close();
  console.log("ALL DONE:", fs.readdirSync(OUT).filter((f) => f.endsWith(".png")).join(", "));
})().catch((e) => { console.error(e); process.exit(1); });
