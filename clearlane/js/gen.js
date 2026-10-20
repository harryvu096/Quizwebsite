/* Seeded boards. Every exported level is peel-solvable and has a free arrow. */
(function (root, factory) {
  const Lane = root.Lane || (typeof require !== "undefined" ? require("./logic.js") : null);
  const api = factory(Lane);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.LaneGen = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (Lane) {
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(list, rng) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function specFor(lv) {
    if (lv <= 3) return { w: 5, h: 6, fill: 0.42, minLen: 2, maxLen: 4, minArrows: 3, minWaves: 2, minFill: 0.3, label: "Normal", tutorial: true };
    if (lv <= 12) return { w: 6, h: 8, fill: 0.7, minLen: 2, maxLen: 5, minArrows: 8, minWaves: 2, minFill: 0.55, label: "Normal" };
    if (lv <= 30) return { w: 7 + (lv % 2), h: 9 + (lv % 2), fill: 0.78, minLen: 2, maxLen: 6, minArrows: 12, minWaves: 3, minFill: 0.62, label: "Normal" };
    if (lv <= 60) return { w: 8, h: 11, fill: 0.8, minLen: 2, maxLen: 7, minArrows: 16, minWaves: 3, minFill: 0.64, label: "Hard" };
    if (lv <= 100) return { w: 9, h: 12, fill: 0.82, minLen: 2, maxLen: 8, minArrows: 20, minWaves: 4, minFill: 0.66, label: "Hard" };
    if (lv <= 140) return { w: 9, h: 14, fill: 0.84, minLen: 2, maxLen: 8, minArrows: 24, minWaves: 4, minFill: 0.68, label: "Super Hard" };
    return { w: 10, h: 15, fill: 0.84, minLen: 2, maxLen: 9, minArrows: 26, minWaves: 5, minFill: 0.68, label: "Expert" };
  }

  function handcrafted(lv) {
    if (lv === 1) {
      return {
        lv: 1, w: 6, h: 8, label: "Normal", tutorial: true,
        title: "Clear the Board",
        coach: "Tap the gold arrow.",
        arrows: [
          { id: 1, dir: "D", cells: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5]] },
          { id: 2, dir: "R", cells: [[2, 0], [3, 0], [4, 0], [5, 0]] },
          { id: 3, dir: "U", cells: [[1, 2], [2, 2], [3, 2], [3, 1]] },
          { id: 4, dir: "D", cells: [[5, 2], [5, 3], [5, 4], [5, 5]] },
          { id: 5, dir: "L", cells: [[2, 4], [2, 5], [2, 6], [1, 6]] },
          { id: 6, dir: "D", cells: [[4, 3], [3, 3], [3, 4], [3, 5]] },
          { id: 7, dir: "D", cells: [[1, 4], [1, 5]] },
          { id: 8, dir: "R", cells: [[4, 7], [5, 7]] }
        ]
      };
    }
    if (lv === 2) {
      return {
        lv: 2, w: 6, h: 7, label: "Normal", tutorial: true,
        title: "Tap Away Arrows",
        coach: "A bend still leaves straight from its head.",
        arrows: [
          { id: 1, dir: "R", cells: [[3, 1], [4, 1], [5, 1]] },
          { id: 2, dir: "L", cells: [[4, 0], [3, 0], [2, 0], [1, 0]] },
          { id: 3, dir: "D", cells: [[0, 0], [0, 1], [0, 2], [0, 3]] },
          { id: 4, dir: "L", cells: [[5, 2], [4, 2], [3, 2], [2, 2]] },
          { id: 5, dir: "R", cells: [[1, 1], [2, 1]] },
          { id: 6, dir: "D", cells: [[4, 3], [4, 4], [4, 5], [4, 6]] },
          { id: 7, dir: "R", cells: [[1, 3], [2, 3], [3, 3]] },
          { id: 8, dir: "L", cells: [[2, 4], [2, 5], [1, 5], [0, 5]] },
          { id: 9, dir: "U", cells: [[5, 6], [5, 5], [5, 4]] },
          { id: 10, dir: "R", cells: [[1, 6], [2, 6], [3, 6]] },
          { id: 11, dir: "D", cells: [[3, 4], [3, 5]] }
        ]
      };
    }
    if (lv === 3) {
      return {
        lv: 3, w: 6, h: 8, label: "Normal", tutorial: true,
        title: "Find a Free Path",
        coach: "If the lane is blocked, clear that arrow first.",
        arrows: [
          { id: 1, dir: "U", cells: [[0, 2], [0, 1], [0, 0]] },
          { id: 2, dir: "L", cells: [[4, 0], [3, 0], [2, 0], [1, 0]] },
          { id: 3, dir: "D", cells: [[5, 1], [5, 2], [5, 3], [5, 4]] },
          { id: 4, dir: "L", cells: [[4, 2], [3, 2], [2, 2], [1, 2]] },
          { id: 5, dir: "D", cells: [[2, 3], [2, 4], [2, 5], [2, 6]] },
          { id: 6, dir: "R", cells: [[0, 4], [1, 4]] },
          { id: 7, dir: "D", cells: [[4, 4], [4, 5], [4, 6], [4, 7]] },
          { id: 8, dir: "D", cells: [[5, 5], [5, 6], [5, 7]] },
          { id: 9, dir: "R", cells: [[1, 7], [2, 7], [3, 7]] },
          { id: 10, dir: "D", cells: [[1, 5], [1, 6]] },
          { id: 11, dir: "R", cells: [[1, 1], [2, 1], [3, 1]] },
          { id: 12, dir: "U", cells: [[0, 7], [0, 6]] },
          { id: 13, dir: "R", cells: [[3, 3], [4, 3]] }
        ]
      };
    }
    return null;
  }

  function neighbors(x, y, w, h) {
    const out = [];
    if (x > 0) out.push([x - 1, y]);
    if (x + 1 < w) out.push([x + 1, y]);
    if (y > 0) out.push([x, y - 1]);
    if (y + 1 < h) out.push([x, y + 1]);
    return out;
  }

  function edgeDir(x, y, w, h, rng) {
    const options = [
      ["L", x],
      ["R", w - 1 - x],
      ["U", y],
      ["D", h - 1 - y]
    ].sort(function (a, b) { return a[1] - b[1]; });
    if (rng() < 0.72) return options[0][0];
    return options[Math.floor(rng() * options.length)][0];
  }

  function orient(path, w, h, rng) {
    if (path.length === 1) {
      return { dir: edgeDir(path[0][0], path[0][1], w, h, rng), cells: [[path[0][0], path[0][1]]] };
    }
    const forward = path.map(function (c) { return [c[0], c[1]]; });
    const backward = forward.slice().reverse();
    const options = [forward, backward];
    const good = [];
    for (let i = 0; i < options.length; i++) {
      const cells = options[i];
      const dir = Lane.dirOfStep(cells[cells.length - 2], cells[cells.length - 1]);
      const arrow = { id: 0, dir: dir, cells: cells };
      if (dir && Lane.validArrow(arrow, w, h)) good.push(arrow);
    }
    if (!good.length) return null;
    return good[Math.floor(rng() * good.length)];
  }

  function carve(w, h, rng, spec) {
    const grid = [];
    for (let y = 0; y < h; y++) {
      grid.push(new Array(w).fill(false));
    }
    const arrows = [];
    const target = Math.floor(w * h * spec.fill);
    let filled = 0;
    let guard = 0;
    let id = 1;
    while (filled < target && guard++ < w * h * 6) {
      const empties = [];
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) if (!grid[y][x]) empties.push([x, y]);
      }
      if (!empties.length) break;
      const start = empties[Math.floor(rng() * empties.length)];
      const path = [[start[0], start[1]]];
      grid[start[1]][start[0]] = true;
      const span = spec.maxLen - spec.minLen + 1;
      const want = spec.minLen + Math.floor(rng() * span);
      while (path.length < want) {
        const cur = path[path.length - 1];
        const prev = path.length > 1 ? path[path.length - 2] : null;
        const options = neighbors(cur[0], cur[1], w, h).filter(function (n) {
          return !grid[n[1]][n[0]];
        });
        if (!options.length) break;
        let pick = null;
        if (prev && rng() < 0.72) {
          const sx = cur[0] + (cur[0] - prev[0]);
          const sy = cur[1] + (cur[1] - prev[1]);
          for (let i = 0; i < options.length; i++) {
            if (options[i][0] === sx && options[i][1] === sy) pick = options[i];
          }
        }
        if (!pick) pick = options[Math.floor(rng() * options.length)];
        grid[pick[1]][pick[0]] = true;
        path.push([pick[0], pick[1]]);
      }
      const built = orient(path, w, h, rng);
      if (!built || path.length < spec.minLen && path.length !== 1) {
        for (let i = 0; i < path.length; i++) grid[path[i][1]][path[i][0]] = false;
        continue;
      }
      if (path.length < spec.minLen) {
        for (let i = 0; i < path.length; i++) grid[path[i][1]][path[i][0]] = false;
        continue;
      }
      built.id = id++;
      arrows.push(built);
      filled += built.cells.length;
    }
    return arrows;
  }

  function repair(arrows, w, h, rng) {
    const list = arrows.map(Lane.cloneArrow);
    for (let iter = 0; iter < list.length * 6 + 8; iter++) {
      const res = Lane.peel(list, w, h);
      if (res.ok) return list;
      const stuck = shuffle(res.stuck, rng);
      let fixed = false;
      for (let i = 0; i < stuck.length; i++) {
        const rev = Lane.reverseArrow(stuck[i]);
        if (!Lane.validArrow(rev, w, h)) continue;
        const trial = list.map(function (a) { return a.id === rev.id ? rev : a; });
        const occ = Lane.occupy(trial);
        if (Lane.isFree(rev, occ, w, h)) {
          const idx = list.findIndex(function (a) { return a.id === rev.id; });
          list[idx] = rev;
          fixed = true;
          break;
        }
      }
      if (!fixed) {
        const victim = stuck[stuck.length - 1];
        const idx = list.findIndex(function (a) { return a.id === victim.id; });
        if (idx >= 0) list.splice(idx, 1);
      }
      if (!list.length) return list;
    }
    const res = Lane.peel(list, w, h);
    if (res.ok) return list;
    return res.stuck.length ? [] : list;
  }

  function deepen(arrows, w, h, rng, minWaves) {
    const list = arrows.map(Lane.cloneArrow);
    const ids = shuffle(list.map(function (a) { return a.id; }), rng);
    for (let i = 0; i < ids.length; i++) {
      const cur = list.find(function (a) { return a.id === ids[i]; });
      if (!cur) continue;
      const rev = Lane.reverseArrow(cur);
      if (!Lane.validArrow(rev, w, h)) continue;
      const trial = list.map(function (a) { return a.id === rev.id ? rev : a; });
      const peeled = Lane.peel(trial, w, h);
      if (!peeled.ok) continue;
      const beforeFree = Lane.freeArrows(list, w, h).length;
      const afterFree = Lane.freeArrows(trial, w, h).length;
      if (afterFree >= 1 && afterFree < beforeFree) {
        const idx = list.findIndex(function (a) { return a.id === rev.id; });
        list[idx] = rev;
      }
      if (Lane.peel(list, w, h).waves >= minWaves && Lane.freeArrows(list, w, h).length <= Math.max(2, Math.floor(list.length * 0.34))) {
        break;
      }
    }
    return list;
  }

  function occupancy(arrows, w, h) {
    let n = 0;
    for (let i = 0; i < arrows.length; i++) n += arrows[i].cells.length;
    return n / (w * h);
  }

  function topUp(arrows, w, h, rng, spec) {
    const grid = [];
    for (let y = 0; y < h; y++) grid.push(new Array(w).fill(false));
    for (let i = 0; i < arrows.length; i++) {
      for (let c = 0; c < arrows[i].cells.length; c++) {
        grid[arrows[i].cells[c][1]][arrows[i].cells[c][0]] = true;
      }
    }
    let id = 1;
    for (let i = 0; i < arrows.length; i++) id = Math.max(id, arrows[i].id + 1);
    const list = arrows.map(Lane.cloneArrow);
    const target = Math.floor(w * h * spec.fill);
    let filled = Math.round(occupancy(list, w, h) * w * h);
    let guard = 0;
    while (filled < target && guard++ < w * h * 5) {
      const empties = [];
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) if (!grid[y][x]) empties.push([x, y]);
      }
      if (!empties.length) break;
      const start = empties[Math.floor(rng() * empties.length)];
      const path = [[start[0], start[1]]];
      grid[start[1]][start[0]] = true;
      const want = 2 + Math.floor(rng() * 3);
      while (path.length < want) {
        const cur = path[path.length - 1];
        const prev = path.length > 1 ? path[path.length - 2] : null;
        const options = neighbors(cur[0], cur[1], w, h).filter(function (n) { return !grid[n[1]][n[0]]; });
        if (!options.length) break;
        let pick = null;
        if (prev && rng() < 0.72) {
          const sx = cur[0] + (cur[0] - prev[0]);
          const sy = cur[1] + (cur[1] - prev[1]);
          for (let i = 0; i < options.length; i++) {
            if (options[i][0] === sx && options[i][1] === sy) pick = options[i];
          }
        }
        if (!pick) pick = options[Math.floor(rng() * options.length)];
        grid[pick[1]][pick[0]] = true;
        path.push(pick);
      }
      const built = orient(path, w, h, rng);
      if (!built || path.length < 2) {
        for (let i = 0; i < path.length; i++) grid[path[i][1]][path[i][0]] = false;
        continue;
      }
      built.id = id++;
      list.push(built);
      filled += built.cells.length;
    }
    return list;
  }

  function pack(lv, spec, arrows) {
    return {
      lv: lv,
      w: spec.w,
      h: spec.h,
      label: spec.label,
      tutorial: !!spec.tutorial,
      arrows: arrows.map(function (a) {
        return { id: a.id, dir: a.dir, cells: a.cells.map(function (c) { return [c[0], c[1]]; }) };
      })
    };
  }

  function generateOne(lv) {
    const handmade = handcrafted(lv);
    if (handmade) return handmade;
    const spec = specFor(lv);
    let best = null;
    let bestScore = -1;
    for (let attempt = 0; attempt < 28; attempt++) {
      const rng = mulberry32((lv * 100003 + attempt * 97 + 13) >>> 0);
      let arrows = carve(spec.w, spec.h, rng, spec);
      arrows = repair(arrows, spec.w, spec.h, rng);
      arrows = topUp(arrows, spec.w, spec.h, rng, spec);
      arrows = repair(arrows, spec.w, spec.h, rng);
      if (arrows.length < Math.min(spec.minArrows, 8)) continue;
      arrows = deepen(arrows, spec.w, spec.h, rng, spec.minWaves);
      const peeled = Lane.peel(arrows, spec.w, spec.h);
      if (!peeled.ok) continue;
      const free = Lane.freeArrows(arrows, spec.w, spec.h).length;
      if (free < 1) continue;
      let overlap = false;
      const seen = new Set();
      for (let i = 0; i < arrows.length && !overlap; i++) {
        if (!Lane.validArrow(arrows[i], spec.w, spec.h)) overlap = true;
        for (let c = 0; c < arrows[i].cells.length; c++) {
          const k = arrows[i].cells[c][0] + "," + arrows[i].cells[c][1];
          if (seen.has(k)) overlap = true;
          seen.add(k);
        }
      }
      if (overlap) continue;
      const filled = occupancy(arrows, spec.w, spec.h);
      const score = peeled.waves * 8 + arrows.length + filled * 20 - Math.abs(free - 2) * 2;
      if (score > bestScore && filled >= (spec.minFill || 0.4) * 0.85) {
        bestScore = score;
        best = pack(lv, spec, arrows);
        best._waves = peeled.waves;
        best._free = free;
      }
      if (peeled.waves >= spec.minWaves && free <= Math.max(3, Math.floor(arrows.length * 0.4)) && arrows.length >= spec.minArrows && filled >= (spec.minFill || 0.45)) {
        return pack(lv, spec, arrows);
      }
    }
    if (best) {
      delete best._waves;
      delete best._free;
      return best;
    }
    const rng = mulberry32((lv * 17 + 9) >>> 0);
    const fallback = repair(carve(spec.w, spec.h, rng, spec), spec.w, spec.h, rng);
    return pack(lv, spec, fallback);
  }

  function campaign(count) {
    const levels = [];
    for (let lv = 1; lv <= count; lv++) levels.push(generateOne(lv));
    return levels;
  }

  function daily(date) {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const seedLv = 4000 + (y * 372 + m * 31 + d) % 5000;
    const spec = { w: 8, h: 10, fill: 0.7, minLen: 2, maxLen: 6, minArrows: 8, minWaves: 3, minFill: 0.5, label: "Daily" };
    for (let attempt = 0; attempt < 12; attempt++) {
      const rng = mulberry32((seedLv + attempt * 131) >>> 0);
      let arrows = repair(carve(spec.w, spec.h, rng, spec), spec.w, spec.h, rng);
      arrows = repair(topUp(arrows, spec.w, spec.h, rng, spec), spec.w, spec.h, rng);
      arrows = deepen(arrows, spec.w, spec.h, rng, 3);
      if (Lane.peel(arrows, spec.w, spec.h).ok && arrows.length >= 6) {
        return {
          lv: 0,
          daily: true,
          w: spec.w,
          h: spec.h,
          label: "Daily",
          title: "Daily",
          arrows: arrows.map(function (a) {
            return { id: a.id, dir: a.dir, cells: a.cells.map(function (c) { return [c[0], c[1]]; }) };
          })
        };
      }
    }
    return generateOne(80);
  }

  return {
    mulberry32: mulberry32,
    specFor: specFor,
    handcrafted: handcrafted,
    generateOne: generateOne,
    campaign: campaign,
    daily: daily
  };
});
