/* แคปหน้าสรุปผล "ฝึกแยกรายวิชา" (สรุปคะแนนเฉพาะวิชา + วิเคราะห์ต่างหาก) */
const { chromium } = require("playwright");
const path = require("path");
const OUT = path.resolve(__dirname, "..", "screenshots");
const URL = "http://localhost:5500/index.html";
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#screen-home.active");
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
  await page.waitForTimeout(900);
  await page.evaluate(() => {
    document.getElementById("toggle-subjects").click();
    document.querySelector('[data-count="30"]').click();
    document.querySelector('[data-subject="analytical"]').click();
    const total = parseInt(document.getElementById("q-total").textContent, 10);
    for (let i = 0; i < total; i++) { const c = document.querySelector("#choices .choice"); if (c) c.click(); if (i < total - 1) document.getElementById("btn-next-top").click(); }
    document.getElementById("btn-next").click();
    document.getElementById("ck-submit").click();
  });
  await page.waitForSelector("#screen-summary.active");
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, "09-subject-summary.png") });
  console.log("saved 09-subject-summary.png");
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
