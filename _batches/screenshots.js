/* แคปหน้าจอระบบ 6 ภาพ บันทึกลงโฟลเดอร์ screenshots/ ด้วย Playwright */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const OUT = path.resolve(__dirname, "..", "screenshots");
const URL = "http://localhost:5500";

const CORRECT = `(() => {
  const qEl = document.getElementById('question-text'); const qt = qEl ? qEl.textContent.trim() : '';
  let correct = null; const pools = [window.QUESTIONS]; for (const b in (window.SPECIAL_BANKS||{})) pools.push(window.SPECIAL_BANKS[b]);
  for (const pool of pools){ for (const q of pool){ if ((q.question||'').trim() === qt){ correct = q.choices[q.answer]; break; } } if (correct!==null) break; }
  return correct;
})()`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 430, height: 920 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on("dialog", (d) => d.accept().catch(() => {}));
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);

  const topicNow = () => page.evaluate(`(() => { const qEl=document.getElementById('question-text'); const qt=qEl?qEl.textContent.trim():''; const pools=[window.QUESTIONS]; for(const b in (window.SPECIAL_BANKS||{}))pools.push(window.SPECIAL_BANKS[b]); for(const pool of pools){for(const q of pool){if((q.question||'').trim()===qt)return q.topic;}} return ''; })()`);
  const answer = (correct = true) => page.evaluate(`(() => { const want=${CORRECT}; const cs=[...document.querySelectorAll('#choices .choice')]; if(!cs.length)return; if(${correct}){ for(const c of cs){ if(c.querySelector('.c-text').textContent.trim()===want){c.click();return;} } cs[0].click(); } else { for(const c of cs){ if(c.querySelector('.c-text').textContent.trim()!==want){c.click();return;} } cs[0].click(); } })()`);
  const next = () => page.evaluate(`(() => { const n=document.getElementById('btn-next'); if(n)n.click(); })()`);
  const shot = async (name, full) => { await page.screenshot({ path: path.join(OUT, name), fullPage: !!full }); console.log("saved", name); };

  // 1) หน้าแรก
  await page.evaluate("window.scrollTo(0,0)");
  await shot("1-home.png", false);

  // เริ่มฝึกรายวิชา (วิเคราะห์) เพื่อเก็บข้อยาก ๆ
  await page.evaluate(`document.getElementById('toggle-subjects').click()`);
  await page.waitForTimeout(200);
  await page.evaluate(`document.querySelector('[data-subject="analytical"]').click()`);
  await page.waitForTimeout(500);

  const cap = { series: false, logic: false };
  for (let i = 0; i < 70 && (!cap.series || !cap.logic); i++) {
    const tp = await topicNow();
    if (tp === "อนุกรมตัวเลข" && !cap.series) { await answer(true); await page.waitForTimeout(400); await shot("2-series.png", true); cap.series = true; }
    else if ((tp === "การวิเคราะห์ข้อมูลจากตาราง" || tp === "เงื่อนไขสัญลักษณ์") && !cap.logic) { await answer(true); await page.waitForTimeout(400); await shot("3-logic.png", true); cap.logic = true; }
    await next(); await page.waitForTimeout(120);
  }

  // ออกกลับหน้าแรก → เปิดคลัง PDPA (ภาค ข) เก็บข้อกฎหมายที่น่าสนใจ
  await page.evaluate(`document.getElementById('btn-exit').click()`); await page.waitForTimeout(400);
  await page.evaluate(`(() => { const b=[...document.querySelectorAll('#partB-pick .special-btn')].find(x=>x.textContent.includes('PDPA')); if(b)b.click(); })()`);
  await page.waitForTimeout(500);
  // ข้ามไปข้อที่เป็นสถานการณ์/มีเฉลยยาว ๆ สักหน่อย
  await answer(true); await page.waitForTimeout(400); await shot("4-law-pdpa.png", true);

  // ออก → ทำข้อสอบเสมือนจริงครบ 100 ข้อ (ตอบถูกเกือบหมด เหลือพลาดนิดหน่อยให้ผลสวย + มีจุดให้เสริม)
  await page.evaluate(`document.getElementById('btn-exit').click()`); await page.waitForTimeout(400);
  await page.evaluate(`document.querySelector('[data-action="start-full"]').click()`); await page.waitForTimeout(400);
  for (let i = 0; i < 100; i++) { await answer(i % 13 !== 6); await next(); }
  await page.waitForTimeout(800);
  await shot("5-result-pass.png", true);
  try { const ana = await page.$("#analysis"); if (ana) { await ana.screenshot({ path: path.join(OUT, "6-analysis.png") }); console.log("saved 6-analysis.png"); } } catch (e) { console.log("analysis cap err", e.message); }

  await browser.close();
  console.log("DONE. files:", fs.readdirSync(OUT).join(", "));
})().catch((e) => { console.error("ERROR", e); process.exit(1); });
