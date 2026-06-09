const { chromium } = require("playwright");
const path = require("path");
const OUT = path.resolve(__dirname, "..", "screenshots");
const URL = "http://localhost:5500/index.html";
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const R = {};
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#screen-home.active");
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
  await page.waitForTimeout(900);

  // ปุ่มแยกปี
  R.hasYearCard = await page.evaluate(() => !!document.getElementById("toggle-years"));
  await page.click("#toggle-years");
  R.yearPickShows = await page.evaluate(() => document.getElementById("year-pick").classList.contains("show"));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT, "10-home-year.png") });

  // เริ่มข้อสอบปี 2568
  await page.click('[data-year="2568"]');
  await page.waitForSelector("#screen-quiz.active");
  R.yearTitle = await page.evaluate(() => document.querySelector(".topbar-title").childNodes[0].textContent.trim() + " | sub=" + document.getElementById("topbar-sub").textContent);
  R.yearTotal = await page.evaluate(() => document.getElementById("q-total").textContent);

  // ปุ่มคำใบ้
  R.hasHintBtn = await page.evaluate(() => !!document.getElementById("hint-btn"));
  await page.click("#hint-btn");
  R.hintShows = await page.evaluate(() => document.getElementById("hint-pop").classList.contains("show"));
  R.hintText = await page.evaluate(() => document.getElementById("hint-pop").textContent.slice(0, 50));
  await page.evaluate(() => document.querySelector("#choices .choice").click()); // ตอบข้อ 1 ไว้โชว์
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(OUT, "11-quiz-hint.png") });

  // ตอบครบ → ส่ง → เช็คโอเวอร์เลย์โหลด
  R.loadingShown = await page.evaluate(() => {
    const total = parseInt(document.getElementById("q-total").textContent, 10);
    for (let i = 0; i < total; i++) { const c = document.querySelector("#choices .choice"); if (c) c.click(); if (i < total - 1) document.getElementById("btn-next-top").click(); }
    document.getElementById("btn-next").click();
    document.getElementById("ck-submit").click();
    return document.getElementById("loading-overlay").classList.contains("show"); // ควร true ทันทีหลังส่ง
  });
  await page.waitForSelector("#screen-summary.active", { timeout: 4000 });
  await page.waitForTimeout(150);
  R.summaryDevText = await page.evaluate(() => { const e = document.querySelector(".summary-dev"); return e ? e.textContent.replace(/\s+/g, " ").trim().slice(0, 70) : "(none)"; });
  R.barsHaveDataW = await page.evaluate(() => [...document.querySelectorAll("#screen-summary .ana-bar i")].slice(0, 3).map((el) => el.getAttribute("data-w")));
  R.barsAnimatingNow = await page.evaluate(() => { const el = document.querySelector("#screen-summary .ana-bar i"); return el ? el.style.width : "(none)"; });
  await page.waitForTimeout(1100); // ให้กราฟวิ่งจบ
  await page.screenshot({ path: path.join(OUT, "12-summary-year.png") });
  R.barsAfterAnim = await page.evaluate(() => { const el = document.querySelector("#screen-summary .ana-bar i"); return el ? el.style.width : "(none)"; });

  console.log(JSON.stringify(R, null, 2));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
