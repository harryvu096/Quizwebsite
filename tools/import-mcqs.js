/* =====================================================================
   AHW Quizverse — MCQ IMPORTER
   ---------------------------------------------------------------
   Drive / WhatsApp / PDF se mile past-paper MCQs ko app ke format me
   convert kar ke SAHI subject ke SAHI bank (MID / FINAL) me daal deta hai.

   Usage:
     node tools/import-mcqs.js <file|folder> [options]

   Options:
     --subject=Q_CS201_FINAL   Target bank (override; warna filename se guess)
     --root=<dir>              Repo root (default: project root) — testing ke liye
     --dry                     Sirf report banao, kuch save na karo
     --distribute=even|levelN  Naye MCQs levels me kaise batें (default even)
     --why=placeholder|empty   Explanation na ho to kya likhe (default placeholder)
     --ans-base=auto|0|1       Object/CSV me numeric answer 0-based ya 1-based
                               (auto = 1-based; JSON array form hamesha 0-based)
     --min-sim=0.82            Duplicate detect threshold (trigram similarity)
     --new-bank                Bank exist na kare to naya bana do (3 levels)

   Supported inputs (.json / .csv / .txt / .md):
     - JSON: [[q,[o1,o2,o3,o4],ansIdx,why], ...]  ya
             [{q, options:[...], answer, why}]     ya
             [{question, a,b,c,d, correct, explanation}]
     - CSV : question,optionA,optionB,optionC,optionD,answer,explanation
     - TEXT: VU past-paper style (numbered question, A) B) C) D), Answer: B, Explanation: ...)
             -- correct option par * ya ✓ bhi chalta hai
   ===================================================================== */
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const opt = {};
const files = [];
for (const a of args) {
  const m = a.match(/^--([^=]+)(?:=(.*))?$/);
  if (m) opt[m[1]] = m[2] === undefined ? true : m[2];
  else files.push(a);
}
if (!files.length) {
  console.log("Usage: node tools/import-mcqs.js <file|folder> [--subject=Q_CS201_FINAL] [--dry] [--distribute=even] [--new-bank] [--ans-base=auto]");
  process.exit(1);
}
const ROOT = path.resolve(opt.root || path.join(__dirname, ".."));
const MIN_SIM = parseFloat(opt["min-sim"] || "0.82");
const ANS_BASE = opt["ans-base"] || "auto";
const DATA = path.join(ROOT, "data", "mcqs.json");

/* ---------------- helpers ---------------- */
const clean = s =>
  String(s == null ? "" : s)
    .replace(/\u00a0/g, " ")
    .replace(/\*\*/g, "")
    .replace(/^[\s*✓✔•▪-]+/, "")
    .replace(/[\s*✓✔]+$/, "")
    .replace(/\s+/g, " ")
    .trim();

const norm = s =>
  clean(s)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(the|a|an|of|is|are|in|to|for|and|or|which|what|following)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function trigrams(s) {
  const t = norm(s);
  const out = new Set();
  const p = "  " + t + "  ";
  for (let i = 0; i < p.length - 2; i++) out.add(p.slice(i, i + 3));
  return out;
}
function sim(a, b) {
  const A = trigrams(a), B = trigrams(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter);
}

/* ---------------- answer -> index ---------------- */
function toIndex(ans, opts, base) {
  const len = opts.length;
  if (typeof ans === "number" && isFinite(ans)) {
    if (base === 0) return ans;                       // 0-based index
    if (base === 1) return ans - 1;                   // 1-based
    return ans >= 1 && ans <= len ? ans - 1 : ans;     // auto
  }
  const s = clean(ans).toLowerCase();
  if (/^[a-e]$/.test(s)) return s.charCodeAt(0) - 97;
  if (/^[1-5]$/.test(s)) return parseInt(s, 10) - 1;
  const i = opts.findIndex(o => norm(o) === norm(ans) || sim(o, ans) >= 0.7);
  return i;
}

