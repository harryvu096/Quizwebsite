/* =====================================================================
   AHW Quizverse — English Lab
   Three sub-sections:
     1) Word Search   (8x8 letter grid, 6 hidden words / level, 6 levels)
     2) Spoken English (TTS, normal + slow)
     3) Tenses        (12 tenses, formula + example + TTS)
   Mobile-friendly, uses browser speechSynthesis (en-US) for audio.
   localStorage key: ahw.englishLab  (per-level progress)
   ===================================================================== */

/* ---------- DATA ---------- */

const WS_LEVELS = [
  {
    name: "Level 1 — Basics",
    words: [
      { w: "BOOK",   urdu: "کتاب",  meaning: "Book" },
      { w: "PEN",    urdu: "قلم",   meaning: "Pen" },
      { w: "WATER",  urdu: "پانی",   meaning: "Water" },
      { w: "FOOD",   urdu: "کھانا",  meaning: "Food" },
      { w: "TIME",   urdu: "وقت",   meaning: "Time" },
      { w: "DAY",    urdu: "دن",    meaning: "Day" }
    ]
  },
  {
    name: "Level 2 — People",
    words: [
      { w: "TEACHER",  urdu: "استاد",       meaning: "Teacher" },
      { w: "STUDENT",  urdu: "طالب علم",    meaning: "Student" },
      { w: "FRIEND",   urdu: "دوست",        meaning: "Friend" },
      { w: "FAMILY",   urdu: "خاندان",      meaning: "Family" },
      { w: "SCHOOL",   urdu: "سکول",        meaning: "School" },
      { w: "HOME",     urdu: "گھر",         meaning: "Home" }
    ]
  },
  {
    name: "Level 3 — Feelings",
    words: [
      { w: "HAPPY",   urdu: "خوش",    meaning: "Happy" },
      { w: "SAD",     urdu: "اداس",   meaning: "Sad" },
      { w: "ANGRY",   urdu: "غصہ",    meaning: "Angry" },
      { w: "TIRED",   urdu: "تھکا",   meaning: "Tired" },
      { w: "HUNGRY",  urdu: "بھوکا",  meaning: "Hungry" },
      { w: "STRONG",  urdu: "مضبوط",  meaning: "Strong" }
    ]
  },
  {
    name: "Level 4 — Actions",
    words: [
      { w: "LEARN",  urdu: "سیکھنا",  meaning: "To learn" },
      { w: "TEACH",  urdu: "پڑھانا",  meaning: "To teach" },
      { w: "READ",   urdu: "پڑھنا",   meaning: "To read" },
      { w: "WRITE",  urdu: "لکھنا",   meaning: "To write" },
      { w: "SPEAK",  urdu: "بولنا",   meaning: "To speak" },
      { w: "LISTEN", urdu: "سننا",    meaning: "To listen" }
    ]
  },
  {
    name: "Level 5 — Studies",
    words: [
      { w: "SUCCESS", urdu: "کامیابی",  meaning: "Success" },
      { w: "EFFORT",  urdu: "کوشش",    meaning: "Effort" },
      { w: "EXAM",    urdu: "امتحان",  meaning: "Exam" },
      { w: "RESULT",  urdu: "نتیجہ",   meaning: "Result" },
      { w: "DEGREE",  urdu: "ڈگری",    meaning: "Degree" },
      { w: "FUTURE",  urdu: "مستقبل",  meaning: "Future" }
    ]
  },
  {
    name: "Level 6 — Values",
    words: [
      { w: "COURAGE",  urdu: "بہادری",     meaning: "Courage" },
      { w: "WISDOM",   urdu: "دانش",       meaning: "Wisdom" },
      { w: "PATIENCE", urdu: "صبر",        meaning: "Patience" },
      { w: "HONESTY",  urdu: "ایمانداری",  meaning: "Honesty" },
      { w: "RESPECT",  urdu: "عزت",        meaning: "Respect" },
      { w: "KINDNESS", urdu: "نرمی",       meaning: "Kindness" }
    ]
  }
];

