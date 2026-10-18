/* Bolty's Puzzle Park — UI. One screen is active at a time. */
(function () {
  const L = window.BoltyLogic;
  const LEVELS = window.BOLTY_LEVELS;
  const SAVE_KEY = "bolty_park_v2";
  const TOTAL = { screw: 50, sort: 30, arrow: 30 };
  const THEMES = [
    { id: "park", name: "Park Day", price: 0, colors: ["#efe7ff", "#6d4aff", "#f5b301"] },
    { id: "night", name: "Night Fair", price: 180, colors: ["#17142e", "#8b5cf6", "#ffd15c"] },
    { id: "sunset", name: "Sunset Mile", price: 260, colors: ["#ffe7d6", "#e85d4c", "#ffb703"] }
  ];

  function freshSave() {
    return {
      coins: 250, gems: 3, hearts: 5, xp: 0, theme: "park",
      music: false, sfx: true, vib: true, streak: 0, lastDaily: "",
      owned: ["park"],
      screw: { unlocked: 1, stars: {}, cur: 1, paid: true },
      sort: { unlocked: 1, stars: {}, cur: 1, paid: false },
      arrow: { unlocked: 1, stars: {}, cur: 1, paid: false }
    };
  }
  let S = freshSave();
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    if (raw && raw.screw) S = Object.assign(freshSave(), raw);
  } catch (e) {}

  let session = null;
  let selectedPlate = null;
  let audioCtx = null;
  let musicTimer = null;
  let svgN = 0;

  function save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(S));
    paintCurrencies();
  }
  function cfg(world, lv) {
    const list = LEVELS && LEVELS[world];
    if (list) {
      const found = list.find((x) => x.lv === lv);
      if (found) return found;
    }
    if (world === "screw") return { lv: lv, colors: 2 + Math.min(3, Math.floor((lv - 1) / 8)), boxes: 2 + Math.min(4, Math.floor(lv / 6)), screwsPerBox: lv < 12 ? 2 : 3, slots: 3, time: 80, boss: lv % 10 === 0 };
    if (world === "sort") return { lv: lv, colors: Math.min(5, 3 + Math.floor(lv / 10)), speed: lv < 8 ? "slow" : lv < 18 ? "medium" : "fast", time: 60, boss: lv % 10 === 0 };
    return { lv: lv, size: Math.min(9, 5 + Math.floor(lv / 6)), time: 60, boss: lv % 10 === 0 };
  }
  function cleared(world) {
    return Object.keys(S[world].stars || {}).length;
  }
  function worldOpen(world) {
    if (world === "screw") return true;
    if (S[world].paid) return true;
    const screwDone = cleared("screw");
    return world === "sort" ? screwDone >= 10 : screwDone >= 20;
  }
  function $(id) { return document.getElementById(id); }

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    document.querySelectorAll(".modal-bg").forEach((m) => m.classList.remove("open"));
    const el = $(id);
    if (el) el.classList.add("active");
    $("app").dataset.screen = id;
  }
  function openModal(id) { $(id).classList.add("open"); }
  function closeModal(id) { $(id).classList.remove("open"); }
  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 1800);
  }
  function buzz(ms) {
    if (S.vib && navigator.vibrate) navigator.vibrate(ms || 18);
  }
  function ac() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }
  function tone(freq, dur, type, vol, delay, force) {
    if (!force && !S.sfx) return;
    try {
      const ctx = ac();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type || "sine";
      o.frequency.value = freq;
      o.connect(g);
      g.connect(ctx.destination);
      const t0 = ctx.currentTime + (delay || 0);
      g.gain.setValueAtTime(vol || 0.08, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.start(t0);
      o.stop(t0 + dur + 0.02);
    } catch (e) {}
  }
  function sfx(name) {
    if (name === "tap") tone(540, 0.05, "triangle", 0.06);
    else if (name === "lock") {
      tone(523, 0.09, "sine", 0.1);
      tone(659, 0.1, "sine", 0.09, 0.07);
      tone(784, 0.16, "sine", 0.08, 0.14);
    } else if (name === "bad") tone(160, 0.16, "square", 0.05);
    else if (name === "win") {
      [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.14, "triangle", 0.08, i * 0.09));
    } else if (name === "lose") {
      tone(320, 0.16, "sawtooth", 0.04);
      tone(180, 0.28, "triangle", 0.05, 0.12);
    } else if (name === "go") tone(660, 0.07, "square", 0.04);
  }
  function startMusic() {
    if (!S.music || musicTimer) return;
    const notes = [262, 311, 392, 466, 392, 311];
    let i = 0;
    musicTimer = setInterval(() => {
      if (!S.music) return;
      tone(notes[i % notes.length], 0.22, "sine", 0.025, 0, true);
      i++;
    }, 680);
  }
  function stopMusic() {
    clearInterval(musicTimer);
    musicTimer = null;
  }

  function burst(x, y, n) {
    const canvas = $("fx");
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const rect = canvas.getBoundingClientRect();
    const pieces = [];
    const colors = ["#f5b301", "#ff4d6d", "#6d4aff", "#12b981", "#fff"];
    for (let i = 0; i < (n || 28); i++) {
      pieces.push({
        x: (x || rect.width / 2) - rect.left,
        y: (y || rect.height / 3) - rect.top,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * -7 - 2,
        r: Math.random() * 4 + 2,
        c: colors[i % colors.length],
        life: 40 + Math.random() * 16
      });
    }
    let f = 0;
    const id = setInterval(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28;
        p.life--;
        ctx.globalAlpha = Math.max(0, p.life / 50);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      f++;
      if (f > 56) {
        clearInterval(id);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }, 16);
  }
  function floatAt(el, text) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    const app = $("app").getBoundingClientRect();
    const d = document.createElement("div");
    d.className = "float";
    d.textContent = text;
    d.style.left = r.left - app.left + r.width / 2 + "px";
    d.style.top = r.top - app.top + "px";
    $("app").appendChild(d);
    setTimeout(() => d.remove(), 700);
  }
  function shake(el) {
    if (!el) return;
    el.classList.remove("shake");
    void el.offsetWidth;
    el.classList.add("shake");
  }
  function uid() { return "g" + (++svgN); }
  function shade(hex, percent) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const t = percent < 0 ? 0 : 255;
    const p = Math.abs(percent) / 100;
    r = Math.round((t - r) * p + r);
    g = Math.round((t - g) * p + g);
    b = Math.round((t - b) * p + b);
    return "#" + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  function screwSVG(colorId, size) {
    const c = L.colorById(colorId);
    const id = uid();
    const px = size || 46;
    return `<svg viewBox="0 0 64 64" width="${px}" height="${px}" aria-hidden="true"><defs><radialGradient id="${id}" cx="32%" cy="28%" r="75%"><stop offset="0%" stop-color="#fff" stop-opacity=".9"/><stop offset="42%" stop-color="${c.hex}"/><stop offset="100%" stop-color="${shade(c.hex, -28)}"/></radialGradient></defs><circle cx="32" cy="32" r="28" fill="url(#${id})"/><circle cx="32" cy="32" r="27" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="2"/><path d="M32 16v32M18 32h28" stroke="rgba(20,10,30,.45)" stroke-width="3.2" stroke-linecap="round"/></svg>`;
  }
  function plateSVG(colorId) {
    const c = L.colorById(colorId);
    return `<svg viewBox="0 0 80 80" width="52" height="52" aria-hidden="true"><circle cx="40" cy="40" r="34" fill="#fff" stroke="${c.hex}" stroke-width="7"/><path d="M40 18 L54 48 H26 Z" fill="${c.hex}"/><circle cx="40" cy="42" r="4" fill="#fff6d8"/></svg>`;
  }
  function chevron(dir) {
    return `<svg class="arrow-chev ${dir}" viewBox="0 0 64 64" aria-hidden="true"><path d="M18 40 L32 22 L46 40"/></svg>`;
  }
  function flagSVG() {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 8v48" stroke="#24183a" stroke-width="4" stroke-linecap="round"/><path d="M22 12h28l-7 10 7 10H22z" fill="#12b981"/></svg>`;
  }
  function kingSVG() {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="36" r="16" fill="#ffd15c" stroke="#c88700" stroke-width="3"/><path d="M14 30 l8-12 10 10 10-14 10 16" fill="none" stroke="#c88700" stroke-width="3" stroke-linejoin="round"/></svg>`;
  }
  function hearts(n) {
    return "❤".repeat(Math.max(0, n)) + "♡".repeat(Math.max(0, 3 - n));
  }
  function fmt(sec) {
    sec = Math.max(0, sec | 0);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m + ":" + String(s).padStart(2, "0");
  }

  function paintCurrencies() {
    ["hubCoins", "mapCoins", "screwCoins", "shopCoins"].forEach((id) => {
      const el = $(id);
      if (el) el.textContent = S.coins;
    });
    if ($("hubGems")) $("hubGems").textContent = S.gems;
    if ($("hubHearts")) $("hubHearts").textContent = S.hearts;
    document.documentElement.dataset.theme = S.theme || "park";
  }
  function renderHub() {
    paintCurrencies();
    const today = new Date().toDateString();
    $("dailyInfo").textContent = S.lastDaily === today ? "Claimed today. Come back tomorrow." : "Tap to claim today's coins";
    $("streakRow").innerHTML = "";
    for (let i = 1; i <= 7; i++) {
      const d = document.createElement("div");
      d.className = "dot" + (i <= S.streak ? " on" : "");
      d.textContent = i <= S.streak ? "✓" : i;
      $("streakRow").appendChild(d);
    }
    [["screw", "progScrew", "progScrewText"], ["sort", "progSort", "progSortText"], ["arrow", "progArrow", "progArrowText"]].forEach(([w, bar, label]) => {
      const n = cleared(w);
      $(bar).style.width = (n / TOTAL[w]) * 100 + "%";
      $(label).textContent = n + "/" + TOTAL[w];
    });
    const sortOpen = worldOpen("sort");
    const arrowOpen = worldOpen("arrow");
    $("cardSort").classList.toggle("locked", !sortOpen);
    $("cardArrow").classList.toggle("locked", !arrowOpen);
    $("pillSort").textContent = sortOpen ? "PLAY" : "LOCK";
    $("pillArrow").textContent = arrowOpen ? "PLAY" : "LOCK";
    $("badgeSort").textContent = sortOpen ? "" : "Clear 10 Screw levels, or 200 coins";
    $("badgeArrow").textContent = arrowOpen ? "" : "Clear 20 Screw levels, or 400 coins";
  }

  function openMap(world) {
    if (!worldOpen(world)) {
      const price = world === "sort" ? 200 : 400;
      const need = world === "sort" ? 10 : 20;
      $("lockTitle").textContent = world === "sort" ? "Sort & Serve is locked" : "Arrow Escape is locked";
      $("lockMsg").textContent = "Finish Screw level " + need + ", or unlock now for " + price + " coins.";
      $("lockPay").textContent = "Unlock · " + price + " coins";
      $("lockPay").onclick = () => {
        if (S.coins < price) return toast("Not enough coins yet");
        S.coins -= price;
        S[world].paid = true;
        S[world].unlocked = TOTAL[world];
        save();
        closeModal("modal-lock");
        toast("World unlocked");
        openMap(world);
      };
      openModal("modal-lock");
      return;
    }
    S.curWorld = world;
    showScreen("screen-map");
    const names = { screw: "Screw Rescue", sort: "Sort & Serve", arrow: "Arrow Escape" };
    $("mapTitle").textContent = names[world];
    paintCurrencies();
    const grid = $("mapGrid");
    grid.innerHTML = "";
    const total = TOTAL[world];
    for (let i = 1; i <= total; i++) {
      const btn = document.createElement("button");
      const locked = i > S[world].unlocked;
      const stars = S[world].stars[i] || 0;
      btn.className = "lvl" + (locked ? " locked" : "") + (i % 10 === 0 ? " boss" : "") + (i === S[world].cur ? " current" : "") + (stars ? " done" : "");
      btn.innerHTML = locked ? "<b>🔒</b>" : "<b>" + i + "</b><small>" + (i % 10 === 0 ? "BOSS" : "★".repeat(stars)) + "</small>";
      if (!locked) btn.onclick = () => startGame(world, i);
      grid.appendChild(btn);
    }
    $("btnContinue").onclick = () => startGame(world, Math.min(S[world].cur, S[world].unlocked));
  }

  function stopSession() {
    if (!session) return;
    clearInterval(session.clock);
    session.walkToken = (session.walkToken || 0) + 1;
    session.ended = true;
  }
  function beginSession(world, level, state) {
    stopSession();
    session = {
      world: world,
      level: level,
      state: state,
      timeLeft: state.time,
      hearts: 3,
      hints: 0,
      freeHint: true,
      ended: false,
      paused: false,
      clock: null,
      walkToken: 0,
      timerId: world === "screw" ? "screwTimer" : world === "sort" ? "sortTimer" : "arrowTimer"
    };
    S.curWorld = world;
    S[world].cur = level;
    save();
  }
  function startClock() {
    clearInterval(session.clock);
    const el = $(session.timerId);
    const tick = () => {
      if (!el) return;
      el.textContent = fmt(session.timeLeft);
      el.classList.toggle("warn", session.timeLeft <= 10);
    };
    tick();
    session.clock = setInterval(() => {
      if (!session || session.paused || session.ended) return;
      session.timeLeft--;
      tick();
      if (session.timeLeft <= 0) {
        clearInterval(session.clock);
        lose("Time's up", "The clock ran out. The board will be the same if you retry.");
      }
    }, 1000);
  }
  function bossFlash(level) {
    if (level % 10 !== 0) return;
    const el = $("bossFlash");
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 900);
  }

  function startGame(world, level) {
    selectedPlate = null;
    if (world === "screw") startScrew(level);
    else if (world === "sort") startSort(level);
    else startArrow(level);
    bossFlash(level);
    sfx("tap");
  }

  function startScrew(level) {
    const state = L.makeScrew(cfg("screw", level), "screw", level);
    beginSession("screw", level, state);
    showScreen("screen-screw");
    $("screwLevel").textContent = (level % 10 === 0 ? "Boss " : "Level ") + level;
    $("screwGoal").textContent = "Seal " + state.boxes.length + " locks";
    $("screwHearts").textContent = hearts(session.hearts);
    $("screwCoach").textContent = level === 1 ? "Tap two screws of the same color. The lock closes by itself." : "Fill one color at a time. Undo if the tray jams.";
    renderScrew();
    startClock();
  }
  function renderScrew() {
    const st = session.state;
    $("screwCoins").textContent = S.coins;
    $("screwHint").textContent = st.slots.filter(Boolean).length + "/" + st.slots.length;
    const locks = $("screwLocks");
    locks.innerHTML = "";
    st.boxes.forEach((box) => {
      const col = L.colorById(box.color);
      const row = document.createElement("div");
      row.className = "lock" + (box.done ? " done" : "");
      const holes = [];
      for (let i = 0; i < box.need; i++) {
        holes.push(`<i class="hole${box.done || i < box.filled ? " filled" : ""}" style="background:${box.done ? col.hex : "transparent"};border-color:${col.hex}"></i>`);
      }
      row.innerHTML = `<div class="lock-name" style="color:${col.hex}">${col.name}</div><div class="holes">${holes.join("")}</div>`;
      locks.appendChild(row);
    });
    const pile = $("screwPile");
    pile.innerHTML = "";
    st.pile.forEach((color, index) => {
      const b = document.createElement("button");
      b.className = "screw pop";
      b.innerHTML = screwSVG(color);
      b.onclick = () => onScrew(index, b);
      pile.appendChild(b);
    });
    const tray = $("screwSlots");
    tray.innerHTML = "";
    st.slots.forEach((color) => {
      const s = document.createElement("div");
      s.className = "slot" + (color ? " filled" : "");
      if (color) s.innerHTML = screwSVG(color, 40);
      tray.appendChild(s);
    });
  }
  function onScrew(index, el) {
    if (!session || session.ended || session.world !== "screw") return;
    const snap = L.screwSnap(session.state);
    session.undo = snap;
    const res = L.screwTapPile(session.state, index);
    if (!res.ok) {
      sfx("bad");
      shake($("screen-screw"));
      toast(res.reason === "full" ? "Tray is full. Undo, or finish a color." : "Can't move that");
      return;
    }
    buzz(12);
    sfx(res.opened.length ? "lock" : "tap");
    if (res.opened.length) {
      burst(el.getBoundingClientRect().left, el.getBoundingClientRect().top, 18);
      floatAt(el, "Locked");
    }
    renderScrew();
    if (res.won) return win();
    if (res.stuck) {
      shake($("screen-screw"));
      sfx("bad");
      toast("Tray jammed. Press Undo and finish one color.");
      $("screwCoach").textContent = "The tray is full and no lock can close. Undo, then collect one color only.";
    }
  }

  function startSort(level) {
    const state = L.makeSort(cfg("sort", level), level);
    state.rng = L.mulberry32(L.hashSeed("sort", level));
    for (let i = 0; i < 4; i++) L.sortSpawn(state, state.rng);
    beginSession("sort", level, state);
    showScreen("screen-sort");
    $("sortLevel").textContent = (level % 10 === 0 ? "Boss " : "Level ") + level;
    $("sortGoal").textContent = "Serve " + state.target + " matching plates";
    $("sortCoach").textContent = "Tap a plate, then the table with the same color.";
    renderSort();
    startClock();
  }
  function renderSort() {
    const st = session.state;
    $("sortScore").textContent = st.served + "/" + st.target;
    $("sortCombo").textContent = st.combo > 1 ? "Combo " + st.combo : "Combo";
    const orders = $("sortOrders");
    orders.innerHTML = "";
    st.colors.forEach((id) => {
      const c = L.colorById(id);
      const d = document.createElement("div");
      d.className = "order";
      d.innerHTML = c.name + `<i style="background:${c.hex}"></i>`;
      orders.appendChild(d);
    });
    const tray = $("sortTray");
    tray.innerHTML = "";
    st.tray.forEach((plate) => {
      const b = document.createElement("button");
      b.className = "plate" + (selectedPlate === plate.id ? " selected" : "");
      b.innerHTML = plateSVG(plate.color);
      b.onclick = () => {
        selectedPlate = plate.id;
        sfx("tap");
        renderSort();
      };
      tray.appendChild(b);
    });
    const tables = $("sortTables");
    tables.innerHTML = "";
    st.colors.forEach((id) => {
      const c = L.colorById(id);
      const b = document.createElement("button");
      b.className = "table";
      b.innerHTML = `<span class="swatch" style="background:${c.hex}"></span>${c.name}`;
      b.onclick = () => servePlate(id, b);
      tables.appendChild(b);
    });
  }
  function servePlate(tableColor, el) {
    if (!session || session.ended || session.world !== "sort") return;
    const st = session.state;
    if (selectedPlate == null) {
      toast("Tap a plate first");
      return;
    }
    const res = L.sortServe(st, selectedPlate, tableColor);
    selectedPlate = null;
    if (!res.ok) {
      session.timeLeft = Math.max(0, session.timeLeft - 4);
      sfx("bad");
      shake(el);
      buzz(30);
      toast("Wrong table · −4s");
      renderSort();
      return;
    }
    sfx(res.combo > 2 ? "lock" : "tap");
    burst(el.getBoundingClientRect().left, el.getBoundingClientRect().top, 12);
    floatAt(el, res.combo > 1 ? "x" + res.combo : "+1");
    L.sortSpawn(st, st.rng);
    renderSort();
    if (res.won) win();
  }

  function startArrow(level) {
    const state = L.makeArrow(cfg("arrow", level), level);
    beginSession("arrow", level, state);
    showScreen("screen-arrow");
    $("arrowLevel").textContent = (level % 10 === 0 ? "Boss " : "Level ") + level;
    $("arrowGoal").textContent = "Turn arrows, then GO";
    $("arrowHearts").textContent = hearts(session.hearts);
    $("arrowCoach").textContent = level === 1
      ? "This road is already set. Press GO and watch Bolty walk."
      : "Tap a tile to rotate it. Bolty follows the arrow under his feet.";
    $("btnGo").disabled = false;
    renderArrow(null);
    startClock();
  }
  function renderArrow(king, bad) {
    const st = session.state;
    $("arrowWrong").textContent = L.wrongArrows(st) + " off";
    const maze = $("arrowMaze");
    maze.style.gridTemplateColumns = "repeat(" + st.n + ", 1fr)";
    maze.style.gap = st.n >= 8 ? "3px" : "5px";
    maze.innerHTML = "";
    for (let y = 0; y < st.n; y++) {
      for (let x = 0; x < st.n; x++) {
        const cell = st.grid[y][x];
        const b = document.createElement("button");
        b.className = "cell " + cell.type;
        if (king && king.x === x && king.y === y) b.classList.add("king");
        if (bad && bad.x === x && bad.y === y) b.classList.add("bad");
        if (cell.type === "wall") b.disabled = true;
        else if (cell.type === "exit") b.innerHTML = flagSVG();
        else b.innerHTML = chevron(cell.dir) + (king && king.x === x && king.y === y ? kingSVG() : "");
        if (cell.type !== "wall" && cell.type !== "exit") {
          b.onclick = () => {
            if (!session || session.ended || session.walking) return;
            L.arrowRotate(st, x, y);
            sfx("tap");
            buzz(8);
            renderArrow({ x: 0, y: 0 });
          };
        }
        maze.appendChild(b);
      }
    }
  }
  function kingGo() {
    if (!session || session.ended || session.world !== "arrow" || session.walking) return;
    const token = ++session.walkToken;
    session.walking = true;
    $("btnGo").disabled = true;
    sfx("go");
    const result = L.arrowWalk(session.state);
    let i = 0;
    const step = () => {
      if (!session || session.walkToken !== token) return;
      const pos = result.steps[i];
      const failed = !result.ok && i === result.steps.length - 1;
      renderArrow(pos, failed ? pos : null);
      i++;
      if (i < result.steps.length) {
        setTimeout(step, 180);
        return;
      }
      session.walking = false;
      $("btnGo").disabled = false;
      if (result.ok) {
        burst(window.innerWidth / 2, window.innerHeight / 2, 36);
        win();
      } else {
        session.hearts--;
        $("arrowHearts").textContent = hearts(session.hearts);
        sfx("bad");
        shake($("screen-arrow"));
        const why = { loop: "He walked in a circle", edge: "He walked off the board", wall: "He hit a wall", stuck: "That tile has no arrow" }[result.reason] || "Not yet";
        toast(why);
        if (session.hearts <= 0) lose("Bolty is stuck", why + ". Turn the road, then try GO again.");
      }
    };
    step();
  }

  function starsFor() {
    const ratio = session.timeLeft / session.state.time;
    if (session.hints === 0 && ratio > 0.45) return 3;
    if (ratio > 0.2) return 2;
    return 1;
  }
  function win() {
    if (!session || session.ended) return;
    session.ended = true;
    clearInterval(session.clock);
    const world = session.world;
    const level = session.level;
    const stars = starsFor();
    const boss = level % 10 === 0;
    const coins = 15 + stars * 8 + (boss ? 25 : 0) + Math.floor(session.timeLeft / 4);
    S.coins += coins;
    S.xp += 8 + stars * 4;
    S.hearts = Math.min(5, S.hearts + (stars === 3 ? 1 : 0));
    if (!S[world].stars[level] || S[world].stars[level] < stars) S[world].stars[level] = stars;
    if (S[world].unlocked < level + 1 && level < TOTAL[world]) S[world].unlocked = level + 1;
    S[world].cur = Math.min(TOTAL[world], level + 1);
    save();
    sfx("win");
    burst(window.innerWidth / 2, 180, 48);
    showScreen("screen-win");
    $("winKicker").textContent = boss ? "Boss down" : "Cleared";
    $("winTitle").textContent = "Level " + level;
    $("winCoins").textContent = "+" + coins + " coins";
    $("winSub").textContent = stars === 3 ? "Perfect. No hint, time to spare." : stars === 2 ? "Clean enough. The next board is open." : "Cleared. A faster run earns more stars.";
    $("xpFill").style.width = (S.xp % 100) + "%";
    $("xpText").textContent = "Park rank " + (Math.floor(S.xp / 100) + 1);
    const box = $("winStars");
    box.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      const s = document.createElement("span");
      s.className = "star";
      s.textContent = i < stars ? "★" : "☆";
      s.style.animationDelay = i * 0.12 + "s";
      box.appendChild(s);
      setTimeout(() => s.classList.add("in"), 40);
    }
    $("btnNext").textContent = level >= TOTAL[world] ? "World complete" : "Next level";
    $("btnNext").onclick = () => {
      if (level >= TOTAL[world]) {
        toast("That world is finished");
        showScreen("screen-hub");
        renderHub();
        return;
      }
      startGame(world, level + 1);
    };
  }
  function lose(title, msg) {
    if (!session || session.ended) return;
    session.ended = true;
    clearInterval(session.clock);
    session.walking = false;
    sfx("lose");
    showScreen("screen-lose");
    $("loseTitle").textContent = title || "Try again";
    $("loseMsg").textContent = msg || "Same board. New attempt.";
  }
  function revive() {
    if (!session) return;
    if (S.coins < 80) return toast("Need 80 coins");
    S.coins -= 80;
    save();
    session.ended = false;
    session.paused = false;
    session.hearts = Math.max(1, session.hearts);
    session.timeLeft += 25;
    showScreen("screen-" + session.world);
    if (session.world === "screw") renderScrew();
    if (session.world === "sort") renderSort();
    if (session.world === "arrow") {
      $("btnGo").disabled = false;
      renderArrow({ x: 0, y: 0 });
      $("arrowHearts").textContent = hearts(session.hearts);
    }
    startClock();
    toast("25 seconds restored");
  }
  function useHint() {
    if (!session || session.ended) return;
    if (!session.freeHint) {
      if (S.coins < 20) return toast("Hints cost 20 coins");
      S.coins -= 20;
      save();
    }
    session.freeHint = false;
    session.hints++;
    if (session.world === "screw") {
      const box = session.state.boxes.find((b) => !b.done);
      if (!box) return;
      toast("Finish " + L.colorById(box.color).name + " next");
      $("screwCoach").textContent = "Collect " + box.need + " " + box.color + " screws before mixing another color.";
    } else if (session.world === "sort") {
      const plate = session.state.tray[0];
      if (!plate) return;
      toast("The left plate wants " + L.colorById(plate.color).name);
      selectedPlate = plate.id;
      renderSort();
    } else if (session.world === "arrow") {
      let flipped = false;
      for (let y = 0; y < session.state.n && !flipped; y++) {
        for (let x = 0; x < session.state.n; x++) {
          const c = session.state.grid[y][x];
          if (c.answer && c.dir !== c.answer) {
            c.dir = c.answer;
            flipped = true;
            toast("One arrow turned onto the road");
            break;
          }
        }
      }
      if (!flipped) toast("The road already reaches the flag. Press GO.");
      renderArrow({ x: 0, y: 0 });
    }
    sfx("lock");
  }

  function claimDaily() {
    const today = new Date().toDateString();
    if (S.lastDaily === today) return toast("Already claimed today");
    if (S.lastDaily) {
      const last = new Date(S.lastDaily);
      const diff = (new Date(today) - new Date(last.toDateString())) / 86400000;
      if (diff > 1) S.streak = 0;
    }
    const rewards = [40, 60, 80, 120, 160, 200, 280];
    const gain = rewards[Math.min(S.streak, 6)];
    S.coins += gain;
    if (S.streak === 6) S.gems += 1;
    S.streak = Math.min(7, (S.streak || 0) + 1);
    S.lastDaily = today;
    save();
    renderHub();
    toast("+" + gain + " coins");
    sfx("lock");
    burst(window.innerWidth / 2, 220, 24);
  }

  function renderShop() {
    paintCurrencies();
    showScreen("screen-shop");
    const grid = $("shopGrid");
    grid.innerHTML = "";
    THEMES.forEach((theme) => {
      const owned = S.owned.indexOf(theme.id) !== -1;
      const card = document.createElement("div");
      card.className = "shop-card";
      card.innerHTML = `<h3>${theme.name}</h3><p>${owned ? (S.theme === theme.id ? "Equipped" : "Owned") : theme.price + " coins"}</p><div class="swatches">${theme.colors.map((c) => `<i style="background:${c}"></i>`).join("")}</div>`;
      const btn = document.createElement("button");
      btn.className = "btn " + (owned ? "ghost" : "primary") + " wide";
      btn.textContent = owned ? (S.theme === theme.id ? "Equipped" : "Equip") : "Buy";
      btn.onclick = () => {
        if (!owned) {
          if (S.coins < theme.price) return toast("Not enough coins");
          S.coins -= theme.price;
          S.owned.push(theme.id);
        }
        S.theme = theme.id;
        save();
        renderShop();
        toast(theme.name + " on");
      };
      card.appendChild(btn);
      grid.appendChild(card);
    });
    const note = document.createElement("p");
    note.className = "legal";
    note.textContent = "Themes are local. No account, no surprise charge.";
    grid.appendChild(note);
  }

  function boot() {
    document.documentElement.dataset.theme = S.theme || "park";
    let load = 0;
    const timer = setInterval(() => {
      load = Math.min(100, load + 18);
      $("loadFill").style.width = load + "%";
      $("loadText").textContent = load < 100 ? "Setting the locks…" : "Ready";
      if (load >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          showScreen("screen-hub");
          renderHub();
        }, 280);
      }
    }, 90);

    $("btnSettings").onclick = () => {
      $("setMusic").checked = !!S.music;
      $("setSfx").checked = S.sfx !== false;
      $("setVib").checked = S.vib !== false;
      openModal("modal-settings");
    };
    $("setClose").onclick = () => closeModal("modal-settings");
    $("setMusic").onchange = (e) => { S.music = e.target.checked; save(); if (S.music) startMusic(); else stopMusic(); };
    $("setSfx").onchange = (e) => { S.sfx = e.target.checked; save(); };
    $("setVib").onchange = (e) => { S.vib = e.target.checked; save(); };
    $("btnDaily").onclick = claimDaily;
    $("btnShop").onclick = renderShop;
    $("shopBack").onclick = () => { showScreen("screen-hub"); renderHub(); };
    $("btnHelp").onclick = () => openModal("modal-help");
    $("helpClose").onclick = () => closeModal("modal-help");
    $("lockClose").onclick = () => closeModal("modal-lock");
    $("cardScrew").onclick = () => openMap("screw");
    $("cardSort").onclick = () => openMap("sort");
    $("cardArrow").onclick = () => openMap("arrow");
    $("mapBack").onclick = () => { showScreen("screen-hub"); renderHub(); };
    $("screwPause").onclick = pause;
    $("sortPause").onclick = pause;
    $("arrowPause").onclick = pause;
    $("btnResume").onclick = resume;
    $("btnRestart").onclick = () => session && startGame(session.world, session.level);
    $("btnQuit").onclick = () => {
      const world = session && session.world;
      stopSession();
      session = null;
      if (world) openMap(world);
      else { showScreen("screen-hub"); renderHub(); }
    };
    $("screwUndo").onclick = () => {
      if (!session || !session.undo) return toast("Nothing to undo");
      L.screwUndo(session.state, session.undo);
      session.undo = null;
      renderScrew();
      sfx("tap");
    };
    $("screwHintBtn").onclick = useHint;
    $("arrowHintBtn").onclick = useHint;
    $("arrowReset").onclick = () => session && startArrow(session.level);
    $("btnGo").onclick = kingGo;
    $("btnRetry").onclick = () => session && startGame(session.world, session.level);
    $("btnRevive").onclick = revive;
    $("btnWinMap").onclick = () => session && openMap(session.world);
    $("btnLoseMap").onclick = () => session && openMap(session.world);
    document.addEventListener("pointerdown", () => { if (S.music) startMusic(); }, { once: true });
  }

  function pause() {
    if (!session || session.ended) return;
    session.paused = true;
    clearInterval(session.clock);
    openModal("modal-pause");
  }
  function resume() {
    if (!session) return;
    closeModal("modal-pause");
    session.paused = false;
    if (!session.ended) startClock();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