/* ---------------- text parser ---------------- */
const RE_Q = /^\s*(?:Q\s*\.?\s*)?(\d{1,3})\s*[\.\)\-:]\s*(.+)$/i;
const RE_OPT = /^[\(\[]?([a-eA-E1-5])[\)\].\-:]\s+(.+)$/;
const RE_ANS = /^\s*(?:ans|answer|correct\s*(?:answer|option|choice)?|sahi\s*jawab|jawab)\s*[:\-–=]?\s*[\(\[]?([a-eA-E1-5])[\)\]]?\s*[\.\)]?\s*(.*)$/i;
const RE_WHY = /^\s*(?:explanation|explain|reason|why|note|detail|tafseel)\s*[:\-–]\s*(.+)$/i;
const RE_STAR_LEAD = /^[\s*✓✔]/;
const RE_LEC = /(?:lecture|lec|chapter|topic)\s*[#:\-]?\s*(\d{1,3})/i;
const RE_YEAR = /\b(20\d{2})\b/;

/* "a) x  b) y  c) z  d) w" ek hi line me */
function splitInline(line) {
  const parts = line.split(/\s*[\(\[]?([a-eA-E])[\)\].\s]\s+/);
  if (parts.length < 7) return null;
  const opts = [];
  for (let i = 2; i < parts.length; i += 2) opts.push(clean(parts[i]));
  return opts.filter(o => o.length).length >= 3 ? opts.map(clean) : null;
}
/* kaunsa option starred hai (correct mark) */
function starredIndex(line) {
  const lead = line.match(/^\s*[*✓✔]\s*[\(\[]?([a-eA-E])[\)\].]/);
  if (lead) return lead[1].toLowerCase().charCodeAt(0) - 97;
  const parts = line.split(/\s*[\(\[]?([a-eA-E])[\)\].\s]\s+/);
  let si = null;
  parts.forEach((p, i) => { if (/[*✓✔]/.test(p) && i >= 2 && i % 2 === 0) si = (i - 2) / 2; });
  return si;
}

function parseText(txt, srcName) {
  const lines = txt.split(/\r?\n/);
  const found = [], skipped = [];
  let cur = null, lastField = null, lastLine = "";

  const finish = () => {
    if (!cur) return;
    const q = clean(cur.q);
    const opts = (cur.opts || []).map(clean).filter(o => o.length);
    const drop = reason => { skipped.push({ reason, q: (q || "").slice(0, 80) }); cur = null; };
    if (!q || q.length < 8) return drop("question-too-short");
    if (opts.length < 2) return drop("less-than-2-options");
    const optKey = o => o.toLowerCase().replace(/\s+/g, " ").trim();
    if (new Set(opts.map(optKey)).size !== opts.length) return drop("duplicate-options");
    const ans = cur.ans != null ? cur.ans : cur.starred;
    if (ans == null) return drop("no-answer-key");
    if (ans < 0 || ans >= opts.length) return drop("answer-out-of-range");
    found.push({
      q, opts, ans, why: clean(cur.why), conf: cur.conf || (cur.starred != null ? "star" : "letter"),
      meta: { ...(cur.lec ? { lec: cur.lec } : {}), ...(cur.year ? { year: cur.year } : {}), src: srcName }
    });
    cur = null;
  };

  for (const raw of lines) {
    const line = raw.replace(/\t/g, "  ").trimEnd();
    if (!line.trim()) continue;
    const bare = line.trim();

    if (cur) {
      const mWhy = bare.match(RE_WHY);
      if (mWhy) { cur.why = clean((cur.why ? cur.why + " " : "") + mWhy[1]); lastField = "why"; continue; }

      const mAns = bare.match(RE_ANS);
      if (mAns) {
        const tok = mAns[1], rest = clean(mAns[2]);
        if (/^[a-eA-E]$/.test(tok)) cur.ans = tok.toLowerCase().charCodeAt(0) - 97;
        else cur.ans = parseInt(tok, 10) - 1;
        if (rest) {  // "Answer: B) option text" ya "Answer: option text"
          const byText = (cur.opts || []).findIndex(o => norm(o) === norm(rest) || sim(o, rest) >= 0.7);
          if (byText >= 0) { cur.ans = byText; cur.conf = "text"; }
        } else cur.conf = "letter";
        continue;
      }
    }

    const inline = splitInline(bare);
    if (cur && inline && !cur.qDone) {
      cur.opts = inline;
      cur.qDone = true;
      const si = starredIndex(bare);
      if (si != null) cur.starred = si;
      lastField = "opt";
      continue;
    }

    const startMatch = bare.match(RE_Q);
    const optMatch = bare.replace(/^[\s*✓✔]+/, "").match(RE_OPT);
    const looksQuestion = startMatch && (!optMatch || startMatch[2].replace(/\s/g, "").length > 14);

    if (looksQuestion && (!cur || cur.qDone || (cur.opts || []).length >= 2)) {
      finish();
      cur = { q: startMatch[2], opts: [], ans: null, why: "", starred: null, qDone: false, conf: null };
      lastField = "q";
      const l = bare.match(RE_LEC); if (l) cur.lec = parseInt(l[1], 10);
      const y = bare.match(RE_YEAR); if (y) cur.year = parseInt(y[1], 10);
      continue;
    }

    if (optMatch && cur && !cur.qDone) {
      const letter = optMatch[1].toUpperCase();
      const idx = /^[1-5]$/.test(letter) ? parseInt(letter, 10) - 1 : letter.charCodeAt(0) - 65;
      cur.opts[idx] = clean(optMatch[2]);
      if (RE_STAR_LEAD.test(bare) || /[*✓✔]/.test(optMatch[2])) cur.starred = idx;
      lastField = "opt";
      continue;
    }

    if (cur) {  // continuation
      if (lastField === "opt" && cur.opts.length) cur.opts[cur.opts.length - 1] = clean(cur.opts[cur.opts.length - 1] + " " + bare);
      else if (lastField === "why") cur.why = clean(cur.why + " " + bare);
      else cur.q = clean(cur.q + " " + bare);
    }
  }
  finish();
  return { found, skipped };
}

/* ---------------- solved-paper parser (Moaaz / VU past-paper style) ----
   Format:
     Question No: 5   ( Marks: 1 ) - Please choose one
     The tree data structure is a
     ► Linear data structure
     ► Non-linear data structure (Page 112)      <-- correct (bold/heading/underline)
     ► Graphical data structure
   Correct option ka nishan: TEXT par bold/heading/underline. "**►**" (sirf marker par
   bold) sirf font ka artifact hai — usse correct na samjho. */
const RE_SOLVED_Q = /Question\s*No\s*[:.\-]?\s*(\d{1,3})/i;
const MARK = /[►▶➢→»]/;

function optScore(raw) {
  const line = String(raw).trim();
  let s = 0;
  const mi = line.search(/[\u25ba\u25b6\u27a2\u2192\u00bb]/);   // ► ▶ ➢ → »
  if (mi < 0) return 0;

  // underline marker (Moaaz files me pakka nishan)
  if (/<u>/.test(line) && /<\/u>/.test(line) &&
      !/<u>\s*(?:[\u25ba\u25b6\u27a2\u2192\u00bb]|<strong>)?\s*<\/u>/.test(line)) s += 4;

  const before = line.slice(0, mi);
  const after = line.slice(mi + 1);
  const wrapsStart = /(?:<strong>|\*\*)\s*$/.test(before);
  const closesRightAfter = /^\s*(?:<\/strong>|\*\*)/.test(after);
  const hasClose = /(?:\*\*|<\/strong>)/.test(after);

  if (wrapsStart) {
    if (closesRightAfter) s -= 2;                       // **►** text  = sirf marker bold (shor)
    else if (hasClose) s += 3;                          // **► text**  = option text bold = correct
  } else {
    const mBold = after.match(/^\s*(?:<strong>|\*\*)\s*([\s\S]*?)\s*(?:<\/strong>|\*\*)/);
    if (mBold && mBold[1].trim().length > 1) s += 4;    // ► **text**  = correct
    else if (mBold && mBold[1].trim().length <= 1) s -= 2;
    if (/^\s*#{1,6}\s*/.test(line) && !mBold) s += 2;   // ## ► text  (heading = bold + bara font)
  }
  return s;
}
function optText(line) {
  return clean(
    line
      .replace(/<strong>|<\/strong>|<u>|<\/u>|<em>|<\/em>/gi, "")
      .replace(/\*\*/g, "")
      .replace(/^\s*#{1,6}\s*/, "")
      .replace(/^[\s►▶➢→»]+/, "")
      .replace(/[\s►▶➢→»]+$/, "")
      .replace(/\(Page\s*\d+\)/i, "")
      .replace(/click here for detail/gi, "")
      .replace(/[\s,;:.]+$/, "")
  );
}
function isNoise(line) {
  const t = line.trim();
  if (!t) return true;
  if (/^\|/.test(t)) return true;                       // footer tables
  if (/^-{3,}$/.test(t)) return true;
  if (/@gmail\.com|mailto:|virtualustaad|^\*\*MC\d/i.test(t)) return true;
  if (/^(page\s*\d+|vu\b|virtual university)/i.test(t)) return true;
  return false;
}

function parseSolved(txt, srcName) {
  const rawLines = txt.split(/\r?\n/);
  const found = [], skipped = [];
  let cur = null;

  const finish = () => {
    if (!cur) return;
    const q = clean(cur.q);
    const opts = cur.opts.map(o => o.text);
    const drop = r => { skipped.push({ reason: r, q: q.slice(0, 80) }); cur = null; };
    if (!q || q.length < 12) return drop("question-too-short");
    if (opts.length < 2) return drop("less-than-2-options");
    if (opts.length > 6) return drop("too-many-options");
    if (opts.some(o => o.length > 300)) return drop("option-too-long");
    if (/Question\s*No|Marks\s*:|Please choose one/i.test(q)) return drop("question-has-meta");
    const optKey = o => o.toLowerCase().replace(/\s+/g, " ").trim();
    if (new Set(opts.map(optKey)).size !== opts.length) return drop("duplicate-options");
    const scored = cur.opts.map((o, i) => ({ i, s: o.score }));
    const max = Math.max(...scored.map(s => s.s));
    const winners = scored.filter(s => s.s === max && s.s > 0);
    if (!winners.length) return drop("no-correct-marker");
    if (winners.length > 1) return drop("multiple-correct-markers");
    const why = clean(cur.why).slice(0, 400);
    const ref = (cur.ref || []).join(" · ");
    found.push({
      q, opts, ans: winners[0].i,
      why: [why, ref].filter(Boolean).join(" — ") ||
           `Sahi jawab: ${opts[winners[0].i]}. (VU past paper se — tafseel update honi hai.)`,
      conf: "solved-marker",
      meta: { src: srcName, ...(cur.marks ? { marks: cur.marks } : {}) }
    });
    cur = null;
  };

  for (const raw of rawLines) {
    const line = raw.replace(/\t/g, "  ").trimEnd();
    if (isNoise(line) && !MARK.test(line)) continue;

    const mQ = line.match(RE_SOLVED_Q);
    if (mQ) {                       // naya question shuru
      finish();
      const m = line.match(/Marks\s*[:.]?\s*(\d+)/i);
      cur = { num: parseInt(mQ[1], 10), q: "", opts: [], why: "", ref: [], marks: m ? parseInt(m[1], 10) : null };
      continue;
    }
    if (!cur) continue;

    if (MARK.test(line) && line.replace(/<[^>]+>/g, "").replace(/\*/g, "").replace(/#/g, "").trim().length > 2) {
      const text = optText(line);
      if (text && text.length > 0 && !/^please choose one/i.test(text)) {
        cur.opts.push({ text, score: optScore(line) });
        const pr = line.match(/\(Page\s*(\d+)\)/i);
        if (pr) cur.ref.push(`Page ${pr[1]}`);
        continue;
      }
    }
    // question text (jab tak options shuru na hon) ya explanation
    const t = clean(line.replace(/^\s*#{1,6}\s*/, ""));
    if (!t || isNoise(line)) continue;
    if (!cur.opts.length) {
      if (/^please choose one/i.test(t)) continue;
      cur.q = cur.q ? cur.q + " " + t : t;
    } else {
      const pr = line.match(/\(Page\s*(\d+)\)/i);
      if (pr) cur.ref.push(`Page ${pr[1]}`);
      cur.why = cur.why ? cur.why + " " + t : t;
    }
  }
  finish();
  return { found, skipped };
}

function looksSolved(txt) {
  const qCount = (txt.match(/Question\s*No\s*[:.\-]?\s*\d+/gi) || []).length;
  const marks = (txt.match(/[►▶➢→»]/g) || []).length;   // g flag zaroori hai (count ke liye)
  const answers = (txt.match(/^\s*(?:ans|answer)\s*[:.\-]/gim) || []).length;
  return qCount >= 4 && marks >= 8 && answers < qCount / 2;
}

/* ---------------- structured parsers ---------------- */
function parseJSON(txt, src) {
  const raw = JSON.parse(txt);
  const arr = Array.isArray(raw) ? raw : Array.isArray(raw.questions) ? raw.questions : Array.isArray(raw.mcqs) ? raw.mcqs : Object.values(raw).find(Array.isArray) || [];
  const found = [], skipped = [];
  for (const it of arr) {
    try {
      let q, opts, ans, why, base = 1, conf = "index";
      if (Array.isArray(it)) { [q, opts, ans, why] = it; base = 0; }
      else if (Array.isArray(it.options)) { q = it.q || it.question; opts = it.options; ans = it.answer ?? it.correct ?? it.correctIndex; why = it.why || it.explanation; }
      else { q = it.question || it.q; opts = [it.a ?? it.A, it.b ?? it.B, it.c ?? it.C, it.d ?? it.D]; ans = it.correct ?? it.answer; why = it.explanation || it.why; }
      opts = (opts || []).map(clean).filter(Boolean);
      if (ANS_BASE !== "auto") base = parseInt(ANS_BASE, 10);
      const idx = toIndex(ans, opts, base);
      if (!clean(q) || opts.length < 2 || idx == null || idx < 0 || idx >= opts.length) { skipped.push({ reason: "invalid-structure", q: clean(q).slice(0, 80) }); continue; }
      if (typeof ans === "string" && !/^[a-eA-E1-5]$/.test(ans.trim())) conf = "text";
      found.push({ q: clean(q), opts, ans: idx, why: clean(why), conf, meta: { src, ...(it.lec ? { lec: it.lec } : {}), ...(it.year ? { year: it.year } : {}) } });
    } catch (e) { skipped.push({ reason: "parse-error: " + e.message.slice(0, 50), q: "" }); }
  }
  return { found, skipped };
}

function parseCSV(txt, src) {
  const rows = txt.split(/\r?\n/).filter(r => r.trim());
  const found = [], skipped = [];
  const head = rows.shift().toLowerCase().split(",").map(s => s.trim().replace(/^"|"$/g, ""));
  const idxOf = (...names) => head.findIndex(h => names.some(n => h.includes(n)));
  const iQ = Math.max(0, idxOf("question", "mcq"));
  const iA = idxOf("optiona", "option_a", "opta") >= 0 ? idxOf("optiona", "option_a", "opta") : idxOf(",a", "a");
  const iAns = idxOf("answer", "correct");
  const iWhy = idxOf("explanation", "why", "reason");
  for (const r of rows) {
    const c = r.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(s => clean(s.replace(/^"|"$/g, "")));
    const q = c[iQ];
    const opts = [c[iA], c[iA + 1], c[iA + 2], c[iA + 3]].filter(Boolean);
    const base = ANS_BASE === "auto" ? 1 : parseInt(ANS_BASE, 10);
    const ans = toIndex(c[iAns], opts, base);
    if (!q || opts.length < 2 || ans == null || ans < 0 || ans >= opts.length) { skipped.push({ reason: "invalid-row", q: clean(q).slice(0, 80) }); continue; }
    found.push({ q, opts, ans, why: iWhy >= 0 ? c[iWhy] : "", conf: "index", meta: { src } });
  }
  return { found, skipped };
}

/* ---------------- target bank guess ---------------- */
/* App ke subjects (code + title) — js/app.js se padhte hain, taake
   "Data Structures Final Term MCQs.txt" jaisi file bhi khud detect ho. */
function loadSubjectTitles() {
  try {
    const app = fs.readFileSync(path.join(ROOT, "js", "app.js"), "utf8");
    return [...app.matchAll(/code:"([A-Z]{2,4}\d{3})"\s*,\s*title:"([^"]+)"/g)]
      .map(m => ({ code: m[1], title: m[2] }));
  } catch (e) { return []; }
}
const SUBJECT_TITLES = loadSubjectTitles();

const squash = s => String(s).toUpperCase().replace(/[_\-.()\[\]|]+/g, " ").replace(/\s+/g, " ").trim();

function examFrom(hay) {
  if (/\bFINALS?\b|\bFINAL\s?TERM\b|\bFINALTERM\b/.test(hay)) return "FINAL";
  if (/\bMID\b|\bMID\s?TERM\b|\bMIDTERM\b|\bMIDS\b/.test(hay)) return "MID";
  const nums = [...hay.matchAll(/LECTURE\s*[#:\-]?\s*(\d{1,3})/g)].map(m => parseInt(m[1], 10));
  if (nums.length) return Math.max(...nums) > 22 ? "FINAL" : "MID";
  return null;
}

function guessBank(filePath, text) {
  if (opt.subject) return String(opt.subject).toUpperCase();
  const fileHay = squash(path.basename(filePath) + " " + path.basename(path.dirname(filePath)));
  const bodyHay = squash(text.slice(0, 800));
  const hay = fileHay + " " + bodyHay;

  // 1) subject CODE (CS201 / CS 201 / CS-201)
  let code = (fileHay.match(/\b([A-Z]{2,4})\s?(\d{3})\b/) || []);
  if (!code.length) code = (bodyHay.match(/\b([A-Z]{2,4})\s?(\d{3})\b/) || []);
  // 2) warna subject ka TITLE match karo (Data Structures -> CS301)
  if (!code.length) {
    for (const s of SUBJECT_TITLES) {
      const t = squash(s.title);
      if (t.length > 6 && hay.includes(t)) { code = [null, s.code.slice(0, s.code.length - 3), s.code.slice(-3)]; break; }
    }
  }
  if (!code.length) return null;

  const cc = (code[1] + code[2]).replace(/[^A-Z0-9]/g, "");
  const fExam = examFrom(fileHay);
  const exam = fExam || examFrom(bodyHay) || "MID";
  return `Q_${cc}_${exam}`;
}

/* ---------------- load db + dedupe index ---------------- */
const DB = JSON.parse(fs.readFileSync(DATA, "utf8"));
const index = [];
for (const [k, bank] of Object.entries(DB))
  for (const L of bank.lv)
    for (const q of L.questions) index.push({ key: k, text: q[0], n: norm(q[0]) });

function findDup(text) {
  const t = norm(text);
  if (t.length < 10) return null;
  for (const e of index) if (e.n === t) return e;
  for (const e of index) if (sim(e.text, text) >= MIN_SIM) return e;
  return null;
}

/* ---------------- inputs ---------------- */
const SKIP_FILES = /^(readme|notes|instructions|license)\.(md|txt)$/i;
function walk(p) {
  const st = fs.statSync(p);
  if (st.isDirectory()) return fs.readdirSync(p).filter(f => !f.startsWith(".")).flatMap(f => walk(path.join(p, f)));
  if (SKIP_FILES.test(path.basename(p))) return [];          // README/hidayat files ko MCQ na samjho
  return /\.(json|csv|txt|md)$/i.test(p) ? [p] : [];
}
const inputs = files.flatMap(f => walk(f));
if (!inputs.length) { console.error("Koi .json/.csv/.txt/.md file nahi mili. (PDF ko pehle text me convert karein: tools/pdf-to-text.py)"); process.exit(1); }

/* ---------------- run ---------------- */
const report = { when: new Date().toISOString(), files: [], perBank: {}, skipped: [], lowConf: [] };
let addedTotal = 0;

for (const f of inputs) {
  const txt = fs.readFileSync(f, "utf8");
  const src = path.basename(f);
  let parsed;
  try {
    parsed = /\.json$/i.test(f) ? parseJSON(txt, src)
      : /\.csv$/i.test(f) ? parseCSV(txt, src)
      : looksSolved(txt) ? parseSolved(txt, src)
      : parseText(txt, src);
  } catch (e) {
    report.files.push({ file: src, parsed: 0, added: 0, dups: 0, skipped: 0, note: "parse fail: " + e.message.slice(0, 60) });
    continue;
  }
  const bankKey = guessBank(f, txt);
  const info = { file: src, bank: bankKey, parsed: parsed.found.length, skipped: parsed.skipped.length, added: 0, dups: 0 };
  report.skipped.push(...parsed.skipped.map(s => ({ ...s, file: src })));

  if (!bankKey) { info.note = "subject detect nahi hua — --subject=Q_XXXX_MID dein"; report.files.push(info); continue; }
  if (!DB[bankKey] && !opt["new-bank"]) { info.note = `bank ${bankKey} exist nahi karta — --new-bank lagayein`; report.files.push(info); continue; }

  const fresh = [];
  for (const q of parsed.found) {
    if (findDup(q.q)) { info.dups++; continue; }
    q.why = q.why || (opt.why === "answer"
      ? `Sahi jawab: ${q.opts[q.ans]}.`
      : `Sahi jawab: ${q.opts[q.ans]}. (VU past paper se — tafseel update honi hai.)`);
    if (q.conf === "text") report.lowConf.push({ q: q.q.slice(0, 90), bank: bankKey });
    fresh.push(q);
    index.push({ key: bankKey, text: q.q, n: norm(q.q) });
  }
  info.added = fresh.length;
  addedTotal += fresh.length;
  report.perBank[bankKey] = (report.perBank[bankKey] || 0) + fresh.length;

  if (fresh.length && !opt.dry) {
    if (!DB[bankKey]) {
      DB[bankKey] = {
        lv: [1, 2, 3].map(i => ({ id: i, icon: "🗂️", name: `Past Papers ${i}`, desc: "Imported past-paper bank", c1: "#8b5cf6", c2: "#0ea5e9", questions: [] })),
        boss: { id: 4, icon: "👑", name: "GRAND BOSS", desc: "15 random questions from ALL levels · 4 hearts", c1: "#facc15", c2: "#ef4444", boss: true, bossCount: 15, questions: [] }
      };
    }
    const bank = DB[bankKey];
    fresh.forEach((q, i) => {
      let target = i % bank.lv.length;
      if (typeof opt.distribute === "string" && /^level\d+$/.test(opt.distribute))
        target = Math.min(bank.lv.length - 1, Math.max(0, parseInt(opt.distribute.replace("level", ""), 10) - 1));
      const entry = [q.q, q.opts, q.ans, q.why];
      if (q.meta && (q.meta.lec || q.meta.year)) entry.push(q.meta);
      bank.lv[target].questions.push(entry);
    });
  }
  report.files.push(info);
}

/* ---------------- validate + write ---------------- */
if (!opt.dry && addedTotal) {
  let q = 0;
  for (const [k, bank] of Object.entries(DB)) {
    if (!bank.lv || !bank.lv.length) throw new Error(k + " has no levels");
    for (const L of bank.lv) for (const e of L.questions) {
      const [txt, opts, ci, why] = e;
      if (!txt || String(txt).length < 8) throw new Error(`${k}: question text too short`);
      if (!Array.isArray(opts) || opts.length < 2) throw new Error(`${k}: bad options — ${String(txt).slice(0, 50)}`);
      if (typeof ci !== "number" || ci < 0 || ci >= opts.length) throw new Error(`${k}: bad answer index — ${String(txt).slice(0, 50)}`);
      if (!why) throw new Error(`${k}: missing why — ${String(txt).slice(0, 50)}`);
      q++;
    }
  }
  const backups = path.join(ROOT, "data", ".backups");
  fs.mkdirSync(backups, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  fs.copyFileSync(DATA, path.join(backups, `mcqs-${stamp}.json`));
  const compact = JSON.stringify(DB);
  fs.writeFileSync(DATA, compact);
  fs.writeFileSync(path.join(ROOT, "data", "mcqs.js"),
    "/* AUTO-GENERATED by tools/build.js — edit data/mcqs.json and re-run build instead. */\nwindow.MCQS=" + compact + ";\n");
  report.totalQuestions = q;
  report.backup = path.relative(ROOT, path.join(backups, `mcqs-${stamp}.json`));
}

/* ---------------- report file ---------------- */
const reportsDir = path.join(ROOT, "reports");
fs.mkdirSync(reportsDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const md = [
  `# Import report — ${report.when}`,
  "",
  `**Mode:** ${opt.dry ? "DRY RUN (kuch save nahi hua)" : "LIVE"}`,
  `**Added:** ${addedTotal} naye MCQs`,
  report.totalQuestions ? `**App me total questions ab:** ${report.totalQuestions}` : "",
  report.backup ? `**Backup:** \`${report.backup}\`` : "",
  "",
  "| File | Target bank | Parsed | Added | Dupes | Skipped | Note |",
  "|---|---|---|---|---|---|---|",
  ...report.files.map(f => `| ${f.file} | ${f.bank || "—"} | ${f.parsed} | ${f.added ?? 0} | ${f.dups ?? 0} | ${f.skipped} | ${f.note || ""} |`),
  "",
  "## Per-bank additions",
  ...(Object.keys(report.perBank).length ? Object.entries(report.perBank).map(([k, v]) => `- **${k}**: +${v}`) : ["- (koi nahi)"]),
  "",
  `## Answer key — text-match se nikale gaye (verify karein) — ${report.lowConf.length}`,
  ...report.lowConf.slice(0, 100).map(s => `- _${s.bank}_ — ${s.q}`),
  "",
  `## Skipped / flagged (${report.skipped.length}) — in par nazar saani zaroori hai`,
  ...report.skipped.slice(0, 250).map(s => `- \`${s.reason}\` — ${s.q || ""} _(${s.file})_`)
].filter(Boolean).join("\n");
fs.writeFileSync(path.join(reportsDir, `import-${stamp}.md`), md);

console.log(`\n${opt.dry ? "DRY RUN — " : ""}Added ${addedTotal} MCQs (${inputs.length} file(s) padhi gayi)`);
for (const [k, v] of Object.entries(report.perBank)) console.log(`  ${k}: +${v}`);
if (report.lowConf.length) console.log(`  ⚠️  answer key text-match se nikli: ${report.lowConf.length} (report me list)`);
if (report.skipped.length) console.log(`  ⚠️  skipped/flagged: ${report.skipped.length} (report me list)`);
console.log(`  📄 report: reports/import-${stamp}.md`);
if (!opt.dry && addedTotal) console.log(`\nAb chalaayein:  node tools/build-standalone.js   (standalone.html update karne ke liye)`);