const SPOKEN_PHRASES = [
  { en: "Good morning!",                        ur: "صبح بخیر" },
  { en: "How are you?",                         ur: "آپ کیسے ہیں؟" },
  { en: "I am fine, thank you.",                ur: "میں ٹھیک ہوں، شکریہ" },
  { en: "What is your name?",                   ur: "آپ کا نام کیا ہے؟" },
  { en: "My name is Ali.",                      ur: "میرا نام علی ہے" },
  { en: "Please speak slowly.",                 ur: "براہ کرم آہستہ بولیں" },
  { en: "I don't understand.",                  ur: "مجھے سمجھ نہیں آیا" },
  { en: "Can you help me?",                     ur: "کیا آپ میری مدد کر سکتے ہیں؟" },
  { en: "Thank you very much.",                 ur: "آپ کا بہت شکریہ" },
  { en: "Excuse me, please.",                   ur: "معاف کیجئے گا" },
  { en: "I am a student of Virtual University.", ur: "میں ورچوئل یونیورسٹی کا طالب علم ہوں" },
  { en: "I am preparing for my exam.",          ur: "میں اپنے امتحان کی تیاری کر رہا ہوں" },
  { en: "What time is it?",                     ur: "کتنا بجا ہے؟" },
  { en: "See you later!",                       ur: "پھر ملیں گے!" },
  { en: "Have a nice day!",                     ur: "آپ کا دن اچھا گزرے" },
  { en: "I want to improve my English.",        ur: "میں اپنی انگریزی بہتر کرنا چاہتا ہوں" },
  { en: "Practice makes perfect.",              ur: "مشق انسان کو کامل بناتی ہے" },
  { en: "No pain, no gain.",                    ur: "محنت کے بغیر کچھ نہیں ملتا" },
  { en: "Where is the library?",                ur: "لائبریری کہاں ہے؟" },
  { en: "I need a little help.",                ur: "مجھے تھوری سی مدد چاہیے" }
];

const TENSES = [
  { name: "Present Indefinite",          formula: "S + V1 + O",            ex: "I eat an apple.",          ur: "میں سیب کھاتا ہوں" },
  { name: "Present Continuous",          formula: "is / am / are + V-ing",   ex: "I am eating an apple.",     ur: "میں سیب کھا رہا ہوں" },
  { name: "Present Perfect",             formula: "has / have + V3",        ex: "I have eaten an apple.",   ur: "میں سیب کھا چکا ہوں" },
  { name: "Present Perfect Continuous",  formula: "has / have been + V-ing",ex: "I have been eating an apple.", ur: "میں کچھ دیر سے کھا رہا ہوں" },
  { name: "Past Indefinite",             formula: "S + V2",                 ex: "I ate an apple.",          ur: "میں نے سیب کھایا" },
  { name: "Past Continuous",             formula: "was / were + V-ing",     ex: "I was eating an apple.",   ur: "میں سیب کھا رہا تھا" },
  { name: "Past Perfect",                formula: "had + V3",               ex: "I had eaten an apple.",    ur: "میں سیب کھا چکا تھا" },
  { name: "Past Perfect Continuous",     formula: "had been + V-ing",       ex: "I had been eating an apple.", ur: "میں پہلے سے کھا رہا تھا" },
  { name: "Future Indefinite",           formula: "will + V1",              ex: "I will eat an apple.",     ur: "میں سیب کھاؤں گا" },
  { name: "Future Continuous",           formula: "will be + V-ing",        ex: "I will be eating an apple.", ur: "میں کھا رہا ہوں گا" },
  { name: "Future Perfect",              formula: "will have + V3",         ex: "I will have eaten an apple.", ur: "میں کھا چکا ہوں گا" },
  { name: "Future Perfect Continuous",   formula: "will have been + V-ing", ex: "I will have been eating an apple.", ur: "میں دیر تک کھا رہا ہوں گا" }
];

/* ---------- STATE ---------- */

const EL_STATE = {
  section: "home",   // home | ws | spoken | tenses
  ws: {
    level: 0,        // current level index
    grid: [],        // 8x8 letters
    placements: [],  // [{word, cells:[[r,c],...]}]
    found: {},       // {WORD: {meaning, urdu, cells}}
    selStart: null,  // [r,c]
    selEnd: null,    // [r,c]
    busy: false
  }
};

