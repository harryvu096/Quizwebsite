/* Seeded boards. Every exported level is peel-solvable and has a free arrow. */
(function (root, factory) {
  const Lane = root.Lane || (typeof require !== "undefined" ? require("./logic.js") : null);
  const Arts = root.LaneArts || (typeof require !== "undefined" ? require("./shapearts.js") : null);
  const api = factory(Lane, Arts);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.LaneGen = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (Lane, Arts) {
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
    const arts = Arts.ARTS;
    const n = arts.length;
    const idx = (lv - 1) % n;
    const cycle = Math.floor((lv - 1) / n);
    const scale = 2;
    const mirror = cycle % 2 === 1;
    const rows = Arts.scaleRows(arts[idx].rows, scale, mirror);
    const parsed = Arts.toMask(rows);
    return {
      w: parsed.w,
      h: parsed.h,
      mask: parsed.mask,
      count: parsed.count,
      fill: 0.94,
      minLen: 2,
      maxLen: Math.min(12, 8 + cycle),
      minArrows: 4,
      minWaves: Math.min(2 + Math.floor(cycle / 2), 4),
      minFill: 0.8,
      label: arts[idx].name,
      shape: arts[idx].name,
      tutorial: lv <= 2
    };
  }

  function handcrafted() {
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

  function outside(spec, x, y) {
    return !!(spec && spec.mask && !spec.mask[y][x]);
  }

  function roomCount(spec, w, h) {
    if (!spec || !spec.mask) return w * h;
    let n = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) if (spec.mask[y][x]) n++;
    }
    return n;
  }

  function isBorder(spec, x, y, w, h) {
    if (!spec.mask || !spec.mask[y][x]) return false;
    if (x === 0 || y === 0 || x + 1 === w || y + 1 === h) return true;
    return !spec.mask[y][x - 1] || !spec.mask[y][x + 1] || !spec.mask[y - 1][x] || !spec.mask[y + 1][x];
  }

  function carve(w, h, rng, spec) {
    const grid = [];
    for (let y = 0; y < h; y++) {
      const row = [];
      for (let x = 0; x < w; x++) {
        let blocked = outside(spec, x, y);
        if (!blocked && spec.onlyBorder && !isBorder(spec, x, y, w, h)) blocked = true;
        row.push(blocked);
      }
      grid.push(row);
    }
    if (spec.seedArrows) {
      for (let i = 0; i < spec.seedArrows.length; i++) {
        const cells = spec.seedArrows[i].cells;
        for (let c = 0; c < cells.length; c++) grid[cells[c][1]][cells[c][0]] = true;
      }
    }
    const arrows = [];
    let open = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!grid[y][x]) open++;
    const target = spec.onlyBorder ? Math.floor(open * spec.fill) : Math.floor(roomCount(spec, w, h) * spec.fill);
    let filled = 0;
    if (spec.seedArrows) {
      for (let i = 0; i < spec.seedArrows.length; i++) filled += spec.seedArrows[i].cells.length;
    }
    let guard = 0;
    let id = 1;
    if (spec.seedArrows) {
      for (let i = 0; i < spec.seedArrows.length; i++) id = Math.max(id, spec.seedArrows[i].id + 1);
    }
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
    const ids = shuffle(list.map(function (a) { return a.id; }), rng).slice(0, 18);
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
    for (let y = 0; y < h; y++) {
      const row = [];
      for (let x = 0; x < w; x++) row.push(outside(spec, x, y));
      grid.push(row);
    }
    for (let i = 0; i < arrows.length; i++) {
      for (let c = 0; c < arrows[i].cells.length; c++) {
        grid[arrows[i].cells[c][1]][arrows[i].cells[c][0]] = true;
      }
    }
    let id = 1;
    for (let i = 0; i < arrows.length; i++) id = Math.max(id, arrows[i].id + 1);
    const list = arrows.map(Lane.cloneArrow);
    const target = Math.floor(roomCount(spec, w, h) * spec.fill);
    let filled = 0;
    for (let i = 0; i < list.length; i++) filled += list[i].cells.length;
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
      shape: spec.shape || spec.label,
      tutorial: !!spec.tutorial,
      coach: lv === 1 ? "Pinch, or tap zoom, to look closer. A free line slides out of the picture." : "",
      arrows: arrows.map(function (a) {
        return { id: a.id, dir: a.dir, cells: a.cells.map(function (c) { return [c[0], c[1]]; }) };
      })
    };
  }

  function filledCount(arrows) {
    let n = 0;
    for (let i = 0; i < arrows.length; i++) n += arrows[i].cells.length;
    return n;
  }

  function orientationsOf(cells) {
    const forward = cells.map(function (c) { return [c[0], c[1]]; });
    const backward = forward.slice().reverse();
    const out = [];
    for (let i = 0; i < 2; i++) {
      const seq = i === 0 ? forward : backward;
      if (seq.length < 2) continue;
      const dir = Lane.dirOfStep(seq[seq.length - 2], seq[seq.length - 1]);
      if (dir) out.push({ dir: dir, cells: seq });
    }
    return out;
  }

  function edgeScore(arrow, w, h) {
    const head = arrow.cells[arrow.cells.length - 1];
    const d = Lane.DIRS[arrow.dir];
    if (d.x < 0) return head[0];
    if (d.x > 0) return w - 1 - head[0];
    if (d.y < 0) return head[1];
    return h - 1 - head[1];
  }

  function solvePaths(paths, w, h, rng) {
    let rem = [];
    for (let i = 0; i < paths.length; i++) {
      if (!paths[i] || paths[i].length < 2) continue;
      rem.push({ id: i + 1, cells: paths[i].map(function (c) { return [c[0], c[1]]; }) });
    }
    const placed = [];
    let guard = 0;
    while (rem.length && guard++ < paths.length + 8) {
      const occ = Lane.occupy(rem.map(function (r) { return { id: r.id, dir: "R", cells: r.cells }; }));
      const order = shuffle(rem, rng);
      let picked = null;
      let bestEdge = 1e9;
      for (let i = 0; i < order.length; i++) {
        const options = orientationsOf(order[i].cells);
        for (let k = 0; k < options.length; k++) {
          const arrow = { id: order[i].id, dir: options[k].dir, cells: options[k].cells };
          if (!Lane.validArrow(arrow, w, h) || !Lane.isFree(arrow, occ, w, h)) continue;
          const edge = edgeScore(arrow, w, h);
          if (!picked || edge < bestEdge) {
            picked = arrow;
            bestEdge = edge;
          }
        }
      }
      if (!picked) {
        rem.sort(function (a, b) { return a.cells.length - b.cells.length; });
        rem.shift();
        continue;
      }
      placed.push(picked);
      rem = rem.filter(function (r) { return r.id !== picked.id; });
    }
    return placed;
  }

  function cleanArrows(arrows, w, h) {
    const seen = new Set();
    for (let i = 0; i < arrows.length; i++) {
      if (!Lane.validArrow(arrows[i], w, h)) return false;
      for (let c = 0; c < arrows[i].cells.length; c++) {
        const k = arrows[i].cells[c][0] + "," + arrows[i].cells[c][1];
        if (seen.has(k)) return false;
        seen.add(k);
      }
    }
    return true;
  }

  function generateOne(lv) {
    const spec = specFor(lv);
    let best = null;
    let bestScore = -1;
    for (let attempt = 0; attempt < 8; attempt++) {
      const rng = mulberry32((lv * 100003 + attempt * 97 + 13) >>> 0);
      const borderSpec = Object.assign({}, spec, { onlyBorder: true, fill: 0.99, minLen: 2, maxLen: 8 });
      let carved = carve(spec.w, spec.h, rng, borderSpec);
      const restSpec = Object.assign({}, spec, { seedArrows: carved, fill: 0.98, maxLen: spec.maxLen });
      carved = carved.concat(carve(spec.w, spec.h, rng, restSpec));
      const arrows = solvePaths(carved.map(function (a) { return a.cells; }), spec.w, spec.h, rng);
      if (arrows.length < spec.minArrows || !cleanArrows(arrows, spec.w, spec.h)) continue;
      const peeled = Lane.peel(arrows, spec.w, spec.h);
      if (!peeled.ok) continue;
      const free = Lane.freeArrows(arrows, spec.w, spec.h).length;
      if (free < 1) continue;
      const filled = filledCount(arrows) / spec.count;
      const score = filled * 200 + Math.min(peeled.waves, 12);
      if (score > bestScore) {
        bestScore = score;
        best = pack(lv, spec, arrows);
      }
      if (filled >= 0.9 && free >= 1) return pack(lv, spec, arrows);
    }
    if (best) return best;
    const rng = mulberry32((lv * 17 + 9) >>> 0);
    const fallback = repair(carve(spec.w, spec.h, rng, spec), spec.w, spec.h, rng);
    return pack(lv, spec, fallback.length ? fallback : carve(spec.w, spec.h, rng, spec));
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
    const spec = specFor(8 + (seedLv % 40));
    spec.label = "Daily";
    for (let attempt = 0; attempt < 8; attempt++) {
      const rng = mulberry32((seedLv + attempt * 131) >>> 0);
      let arrows = carve(spec.w, spec.h, rng, spec);
      arrows = repair(arrows, spec.w, spec.h, rng);
      arrows = repair(topUp(arrows, spec.w, spec.h, rng, spec), spec.w, spec.h, rng);
      if (Lane.peel(arrows, spec.w, spec.h).ok && arrows.length >= 6) {
        const packed = pack(0, spec, arrows);
        packed.daily = true;
        packed.label = "Daily";
        return packed;
      }
    }
    const packed = generateOne(18);
    packed.daily = true;
    packed.lv = 0;
    packed.label = "Daily";
    return packed;
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
