/* =====================================================================
   AHW Quizverse build tool
   1) Extracts the existing Q_* banks embedded in index.html (if still present)
   2) Merges them with data/mcqs.json + data-new/part*.json (if present)
   3) Validates every question (index, options, explanation, duplicates)
   4) REBALANCES answer positions (deterministic seeded shuffle) so the
      correct answer is spread evenly across A/B/C/D — no more "answer is
      always the first option" pattern in the stored data.
   5) Writes data/mcqs.json  (single source of truth — ALL subjects' MCQs)
      and  data/mcqs.js      (mirror loaded via <script> so the site also
                              works when opened directly as an HTML file)
   Usage:  node tools/build.js
   ===================================================================== */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

function read(p) { return fs.readFileSync(path.join(ROOT, p), "utf8"); }

/* deterministic PRNG so re-running the build produces identical output */
function hashStr(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- 1) existing embedded banks ---------- */
let existing = {};
const html = read("index.html");
const mScript = html.match(/<script>([\s\S]*?)<\/script>/);
if (mScript) {
  const js = mScript[1];
  const dStart = js.indexOf("/* ===== Q format");
  const rStart = js.indexOf("const QREG");
  if (dStart >= 0 && rStart > dStart) {
    const dataCode = js.slice(dStart, rStart);
    const names = [...dataCode.matchAll(/^const (Q_[A-Z0-9_]+)\s*=/gm)].map(m => m[1]);
    if (names.length) {
      const fn = new Function(dataCode + "\nreturn {" + names.map(n => n + ":" + n).join(",") + "};");
      existing = fn();
      console.log("extracted embedded banks:", names.length);
    }
  }
}

/* ---------- 2) merge current json + new parts ---------- */
let merged = {};
try { merged = JSON.parse(read("data/mcqs.json")); console.log("loaded existing mcqs.json banks:", Object.keys(merged).length); } catch (e) { /* first build */ }
Object.assign(merged, existing);
const dn = path.join(ROOT, "data-new");
if (fs.existsSync(dn)) {
  for (const f of fs.readdirSync(dn).filter(f => f.endsWith(".json")).sort()) {
    const part = JSON.parse(read("data-new/" + f));
    Object.assign(merged, part);
    console.log("merged", f, "banks:", Object.keys(part).length);
  }
}

/* ---------- 3) validate (hard errors) ---------- */
let q = 0;
for (const [k, bank] of Object.entries(merged)) {
  if (!bank.lv || !bank.lv.length) throw new Error(k + " has no levels");
  const groups = bank.lv.concat(bank.boss && bank.boss.questions && bank.boss.questions.length ? [bank.boss] : []);
  for (const L of groups) {
    for (const entry of L.questions) {
      const [txt, opts, ci, why] = entry;
      if (typeof txt !== "string" || !txt.trim()) throw new Error(k + " empty question text");
      if (!Array.isArray(opts) || opts.length < 2) throw new Error(k + " needs >=2 options: " + txt.slice(0, 40));
      if (typeof ci !== "number" || ci < 0 || ci >= opts.length) throw new Error(k + " bad index: " + txt.slice(0, 40));
      if (!why || !String(why).trim()) throw new Error(k + " missing why: " + txt.slice(0, 40));
      const norm = opts.map(o => String(o).trim().toLowerCase());
      if (new Set(norm).size !== norm.length) throw new Error(k + " duplicate options: " + txt.slice(0, 40));
      q++;
    }
  }
}
console.log("validation OK — banks:", Object.keys(merged).length, "| questions:", q);

/* ---------- 4) rebalance answer positions (deterministic) ---------- */
/* shuffle each question's options with a PRNG seeded by its text so the
   correct index spreads evenly across 0..3 — and rebuilds stay stable */
for (const bank of Object.values(merged)) {
  const groups = bank.lv.concat(bank.boss && bank.boss.questions && bank.boss.questions.length ? [bank.boss] : []);
  for (const L of groups) {
    for (const entry of L.questions) {
      const [txt, opts, ci] = entry;
      const ans = opts[ci];
      const rnd = mulberry32(hashStr(txt));
      for (let i = opts.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [opts[i], opts[j]] = [opts[j], opts[i]];
      }
      entry[2] = opts.indexOf(ans);   // keep pointing at the SAME answer text
    }
  }
}
const dist = [0, 0, 0, 0, 0];
for (const bank of Object.values(merged)) {
  const groups = bank.lv.concat(bank.boss && bank.boss.questions && bank.boss.questions.length ? [bank.boss] : []);
  for (const L of groups) for (const entry of L.questions) dist[entry[2]] = (dist[entry[2]] || 0) + 1;
}
console.log("answer-position distribution after rebalance:",
  dist.slice(0, 4).map(x => Math.round(100 * x / q) + "%").join(" / "));

/* ---------- 5) write outputs ---------- */
const compact = JSON.stringify(merged);
fs.writeFileSync(path.join(ROOT, "data/mcqs.json"), compact);
fs.writeFileSync(path.join(ROOT, "data/mcqs.js"), "/* AUTO-GENERATED by tools/build.js — edit data/mcqs.json and re-run build instead. */\nwindow.MCQS=" + compact + ";\n");
console.log("wrote data/mcqs.json (" + (compact.length / 1024).toFixed(0) + " KB) and data/mcqs.js");