const EL_STORAGE_KEY = "ahw.englishLab.v1";

function elLoadProgress() {
  try {
    const raw = localStorage.getItem(EL_STORAGE_KEY);
    if (raw) return JSON.parse(raw) || {};
  } catch (e) {}
  return {};
}
function elSaveProgress(p) {
  try { localStorage.setItem(EL_STORAGE_KEY, JSON.stringify(p || {})); } catch (e) {}
}
function elClearProgress() {
  try { localStorage.removeItem(EL_STORAGE_KEY); } catch (e) {}
}

/* ---------- TTS (browser speechSynthesis) ---------- */

function elSpeak(text, rate) {
  try {
    if (!("speechSynthesis" in window)) {
      // graceful fallback — small visual hint
      flashToast("🔇 TTS not supported in this browser");
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = rate || 1.0;
    u.pitch = 1.0;
    u.volume = 1.0;
    window.speechSynthesis.speak(u);
  } catch (e) {
    console.warn("TTS error:", e);
  }
}

/* ---------- ENTRY / NAV ---------- */

function showEnglishLab() {
  EL_STATE.section = "home";
  renderEnglishLab();
  applyScreen("screen-english");
}

function elGo(section) {
  EL_STATE.section = section;
  renderEnglishLab();
}

function elHome() {
  EL_STATE.section = "home";
  renderEnglishLab();
}

function renderEnglishLab() {
  const root = document.getElementById("englishBody");
  if (!root) return;
  if (EL_STATE.section === "home") root.innerHTML = elHtmlHome();
  else if (EL_STATE.section === "ws") root.innerHTML = elHtmlWordSearch();
  else if (EL_STATE.section === "spoken") root.innerHTML = elHtmlSpoken();
  else if (EL_STATE.section === "tenses") root.innerHTML = elHtmlTenses();
  // Toggle the back button based on section
  const back = document.getElementById("elBackBtn");
  if (back) back.style.display = EL_STATE.section === "home" ? "none" : "";
  // After DOM write, init word-search grid if needed
  setTimeout(elInitScreen, 0);
}

/* ---------- HOME ---------- */

function elHtmlHome() {
  const prog = elLoadProgress();
  const wsDone = Object.keys(prog.wsDone || {}).length;
  return `
    <div class="big-title"><span class="grad">English Lab</span></div>
    <p class="sub" style="text-align:center">Vocabulary · Pronunciation · Grammar — sab ek jagah!</p>
    <div class="feature-grid">
      <div class="feature" onclick="elGo('ws')" style="cursor:pointer">
        <span class="fe">🔤</span>Word Search<br><span style="font-size:11px;color:#8a83a8">${wsDone}/6 levels</span>
      </div>
      <div class="feature" onclick="elGo('spoken')" style="cursor:pointer">
        <span class="fe">🗣️</span>Spoken English<br><span style="font-size:11px;color:#8a83a8">20 phrases</span>
      </div>
      <div class="feature" onclick="elGo('tenses')" style="cursor:pointer">
        <span class="fe">⏰</span>12 Tenses<br><span style="font-size:11px;color:#8a83a8">Formula + example</span>
      </div>
    </div>
    <div class="btn-row" style="margin-top:20px">
      <button class="btn btn-gray" onclick="elResetProgress()">🗑️ Reset Progress</button>
    </div>
  `;
}

function elResetProgress() {
  if (confirm("Are you sure you want to reset English Lab progress?")) {
    elClearProgress();
    renderEnglishLab();
    flashToast("✅ Progress reset");
  }
}

/* ---------- WORD SEARCH ---------- */

function elHtmlWordSearch() {
  const lvl = WS_LEVELS[EL_STATE.ws.level];
  const found = EL_STATE.ws.found;
  return `
    <div class="big-title" style="font-size:24px"><span class="grad">Word Search</span></div>
    <p class="sub" style="text-align:center">${lvl.name} — Tap first letter, then last letter. Straight line = found!</p>

    <div class="ws-level-bar">
      ${WS_LEVELS.map((L, i) => {
        const isCur = i === EL_STATE.ws.level;
        const isDone = !!(elLoadProgress().wsDone || {})[i];
        return `<button class="ws-lvl-pill ${isCur ? 'on' : ''} ${isDone ? 'done' : ''}" onclick="elSelectLevel(${i})">${i+1}${isDone ? ' ✓' : ''}</button>`;
      }).join("")}
    </div>

    <div class="ws-grid" id="wsGrid"></div>
    <div class="ws-found-title">Found words <span class="ws-found-count">${Object.keys(found).length}/${lvl.words.length}</span></div>
    <div class="ws-found-list" id="wsFoundList"></div>
    <div id="wsToast" class="ws-toast"></div>

    <div class="btn-row">
      <button class="btn btn-blue" onclick="elWsHint()">💡 Hint</button>
      <button class="btn btn-orange" onclick="elWsNewGrid()">🔄 New Grid</button>
      <button class="btn btn-green" onclick="elWsNext()">Next ➜</button>
    </div>
  `;
}

function elSelectLevel(i) {
  EL_STATE.ws.level = i;
  EL_STATE.ws.found = {};
  EL_STATE.ws.selStart = null;
  EL_STATE.ws.selEnd = null;
  elWsNewGrid();
  renderEnglishLab();
}

function elWsNewGrid() {
  const lvl = WS_LEVELS[EL_STATE.ws.level];
  EL_STATE.ws.grid = [];
  EL_STATE.ws.placements = [];
  EL_STATE.ws.found = {};
  EL_STATE.ws.selStart = null;
  EL_STATE.ws.selEnd = null;

  const SIZE = 8;
  // initialize empty grid
  for (let r = 0; r < SIZE; r++) {
    EL_STATE.ws.grid.push(new Array(SIZE).fill(""));
  }

  // place each word in a random direction
  const directions = [
    [0, 1],   // right
    [1, 0],   // down
    [1, 1],   // diag down-right
    [-1, 1],  // diag up-right
    [0, -1],  // left
    [-1, 0],  // up
    [-1, -1], // diag up-left
    [1, -1]   // diag down-left
  ];
  for (const item of lvl.words) {
    const w = item.w.toUpperCase();
    let placed = false;
    for (let attempt = 0; attempt < 200 && !placed; attempt++) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const sr = Math.floor(Math.random() * SIZE);
      const sc = Math.floor(Math.random() * SIZE);
      const er = sr + dir[0] * (w.length - 1);
      const ec = sc + dir[1] * (w.length - 1);
      if (er < 0 || er >= SIZE || ec < 0 || ec >= SIZE) continue;
      // check overlap allowed only if same letter
      let ok = true;
      const cells = [];
      for (let k = 0; k < w.length; k++) {
        const r = sr + dir[0] * k;
        const c = sc + dir[1] * k;
        const cur = EL_STATE.ws.grid[r][c];
        if (cur && cur !== w[k]) { ok = false; break; }
        cells.push([r, c]);
      }
      if (!ok) continue;
      // commit
      for (let k = 0; k < w.length; k++) {
        const r = sr + dir[0] * k;
        const c = sc + dir[1] * k;
        EL_STATE.ws.grid[r][c] = w[k];
      }
      EL_STATE.ws.placements.push({ word: w, cells, dir });
      placed = true;
    }
  }

  // fill remaining empty cells with random letters
  const FILL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!EL_STATE.ws.grid[r][c]) {
        EL_STATE.ws.grid[r][c] = FILL[Math.floor(Math.random() * FILL.length)];
      }
    }
  }

  renderEnglishLab();
}

