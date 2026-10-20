/* Arrowlane rules. Original tap-away logic, not a port of any publisher's code. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.Lane = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const DIRS = {
    U: { x: 0, y: -1 },
    D: { x: 0, y: 1 },
    L: { x: -1, y: 0 },
    R: { x: 1, y: 0 }
  };
  const OPP = { U: "D", D: "U", L: "R", R: "L" };

  function key(x, y) { return x + "," + y; }

  function occupy(arrows) {
    const map = new Map();
    for (let i = 0; i < arrows.length; i++) {
      const a = arrows[i];
      for (let c = 0; c < a.cells.length; c++) {
        map.set(key(a.cells[c][0], a.cells[c][1]), a.id);
      }
    }
    return map;
  }

  function inGrid(x, y, w, h) {
    return x >= 0 && y >= 0 && x < w && y < h;
  }

  function headOf(arrow) {
    return arrow.cells[arrow.cells.length - 1];
  }

  function selfBlocks(arrow, w, h) {
    const own = new Set();
    for (let i = 0; i < arrow.cells.length; i++) own.add(key(arrow.cells[i][0], arrow.cells[i][1]));
    const head = headOf(arrow);
    const d = DIRS[arrow.dir];
    let x = head[0] + d.x;
    let y = head[1] + d.y;
    while (inGrid(x, y, w, h)) {
      if (own.has(key(x, y))) return true;
      x += d.x;
      y += d.y;
    }
    return false;
  }

  function blocker(arrow, occ, w, h) {
    const d = DIRS[arrow.dir];
    const head = headOf(arrow);
    let x = head[0] + d.x;
    let y = head[1] + d.y;
    while (inGrid(x, y, w, h)) {
      const id = occ.get(key(x, y));
      if (id != null && id !== arrow.id) return { x: x, y: y, id: id };
      x += d.x;
      y += d.y;
    }
    return null;
  }

  function isFree(arrow, arrowsOrOcc, w, h) {
    const occ = arrowsOrOcc instanceof Map ? arrowsOrOcc : occupy(arrowsOrOcc);
    return !blocker(arrow, occ, w, h) && !selfBlocks(arrow, w, h);
  }

  function rayCells(arrow, w, h) {
    const d = DIRS[arrow.dir];
    const head = headOf(arrow);
    const cells = [];
    let x = head[0] + d.x;
    let y = head[1] + d.y;
    while (inGrid(x, y, w, h)) {
      cells.push([x, y]);
      x += d.x;
      y += d.y;
    }
    return cells;
  }

  function peel(arrows, w, h) {
    const rem = arrows.slice();
    const order = [];
    let waves = 0;
    while (rem.length) {
      const occ = occupy(rem);
      const free = [];
      for (let i = 0; i < rem.length; i++) {
        if (isFree(rem[i], occ, w, h)) free.push(rem[i]);
      }
      if (!free.length) return { ok: false, order: order, waves: -1, stuck: rem };
      waves++;
      const gone = new Set();
      for (let i = 0; i < free.length; i++) {
        gone.add(free[i].id);
        order.push(free[i].id);
      }
      for (let i = rem.length - 1; i >= 0; i--) {
        if (gone.has(rem[i].id)) rem.splice(i, 1);
      }
    }
    return { ok: true, order: order, waves: waves, stuck: [] };
  }

  function freeArrows(arrows, w, h) {
    const occ = occupy(arrows);
    const out = [];
    for (let i = 0; i < arrows.length; i++) {
      if (isFree(arrows[i], occ, w, h)) out.push(arrows[i]);
    }
    return out;
  }

  function hint(arrows, w, h) {
    const free = freeArrows(arrows, w, h);
    if (!free.length) return null;
    free.sort(function (a, b) {
      return rayCells(a, w, h).length - rayCells(b, w, h).length;
    });
    return free[0].id;
  }

  function cloneArrow(a) {
    return { id: a.id, dir: a.dir, cells: a.cells.map(function (c) { return [c[0], c[1]]; }) };
  }

  function reverseArrow(arrow) {
    const cells = arrow.cells.map(function (c) { return [c[0], c[1]]; }).reverse();
    let dir = arrow.dir;
    if (cells.length >= 2) {
      const a = cells[cells.length - 2];
      const b = cells[cells.length - 1];
      if (b[0] === a[0] + 1) dir = "R";
      else if (b[0] === a[0] - 1) dir = "L";
      else if (b[1] === a[1] + 1) dir = "D";
      else if (b[1] === a[1] - 1) dir = "U";
      else dir = OPP[arrow.dir];
    } else {
      dir = OPP[arrow.dir];
    }
    return { id: arrow.id, dir: dir, cells: cells };
  }

  function dirOfStep(a, b) {
    if (b[0] === a[0] + 1 && b[1] === a[1]) return "R";
    if (b[0] === a[0] - 1 && b[1] === a[1]) return "L";
    if (b[1] === a[1] + 1 && b[0] === a[0]) return "D";
    if (b[1] === a[1] - 1 && b[0] === a[0]) return "U";
    return null;
  }

  function validArrow(arrow, w, h) {
    if (!arrow || !DIRS[arrow.dir] || !arrow.cells || !arrow.cells.length) return false;
    const seen = new Set();
    for (let i = 0; i < arrow.cells.length; i++) {
      const c = arrow.cells[i];
      if (!inGrid(c[0], c[1], w, h)) return false;
      const k = key(c[0], c[1]);
      if (seen.has(k)) return false;
      seen.add(k);
      if (i > 0) {
        const prev = arrow.cells[i - 1];
        if (Math.abs(prev[0] - c[0]) + Math.abs(prev[1] - c[1]) !== 1) return false;
      }
    }
    if (arrow.cells.length >= 2) {
      const n = arrow.cells.length;
      if (dirOfStep(arrow.cells[n - 2], arrow.cells[n - 1]) !== arrow.dir) return false;
    }
    if (selfBlocks(arrow, w, h)) return false;
    return true;
  }

  return {
    DIRS: DIRS,
    OPP: OPP,
    occupy: occupy,
    selfBlocks: selfBlocks,
    blocker: blocker,
    isFree: isFree,
    rayCells: rayCells,
    peel: peel,
    freeArrows: freeArrows,
    hint: hint,
    cloneArrow: cloneArrow,
    reverseArrow: reverseArrow,
    dirOfStep: dirOfStep,
    validArrow: validArrow,
    headOf: headOf
  };
});
