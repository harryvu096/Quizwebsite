/* Bolty's Puzzle Park — pure level + rules logic (no DOM). */
(function (root) {
  const COLORS = [
    { id: "red", name: "Red", hex: "#ff4d6d", ink: "#fff" },
    { id: "blue", name: "Blue", hex: "#3d7eff", ink: "#fff" },
    { id: "green", name: "Green", hex: "#12b981", ink: "#fff" },
    { id: "yellow", name: "Gold", hex: "#f5b301", ink: "#3a2a00" },
    { id: "purple", name: "Violet", hex: "#8b5cf6", ink: "#fff" }
  ];
  const DIRS = {
    up: [0, -1],
    right: [1, 0],
    down: [0, 1],
    left: [-1, 0]
  };
  const DIR_ORDER = ["up", "right", "down", "left"];
  const ARROW = { up: "↑", right: "→", down: "↓", left: "←" };

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashSeed(world, lv) {
    let h = 2166136261;
    const s = world + ":" + lv;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }
  function colorById(id) {
    return COLORS.find((c) => c.id === id) || COLORS[0];
  }

  function makeScrew(cfg, world, lv) {
    const rng = mulberry32(hashSeed(world || "screw", lv || cfg.lv || 1));
    const colors = COLORS.slice(0, Math.max(2, Math.min(5, cfg.colors || 2)));
    const boxes = [];
    const count = Math.max(2, cfg.boxes || 2);
    const need = Math.max(2, cfg.screwsPerBox || 2);
    const slotCount = Math.max(need, cfg.slots || 3);
    for (let i = 0; i < count; i++) {
      const color = colors[i % colors.length];
      boxes.push({
        id: i,
        color: color.id,
        need: need,
        filled: 0,
        done: false
      });
    }
    let pile = [];
    boxes.forEach((b) => {
      for (let s = 0; s < b.need; s++) pile.push(b.color);
    });
    pile = shuffle(pile, rng);
    return {
      kind: "screw",
      lv: lv || cfg.lv || 1,
      time: cfg.time || 90,
      boss: !!cfg.boss || (lv || 0) % 10 === 0,
      desc: cfg.desc || "",
      boxes: boxes,
      pile: pile,
      slots: Array(slotCount).fill(null),
      moves: 0
    };
  }

  function screwCounts(slots) {
    const counts = {};
    slots.forEach((c) => {
      if (c) counts[c] = (counts[c] || 0) + 1;
    });
    return counts;
  }

  function screwCanResolve(state) {
    const counts = screwCounts(state.slots);
    return state.boxes.some((b) => !b.done && (counts[b.color] || 0) >= b.need);
  }

  function screwResolve(state) {
    const opened = [];
    let guard = 0;
    while (screwCanResolve(state) && guard++ < 12) {
      const counts = screwCounts(state.slots);
      const box = state.boxes.find((b) => !b.done && (counts[b.color] || 0) >= b.need);
      if (!box) break;
      let left = box.need;
      for (let i = 0; i < state.slots.length && left > 0; i++) {
        if (state.slots[i] === box.color) {
          state.slots[i] = null;
          left--;
        }
      }
      box.filled = box.need;
      box.done = true;
      opened.push(box.color);
    }
    return opened;
  }

  function screwTapPile(state, index) {
    if (index < 0 || index >= state.pile.length) return { ok: false, reason: "bad" };
    const empty = state.slots.findIndex((s) => s == null);
    if (empty === -1) return { ok: false, reason: "full" };
    const color = state.pile.splice(index, 1)[0];
    state.slots[empty] = color;
    state.moves++;
    const opened = screwResolve(state);
    const won = state.boxes.every((b) => b.done) && state.pile.length === 0;
    const stuck = !won && state.slots.every((s) => s != null) && !screwCanResolve(state);
    return { ok: true, opened, won, stuck, color };
  }

  function screwUndo(state, snap) {
    state.boxes = snap.boxes.map((b) => Object.assign({}, b));
    state.pile = snap.pile.slice();
    state.slots = snap.slots.slice();
    state.moves = snap.moves;
  }
  function screwSnap(state) {
    return {
      boxes: state.boxes.map((b) => Object.assign({}, b)),
      pile: state.pile.slice(),
      slots: state.slots.slice(),
      moves: state.moves
    };
  }

  /* Perfect-play solver: finish one lock at a time. Always possible because slots >= need. */
  function screwSolvable(cfg, lv) {
    const state = makeScrew(cfg, "screw", lv);
    const guardMax = state.pile.length + 5;
    let guard = 0;
    while (!state.boxes.every((b) => b.done) && guard++ < guardMax) {
      const box = state.boxes.find((b) => !b.done);
      if (!box) break;
      const idx = state.pile.indexOf(box.color);
      if (idx === -1) return false;
      const res = screwTapPile(state, idx);
      if (!res.ok) return false;
    }
    return state.boxes.every((b) => b.done) && state.pile.length === 0;
  }

  function makeSort(cfg, lv) {
    const n = Math.max(2, Math.min(5, cfg.colors || 3));
    const colors = COLORS.slice(0, n);
    const speed = cfg.speed || "slow";
    const target = Math.min(24, 6 + Math.floor((lv || 1) / 2) + (speed === "fast" ? 2 : 0));
    return {
      kind: "sort",
      lv: lv || cfg.lv || 1,
      time: cfg.time || 60,
      boss: !!cfg.boss,
      desc: cfg.desc || "",
      colors: colors.map((c) => c.id),
      speed: speed,
      target: target,
      served: 0,
      combo: 0,
      bestCombo: 0,
      tray: [],
      nextId: 1
    };
  }

  function sortSpawn(state, rng) {
    const color = state.colors[Math.floor(rng() * state.colors.length)];
    state.tray.push({ id: state.nextId++, color: color });
    if (state.tray.length > 4) state.tray.shift();
  }

  function sortServe(state, plateId, tableColor) {
    const i = state.tray.findIndex((p) => p.id === plateId);
    if (i === -1) return { ok: false, reason: "missing" };
    const plate = state.tray[i];
    if (plate.color !== tableColor) {
      state.combo = 0;
      return { ok: false, reason: "wrong", color: plate.color };
    }
    state.tray.splice(i, 1);
    state.served++;
    state.combo++;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    return { ok: true, combo: state.combo, won: state.served >= state.target };
  }

  function carvePath(n, rng) {
    const path = [{ x: 0, y: 0 }];
    const seen = new Set(["0,0"]);
    function dfs(x, y) {
      if (x === n - 1 && y === n - 1) return true;
      const dirs = [
        [1, 0],
        [0, 1],
        [0, -1],
        [-1, 0]
      ].sort((a, b) => {
        const da = n - 1 - (x + a[0]) + (n - 1 - (y + a[1]));
        const db = n - 1 - (x + b[0]) + (n - 1 - (y + b[1]));
        return da - db + (rng() - 0.5) * 2.4;
      });
      for (let i = 0; i < dirs.length; i++) {
        const nx = x + dirs[i][0];
        const ny = y + dirs[i][1];
        if (nx < 0 || ny < 0 || nx >= n || ny >= n) continue;
        const key = nx + "," + ny;
        if (seen.has(key)) continue;
        seen.add(key);
        path.push({ x: nx, y: ny });
        if (dfs(nx, ny)) return true;
        path.pop();
        seen.delete(key);
      }
      return false;
    }
    if (!dfs(0, 0)) return [{ x: 0, y: 0 }, { x: n - 1, y: n - 1 }];
    return path;
  }

  function dirBetween(a, b) {
    if (b.x > a.x) return "right";
    if (b.x < a.x) return "left";
    if (b.y > a.y) return "down";
    return "up";
  }
  function rotateDir(dir, steps) {
    const i = DIR_ORDER.indexOf(dir);
    return DIR_ORDER[(i + steps) % 4];
  }

  function makeArrow(cfg, lv) {
    const rng = mulberry32(hashSeed("arrow", lv || cfg.lv || 1) ^ 0x9e3779b9);
    const n = Math.max(4, Math.min(9, cfg.size || 5));
    const path = carvePath(n, rng);
    const onPath = new Set(path.map((p) => p.x + "," + p.y));
    const answer = {};
    for (let i = 0; i < path.length - 1; i++) {
      answer[path[i].x + "," + path[i].y] = dirBetween(path[i], path[i + 1]);
    }
    const scramble = Math.min(0.72, 0.18 + (lv || 1) / 48);
    const grid = [];
    for (let y = 0; y < n; y++) {
      grid[y] = [];
      for (let x = 0; x < n; x++) {
        const key = x + "," + y;
        const isStart = x === 0 && y === 0;
        const isExit = x === n - 1 && y === n - 1;
        if (isExit) {
          grid[y][x] = { type: "exit", dir: null, answer: null };
          continue;
        }
        if (onPath.has(key)) {
          const correct = answer[key];
          let dir = correct;
          if (!isStart && rng() < scramble) dir = rotateDir(correct, 1 + Math.floor(rng() * 3));
          if (isStart && (lv || 1) > 3 && rng() < scramble * 0.45) dir = rotateDir(correct, 1 + Math.floor(rng() * 2));
          grid[y][x] = { type: isStart ? "start" : "arrow", dir: dir, answer: correct };
          continue;
        }
        if (rng() < 0.42) {
          grid[y][x] = { type: "wall", dir: null, answer: null };
        } else {
          const dir = DIR_ORDER[Math.floor(rng() * 4)];
          grid[y][x] = { type: "arrow", dir: dir, answer: null };
        }
      }
    }
    const level = lv || cfg.lv || 1;
    if (level <= 1) {
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          const c = grid[y][x];
          if (c.answer) c.dir = c.answer;
        }
      }
    }
    const wantWrong = level <= 1 ? 0 : level < 8 ? 1 : level % 10 === 0 ? 3 : 2;
    const rotatable = [];
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const c = grid[y][x];
        if (c.answer && !(x === 0 && y === 0 && level < 4)) rotatable.push(c);
      }
    }
    let wrongNow = rotatable.filter((c) => c.dir !== c.answer).length;
    let k = 0;
    while (wrongNow < wantWrong && k < rotatable.length) {
      const c = rotatable[k++];
      if (c.dir === c.answer) {
        c.dir = rotateDir(c.answer, 1 + Math.floor(rng() * 3));
        wrongNow++;
      }
    }
    return {
      kind: "arrow",
      lv: level,
      time: cfg.time || 60,
      boss: !!cfg.boss || level % 10 === 0,
      desc: cfg.desc || "",
      n: n,
      grid: grid,
      pathLength: path.length
    };
  }

  function arrowRotate(state, x, y) {
    const cell = state.grid[y] && state.grid[y][x];
    if (!cell || cell.type === "wall" || cell.type === "exit" || !cell.dir) return false;
    cell.dir = rotateDir(cell.dir, 1);
    return true;
  }

  function arrowWalk(state) {
    const n = state.n;
    let x = 0;
    let y = 0;
    const seen = new Set();
    const steps = [{ x: x, y: y }];
    for (let i = 0; i < n * n + 3; i++) {
      if (x === n - 1 && y === n - 1) return { ok: true, steps: steps };
      const key = x + "," + y;
      if (seen.has(key)) return { ok: false, reason: "loop", steps: steps };
      seen.add(key);
      const cell = state.grid[y][x];
      if (!cell.dir || !DIRS[cell.dir]) return { ok: false, reason: "stuck", steps: steps };
      const d = DIRS[cell.dir];
      const nx = x + d[0];
      const ny = y + d[1];
      if (nx < 0 || ny < 0 || nx >= n || ny >= n) return { ok: false, reason: "edge", steps: steps };
      if (state.grid[ny][nx].type === "wall") return { ok: false, reason: "wall", steps: steps };
      x = nx;
      y = ny;
      steps.push({ x: x, y: y });
    }
    return { ok: false, reason: "long", steps: steps };
  }

  function arrowWithAnswers(state) {
    const copy = JSON.parse(JSON.stringify(state));
    for (let y = 0; y < copy.n; y++) {
      for (let x = 0; x < copy.n; x++) {
        const c = copy.grid[y][x];
        if (c.answer) c.dir = c.answer;
      }
    }
    return copy;
  }

  function wrongArrows(state) {
    let n = 0;
    for (let y = 0; y < state.n; y++) {
      for (let x = 0; x < state.n; x++) {
        const c = state.grid[y][x];
        if (c.answer && c.dir !== c.answer) n++;
      }
    }
    return n;
  }

  root.BoltyLogic = {
    COLORS: COLORS,
    ARROW: ARROW,
    DIR_ORDER: DIR_ORDER,
    colorById: colorById,
    makeScrew: makeScrew,
    screwTapPile: screwTapPile,
    screwResolve: screwResolve,
    screwSnap: screwSnap,
    screwUndo: screwUndo,
    screwSolvable: screwSolvable,
    makeSort: makeSort,
    sortSpawn: sortSpawn,
    sortServe: sortServe,
    makeArrow: makeArrow,
    arrowRotate: arrowRotate,
    arrowWalk: arrowWalk,
    arrowWithAnswers: arrowWithAnswers,
    wrongArrows: wrongArrows,
    mulberry32: mulberry32,
    hashSeed: hashSeed
  };
})(typeof window !== "undefined" ? window : globalThis);