function elRenderGrid() {
  const grid = document.getElementById("wsGrid");
  if (!grid) return;
  const SIZE = 8;
  let html = "";
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const ch = EL_STATE.ws.grid[r][c];
      let cls = "ws-cell";
      if (isCellFound(r, c)) cls += " found";
      if (EL_STATE.ws.selStart && EL_STATE.ws.selStart[0] === r && EL_STATE.ws.selStart[1] === c) cls += " sel-start";
      if (EL_STATE.ws.selEnd && EL_STATE.ws.selEnd[0] === r && EL_STATE.ws.selEnd[1] === c) cls += " sel-end";
      if (isCellInLine(r, c)) cls += " in-line";
      html += `<div class="${cls}" data-r="${r}" data-c="${c}">${ch}</div>`;
    }
  }
  grid.innerHTML = html;
  elRenderFound();
}

function isCellFound(r, c) {
  for (const k in EL_STATE.ws.found) {
    const cells = EL_STATE.ws.found[k].cells;
    for (const cell of cells) if (cell[0] === r && cell[1] === c) return true;
  }
  return false;
}

function isCellInLine(r, c) {
  if (!EL_STATE.ws.selStart || !EL_STATE.ws.selEnd) return false;
  const line = getLineCells(EL_STATE.ws.selStart, EL_STATE.ws.selEnd);
  for (const cell of line) if (cell[0] === r && cell[1] === c) return true;
  return false;
}

