/* ============================================================
   ติวสอบราชการ ก.พ. ภาค ก/ข/ค — Application Logic
   ============================================================ */
(function () {
  "use strict";

  const LETTERS = ["A", "B", "C", "D", "E"];
  const HISTORY_KEY = "kp_exam_history_v1";
  const SPECIAL_PASS = 60;
  const NAV_SCREENS = { "screen-home": "home", "screen-study": "study", "screen-positions": "positions", "screen-history": "history" };

  /* ตำแหน่งราชการ จัดกลุ่มตามสายงาน → สอบ ภาค ข (ตามตำแหน่ง) + ภาค ค (ความเหมาะสม) — ไม่รวม ภาค ก
     แต่ละตำแหน่งมีไอคอนเฉพาะให้ตรงกับงาน */
  const POSITION_GROUPS = [
    { group: "ด้านการวางแผนและบริหารจัดการ", icon: "🗂️", positions: [
      { id: "plan", name: "นักวิเคราะห์นโยบายและแผน", icon: "🧭", banks: ["strategy", "constitution", "civilservant"] },
      { id: "finance", name: "นักวิชาการเงินและบัญชี", icon: "💰", banks: ["finance", "procurement"] },
      { id: "supply", name: "นักวิชาการพัสดุ", icon: "📦", banks: ["procurement", "finance"] },
      { id: "hr", name: "นักทรัพยากรบุคคล (งานบุคคล/HR)", icon: "🧑‍💼", banks: ["civilservant", "govemployee"] },
      { id: "audit", name: "นักวิชาการตรวจสอบภายใน", icon: "🔍", banks: ["finance", "procurement"] },
      { id: "landacq", name: "นักวิชาการจัดหาที่ดิน", icon: "📐", banks: ["procurement", "local", "constitution"] }
    ]},
    { group: "ด้านการศึกษา สังคม และศิลปวัฒนธรรม", icon: "🎓", positions: [
      { id: "edu", name: "นักวิชาการศึกษา", icon: "🎓", banks: ["education", "constitution"] },
      { id: "culture", name: "นักวิชาการวัฒนธรรม", icon: "🏺", banks: ["constitution", "civilservant", "saraban"] },
      { id: "religion", name: "นักวิชาการศาสนา", icon: "🛕", banks: ["constitution", "civilservant", "saraban"] },
      { id: "pr", name: "นักวิชาการเผยแพร่", icon: "📣", banks: ["info", "saraban", "civilservant"] },
      { id: "artmusic", name: "นักวิชาการละครและดนตรี", icon: "🎭", banks: ["constitution", "civilservant", "saraban"] }
    ]},
    { group: "ด้านวิทยาศาสตร์ เทคโนโลยี และสิ่งแวดล้อม", icon: "🔬", positions: [
      { id: "it", name: "นักวิชาการคอมพิวเตอร์", icon: "💻", banks: ["computer", "pdpa"] },
      { id: "env", name: "นักวิชาการสิ่งแวดล้อม", icon: "🌱", banks: ["constitution", "local", "strategy"] },
      { id: "sciservice", name: "นักวิชาการวิทยาศาสตร์บริการ", icon: "🔬", banks: ["civilservant", "strategy", "saraban"] },
      { id: "scientist", name: "นักวิทยาศาสตร์", icon: "🧪", banks: ["civilservant", "strategy", "saraban"] },
      { id: "statistics", name: "นักวิชาการสถิติ", icon: "📈", banks: ["info", "pdpa", "computer"] }
    ]},
    { group: "ด้านการเกษตร ที่ดิน และทรัพยากร", icon: "🌾", positions: [
      { id: "agri", name: "นักวิชาการเกษตร", icon: "🌾", banks: ["strategy", "local", "civilservant"] },
      { id: "landreform", name: "นักวิชาการปฏิรูปที่ดิน", icon: "🚜", banks: ["local", "procurement", "constitution"] },
      { id: "forest", name: "นักวิชาการป่าไม้", icon: "🌳", banks: ["local", "constitution", "strategy"] },
      { id: "fishery", name: "นักวิชาการประมง", icon: "🐟", banks: ["strategy", "local", "civilservant"] },
      { id: "land", name: "นักวิชาการที่ดิน", icon: "🗺️", banks: ["local", "procurement", "constitution"] }
    ]},
    { group: "ด้านสาธารณสุขและการแพทย์", icon: "🏥", positions: [
      { id: "health", name: "นักวิชาการสาธารณสุข", icon: "🏥", banks: ["civilservant", "constitution", "strategy"] },
      { id: "fda", name: "นักวิชาการอาหารและยา", icon: "💊", banks: ["civilservant", "info", "constitution"] },
      { id: "medtech", name: "นักเทคนิคการแพทย์", icon: "🧫", banks: ["civilservant", "constitution", "saraban"] },
      { id: "radio", name: "นักรังสีการแพทย์", icon: "🩻", banks: ["civilservant", "constitution", "saraban"] }
    ]},
    { group: "ด้านกฎหมายและการต่างประเทศ", icon: "⚖️", positions: [
      { id: "lawcouncil", name: "นักกฎหมายกฤษฎีกา", icon: "⚖️", banks: ["constitution", "civilservant", "procurement"] },
      { id: "justice", name: "นักวิชาการยุติธรรม", icon: "👨‍⚖️", banks: ["constitution", "civilservant", "info"] },
      { id: "foreign", name: "นักวิเทศสัมพันธ์", icon: "🌐", banks: ["constitution", "strategy", "civilservant"] }
    ]}
  ];
  const POSITIONS = [];
  POSITION_GROUPS.forEach((g) => g.positions.forEach((p) => POSITIONS.push({ id: p.id, name: p.name, banks: p.banks, group: g.group, icon: p.icon || g.icon })));

  let state = {
    kind: "kp", mode: "full", level: "undergrad", feedback: "instant",
    subjectKey: null, bankId: null, positionId: null, weakSource: null,
    title: "", questions: [], current: 0, answers: [], revealed: [],
    startTime: 0, elapsedSec: 0, finished: false
  };
  let currentLevel = "undergrad";
  let currentFeedback = "instant";
  let currentSource = "all";   // all = รวมข้อเก็ง 2569, real = เฉพาะข้อสอบจริง
  let currentSubjectCount = 30; // จำนวนข้อเมื่อฝึกแยกรายวิชา (20/30/40/50)
  let currentYearScope = "full"; // ข้อสอบจริงแยกปี: full | 20/30/40/50 | s_analytical/s_ethics/s_english
  let timerInterval = null;
  let reviewFilter = "all";
  let lastResult = null;

  const $ = (id) => document.getElementById(id);

  /* ---------- ยูทิลิตี้ ---------- */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function prepare(q) {
    const order = shuffle(q.choices.map((_, i) => i));
    return { ...q, choices: order.map((i) => q.choices[i]), answer: order.indexOf(q.answer) };
  }
  function critText(subj, level) {
    const pct = subj.passPercent[level] != null ? subj.passPercent[level] : subj.passPercent.undergrad;
    return "เกณฑ์การสอบผ่านต้องได้คะแนนไม่ต่ำกว่าร้อยละ " + pct + " (" + Math.round(subj.fullScore * pct / 100) + " คะแนนขึ้นไป)";
  }
  function levelLabel(l) { return l === "master" ? "ระดับ ป.โท" : "ระดับ ปวช./ปวส./ป.ตรี"; }
  function isSpecialQ(q) { return q.subject && q.subject.indexOf("special_") === 0; }
  function qColor(q) { if (isSpecialQ(q)) return "#7b61ff"; const s = window.SUBJECTS[q.subject]; return s ? s.color : "#7b61ff"; }
  function bankPart(b) { const m = window.SPECIAL_BANK_META[b]; return m ? m.part : "ข"; }
  function fmtTime(sec) { return String(Math.floor(sec / 60)).padStart(2, "0") + ":" + String(Math.floor(sec % 60)).padStart(2, "0"); }
  function escapeHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function hexToSoft(hex) { const c = hex.replace("#", ""); return "rgba(" + parseInt(c.substr(0, 2), 16) + "," + parseInt(c.substr(2, 2), 16) + "," + parseInt(c.substr(4, 2), 16) + ",0.12)"; }
  function toast(m) { const t = $("toast"); t.textContent = m; t.classList.add("show"); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("show"), 1800); }

  /* ---------- ธีม (สว่าง/มืด/อ่าน) ---------- */
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("kp_theme", t); } catch (e) {}
    document.querySelectorAll("[data-theme-set]").forEach((b) => b.classList.toggle("active", b.getAttribute("data-theme-set") === t));
  }

  /* ---------- ป๊อปอัปยืนยัน (แทน confirm ของระบบ) ---------- */
  function showConfirm(msg, onOk) {
    $("cf-msg").textContent = msg;
    const m = $("confirm-modal"), ok = $("cf-ok"), cancel = $("cf-cancel");
    const close = () => { m.classList.remove("show"); ok.onclick = null; cancel.onclick = null; };
    ok.onclick = () => { close(); if (onOk) onOk(); };
    cancel.onclick = close;
    m.classList.add("show");
  }

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    $(id).classList.add("active");
    const nav = $("bottom-nav");
    if (NAV_SCREENS[id]) { nav.style.display = "flex"; document.querySelectorAll(".nav-btn").forEach((b) => b.classList.toggle("active", b.getAttribute("data-nav") === NAV_SCREENS[id])); }
    else nav.style.display = "none";
    const fab = $("theme-fab"); if (fab) fab.style.display = (id === "screen-quiz") ? "none" : "";
    if (id === "screen-quiz") hideDlBanner();   // เริ่มทำข้อสอบแล้ว เก็บแบนเนอร์ชวนโหลดแอป
    const tm = $("theme-menu"); if (tm) tm.classList.remove("show");
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  /* ---------- อัตราการออก (ดาว) ---------- */
  function freqLabel(f) { return ["", "นาน ๆ ครั้ง", "ออกบ้าง", "ออกปานกลาง", "ออกบ่อย", "ออกเกือบทุกปี"][f] || "ออกปานกลาง"; }
  function freqHtml(q) {
    if (q.predicted) return '<span class="freq-badge pred">🔮 ข้อเก็งปี 2569 · คาดว่าจะออก</span>';
    if (q.freq) {
      let stars = "";
      for (let i = 1; i <= 5; i++) stars += (i <= q.freq ? "★" : "☆");
      const tail = q.freq >= 2 ? "ออกประมาณ " + ({ 5: "4", 4: "3", 3: "2", 2: "1" })[q.freq] + "/4 ปีล่าสุด" : "ออกนาน ๆ ครั้ง";
      return '<span class="freq-badge"><span class="stars">' + stars + "</span> " + freqLabel(q.freq) + " · " + tail + "</span>";
    }
    if (isSpecialQ(q) && bankPart(q.bank) === "ค") return '<span class="freq-badge skill">🧭 วัดความเหมาะสมกับตำแหน่ง (ภาค ค)</span>';
    return "";
  }

  /* ============================================================
     เริ่มทำข้อสอบ
     ============================================================ */
  function initSession() {
    state.current = 0;
    state.answers = new Array(state.questions.length).fill(null);
    state.revealed = new Array(state.questions.length).fill(false);
    state.finished = false; state.elapsedSec = 0; state.startTime = Date.now();
    startTimer(); showScreen("screen-quiz"); renderQuiz();
  }

  function srcFilter(list) { return currentSource === "real" ? list.filter((q) => !q.predicted) : list; }

  /* ลำดับหมวดของวิชาคิดวิเคราะห์ — ให้เรียงเหมือนสนามสอบจริง + จำนวนข้อในชุดเสมือนจริง (รวม 50) */
  const ANALYTICAL_CATS = [
    { n: 5,  m: (t) => t.indexOf("อนุกรม") === 0 },
    { n: 5,  m: (t) => t.indexOf("คณิตศาสตร์") === 0 || ["ร้อยละ", "กำไร-ขาดทุน", "ค่าเฉลี่ย", "อัตราเร็ว", "โจทย์อายุ", "อัตราส่วน"].indexOf(t) !== -1 },
    { n: 5,  m: (t) => t.indexOf("การวิเคราะห์ข้อมูล") === 0 },
    { n: 5,  m: (t) => t.indexOf("อุปมา") === 0 },
    { n: 10, m: (t) => t.indexOf("เงื่อนไขสัญลักษณ์") === 0 },
    { n: 5,  m: (t) => t.indexOf("เงื่อนไขภาษา") === 0 || t === "การสรุปเหตุผล" || t === "ตรรกศาสตร์" },
    { n: 5,  m: (t) => t.indexOf("ภาษาไทย:") === 0 && t.indexOf("จับใจความ") < 0 && t.indexOf("ตีความ") < 0 },
    { n: 10, m: (t) => t.indexOf("ภาษาไทย:") === 0 && (t.indexOf("จับใจความ") >= 0 || t.indexOf("ตีความ") >= 0) }
  ];
  function analyticalRank(t) { for (let i = 0; i < ANALYTICAL_CATS.length; i++) if (ANALYTICAL_CATS[i].m(t || "")) return i; return ANALYTICAL_CATS.length; }
  function orderByAnalyticalCat(list) { return list.slice().sort((a, b) => analyticalRank(a.topic) - analyticalRank(b.topic)); }
  function pickAnalyticalMock(pool, target) {  // เลือกตามจำนวนแต่ละหมวด แล้วเรียงตามหมวด
    const used = new Set(); const out = [];
    ANALYTICAL_CATS.forEach((c) => { shuffle(pool.filter((q) => !used.has(q) && c.m(q.topic || ""))).slice(0, c.n).forEach((q) => { used.add(q); out.push(q); }); });
    if (out.length < target) orderByAnalyticalCat(shuffle(pool.filter((q) => !used.has(q)))).slice(0, target - out.length).forEach((q) => { used.add(q); out.push(q); });
    return orderByAnalyticalCat(out);
  }

  /* ลำดับหมวดวิชาภาษาอังกฤษ (ตามผังข้อสอบจริง) + จำนวนข้อ (รวม 25) */
  const ENGLISH_CATS = [
    { n: 5,  m: (t) => t.indexOf("Conversation") === 0 },
    { n: 5,  m: (t) => t.indexOf("Grammar") === 0 },
    { n: 5,  m: (t) => t.indexOf("Vocabulary") === 0 },
    { n: 10, m: (t) => t.indexOf("Reading") === 0 }
  ];
  function englishRank(t) { for (let i = 0; i < ENGLISH_CATS.length; i++) if (ENGLISH_CATS[i].m(t || "")) return i; return ENGLISH_CATS.length; }
  function orderByEnglishCat(list) { return list.slice().sort((a, b) => englishRank(a.topic) - englishRank(b.topic)); }
  function pickEnglishMock(pool, target) {
    const used = new Set(); const out = [];
    ENGLISH_CATS.forEach((c) => { shuffle(pool.filter((q) => !used.has(q) && c.m(q.topic || ""))).slice(0, c.n).forEach((q) => { used.add(q); out.push(q); }); });
    if (out.length < target) orderByEnglishCat(shuffle(pool.filter((q) => !used.has(q)))).slice(0, target - out.length).forEach((q) => { used.add(q); out.push(q); });
    return orderByEnglishCat(out);
  }

  function buildCore(mode, subjectKey, count) {
    let set = [];
    if (mode === "full") {
      // เสมือนจริง: เรียงตามวิชา 1.วิเคราะห์ → 2.จริยธรรม → 3.อังกฤษ (ไม่สลับข้ามวิชา); วิเคราะห์จัดตามหมวด
      const bp = window.EXAM_BLUEPRINT || { analytical: 50, ethics: 25, english: 25 };
      window.SUBJECT_ORDER.forEach((k) => {
        const pool = srcFilter(window.QUESTIONS.filter((q) => q.subject === k));
        if (k === "analytical") set = set.concat(pickAnalyticalMock(pool, bp.analytical || 50));
        else if (k === "english") set = set.concat(pickEnglishMock(pool, bp.english || 25));
        else set = set.concat(shuffle(pool).slice(0, Math.min(bp[k] || pool.length, pool.length)));
      });
    } else if (mode === "subject") {
      let pool = shuffle(srcFilter(window.QUESTIONS.filter((q) => q.subject === subjectKey)));
      if (count) pool = pool.slice(0, count);
      set = subjectKey === "analytical" ? orderByAnalyticalCat(pool) : subjectKey === "english" ? orderByEnglishCat(pool) : pool;   // วิเคราะห์/อังกฤษ เรียงตามหมวด
    } else if (mode === "quick") set = shuffle(srcFilter(window.QUESTIONS)).slice(0, 10);
    else if (mode === "predicted") set = shuffle(window.QUESTIONS.filter((q) => q.predicted));
    return set.map(prepare);
  }
  function startCore(mode, subjectKey, count) {
    state.kind = "kp"; state.mode = mode; state.subjectKey = subjectKey || null; state.count = count || null; state.bankId = null; state.positionId = null; state.weakSource = null; state.level = currentLevel; state.feedback = currentFeedback;
    state.questions = buildCore(mode, subjectKey, count);
    if (!state.questions.length) { toast("ยังไม่มีข้อสอบในหมวดนี้"); return; }
    state.title = mode === "subject" ? "ฝึกรายวิชา: " + window.SUBJECTS[subjectKey].name + (state.questions.length ? " (" + state.questions.length + " ข้อ)" : "")
      : mode === "quick" ? "ฝึกเร็ว 10 ข้อ (คละวิชา)"
        : mode === "predicted" ? "ข้อสอบเก็ง 2569 (คาดการณ์)" : "ข้อสอบเสมือนจริง (ครบทุกวิชา)";
    initSession();
  }
  function startYear(year, scope) {
    // ข้อสอบจริงแยกปี — เลือกได้: เต็มทั้งปี / สุ่ม N ข้อ / เจาะวิชาเดียว
    scope = scope || currentYearScope;
    const yp = (sub) => window.QUESTIONS.filter((q) => !q.predicted && q.year === year && (!sub || q.subject === sub));
    state.year = year; state.yearScope = scope; state.bankId = null; state.positionId = null; state.weakSource = null; state.level = currentLevel; state.feedback = currentFeedback;
    if (scope.indexOf("s_") === 0) {                 // เจาะวิชาเดียวของปีนั้น → สรุปแบบรายวิชา
      const sub = scope.slice(2);
      state.kind = "kp"; state.mode = "year-subject"; state.subjectKey = sub; state.count = null;
      let pool = shuffle(yp(sub));
      pool = sub === "analytical" ? orderByAnalyticalCat(pool) : sub === "english" ? orderByEnglishCat(pool) : pool;
      if (!pool.length) { toast("ยังไม่มีข้อสอบวิชานี้ของปี " + year); return; }
      state.questions = pool.map(prepare);
      state.title = "ข้อสอบจริง ปี " + year + " — " + window.SUBJECTS[sub].name;
    } else if (/^\d+$/.test(scope)) {                // สุ่ม N ข้อ คละวิชาของปีนั้น → สรุปตามที่สุ่มมา
      state.kind = "kp"; state.mode = "year-sample"; state.subjectKey = null; state.count = parseInt(scope, 10);
      const pool = shuffle(yp(null)).slice(0, parseInt(scope, 10));
      if (!pool.length) { toast("ยังไม่มีข้อสอบจริงของปี " + year); return; }
      state.questions = pool.map(prepare);
      state.title = "ข้อสอบจริง ปี " + year + " — สุ่ม " + state.questions.length + " ข้อ";
    } else {                                         // เต็มทั้งปี (เสมือนจริง ภาค ก) → สรุป 3 วิชา
      state.kind = "kp"; state.mode = "year"; state.subjectKey = null; state.count = null;
      const bp = window.EXAM_BLUEPRINT || { analytical: 50, ethics: 25, english: 25 };
      let set = [];
      window.SUBJECT_ORDER.forEach((k) => {
        const all = yp(k), picked = shuffle(all).slice(0, Math.min(bp[k] || all.length, all.length));
        set = set.concat(k === "analytical" ? orderByAnalyticalCat(picked) : k === "english" ? orderByEnglishCat(picked) : picked);
      });
      if (!set.length) { toast("ยังไม่มีข้อสอบจริงของปี " + year); return; }
      state.questions = set.map(prepare);
      state.title = "ข้อสอบจริง ปี " + year + " (เต็มทั้งปี)";
    }
    initSession();
  }
  function startSpecial(bankId) {
    const meta = window.SPECIAL_BANK_META[bankId]; if (!meta) return;
    state.kind = "special"; state.mode = "special"; state.bankId = bankId; state.subjectKey = null; state.positionId = null; state.weakSource = null; state.level = currentLevel; state.feedback = currentFeedback;
    state.questions = shuffle(srcFilter(window.SPECIAL_BANKS[bankId] || [])).map(prepare);
    state.title = meta.name;
    initSession();
  }
  function startPosition(posId) {
    const pos = POSITIONS.find((p) => p.id === posId); if (!pos) return;
    let set = [];
    const per = Math.max(1, Math.ceil(20 / pos.banks.length));   // ภาค ข ~20 ข้อ (ตามตำแหน่ง ไม่รวม ภาค ก)
    pos.banks.forEach((b) => { set = set.concat(shuffle(srcFilter(window.SPECIAL_BANKS[b] || [])).slice(0, per)); });
    const cpool = shuffle(srcFilter((window.SPECIAL_BANKS.sjt_service || []).concat(window.SPECIAL_BANKS.sjt_integrity || [])));
    set = set.concat(cpool.slice(0, 10));   // ภาค ค ~10 ข้อ
    state.kind = "position"; state.mode = "position"; state.positionId = posId; state.bankId = null; state.subjectKey = null; state.weakSource = null; state.level = currentLevel; state.feedback = currentFeedback;
    state.questions = shuffle(set).map(prepare);
    state.title = "ชุดจำลองตามตำแหน่ง: " + pos.name;
    initSession();
  }
  function startWeakFrom(src) {
    let pool;
    if (src.kind === "special" && src.bankId) pool = window.SPECIAL_BANKS[src.bankId] || [];
    else if (src.kind === "position") { pool = window.QUESTIONS.slice(); (window.SPECIAL_BANK_ORDER || []).forEach((b) => { pool = pool.concat(window.SPECIAL_BANKS[b] || []); }); }
    else pool = window.QUESTIONS;
    const set = shuffle(srcFilter(pool.filter((q) => src.topics.indexOf(q.topic) !== -1))).slice(0, 20).map(prepare);
    if (!set.length) { toast("ไม่พบข้อสอบในหัวข้อที่ต้องเสริม"); return; }
    state.kind = "special"; state.mode = "weak"; state.bankId = null; state.subjectKey = null; state.positionId = null; state.weakSource = src; state.level = currentLevel; state.feedback = currentFeedback;
    state.questions = set; state.title = "ทบทวนเรื่องที่ยังควรเสริมให้ดีขึ้น";
    initSession();
  }

  function startTimer() { clearInterval(timerInterval); timerInterval = setInterval(() => { state.elapsedSec = Math.floor((Date.now() - state.startTime) / 1000); $("timer").textContent = "⏱ " + fmtTime(state.elapsedSec); }, 1000); }
  function stopTimer() { clearInterval(timerInterval); }

  /* ---------- คำใบ้ (ไกด์) รายข้อ — มีทุกหมวด ทุกข้อ ---------- */
  const HINT_BY_TOPIC = {
    "อนุกรมตัวเลข": "หาความสัมพันธ์ของตัวเลขที่ติดกัน (บวก ลบ คูณ หาร หรือยกกำลัง) บางชุดสลับฟันปลาทีละ 2 ชั้น",
    "อนุกรมตัวอักษร": "แปลงตัวอักษรเป็นลำดับที่ (ก=1, ข=2 / A=1) แล้วหาแพทเทิร์นเหมือนอนุกรมตัวเลข",
    "อนุกรมตัวเลขหลายชุด": "ลองแยกตำแหน่งคี่/คู่ออกจากกัน อาจเป็นคนละแพทเทิร์น",
    "เงื่อนไขสัญลักษณ์": "แปลงสัญลักษณ์เป็นเครื่องหมาย >,<,=,≥,≤ แล้วไล่เชื่อมโยงทีละทอด ระวังเครื่องหมายผสม",
    "เงื่อนไขภาษา": "จัดกลุ่มเงื่อนไขเป็นตาราง/ผัง แล้วเลือกข้อที่ 'จริงแน่นอน' เท่านั้น",
    "การวิเคราะห์ข้อมูลจากตาราง": "อ่านหัวตารางและหน่วยให้ชัด คำนวณเฉพาะช่องที่โจทย์ถาม อย่าเผลอรวมทั้งหมด",
    "การวิเคราะห์ข้อมูล": "ดูแนวโน้ม ผลรวม และร้อยละจากข้อมูลที่ให้ เทียบเฉพาะสิ่งที่ถาม",
    "อุปมาอุปไมย": "หา 'ความสัมพันธ์' ของคู่แรกก่อน (หน้าที่/ประเภท/ส่วนประกอบ) แล้วหาคู่หลังที่สัมพันธ์แบบเดียวกัน",
    "การสรุปเหตุผล": "ดูว่าข้อสรุปตามมาจากเงื่อนไขที่ให้จริงไหม ระวังคำว่า 'ทั้งหมด/บางส่วน'",
    "ตรรกศาสตร์": "ใช้หลัก ถ้า-แล้ว และนิเสธให้ครบ ระวังการสลับเหตุกับผล",
    "ภาษาไทย: การจับใจความ": "อ่านคำถามก่อนแล้วค่อยกวาดหาคำตอบในบทความ ระวังตัวเลือกที่ 'จริงแต่ไม่ตรงคำถาม'",
    "ภาษาไทย: การตีความเชิงวิเคราะห์": "จับเจตนาและน้ำเสียงของผู้เขียน ไม่ใช่แค่ความหมายตรงตัว",
    "ภาษาไทย: การเรียงประโยค": "หาประโยคเปิด (ใจความหลัก) ก่อน แล้วไล่ตามเหตุ-ผล/ลำดับเวลา",
    "ภาษาไทย: เรียงลำดับประโยค": "หาประโยคเปิดก่อน แล้วเชื่อมด้วยคำเชื่อม (ดังนั้น เพราะ ต่อมา)",
    "ภาษาไทย: การใช้ภาษา": "เลือกคำให้ถูกตามบริบทและระดับภาษา ระวังคำฟุ่มเฟือย/กำกวม",
    "ภาษาไทย: คำและสำนวน": "นึกถึงความหมายโดยนัยของสำนวน ไม่ใช่ความหมายตรงตัว",
    "ภาษาไทย: สำนวน": "สำนวนเน้นความหมายแฝง ลองแทนสถานการณ์จริงดู",
    "ภาษาไทย: สำนวนสุภาษิต": "จับใจความสอนใจของสุภาษิต แล้วจับคู่กับสถานการณ์",
    "ภาษาไทย: การสะกดคำ": "ระวังการันต์ สระ และตัวสะกดมาตราเดียวกัน"
  };
  const HINT_MATH = "ตั้งสมการจากสิ่งที่โจทย์ให้ ระวังหน่วยและคำว่า 'มากกว่า/น้อยกว่า/ของ' แล้วแทนค่ากลับไปตรวจ";
  const HINT_ENG = {
    "Grammar & Structure": "ดูโครงสร้างประโยคและ tense ที่ช่องว่างต้องการ ตัดตัวเลือกที่ผิดรูปออกก่อน",
    "Grammar: Tense": "ดูคำบอกเวลา (yesterday, since, already) เพื่อเลือก tense ให้ถูก",
    "Reading Comprehension": "อ่านคำถามก่อน แล้วสแกนหาคีย์เวิร์ดในบทความ ระวังคำพ้องความหมาย",
    "Vocabulary & Expression": "เดาจากบริบทรอบคำ และดูรากศัพท์/คำเชื่อม",
    "Vocabulary: Synonym": "หาคำที่ความหมายใกล้ที่สุดในบริบทนั้น",
    "Vocabulary: Antonym": "หาคำที่ความหมายตรงข้ามในบริบทนั้น",
    "Conversation": "นึกถึงสถานการณ์จริงและมารยาทการสนทนา เลือกประโยคที่ตอบรับเป็นธรรมชาติ"
  };
  const HINT_BY_BANK = {
    constitution: "นึกถึงอำนาจ 3 ฝ่าย จำนวน/วาระขององค์กร และสิทธิเสรีภาพหลักในรัฐธรรมนูญ 2560",
    civilservant: "ทบทวนการบรรจุ-แต่งตั้ง โทษวินัย 5 สถาน และการอุทธรณ์/ร้องทุกข์ ตาม พ.ร.บ. 2551",
    govemployee: "พนักงานราชการต่างจากข้าราชการ ดูประเภท สัญญาจ้าง และสิทธิประโยชน์",
    info: "ยึดหลัก 'เปิดเผยเป็นหลัก ปกปิดเป็นข้อยกเว้น' และสิทธิรับรู้ข้อมูลของประชาชน",
    pdpa: "จำฐานการประมวลผล ความยินยอม สิทธิเจ้าของข้อมูล และการแจ้งเหตุละเมิด 72 ชม.",
    procurement: "วิธีจัดซื้อ 3 วิธี หลักความคุ้มค่า/โปร่งใส และวงเงินที่ใช้แต่ละวิธี",
    saraban: "ชนิดหนังสือราชการ 6 ชนิด ชั้นความลับ/ความเร็ว และการเก็บ-ทำลายหนังสือ",
    finance: "หลักวินัยการเงินการคลัง การงบประมาณ และความรับผิดของเจ้าหน้าที่",
    strategy: "ยุทธศาสตร์ชาติ 20 ปี มี 6 ด้าน เชื่อมกับแผนแม่บทและเป้าหมายการพัฒนา",
    computer: "ฐานความผิดมาตรา 5-16 โดยเฉพาะการเข้าถึงโดยมิชอบ และข้อมูลอันเป็นเท็จ (ม.14)",
    local: "รูปแบบ อปท. (อบจ./เทศบาล/อบต. + พิเศษ กทม./พัทยา) อำนาจหน้าที่ และการกระจายอำนาจ",
    education: "ความมุ่งหมาย/แนวจัดการศึกษา สิทธิทางการศึกษา และระบบประกันคุณภาพ",
    sjt_service: "เลือกทางที่ 'บริการดี + ถูกระเบียบ + รักษาทีม' อย่าเลือกทางที่เอาง่ายเข้าว่า",
    sjt_integrity: "ยึดความซื่อสัตย์ โปร่งใส และประโยชน์ส่วนรวมก่อนเสมอ เลี่ยงผลประโยชน์ทับซ้อน",
    interview: "ตอบให้เห็นทัศนคติบวก ความรับผิดชอบ และความเข้าใจบทบาทราชการ"
  };
  function hintFor(q) {
    if (isSpecialQ(q)) return HINT_BY_BANK[q.bank] || "ทบทวนหลักการสำคัญของหัวข้อนี้ แล้วตัดตัวเลือกที่ขัดหลักการออก";
    const t = q.topic || "";
    if (t.indexOf("คณิตศาสตร์") === 0 || ["ร้อยละ", "กำไร-ขาดทุน", "ค่าเฉลี่ย", "อัตราเร็ว", "โจทย์อายุ", "อัตราส่วน"].indexOf(t) !== -1) return HINT_MATH;
    if (HINT_BY_TOPIC[t]) return HINT_BY_TOPIC[t];
    if (q.subject === "english") return HINT_ENG[t] || "อ่านบริบทรอบช่องว่าง ตัดตัวเลือกที่ผิดไวยากรณ์/ความหมายออกก่อน";
    if (q.subject === "ethics") return "ยึดหลักธรรมาภิบาล จริยธรรมข้าราชการ และประโยชน์ส่วนรวมเป็นที่ตั้ง";
    return "อ่านโจทย์ให้ครบ จับคีย์เวิร์ด แล้วตัดตัวเลือกที่ไม่เกี่ยวออกทีละข้อ";
  }
  function toggleHint() { const p = $("hint-pop"), b = $("hint-btn"); const show = !p.classList.contains("show"); p.classList.toggle("show", show); b.classList.toggle("active", show); }

  /* ---------- อนิเมชั่นหน้าสรุป (เลขนับขึ้น + กราฟวิ่งจาก 0) ---------- */
  function countUp(el, to, suffix) {
    if (!el) return; const dur = 850, start = performance.now();
    const step = (now) => { const p = Math.min(1, (now - start) / dur); el.textContent = Math.round(to * (p * (2 - p))) + (suffix || ""); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  function animateSummary() {
    const r = lastResult; if (!r) return;
    document.querySelectorAll("#screen-summary .ana-bar i").forEach((el) => { const w = el.getAttribute("data-w"); if (w != null) { el.style.width = "0%"; requestAnimationFrame(() => { el.style.width = w + "%"; }); } });
    countUp($("meta-percent"), r.pct || 0, "%");
    if (r.kind !== "kp") countUp($("ss-pct"), r.pct || 0, "%");
  }

  /* ============================================================
     แสดงข้อสอบ
     ============================================================ */
  function renderQuiz() {
    const q = state.questions[state.current], total = state.questions.length, idx = state.current;
    $("q-index").textContent = idx + 1; $("q-total").textContent = total;
    $("progress-fill").style.width = ((idx + 1) / total * 100) + "%";

    const chip = $("subject-chip"), yc = $("year-chip");
    if (isSpecialQ(q)) {
      const m = window.SPECIAL_BANK_META[q.bank];
      chip.style.background = hexToSoft("#7b61ff"); chip.style.color = "#7b61ff";
      $("subject-chip-text").textContent = m ? m.icon + " " + m.short : "เฉพาะทาง";
      yc.style.display = "none";
    } else {
      const subj = window.SUBJECTS[q.subject];
      chip.style.background = hexToSoft(subj.color); chip.style.color = subj.color;
      $("subject-chip-text").textContent = "วิชา: " + subj.name;
      yc.style.display = ""; yc.textContent = q.predicted ? "🔮 เก็ง 2569" : "ปี " + q.year; yc.classList.toggle("predicted", !!q.predicted);
    }
    $("freq-row").innerHTML = freqHtml(q);

    const pas = $("passage");
    if (q.passage) { pas.style.display = "block"; pas.textContent = q.passage; } else pas.style.display = "none";
    const qt = $("question-text"); qt.textContent = q.question; qt.classList.toggle("has-list", /\n/.test(q.question));
    $("hint-pop").textContent = hintFor(q); $("hint-pop").classList.remove("show"); $("hint-btn").classList.remove("active");

    renderChoices();
    $("btn-prev").disabled = idx === 0; $("btn-next-top").disabled = idx === total - 1;
    $("btn-prev2").disabled = idx === 0;

    const examMode = state.feedback === "end";
    $("topbar-sub").textContent = examMode ? "โหมดเสมือนสอบจริง (เฉลยตอนจบ)" : "โหมดฝึก (เฉลยทันที)";
    $("btn-explain").style.display = examMode ? "none" : "";
    $("btn-check").style.display = "";
    $("btn-next").textContent = idx === total - 1 ? "📋 ตรวจ & ส่งคำตอบ" : "ข้อต่อไป ❯";

    const rev = state.revealed[idx] && !examMode;
    $("explanation-body").innerHTML = '<div class="q-recap">เฉลยละเอียด:</div>' + escapeHtml(q.explanation);
    $("explanation").classList.toggle("show", rev);
    $("btn-explain").classList.toggle("open", rev);
    syncExplainBtn();
  }
  function renderChoices() {
    const q = state.questions[state.current], idx = state.current, chosen = state.answers[idx], rev = state.revealed[idx], box = $("choices");
    box.innerHTML = "";
    q.choices.forEach((text, i) => {
      const b = document.createElement("button"); b.className = "choice";
      b.innerHTML = '<span class="letter">' + LETTERS[i] + '</span><span class="c-text">' + escapeHtml(text) + '</span><span class="mark"></span>';
      if (rev) { b.classList.add("disabled"); if (i === q.answer) { b.classList.add("correct"); b.querySelector(".mark").textContent = "✓"; } else if (i === chosen) { b.classList.add("wrong"); b.querySelector(".mark").textContent = "✗"; } }
      else if (i === chosen) b.classList.add("selected");
      b.addEventListener("click", () => selectChoice(i));
      box.appendChild(b);
    });
  }
  function selectChoice(i) {
    const idx = state.current;
    if (state.revealed[idx]) return;                            // กดดูเฉลยแล้ว → ล็อก แก้ไขไม่ได้
    state.answers[idx] = i; renderChoices(); syncExplainBtn();  // เลือก/เปลี่ยนได้อิสระจนกว่าจะกดดูเฉลย
  }
  function syncExplainBtn() {
    const be = $("btn-explain"); if (!be || be.style.display === "none") return;
    const i = state.current, answered = state.answers[i] !== null, rev = state.revealed[i];
    const locked = !answered && !rev;
    be.classList.toggle("locked", locked);
    be.disabled = locked;   // ยังไม่ตอบ → กดไม่ได้จริง ๆ
    be.textContent = rev ? "ซ่อนเฉลย ⌄" : (answered ? "อ่านเฉลยละเอียด ⌃" : "🔒 ตอบคำถามก่อน จึงจะดูเฉลยได้");
  }
  function toggleExplanation() {
    const i = state.current;
    if (state.answers[i] === null) { toast("เลือกคำตอบก่อน แล้วจึงดูเฉลยได้"); return; }
    state.revealed[i] = !state.revealed[i]; renderQuiz();
  }
  function go(d) { const n = state.current + d; if (n < 0 || n >= state.questions.length) return; state.current = n; renderQuiz(); }
  function onNext() {
    if (state.current === state.questions.length - 1) openCheck();   // ข้อสุดท้ายของทุกแบบทดสอบ → ป๊อปอัปตรวจก่อนส่ง
    else go(1);
  }

  /* ============================================================
     คำนวณผล + วิเคราะห์
     ============================================================ */
  function topicStats() {
    const t = {};
    state.questions.forEach((q, i) => { const k = q.topic || "(อื่น ๆ)"; if (!t[k]) t[k] = { correct: 0, total: 0 }; t[k].total++; if (state.answers[i] === q.answer) t[k].correct++; });
    return t;
  }
  function analyze(t) {
    const arr = Object.keys(t).map((k) => ({ topic: k, correct: t[k].correct, total: t[k].total, pct: t[k].total ? Math.round(t[k].correct / t[k].total * 100) : 0 }));
    const strong = arr.filter((x) => x.pct >= 80).sort((a, b) => b.pct - a.pct);
    const weak = arr.filter((x) => x.pct < 60).sort((a, b) => a.pct - b.pct);
    let targets = weak.map((x) => x.topic);
    if (!targets.length) targets = arr.filter((x) => x.pct < 100).sort((a, b) => a.pct - b.pct).slice(0, 2).map((x) => x.topic);
    return { all: arr, strong: strong, weak: weak, targets: targets };
  }
  function computeResult() {
    const ana = analyze(topicStats());
    if (state.kind === "special") {
      let c = 0; state.questions.forEach((q, i) => { if (state.answers[i] === q.answer) c++; });
      const total = state.questions.length, pct = total ? Math.round(c / total * 100) : 0;
      return { kind: "special", bankId: state.bankId, correct: c, total: total, pct: pct, pass: pct >= SPECIAL_PASS, topics: ana };
    }
    if (state.kind === "position") {
      let c = 0; const part = { "ข": { c: 0, t: 0 }, "ค": { c: 0, t: 0 } };
      state.questions.forEach((q, i) => {
        const ok = state.answers[i] === q.answer; if (ok) c++;
        const p = bankPart(q.bank); if (part[p]) { part[p].t++; if (ok) part[p].c++; }
      });
      const total = state.questions.length, pct = total ? Math.round(c / total * 100) : 0;
      return { kind: "position", positionId: state.positionId, correct: c, total: total, pct: pct, pass: pct >= SPECIAL_PASS, part: part, topics: ana };
    }
    if (state.mode === "quick" || state.mode === "year-sample") {
      // ฝึกเร็ว / สุ่มตามปี → สรุปตามข้อ/หมวดที่สุ่มมาเท่านั้น (ไม่ใช่ตาราง 3 วิชา)
      let c = 0; state.questions.forEach((q, i) => { if (state.answers[i] === q.answer) c++; });
      const total = state.questions.length, pct = total ? Math.round(c / total * 100) : 0;
      return { kind: "sample", correct: c, total: total, pct: pct, pass: pct >= 60, topics: ana };
    }
    if ((state.mode === "subject" || state.mode === "year-subject") && state.subjectKey) {
      // ฝึกแยกรายวิชา → สรุปคะแนนเฉพาะวิชานั้นต่างหาก (ไม่ใช่ตาราง ก.พ. 3 วิชา)
      const subj = window.SUBJECTS[state.subjectKey];
      let c = 0; state.questions.forEach((q, i) => { if (state.answers[i] === q.answer) c++; });
      const total = state.questions.length, pct = total ? Math.round(c / total * 100) : 0;
      const passPct = subj.passPercent[state.level] != null ? subj.passPercent[state.level] : subj.passPercent.undergrad;
      return { kind: "subject", subjectKey: state.subjectKey, subjectName: subj.name, correct: c, total: total, pct: pct, passPct: passPct, pass: pct >= passPct, topics: ana };
    }
    const result = {};
    window.SUBJECT_ORDER.forEach((k) => { result[k] = { correct: 0, total: 0 }; });
    state.questions.forEach((q, i) => { const r = result[q.subject]; if (!r) return; r.total++; if (state.answers[i] === q.answer) r.correct++; });
    let tc = 0, tq = 0;
    window.SUBJECT_ORDER.forEach((k) => {
      const r = result[k], subj = window.SUBJECTS[k];
      const pct = subj.passPercent[state.level] != null ? subj.passPercent[state.level] : subj.passPercent.undergrad;
      r.score = r.total ? (r.correct / r.total) * subj.fullScore : 0; r.fullScore = subj.fullScore;
      r.passNeed = subj.fullScore * pct / 100; r.pass = r.total > 0 && r.score >= r.passNeed; r.present = r.total > 0;
      tc += r.correct; tq += r.total;
    });
    const present = Object.values(result).filter((r) => r.present);
    const overallPass = present.length > 0 && present.every((r) => r.pass);
    const fullTotal = window.SUBJECT_ORDER.reduce((s, k) => s + (result[k].present ? result[k].fullScore : 0), 0);
    const gotTotal = window.SUBJECT_ORDER.reduce((s, k) => s + (result[k].present ? result[k].score : 0), 0);
    return { kind: "kp", result: result, correct: tc, total: tq, overallPass: overallPass, pct: fullTotal ? Math.round(gotTotal / fullTotal * 100) : 0, topics: ana };
  }

  function finishExam() {
    state.finished = true; stopTimer();
    const res = computeResult(); renderSummary(res); saveAttempt(res);
    const sum = $("screen-summary");
    sum.classList.add("loading");          // เข้าหน้าสรุปเลย แล้วโชว์เป็นเงา + สปินเนอร์บนหน้าเดียวกัน
    showScreen("screen-summary");
    setTimeout(() => { sum.classList.remove("loading"); animateSummary(); }, 1200);  // หมดเวลา → เฉลย + อนิเมชั่นวิ่ง
  }

  function renderSummary(res) {
    lastResult = res;
    const isKp = res.kind === "kp";
    $("summary-sub").textContent = (isKp || res.kind === "subject") ? state.title + " · " + levelLabel(state.level) : state.title;
    const pass = isKp ? res.overallPass : res.pass;
    const banner = $("overall-banner"); banner.className = "overall-banner " + (pass ? "pass" : "fail");
    if (res.kind === "sample") {
      $("overall-big").textContent = "ทำได้ " + res.pct + "%";
      $("overall-small").textContent = res.pct >= 80 ? "เยี่ยมมาก! 🎉 แม่นขึ้นเรื่อย ๆ" : res.pct >= 60 ? "ทำได้ดี ลองอีกชุดได้เลย" : "ทบทวนเฉลยแล้วลองใหม่นะ เดี๋ยวก็ขึ้น 💪";
    } else {
      $("overall-big").textContent = pass ? "🎉 ผ่านเกณฑ์" : "ยังไม่ผ่านเกณฑ์";
      $("overall-small").textContent = pass ? "ยอดเยี่ยมมาก! ทำได้ตามเกณฑ์" : "ทบทวนเฉลยแล้วลองใหม่อีกครั้งนะ";
    }

    $("kp-result").style.display = isKp ? "" : "none";
    $("special-result").style.display = isKp ? "none" : "";
    $("part-breakdown").style.display = res.kind === "position" ? "" : "none";

    if (isKp) {
      const tb = $("result-tbody"); tb.innerHTML = "";
      window.SUBJECT_ORDER.forEach((key) => {
        const subj = window.SUBJECTS[key], r = res.result[key];
        const gc = !r.present ? "" : (r.pass ? "got-pass" : "got-fail"), got = r.present ? r.score.toFixed(2) : "–";
        const tr = document.createElement("tr");
        tr.innerHTML = '<td class="col-subject"><div class="subj-name">' + subj.no + ". " + escapeHtml(subj.name) + '</div><div class="subj-crit">' + escapeHtml(critText(subj, state.level)) + '</div></td><td class="num">' + subj.fullScore.toFixed(2) + '</td><td class="num ' + gc + '">' + got + "</td>";
        tb.appendChild(tr);
      });
    } else {
      let name, passLabel = "เกณฑ์ " + SPECIAL_PASS + "%";
      if (res.kind === "position") { const p = POSITIONS.find((x) => x.id === res.positionId); name = p ? p.icon + " " + p.name : state.title; }
      else if (res.kind === "subject") { name = "📚 " + res.subjectName; passLabel = "เกณฑ์ผ่าน " + res.passPct + "% (" + levelLabel(state.level) + ")"; }
      else if (res.kind === "sample") { name = "📝 " + state.title; }
      else { const m = window.SPECIAL_BANK_META[res.bankId]; name = m ? m.icon + " " + m.name : state.title; }
      $("ss-name").textContent = name;
      $("ss-got").textContent = res.correct; $("ss-total").textContent = res.total; $("ss-pct").textContent = "0%";
      const sp = $("ss-pass");
      if (res.kind === "sample") sp.textContent = "ตอบถูก " + res.correct + " จาก " + res.total + " ข้อ";
      else sp.textContent = (res.pass ? "ผ่าน" : "ไม่ผ่าน") + " (" + passLabel + ")";
      sp.className = "ss-pass " + (res.pass ? "pass" : "fail");
      if (res.kind === "position") {
        const labels = { "ข": "ภาค ข เฉพาะตำแหน่ง", "ค": "ภาค ค ความเหมาะสม" };
        $("pb-rows").innerHTML = ["ข", "ค"].map((p) => '<div class="pb-row"><span>' + labels[p] + '</span><b>' + res.part[p].c + "/" + res.part[p].t + "</b></div>").join("");
      }
    }
    $("meta-correct").textContent = res.correct + "/" + res.total; $("meta-percent").textContent = "0%"; $("meta-time").textContent = fmtTime(state.elapsedSec);

    const isWeak = state.mode === "weak" && state.weakSource && state.weakSource.baseline;
    $("improvement").style.display = isWeak ? "" : "none";
    if (isWeak) renderImprovement(res);

    renderAnalysis(res);
  }
  function renderImprovement(res) {
    const baseline = state.weakSource.baseline;
    const cur = {};
    (res.topics.all || []).forEach((x) => { cur[x.topic] = x; });
    let rows = "", deltas = [];
    Object.keys(baseline).forEach((t) => {
      const c = cur[t]; if (!c) return;
      const before = baseline[t].pct, after = c.pct, d = after - before;
      deltas.push(d);
      const cls = d > 0 ? "up" : (d < 0 ? "down" : "same");
      const arrow = d > 0 ? "↑" : (d < 0 ? "↓" : "→");
      rows += '<div class="imp-row"><span class="imp-t">' + escapeHtml(t) + '</span>' +
        '<span class="imp-vals"><b class="old">' + before + "%</b> → <b class=\"new " + cls + "\">" + after + "%</b>" +
        '<span class="imp-d ' + cls + '">' + arrow + " " + (d > 0 ? "+" : "") + d + "%</span></span></div>";
    });
    $("imp-rows").innerHTML = rows || '<div class="ana-empty">— ไม่มีข้อมูลเปรียบเทียบ</div>';
    let msg;
    if (!deltas.length) msg = "";
    else {
      const avg = Math.round(deltas.reduce((a, b) => a + b, 0) / deltas.length);
      const up = deltas.filter((d) => d > 0).length;
      if (avg > 0) msg = "🎉 เยี่ยมมาก! เรื่องที่เสริมทำได้ดีขึ้นเฉลี่ย <b>+" + avg + "%</b> (ดีขึ้น " + up + "/" + deltas.length + " เรื่อง) สู้ต่อไป!";
      else if (avg === 0) msg = "คะแนนเฉลี่ยเท่าเดิม — ลองอ่านเฉลยให้ละเอียดแล้วทบทวนอีกครั้งนะ เดี๋ยวก็ขึ้น 💪";
      else msg = "รอบนี้เฉลี่ยลดลง " + avg + "% ไม่เป็นไร การทบทวนซ้ำช่วยให้จำแม่นขึ้น ลองอีกครั้งได้เลย 💪";
    }
    $("imp-overall").innerHTML = msg;
  }
  function renderAnalysis(res) {
    const ana = res.topics;
    const row = (x, cls) => '<div class="ana-item"><div class="ana-top"><span>' + escapeHtml(x.topic) + '</span><b class="' + cls + '">' + x.pct + "% (" + x.correct + "/" + x.total + ")</b></div><div class=\"ana-bar\"><i class=\"" + cls + "\" style=\"width:0\" data-w=\"" + x.pct + "\"></i></div></div>";
    $("ana-strong").innerHTML = ana.strong.length ? ana.strong.slice(0, 6).map((x) => row(x, "good")).join("") : '<div class="ana-empty">— ยังไม่มีหัวข้อที่ทำได้ ≥ 80%</div>';
    $("ana-weak").innerHTML = ana.weak.length ? ana.weak.slice(0, 6).map((x) => row(x, "bad")).join("") : '<div class="ana-empty">— ไม่มีเรื่องที่ต้องเสริมเพิ่ม เยี่ยมมาก!</div>';
    const reco = $("ana-reco"), btn = $("btn-weak");
    if (ana.targets.length) {
      reco.innerHTML = "เรื่องที่ยังควรเสริมให้ดีขึ้น: <b>" + ana.targets.slice(0, 5).map(escapeHtml).join(", ") + "</b><br>อยากลองทบทวนเรื่องเหล่านี้ให้แน่นขึ้นไหม?";
      btn.style.display = ""; btn.textContent = "📝 ทดสอบเรื่องที่ยังควรเสริม (" + ana.targets.length + " เรื่อง)";
    } else { reco.innerHTML = "🎉 เก่งมาก! คุณทำได้ดีในทุกหัวข้อ ลองทำชุดใหม่เพื่อรักษาฟอร์มได้เลย"; btn.style.display = "none"; }
  }

  /* ============================================================
     ประวัติ
     ============================================================ */
  function loadHistory() { try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch (e) { return []; } }
  function saveHistory(a) { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(a)); } catch (e) {} }
  function saveAttempt(res) {
    const now = new Date();
    const e = {
      date: now.toISOString(), dateLabel: now.toLocaleString("th-TH", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      kind: res.kind, mode: state.mode, level: state.level, title: state.title, elapsedSec: state.elapsedSec,
      totalCorrect: res.correct, totalQ: res.total, pct: res.pct, overallPass: res.kind === "kp" ? res.overallPass : res.pass,
      weak: (res.topics && res.topics.weak) ? res.topics.weak.slice(0, 10).map((x) => x.topic) : []
    };
    if (res.kind === "kp") e.subjects = window.SUBJECT_ORDER.map((k) => { const r = res.result[k]; return { key: k, present: r.present, fullScore: r.fullScore, score: r.score, pass: r.pass }; });
    const h = loadHistory(); h.unshift(e); saveHistory(h.slice(0, 60));
  }
  function renderHistory() {
    const body = $("history-body"), hist = loadHistory();
    if (!hist.length) { body.innerHTML = '<div class="empty-state"><div class="e-ico">📭</div>ยังไม่มีประวัติการทำข้อสอบ<br>เริ่มทำข้อสอบครั้งแรกได้เลย!</div>'; return; }

    // ---- สรุป/วิเคราะห์จากสถิติย้อนหลัง ----
    const n = hist.length;
    let passCount = 0, pctSum = 0;
    const subjAgg = {}, weakCount = {};
    hist.forEach((h) => {
      if (h.overallPass) passCount++;
      const pct = h.pct != null ? h.pct : (h.totalQ ? Math.round(h.totalCorrect / h.totalQ * 100) : 0);
      pctSum += pct;
      (h.subjects || []).forEach((s) => { if (s.present) { const p = s.fullScore ? (s.score / s.fullScore * 100) : 0; (subjAgg[s.key] = subjAgg[s.key] || { sum: 0, n: 0 }); subjAgg[s.key].sum += p; subjAgg[s.key].n++; } });
      (h.weak || []).forEach((t) => { weakCount[t] = (weakCount[t] || 0) + 1; });
    });
    const avgPct = Math.round(pctSum / n), passRate = Math.round(passCount / n * 100);
    const topWeak = Object.keys(weakCount).sort((a, b) => weakCount[b] - weakCount[a]).slice(0, 6);
    let weakSubjKey = null, weakSubjPct = 101;
    Object.keys(subjAgg).forEach((k) => { const a = subjAgg[k].sum / subjAgg[k].n; if (a < weakSubjPct) { weakSubjPct = a; weakSubjKey = k; } });
    let trendHtml = "";
    if (n >= 2) {
      const avg = (arr) => { let s = 0; arr.forEach((h) => { s += (h.pct != null ? h.pct : (h.totalQ ? h.totalCorrect / h.totalQ * 100 : 0)); }); return arr.length ? s / arr.length : 0; };
      const half = Math.ceil(n / 2), d = Math.round(avg(hist.slice(0, half)) - avg(hist.slice(half)));
      trendHtml = d > 2 ? '<span class="trend up">📈 พัฒนาขึ้น +' + d + '% เทียบช่วงก่อนหน้า</span>'
        : d < -2 ? '<span class="trend down">📉 ลดลง ' + d + '% — กลับมาโฟกัสอีกครั้งนะ</span>'
        : '<span class="trend">➡️ ผลค่อนข้างคงที่</span>';
    }
    const subjBars = window.SUBJECT_ORDER.filter((k) => subjAgg[k]).map((k) => {
      const a = Math.round(subjAgg[k].sum / subjAgg[k].n), subj = window.SUBJECTS[k], cls = a >= 60 ? "good" : "bad";
      return '<div class="hs-bar"><div class="hs-bar-top"><span>' + escapeHtml(subj.name) + '</span><b class="' + cls + '">' + a + '%</b></div><div class="ana-bar"><i class="' + cls + '" style="width:' + a + '%"></i></div></div>';
    }).join("");
    let reco = "";
    if (weakSubjKey) reco += "ควรเน้น <b>" + escapeHtml(window.SUBJECTS[weakSubjKey].name) + "</b> (เฉลี่ย " + Math.round(weakSubjPct) + "%) ที่ยังต่ำสุด<br>";
    if (topWeak.length) reco += "เรื่องที่พลาดบ่อย: <b>" + topWeak.slice(0, 5).map(escapeHtml).join(", ") + "</b>";
    if (!reco) reco = "ทำได้ดีมาก! ทำต่อเนื่องเพื่อรักษาฟอร์ม 💪";
    const chips = topWeak.length ? '<div class="hs-chips">' + topWeak.map((t) => '<span class="hs-chip">' + escapeHtml(t) + "</span>").join("") + "</div>" : "";
    const weakBtn = topWeak.length ? '<button class="btn btn-primary" id="hist-weak-btn">📝 ฝึกเรื่องที่ควรเสริม (รวมจากประวัติ)</button>' : "";

    body.innerHTML =
      '<div class="hist-summary"><h3>📊 สรุปพัฒนาการจากประวัติของคุณ</h3>' +
      '<div class="hs-stats"><div class="hs-stat"><div class="v">' + n + '</div><div class="l">ครั้งที่ทำ</div></div>' +
      '<div class="hs-stat"><div class="v">' + passRate + '%</div><div class="l">สอบผ่าน</div></div>' +
      '<div class="hs-stat"><div class="v">' + avgPct + '%</div><div class="l">คะแนนเฉลี่ย</div></div></div>' +
      (trendHtml ? '<div class="hs-trend">' + trendHtml + '</div>' : "") +
      (subjBars ? '<div class="hs-section-t">คะแนนเฉลี่ยรายวิชา</div>' + subjBars : "") +
      (chips ? '<div class="hs-section-t">เรื่องที่ควรเสริม (พลาดบ่อย)</div>' + chips : "") +
      '<div class="hs-reco">💡 ' + reco + '</div>' + weakBtn + '</div>' +
      '<div class="hs-section-t" style="margin:18px 4px 8px">📋 รายการที่ทำทั้งหมด</div>';

    if (topWeak.length) { const wb = $("hist-weak-btn"); if (wb) wb.addEventListener("click", () => startWeakFrom({ topics: topWeak, kind: "position" })); }

    hist.forEach((h) => {
      const card = document.createElement("div"); card.className = "history-card";
      const head = '<div class="h-top"><div><div class="h-date">' + escapeHtml(h.dateLabel) + '</div><div class="h-mode">' + escapeHtml(h.title) + " · ตอบถูก " + h.totalCorrect + "/" + h.totalQ + " · " + fmtTime(h.elapsedSec) + '</div></div><span class="h-badge ' + (h.overallPass ? "pass" : "fail") + '">' + (h.overallPass ? "ผ่าน" : "ไม่ผ่าน") + "</span></div>";
      if (h.kind === "kp") {
        let rows = "";
        (h.subjects || []).forEach((s) => {
          const subj = window.SUBJECTS[s.key], gc = !s.present ? "" : (s.pass ? "got-pass" : "got-fail"), got = s.present ? s.score.toFixed(2) : "–";
          rows += '<tr><td class="col-subject"><div class="subj-name">' + subj.no + ". " + escapeHtml(subj.name) + '</div><div class="subj-crit">' + escapeHtml(critText(subj, h.level || "undergrad")) + "</div></td><td class=\"num\">" + subj.fullScore.toFixed(2) + "</td><td class=\"num " + gc + "\">" + got + "</td></tr>";
        });
        card.innerHTML = head + '<table class="result-table"><thead><tr><th class="col-subject">วิชาที่สอบ</th><th class="col-w">คะแนน<br>เต็ม</th><th class="col-w">คะแนน<br>ที่ได้</th></tr></thead><tbody>' + rows + "</tbody></table>";
      } else {
        const pct = h.pct != null ? h.pct : Math.round(h.totalCorrect / h.totalQ * 100);
        card.innerHTML = head + '<div class="h-simple">คะแนน ' + h.totalCorrect + "/" + h.totalQ + " (" + pct + "%)</div>";
      }
      body.appendChild(card);
    });
  }

  /* ============================================================
     อ่านก่อนสอบ (สรุป + ทริค)
     ============================================================ */
  function fmtNote(s) {
    return escapeHtml(s).replace(/==(.+?)==/g, "<mark>$1</mark>").replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  }
  function fillLibStats() {
    const el = $("lib-total"); if (!el) return;
    const partA = window.QUESTIONS.length;
    let partB = 0, partC = 0, pred = window.QUESTIONS.filter((q) => q.predicted).length;
    (window.SPECIAL_BANK_ORDER || []).forEach((b) => {
      const list = window.SPECIAL_BANKS[b] || [], m = window.SPECIAL_BANK_META[b] || {};
      if (m.part === "ค") partC += list.length; else partB += list.length;
      pred += list.filter((q) => q.predicted).length;
    });
    el.textContent = (partA + partB + partC).toLocaleString("th-TH");
    $("lib-break").innerHTML =
      '<span class="lib-chip pa">ภาค ก ' + partA + " ข้อ</span>" +
      '<span class="lib-chip pb">ภาค ข ' + partB + " ข้อ</span>" +
      '<span class="lib-chip pc">ภาค ค ' + partC + " ข้อ</span>" +
      '<span class="lib-chip pp">🔮 เก็ง 2569 ' + pred + " ข้อ</span>";
  }
  /* คลังข้อสอบ — กดดูรายละเอียดแต่ละหมวด (พับเก็บไว้ก่อน เปิดดูได้ทีละกลุ่ม) */
  function libRows(items) {
    return items.map((it) => '<div class="lib-row"><span class="lib-row-name">' + escapeHtml(it.name) + '</span><span class="lib-row-num">' + it.count.toLocaleString("th-TH") + ' ข้อ</span></div>').join("");
  }
  function renderLibraryGroups() {
    const host = $("lib-groups"); if (!host) return;
    const partA = window.QUESTIONS || [];
    // ภาค ก → แยกตามวิชา แล้วลงลึกเป็นหมวด (topic)
    const subjOrder = window.SUBJECT_ORDER || ["analytical", "ethics", "english"];
    const aGroups = subjOrder.map((key) => {
      const qs = partA.filter((q) => q.subject === key);
      const tmap = {};
      qs.forEach((q) => { const t = q.topic || "อื่น ๆ"; tmap[t] = (tmap[t] || 0) + 1; });
      const topics = Object.keys(tmap).map((t) => ({ name: t, count: tmap[t] })).sort((a, b) => b.count - a.count);
      return { name: (window.SUBJECTS[key] ? window.SUBJECTS[key].name : key), count: qs.length, topics };
    });
    const partAtotal = partA.length;
    // ภาค ข / ค → แยกตามคลังกฎหมาย/ชุดข้อสอบ
    const bBanks = [], cBanks = [];
    (window.SPECIAL_BANK_ORDER || []).forEach((b) => {
      const list = window.SPECIAL_BANKS[b] || [], m = window.SPECIAL_BANK_META[b] || {};
      const item = { name: (m.icon ? m.icon + " " : "") + (m.short || m.name || b), count: list.length };
      if (m.part === "ค") cBanks.push(item); else bBanks.push(item);
    });
    const bTotal = bBanks.reduce((s, x) => s + x.count, 0), cTotal = cBanks.reduce((s, x) => s + x.count, 0);
    const grand = partAtotal + bTotal + cTotal;

    const subjAcc = (g) => '<div class="lib-sub">'
      + '<button class="lib-sub-head" data-libtoggle><span class="lib-sub-name">' + escapeHtml(g.name) + '</span>'
      + '<span class="lib-sub-meta">' + g.count.toLocaleString("th-TH") + ' ข้อ <span class="lib-chev">▾</span></span></button>'
      + '<div class="lib-sub-body">' + libRows(g.topics) + '</div></div>';

    const accGroup = (cls, chip, title, total, bodyHtml) => '<div class="lib-acc ' + cls + '">'
      + '<button class="lib-acc-head" data-libtoggle><span class="lib-eye">👁</span>'
      + '<span class="lib-acc-title"><b>' + chip + '</b> ' + title + '</span>'
      + '<span class="lib-acc-count">' + total.toLocaleString("th-TH") + ' ข้อ <span class="lib-chev">▾</span></span></button>'
      + '<div class="lib-acc-body">' + bodyHtml + '</div></div>';

    host.innerHTML =
      '<div class="lib-groups-cap">👁 รวมทั้งหมด <b>' + grand.toLocaleString("th-TH") + ' ข้อ</b> · แตะแต่ละหมวดเพื่อดูว่ามีอะไรบ้าง กี่ข้อ</div>'
      + accGroup("pa", "ภาค ก", "ความรู้ความสามารถทั่วไป", partAtotal, aGroups.map(subjAcc).join(""))
      + accGroup("pb", "ภาค ข", "ความรู้เฉพาะตำแหน่ง", bTotal, libRows(bBanks))
      + accGroup("pc", "ภาค ค", "ความเหมาะสมกับตำแหน่ง", cTotal, libRows(cBanks));

    host.querySelectorAll("[data-libtoggle]").forEach((btn) => btn.addEventListener("click", () => btn.parentElement.classList.toggle("open")));
  }
  function renderStudy() {
    fillLibStats();
    renderLibraryGroups();
    const body = $("study-body"); body.innerHTML = "";
    (window.STUDY_NOTES || []).forEach((n) => {
      const card = document.createElement("div");
      card.className = "study-card" + (n.pinned ? " open" : "");
      let inner = "";
      (n.blocks || []).forEach((b) => {
        if (b.trick) inner += '<div class="study-trick">💡 ' + fmtNote(b.trick) + "</div>";
        else if (b.p) inner += '<p class="study-p">' + fmtNote(b.p) + "</p>";
        else if (b.h) inner += '<div class="study-h">' + fmtNote(b.h) + '</div><ul class="study-ul">' + (b.points || []).map((p) => "<li>" + fmtNote(p) + "</li>").join("") + "</ul>";
      });
      card.innerHTML = '<button class="study-head"><span class="sh-ic">' + n.icon + '</span><span class="sh-t">' + escapeHtml(n.title) + "</span>" + (n.tag ? '<span class="sh-tag">' + escapeHtml(n.tag) + "</span>" : "") + '<span class="sh-arrow">⌄</span></button><div class="study-inner">' + inner + "</div>";
      card.querySelector(".study-head").addEventListener("click", () => card.classList.toggle("open"));
      body.appendChild(card);
    });
  }

  /* ============================================================
     สอบตามตำแหน่ง
     ============================================================ */
  function renderPositions() {
    const body = $("positions-body"); body.innerHTML = "";
    POSITION_GROUPS.forEach((g) => {
      const sec = document.createElement("div"); sec.className = "pos-group";
      sec.innerHTML = '<div class="pos-group-h"><span class="pg-ic">' + g.icon + '</span>' + escapeHtml(g.group) + '</div>';
      g.positions.forEach((p) => {
        const banks = p.banks.map((b) => window.SPECIAL_BANK_META[b].short).join(" · ");
        const card = document.createElement("button"); card.className = "pos-card";
        card.innerHTML = '<div class="pos-ic">' + (p.icon || g.icon) + '</div><div class="pos-tx"><b>' + escapeHtml(p.name) + '</b><span>ภาค ข: ' + escapeHtml(banks) + '</span></div><div class="arrow">›</div>';
        card.addEventListener("click", () => openPosition(p.id));
        sec.appendChild(card);
      });
      body.appendChild(sec);
    });
  }
  function openPosition(id) {
    const p = POSITIONS.find((x) => x.id === id); if (!p) return;
    $("posdetail-title").textContent = p.icon + " " + p.name;
    const chip = (b) => { const m = window.SPECIAL_BANK_META[b]; return '<button class="pd-chip" data-bank="' + b + '">' + m.icon + " " + escapeHtml(m.short) + ' <i>' + m.count + ' ข้อ</i></button>'; };
    const cBanks = ["sjt_service", "sjt_integrity", "interview"];
    $("position-detail").innerHTML =
      '<div class="pd-intro">ตำแหน่ง <b>' + escapeHtml(p.name) + '</b> เน้นสอบ <b>ภาค ข</b> (ความรู้เฉพาะตำแหน่ง) และ <b>ภาค ค</b> (ความเหมาะสมกับตำแหน่ง) ดังนี้</div>' +
      '<div class="pd-block"><div class="pd-h"><span class="pchip pb">ภาค ข</span> ความรู้เฉพาะตำแหน่งนี้</div><div class="pd-chips">' + p.banks.map(chip).join("") + '</div></div>' +
      '<div class="pd-block"><div class="pd-h"><span class="pchip pc">ภาค ค</span> ความเหมาะสมกับตำแหน่ง</div><div class="pd-chips">' + cBanks.map(chip).join("") + '</div></div>' +
      '<div class="pd-prop">📊 ชุดจำลองตามตำแหน่ง: ภาค ข ~20 · ภาค ค ~10 (รวม ~30 ข้อ)</div>' +
      '<button class="btn btn-primary" id="pd-start">▶ เริ่มชุดจำลองตามตำแหน่งนี้</button>';
    $("position-detail").querySelectorAll(".pd-chip[data-bank]").forEach((el) => el.addEventListener("click", () => startSpecial(el.getAttribute("data-bank"))));
    $("pd-start").addEventListener("click", () => startPosition(id));
    showScreen("screen-position-detail");
  }

  /* ============================================================
     ทบทวนเฉลย
     ============================================================ */
  function renderReview() {
    const body = $("review-body"); body.innerHTML = "";
    state.questions.forEach((q, i) => {
      const chosen = state.answers[i], isCorrect = chosen === q.answer, answered = chosen !== null;
      if (reviewFilter === "wrong" && isCorrect) return;
      if (reviewFilter === "correct" && !isCorrect) return;
      const card = document.createElement("div"); card.className = "review-card" + (isCorrect ? "" : " is-wrong");
      const color = qColor(q);
      const ylab = isSpecialQ(q) ? "" : (q.predicted ? '<span class="rc-year predicted">🔮 เก็ง 2569</span>' : '<span class="rc-year">ปี ' + q.year + "</span>");
      const fr = freqHtml(q);
      const your = answered ? '<div class="rc-ans">คำตอบของคุณ: <span class="' + (isCorrect ? "ok" : "no") + '">' + LETTERS[chosen] + ". " + escapeHtml(q.choices[chosen]) + "</span></div>" : '<div class="rc-ans">คำตอบของคุณ: <span class="no">ไม่ได้ตอบ</span></div>';
      const correct = '<div class="rc-ans">เฉลยที่ถูก: <span class="ok">' + LETTERS[q.answer] + ". " + escapeHtml(q.choices[q.answer]) + "</span></div>";
      card.innerHTML =
        '<div class="rc-top"><span class="rc-no">ข้อ ' + (i + 1) + '</span><span class="rc-tag" style="background:' + hexToSoft(color) + ";color:" + color + '">' + escapeHtml(q.topic || "") + "</span>" + ylab + '<span class="rc-status ' + (isCorrect ? "ok" : "no") + '">' + (isCorrect ? "ถูก ✓" : "ผิด ✗") + "</span></div>" +
        (fr ? '<div class="rc-freq">' + fr + "</div>" : "") +
        (q.passage ? '<div class="rc-pass">' + escapeHtml(q.passage) + "</div>" : "") +
        '<div class="rc-q">' + escapeHtml(q.question) + "</div>" + your + correct +
        '<div class="rc-exp">💡 ' + escapeHtml(q.explanation) + "</div>";
      body.appendChild(card);
    });
    if (!body.children.length) body.innerHTML = '<div class="empty-state"><div class="e-ico">✨</div>ไม่มีข้อในหมวดนี้</div>';
  }

  /* ---------- นำทาง ---------- */
  function confirmExit() { if (state.finished) { goHome(); return; } showConfirm("ต้องการออกจากการทำข้อสอบหรือไม่?\nความคืบหน้าจะไม่ถูกบันทึก", () => { stopTimer(); goHome(); }); }
  function goHome() { stopTimer(); showScreen("screen-home"); }
  function retry() {
    if (state.mode === "weak" && state.weakSource) startWeakFrom(state.weakSource);
    else if (state.kind === "position") startPosition(state.positionId);
    else if (state.kind === "special") startSpecial(state.bankId);
    else if (state.mode.indexOf("year") === 0) startYear(state.year, state.yearScope);
    else startCore(state.mode, state.subjectKey, state.count);
  }

  /* ============================================================
     บริจาค / สนับสนุน (สร้าง PromptPay QR อัตโนมัติ)
     ============================================================ */
  function ppField(id, val) { return id + String(val.length).padStart(2, "0") + val; }
  function ppCRC(s) { let c = 0xFFFF; for (let i = 0; i < s.length; i++) { c ^= s.charCodeAt(i) << 8; for (let j = 0; j < 8; j++) { c = (c & 0x8000) ? ((c << 1) ^ 0x1021) : (c << 1); c &= 0xFFFF; } } return c.toString(16).toUpperCase().padStart(4, "0"); }
  function ppTarget(id) {
    const s = String(id).replace(/[^0-9]/g, "");
    if (s.length >= 15) return ppField("03", s);
    if (s.length === 13) return ppField("02", s);
    let p = "66" + s.replace(/^0/, ""); p = p.padStart(13, "0");
    return ppField("01", p);
  }
  function promptPayPayload(id, amount) {
    const merchant = ppField("29", ppField("00", "A000000677010111") + ppTarget(id));
    let s = ppField("00", "01") + ppField("01", amount ? "12" : "11") + merchant + ppField("53", "764");
    if (amount) s += ppField("54", Number(amount).toFixed(2));
    s += ppField("58", "TH");
    s += "6304"; s += ppCRC(s);
    return s;
  }
  let _qrState = 0; const _qrCbs = [];
  function ensureQRLib(cb) {
    if (typeof window.qrcode === "function") return cb();
    _qrCbs.push(cb);
    if (_qrState === 1) return;
    _qrState = 1;
    const tryLoad = (srcs) => {
      if (!srcs.length) { _qrState = 0; _qrCbs.splice(0).forEach((f) => f(new Error("qr"))); return; }
      const sc = document.createElement("script");
      sc.src = srcs[0];
      sc.onload = () => { if (typeof window.qrcode === "function") { _qrState = 2; _qrCbs.splice(0).forEach((f) => f()); } else tryLoad(srcs.slice(1)); };
      sc.onerror = () => tryLoad(srcs.slice(1));
      document.head.appendChild(sc);
    };
    tryLoad(["vendor/qrcode-generator.js", "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js"]);
  }
  function renderDonateQR(amount) {
    const box = $("dn-qr"); box.innerHTML = ""; const D = window.DONATE || {};
    if (D.promptpayId) {
      const payload = promptPayPayload(D.promptpayId, amount);
      box.innerHTML = '<div class="dn-ph">⏳ กำลังสร้าง QR…</div>';
      ensureQRLib((err) => {
        if (err) { box.innerHTML = '<div class="dn-ph">⚠️ สร้าง QR อัตโนมัติไม่ได้<br>โอนเข้าพร้อมเพย์: <b>' + escapeHtml(D.promptpayId) + "</b></div>"; return; }
        try {
          const qr = window.qrcode(0, "M"); qr.addData(payload); qr.make();
          const img = new Image(); img.className = "dn-img"; img.alt = "PromptPay QR"; img.style.imageRendering = "pixelated";
          img.src = qr.createDataURL(8, 16);
          box.innerHTML = ""; box.appendChild(img);
        } catch (e) { box.innerHTML = '<div class="dn-ph">สร้าง QR ไม่สำเร็จ<br>พร้อมเพย์: <b>' + escapeHtml(D.promptpayId) + "</b></div>"; }
      });
    } else {
      const img = new Image(); img.className = "dn-img"; img.alt = "QR สำหรับบริจาค";
      img.onerror = () => { box.innerHTML = '<div class="dn-ph">ยังไม่ได้ตั้งค่า QR<br><small>วางรูปที่ <b>' + escapeHtml(D.qrImage || "assets/donate-qr.png") + "</b><br>หรือใส่เบอร์พร้อมเพย์ใน <b>donate-config.js</b></small></div>"; };
      img.src = D.qrImage || "assets/donate-qr.png";
      box.appendChild(img);
    }
  }
  function openDonate() {
    const D = window.DONATE || {};
    $("dn-title").textContent = D.name || "สนับสนุนผู้พัฒนา";
    $("dn-msg").textContent = D.message || "";
    const amtBox = $("dn-amounts"); amtBox.innerHTML = "";
    if (D.promptpayId && Array.isArray(D.suggestedAmounts) && D.suggestedAmounts.length) {
      const mk = (label, val) => { const b = document.createElement("button"); b.className = "dn-amt" + (val === null ? " active" : ""); b.textContent = label; b.addEventListener("click", () => { amtBox.querySelectorAll(".dn-amt").forEach((x) => x.classList.remove("active")); b.classList.add("active"); renderDonateQR(val); }); return b; };
      amtBox.appendChild(mk("ไม่กำหนด", null));
      D.suggestedAmounts.forEach((v) => amtBox.appendChild(mk("฿" + v, v)));
    }
    renderDonateQR(null);
    const acc = $("dn-acc"); acc.innerHTML = "";
    const lines = [];
    if (D.payeeName) lines.push("ชื่อบัญชี: " + escapeHtml(D.payeeName));
    if (D.bankName || D.bankAccount) lines.push(escapeHtml([D.bankName, D.bankAccount].filter(Boolean).join("  ")));
    if (D.promptpayId) lines.push("พร้อมเพย์: " + escapeHtml(D.promptpayId));
    if (lines.length) {
      acc.innerHTML = '<div class="dn-acc-text">' + lines.join("<br>") + "</div>";
      const copyVal = D.bankAccount || D.promptpayId || "";
      if (copyVal) { const cb = document.createElement("button"); cb.className = "dn-copy"; cb.textContent = "📋 คัดลอกเลขบัญชี/พร้อมเพย์"; cb.addEventListener("click", () => { if (navigator.clipboard) navigator.clipboard.writeText(copyVal).then(() => toast("คัดลอกแล้ว: " + copyVal)).catch(() => toast(copyVal)); else toast(copyVal); }); acc.appendChild(cb); }
    }
    const dev = $("dn-dev");
    if (dev) {
      if (D.developerFacebookUrl && D.developerFacebookName) {
        dev.innerHTML = '👨‍💻 ผู้พัฒนา · Facebook: <a class="dn-fb" href="' + escapeHtml(D.developerFacebookUrl) + '" target="_blank" rel="noopener">' + escapeHtml(D.developerFacebookName) + ' ↗</a>' +
          '<div class="dn-dev-sub">ปีหน้าผมตั้งใจจะไปสมัครสอบเหมือนกันครับ ใครจำข้อสอบได้หลังสอบ รบกวนฝากทิ้งไว้สักข้อก็ยังดี (ทักมาทางเฟซได้เลย) เผื่อเป็นประโยชน์ให้คนรุ่นถัดไปและตัวผมเอง จะเป็นพระคุณอย่างสูงครับ 🙏</div>';
        dev.style.display = "";
      } else dev.style.display = "none";
    }
    $("donate-modal").classList.add("show");
  }
  function closeDonate() { $("donate-modal").classList.remove("show"); }

  /* ============================================================
     ตรวจคำตอบก่อนส่ง (โหมดเฉลยตอนจบ) — ข้ามข้อได้ แล้วกลับมาทำ
     ============================================================ */
  function openCheck() {
    const total = state.questions.length;
    let answered = 0;
    state.answers.forEach((a) => { if (a !== null) answered++; });
    const unanswered = total - answered;
    $("check-summary").innerHTML = "ทำแล้ว <b>" + answered + "/" + total + "</b> ข้อ" +
      (unanswered > 0 ? ' · ยังไม่ได้ทำ <b class="todo-n">' + unanswered + "</b> ข้อ" : " · ครบทุกข้อแล้ว ✓");
    const grid = $("check-grid"); grid.innerHTML = "";
    state.questions.forEach((q, i) => {
      const b = document.createElement("button");
      b.className = "ck-cell " + (state.answers[i] !== null ? "done" : "todo") + (i === state.current ? " cur" : "");
      b.textContent = i + 1;
      b.addEventListener("click", () => { closeCheck(); state.current = i; renderQuiz(); });
      grid.appendChild(b);
    });
    const act = $("check-actions");
    const resume = '<button class="btn btn-ghost" id="ck-resume">↩ กลับไปทำต่อ</button>';
    if (unanswered > 0) {
      act.innerHTML = '<button class="btn btn-primary" id="ck-goto">✏️ ไปทำข้อที่ยังไม่เสร็จ (' + unanswered + " ข้อ)</button>" +
        '<button class="btn btn-primary" id="ck-submit" disabled>🔒 ส่งคำตอบ (ต้องทำให้ครบก่อน)</button>' +
        '<div class="check-note">⚠️ ต้องทำให้ครบทุกข้อก่อนจึงจะส่งคำตอบได้</div>' + resume;
    } else {
      act.innerHTML = '<button class="btn btn-primary" id="ck-submit">✅ ส่งคำตอบ</button>' + resume;
    }
    const goto = $("ck-goto");
    if (goto) goto.addEventListener("click", () => { const f = state.answers.findIndex((a) => a === null); closeCheck(); if (f >= 0) { state.current = f; renderQuiz(); } });
    const sb = $("ck-submit");
    if (sb && !sb.disabled) sb.addEventListener("click", () => { closeCheck(); finishExam(); });
    $("ck-resume").addEventListener("click", closeCheck);
    $("check-modal").classList.add("show");
  }
  function closeCheck() { $("check-modal").classList.remove("show"); }

  /* ============================================================
     ผังข้อสอบ ภาค ก (แสดงก่อนเข้าสอบเสมือนจริง / เต็มทั้งปี)
     ============================================================ */
  let blueprintCallback = null;
  function showBlueprint(onStart) {
    blueprintCallback = onStart;
    $("blueprint-modal").classList.add("show");
  }
  function closeBlueprint() { $("blueprint-modal").classList.remove("show"); blueprintCallback = null; }

  /* ============================================================
     โปรโมตโหลดแอป (เฉพาะตอนเปิดบนเว็บ ไม่โชว์ในแอป Android)
     - แบนเนอร์ลอยข้างบนตอนเข้าใหม่ ๆ · หายเองใน 1 นาที · กดปิดได้ · แตะแล้วไปหน้าวิธีติดตั้ง
     ============================================================ */
  let dlBannerEl = null;
  function isNativeApp() {
    return !!(window.Capacitor && ((typeof window.Capacitor.isNativePlatform === "function" && window.Capacitor.isNativePlatform()) || window.Capacitor.isNative));
  }
  function hideDlBanner() {
    if (!dlBannerEl || dlBannerEl.hidden) return;
    dlBannerEl.classList.remove("show");
    try { sessionStorage.setItem("kp_dlbanner", "1"); } catch (e) {}
    clearTimeout(dlBannerEl._t);
    setTimeout(() => { if (dlBannerEl) dlBannerEl.hidden = true; }, 380);
  }
  function initDownloadPromo() {
    const native = isNativeApp();
    const card = $("home-download");
    dlBannerEl = $("dl-banner");
    if (native) {                              // อยู่ในแอปแล้ว ไม่ต้องชวนโหลด
      if (card) card.style.display = "none";
      if (dlBannerEl) dlBannerEl.hidden = true;
      return;
    }
    if (!dlBannerEl) return;
    let seen = false; try { seen = sessionStorage.getItem("kp_dlbanner") === "1"; } catch (e) {}
    if (seen) return;                          // เคยเห็น/ปิดไปแล้วในรอบนี้ ไม่กวนซ้ำ
    dlBannerEl.hidden = false;
    requestAnimationFrame(() => dlBannerEl.classList.add("show"));
    const x = $("dl-banner-x"); if (x) x.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); hideDlBanner(); });
    dlBannerEl._t = setTimeout(hideDlBanner, 60000);   // หายเองใน 1 นาที
  }

  /* ============================================================
     ผูก Event
     ============================================================ */
  function bind() {
    document.querySelectorAll("[data-level]").forEach((el) => el.addEventListener("click", () => { currentLevel = el.getAttribute("data-level"); document.querySelectorAll("[data-level]").forEach((b) => b.classList.toggle("active", b === el)); updateStructureCriteria(); }));
    document.querySelectorAll("[data-feedback]").forEach((el) => el.addEventListener("click", () => { currentFeedback = el.getAttribute("data-feedback"); document.querySelectorAll("[data-feedback]").forEach((b) => b.classList.toggle("active", b === el)); }));
    document.querySelectorAll("[data-source]").forEach((el) => el.addEventListener("click", () => { currentSource = el.getAttribute("data-source"); document.querySelectorAll("[data-source]").forEach((b) => b.classList.toggle("active", b === el)); }));
    document.querySelectorAll("[data-action]").forEach((el) => el.addEventListener("click", () => { const a = el.getAttribute("data-action"); if (a === "start-full") showBlueprint(function () { startCore("full"); }); else if (a === "quick") startCore("quick"); else if (a === "predicted") startCore("predicted"); else if (a === "donate") openDonate(); }));
    $("toggle-subjects").addEventListener("click", () => $("subject-pick").classList.toggle("show"));
    document.querySelectorAll("[data-count]").forEach((el) => el.addEventListener("click", () => { currentSubjectCount = parseInt(el.getAttribute("data-count"), 10); document.querySelectorAll("[data-count]").forEach((b) => b.classList.toggle("active", b === el)); }));
    document.querySelectorAll("[data-subject]").forEach((el) => el.addEventListener("click", () => startCore("subject", el.getAttribute("data-subject"), currentSubjectCount)));
    $("toggle-years").addEventListener("click", () => $("year-pick").classList.toggle("show"));
    document.querySelectorAll("[data-yscope]").forEach((el) => el.addEventListener("click", () => { currentYearScope = el.getAttribute("data-yscope"); document.querySelectorAll("[data-yscope]").forEach((b) => b.classList.toggle("active", b === el)); }));
    document.querySelectorAll("[data-year]").forEach((el) => el.addEventListener("click", () => { const yr = parseInt(el.getAttribute("data-year"), 10); if (currentYearScope === "full") showBlueprint(function () { startYear(yr, "full"); }); else startYear(yr); }));

    const pb = $("partB-pick"), pc = $("partC-pick");
    (window.SPECIAL_BANK_ORDER || []).forEach((b) => {
      const m = window.SPECIAL_BANK_META[b];
      const btn = document.createElement("button"); btn.className = "btn btn-outline special-btn";
      btn.innerHTML = '<span>' + m.icon + " " + escapeHtml(m.short) + '</span><span class="sb-count">' + m.count + " ข้อ</span>";
      btn.addEventListener("click", () => startSpecial(b));
      (m.part === "ค" ? pc : pb).appendChild(btn);
    });

    document.querySelectorAll("[data-nav]").forEach((b) => b.addEventListener("click", () => {
      const n = b.getAttribute("data-nav");
      if (n === "home") showScreen("screen-home");
      else if (n === "study") { renderStudy(); showScreen("screen-study"); }
      else if (n === "positions") { renderPositions(); showScreen("screen-positions"); }
      else if (n === "history") { renderHistory(); showScreen("screen-history"); }
    }));
    $("posdetail-back").addEventListener("click", () => { renderPositions(); showScreen("screen-positions"); });

    $("btn-exit").addEventListener("click", confirmExit);
    $("btn-prev").addEventListener("click", () => go(-1));
    $("btn-prev2").addEventListener("click", () => go(-1));
    $("btn-next-top").addEventListener("click", () => go(1));
    $("btn-next").addEventListener("click", onNext);
    $("btn-explain").addEventListener("click", toggleExplanation);
    $("btn-check").addEventListener("click", openCheck);
    $("hint-btn").addEventListener("click", toggleHint);

    $("btn-review").addEventListener("click", () => { reviewFilter = "all"; syncFilterUI(); renderReview(); showScreen("screen-review"); });
    $("btn-retry").addEventListener("click", retry);
    $("btn-home").addEventListener("click", goHome);
    $("btn-weak").addEventListener("click", () => {
      if (!lastResult || !lastResult.topics.targets.length) return;
      const baseline = {};
      (lastResult.topics.all || []).forEach((x) => { baseline[x.topic] = { pct: x.pct, correct: x.correct, total: x.total }; });
      const b = {};
      lastResult.topics.targets.forEach((t) => { if (baseline[t]) b[t] = baseline[t]; });
      startWeakFrom({ topics: lastResult.topics.targets, kind: lastResult.kind, bankId: state.bankId, baseline: b });
    });

    $("review-back").addEventListener("click", () => showScreen("screen-summary"));
    document.querySelectorAll("#review-filter .chip-btn").forEach((el) => el.addEventListener("click", () => { reviewFilter = el.getAttribute("data-filter"); syncFilterUI(); renderReview(); }));

    $("history-clear").addEventListener("click", () => { showConfirm("ต้องการล้างประวัติทั้งหมดหรือไม่?", () => { saveHistory([]); renderHistory(); toast("ล้างประวัติเรียบร้อยแล้ว"); }); });

    // บริจาค / สนับสนุน
    $("donate-close").addEventListener("click", closeDonate);
    $("donate-modal").addEventListener("click", (e) => { if (e.target === $("donate-modal")) closeDonate(); });
    $("check-close").addEventListener("click", closeCheck);
    $("check-modal").addEventListener("click", (e) => { if (e.target === $("check-modal")) closeCheck(); });
    $("bp-close").addEventListener("click", closeBlueprint);
    $("blueprint-modal").addEventListener("click", (e) => { if (e.target === $("blueprint-modal")) closeBlueprint(); });
    $("bp-start").addEventListener("click", () => { const fn = blueprintCallback; closeBlueprint(); if (fn) fn(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeDonate(); closeCheck(); closeBlueprint(); $("confirm-modal").classList.remove("show"); } });

    // ธีม สว่าง/มืด/อ่าน
    applyTheme((function () { try { return localStorage.getItem("kp_theme") || "light"; } catch (e) { return "light"; } })());
    $("theme-toggle").addEventListener("click", (e) => { e.stopPropagation(); $("theme-menu").classList.toggle("show"); });
    document.querySelectorAll("[data-theme-set]").forEach((b) => b.addEventListener("click", () => { applyTheme(b.getAttribute("data-theme-set")); $("theme-menu").classList.remove("show"); }));
    document.addEventListener("click", (e) => { if (!$("theme-fab").contains(e.target)) $("theme-menu").classList.remove("show"); });
    $("confirm-modal").addEventListener("click", (e) => { if (e.target === $("confirm-modal")) $("confirm-modal").classList.remove("show"); });
    if (!window.DONATE || !window.DONATE.enabled) document.querySelectorAll('[data-action="donate"]').forEach((el) => { el.style.display = "none"; });

    const totalEl = $("bank-total");
    if (totalEl) { let g = window.QUESTIONS.length; (window.SPECIAL_BANK_ORDER || []).forEach((b) => { g += (window.SPECIAL_BANKS[b] || []).length; }); totalEl.textContent = g.toLocaleString("th-TH"); }
    updateStructureCriteria();
    showScreen("screen-home");
    initDownloadPromo();
  }
  function updateStructureCriteria() { const a = window.SUBJECTS.analytical, el = $("struct-analytical"); if (el) el.textContent = "100 คะแนน · ผ่าน " + a.passPercent[currentLevel] + "%"; }
  function syncFilterUI() { document.querySelectorAll("#review-filter .chip-btn").forEach((el) => el.classList.toggle("active", el.getAttribute("data-filter") === reviewFilter)); }

  document.addEventListener("DOMContentLoaded", bind);
})();
