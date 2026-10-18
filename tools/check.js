/* =====================================================================
   AHW Quizverse — data & repo checker (CI-friendly)
   Run:  node tools/check.js     (exit code 1 on hard errors)
   - structure: every question has text / >=2 unique options / valid index / why
   - INTRA-bank duplicate questions          -> ERROR
   - cross-bank duplicates                   -> info only (same topic, 2 courses)
   - answer-position balance per bank        -> WARN if >45% at one position
   - explanation length                      -> WARN if median < 25 chars
   ===================================================================== */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

let errors = 0, warnings = 0;
const err = m => { errors++; console.log("  ✗ ERROR:", m); };
const warn = m => { warnings++; console.log("  ⚠ WARN :", m); };

const src = fs.readFileSync(path.join(ROOT, "data/mcqs.js"), "utf8");
const m = src.match(/window\.MCQS\s*=\s*([\s\S]+);\s*$/);
if (!m) { console.log("✗ cannot parse data/mcqs.js"); process.exit(1); }
const M = JSON.parse(m[1]);

const banks = Object.keys(M);
let total = 0;
const globalSeen = new Map();
const allExpl = [];

console.log("Checking", banks.length, "banks...\n");

for (const b of banks) {
  const bank = M[b];
  if (!bank.lv || !bank.lv.length) { err(b + ": no levels"); continue; }
  const groups = [];
  bank.lv.forEach((L, i) => groups.push(["L" + (i + 1), L]));
  if (bank.boss && bank.boss.questions && bank.boss.questions.length) groups.push(["boss", bank.boss]);

  const seen = new Map();
  const dist = [0, 0, 0, 0, 0];
  let n = 0;

  for (const [tag, L] of groups) {
    for (const entry of L.questions) {
      const [txt, opts, ci, why] = entry;
      const loc = b + "/" + tag;
      n++; total++;
      if (typeof txt !== "string" || !txt.trim()) err(loc + ": empty question text");
      if (!Array.isArray(opts) || opts.length < 2) err(loc + ": <2 options — " + String(txt).slice(0, 40));
      else {
        const norm = opts.map(o => String(o).trim().toLowerCase());
        if (new Set(norm).size !== norm.length) err(loc + ": duplicate options — " + String(txt).slice(0, 40));
        if (typeof ci !== "number" || ci < 0 || ci >= opts.length) err(loc + ": bad answer index — " + String(txt).slice(0, 40));
        else dist[ci]++;
      }
      if (!why || !String(why).trim()) err(loc + ": missing explanation — " + String(txt).slice(0, 40));
      else allExpl.push(String(why).length);

      const key = String(txt).toLowerCase().replace(/\s+/g, " ").trim();
      if (seen.has(key)) err(loc + ": INTRA-BANK duplicate of " + seen.get(key) + " — " + key.slice(0, 50));
      else seen.set(key, loc);
      if (globalSeen.has(key)) globalSeen.get(key).push(loc); else globalSeen.set(key, [loc]);
    }
  }

  const pct = i => n ? Math.round(100 * dist[i] / n) : 0;
  const maxPct = Math.max(pct(0), pct(1), pct(2), pct(3));
  if (n >= 10 && maxPct > 45) warn(b + ": answer position skew " + pct(0) + "/" + pct(1) + "/" + pct(2) + "/" + pct(3) + " (" + n + "q)");
}

let cross = 0;
for (const locs of globalSeen.values()) if (locs.length > 1) cross++;
if (cross) console.log("\n  ℹ info :", cross, "question texts appear in multiple subject banks (OK for shared topics)");

allExpl.sort((a, b) => a - b);
const med = allExpl.length ? allExpl[Math.floor(allExpl.length / 2)] : 0;
if (med < 25) warn("median explanation is only " + med + " chars — explanations should teach, not just label");

console.log("\n" + "─".repeat(50));
console.log("questions:", total, "| banks:", banks.length, "| errors:", errors, "| warnings:", warnings);
process.exit(errors ? 1 : 0);