function getLineCells(a, b) {
  const dr = b[0] - a[0];
  const dc = b[1] - a[1];
  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  if (steps === 0) return [a];
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return [a]; // not a straight line
  const sr = dr === 0 ? 0 : dr / Math.abs(dr);
  const sc = dc === 0 ? 0 : dc / Math.abs(dc);
  const cells = [];
  for (let k = 0; k <= steps; k++) cells.push([a[0] + sr * k, a[1] + sc * k]);
  return cells;
}

function getSelectedWord() {
  if (!EL_STATE.ws.selStart || !EL_STATE.ws.selEnd) return "";
  const cells = getLineCells(EL_STATE.ws.selStart, EL_STATE.ws.selEnd);
  return cells.map(c => EL_STATE.ws.grid[c[0]][c[1]]).join("");
}

function elCellClick(r, c) {
  if (!EL_STATE.ws.selStart) {
    EL_STATE.ws.selStart = [r, c];
    EL_STATE.ws.selEnd = [r, c];
  } else {
    EL_STATE.ws.selEnd = [r, c];
    elWsCheck();
  }
  elRenderGrid();
}

function elWsCheck() {
  const word = getSelectedWord();
  if (!word || word.length < 2) return;
  const lvl = WS_LEVELS[EL_STATE.ws.level];
  const match = lvl.words.find(x => x.w === word);
  if (match) {
    if (EL_STATE.ws.found[word]) {
      flashToast("Already found!");
      return;
    }
    const cells = getLineCells(EL_STATE.ws.selStart, EL_STATE.ws.selEnd);
    EL_STATE.ws.found[word] = { meaning: match.meaning, urdu: match.urdu, cells };
    flashToast(`✅ ${word} — ${match.meaning} (${match.urdu})`);
    elSpeak(word, 0.9);
    elCheckLevelComplete();
  } else {
    flashToast("❌ Not in this level");
  }
  // reset selection after a moment
  setTimeout(() => {
    EL_STATE.ws.selStart = null;
    EL_STATE.ws.selEnd = null;
    elRenderGrid();
  }, 700);
}

function elCheckLevelComplete() {
  const lvl = WS_LEVELS[EL_STATE.ws.level];
  if (Object.keys(EL_STATE.ws.found).length >= lvl.words.length) {
    setTimeout(() => {
      flashToast(`🎉 Level complete!`);
      elSpeak("Level complete! Well done.", 1.0);
      const prog = elLoadProgress();
      prog.wsDone = prog.wsDone || {};
      prog.wsDone[EL_STATE.ws.level] = true;
      elSaveProgress(prog);
    }, 800);
  }
}

function elRenderFound() {
  const list = document.getElementById("wsFoundList");
  if (!list) return;
  const lvl = WS_LEVELS[EL_STATE.ws.level];
  list.innerHTML = lvl.words.map(item => {
    const f = EL_STATE.ws.found[item.w];
    if (f) {
      return `<div class="ws-chip found" onclick="elSpeak('${item.w}', 0.9)">
        <span class="ws-chip-en">${item.w}</span>
        <span class="ws-chip-ur" dir="rtl">${item.urdu}</span>
        <span class="ws-chip-mean">${item.meaning}</span>
      </div>`;
    }
    return `<div class="ws-chip">
        <span class="ws-chip-en">${item.w}</span>
        <span class="ws-chip-ur" dir="rtl">${item.urdu}</span>
      </div>`;
  }).join("");
}

