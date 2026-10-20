const Lane = require("../js/logic.js");
const Gen = require("../js/gen.js");
const fs = require("fs");
const path = require("path");

function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL", msg);
    process.exit(1);
  }
}

const cycle = [
  { id: 1, dir: "R", cells: [[0, 0], [1, 0]] },
  { id: 2, dir: "L", cells: [[3, 0], [2, 0]] }
];
assert(Lane.peel(cycle, 4, 1).ok === false, "mutual block is unsolvable");
const opened = [cycle[0], Lane.reverseArrow(cycle[1])];
assert(Lane.peel(opened, 4, 1).ok, "reversing one end opens the board");

for (let lv = 1; lv <= 3; lv++) {
  const level = Gen.handcrafted(lv);
  assert(Lane.peel(level.arrows, level.w, level.h).ok, "handmade " + lv + " solvable");
  assert(Lane.freeArrows(level.arrows, level.w, level.h).length >= 1, "handmade " + lv + " has a free arrow");
  level.arrows.forEach(function (a) {
    assert(Lane.validArrow(a, level.w, level.h), "handmade arrow " + lv + ":" + a.id);
  });
}

const COUNT = Number(process.env.LANE_COUNT || 200);
console.log("generating", COUNT);
const t0 = Date.now();
const levels = Gen.campaign(COUNT);
console.log("generated in", Date.now() - t0, "ms");

let minWaves = 99;
let maxArrows = 0;
levels.forEach(function (level, i) {
  const lv = i + 1;
  const peeled = Lane.peel(level.arrows, level.w, level.h);
  assert(peeled.ok, "level " + lv + " unsolvable");
  assert(Lane.freeArrows(level.arrows, level.w, level.h).length >= 1, "level " + lv + " no free arrow");
  const seen = new Set();
  level.arrows.forEach(function (a) {
    assert(Lane.validArrow(a, level.w, level.h), "invalid arrow L" + lv + " #" + a.id);
    a.cells.forEach(function (c) {
      const k = c[0] + "," + c[1];
      assert(!seen.has(k), "overlap L" + lv + " " + k);
      seen.add(k);
    });
  });
  assert(level.arrows.length >= 3, "too few arrows L" + lv);
  if (peeled.waves < minWaves) minWaves = peeled.waves;
  if (level.arrows.length > maxArrows) maxArrows = level.arrows.length;
  if (lv > 20) assert(peeled.waves >= 2, "shallow L" + lv);
});

const out = path.join(__dirname, "..", "data", "levels.js");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, "window.LANE_LEVELS = " + JSON.stringify(levels) + ";\n");
fs.writeFileSync(path.join(__dirname, "..", "data", "levels.json"), JSON.stringify(levels));
console.log("OK", levels.length, "levels; max arrows", maxArrows, "; min waves", minWaves);
console.log("L1 free", Lane.freeArrows(levels[0].arrows, levels[0].w, levels[0].h).map(function (a) { return a.id; }).join(","));
console.log("L24", levels[23].w + "x" + levels[23].h, "arrows", levels[23].arrows.length, "waves", Lane.peel(levels[23].arrows, levels[23].w, levels[23].h).waves);
console.log("L160", levels[159].w + "x" + levels[159].h, "arrows", levels[159].arrows.length, "waves", Lane.peel(levels[159].arrows, levels[159].w, levels[159].h).waves);
