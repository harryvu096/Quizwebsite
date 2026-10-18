const fs = require("fs");
const vm = require("vm");
const path = require("path");
const code = fs.readFileSync(path.join(__dirname, "../js/logic.js"), "utf8");
const ctx = { window: {}, console, Math, JSON, Object, Array, Set };
vm.createContext(ctx);
vm.runInContext(code, ctx);
const L = ctx.window.BoltyLogic;
const levels = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/levels.json"), "utf8"));

let fail = 0;
levels.screw.forEach((cfg) => {
  if (!L.screwSolvable(cfg, cfg.lv)) {
    console.error("screw unsolvable", cfg.lv);
    fail++;
  }
});
levels.arrow.forEach((cfg) => {
  const st = L.makeArrow(cfg, cfg.lv);
  const solved = L.arrowWithAnswers(st);
  const walk = L.arrowWalk(solved);
  if (!walk.ok) {
    console.error("arrow answer path fails", cfg.lv, walk.reason, "n", st.n, "path", st.pathLength);
    fail++;
  }
  if (cfg.lv >= 2 && L.wrongArrows(st) < 1) {
    console.error("arrow too easy, no scramble", cfg.lv);
    fail++;
  }
  if (cfg.lv === 1 && L.wrongArrows(st) !== 0) {
    console.error("arrow tutorial should be solved", L.wrongArrows(st));
    fail++;
  }
});
const s1 = L.makeSort(levels.sort[0], 1);
if (s1.target < 6 || s1.colors.length !== 3) {
  console.error("sort config", s1);
  fail++;
}
console.log(fail ? "FAIL " + fail : "OK screw " + levels.screw.length + " arrow " + levels.arrow.length + " sort " + levels.sort.length);
process.exit(fail ? 1 : 0);