function elWsHint() {
  // reveal the first un-found word's first letter
  const lvl = WS_LEVELS[EL_STATE.ws.level];
  const unfound = lvl.words.find(x => !EL_STATE.ws.found[x.w]);
  if (!unfound) { flashToast("All words found! 🎉"); return; }
  const placement = EL_STATE.ws.placements.find(p => p.word === unfound.w);
  if (!placement) return;
  const [r, c] = placement.cells[0];
  flashToast(`💡 First letter: ${unfound.w[0]} at row ${r+1}, col ${c+1}`);
  elSpeak(unfound.w[0], 0.9);
}

function elWsNext() {
  if (EL_STATE.ws.level < WS_LEVELS.length - 1) {
    EL_STATE.ws.level++;
    elWsNewGrid();
    renderEnglishLab();
  } else {
    flashToast("🏆 All levels complete!");
  }
}

/* ---------- SPOKEN ENGLISH ---------- */

function elHtmlSpoken() {
  return `
    <div class="big-title" style="font-size:24px"><span class="grad">Spoken English</span></div>
    <p class="sub" style="text-align:center">🔊 Sunain = Normal speed · 🐢 Slow = 0.6x speed</p>
    <div class="spoken-list">
      ${SPOKEN_PHRASES.map((p, i) => `
        <div class="spoken-card">
          <div class="spoken-en">${escapeHtml(p.en)}</div>
          <div class="spoken-ur" dir="rtl">${escapeHtml(p.ur)}</div>
          <div class="spoken-btns">
            <button class="btn btn-green btn-sm" onclick="elSpeak(${JSON.stringify(p.en)}, 1.0)">🔊 Sunain</button>
            <button class="btn btn-orange btn-sm" onclick="elSpeak(${JSON.stringify(p.en)}, 0.6)">🐢 Slow</button>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

/* ---------- TENSES ---------- */

function elHtmlTenses() {
  return `
    <div class="big-title" style="font-size:24px"><span class="grad">12 English Tenses</span></div>
    <p class="sub" style="text-align:center">Formula, Example (TTS), Urdu translation</p>
    <div class="tense-grid">
      ${TENSES.map((t, i) => `
        <div class="tense-card">
          <div class="tense-name">${i+1}. ${escapeHtml(t.name)}</div>
          <div class="tense-formula"><b>Formula:</b> ${escapeHtml(t.formula)}</div>
          <div class="tense-ex">${escapeHtml(t.ex)}</div>
          <div class="tense-ur" dir="rtl">${escapeHtml(t.ur)}</div>
          <div class="tense-btns">
            <button class="btn btn-green btn-sm" onclick="elSpeak(${JSON.stringify(t.ex)}, 1.0)">🔊 Example</button>
            <button class="btn btn-orange btn-sm" onclick="elSpeak(${JSON.stringify(t.ex)}, 0.6)">🐢 Slow</button>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

/* ---------- HELPERS ---------- */

function flashToast(msg) {
  try {
    const t = typeof document !== "undefined" && document.getElementById("wsToast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(flashToast._t);
    flashToast._t = setTimeout(() => t.classList.remove("show"), 1800);
  } catch (e) { /* ignore */ }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ---------- INIT (called when screen opens) ---------- */

function elInitScreen() {
  // attach click delegation for grid cells
  const grid = document.getElementById("wsGrid");
  if (grid && !grid._wired) {
    grid._wired = true;
    grid.addEventListener("click", e => {
      const cell = e.target.closest(".ws-cell");
      if (!cell) return;
      elCellClick(parseInt(cell.dataset.r, 10), parseInt(cell.dataset.c, 10));
    });
  }
  // initial paint
  if (EL_STATE.section === "ws") {
    if (!EL_STATE.ws.grid || EL_STATE.ws.grid.length === 0) elWsNewGrid();
    else elRenderGrid();
  }
}

/* After renderEnglishLab() finishes DOM write, call elInitScreen()
   (now inlined directly in renderEnglishLab above) */
